import React, { useState, useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { updateAcceleration, updateLocation, updateSpeed, updateViolations, addViolationToSupabase, updateSpeedLimit, updateAlertZones } from '../store/drivingSlice';
import { getSpeedLimitMapbox, sendDriverData } from '../api/trafficApi';
import { sendNotification } from '../api/notificationApi';
import { RootState, AppDispatch } from '../store';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';

interface LocationObject {
  latitude: number | null;
  longitude: number | null;
}

interface DangerZone {
  id: string;
  created_by: string;
  geometry: {
    type: "Polygon";
    coordinates: number[][][]
  }
}

const SensorDataCollector = () => {
  const { t } = useTranslation();
  console.log('SensorDataCollector is running');
  const [location, setLocation] = useState<LocationObject>({
    latitude: null,
    longitude: null,
  });
  const [speed, setSpeed] = useState(0);
  const [acceleration, setAcceleration] = useState(0);
  const dispatch: AppDispatch = useDispatch();
  const userId = useSelector((state: RootState) => state.auth.userId);
  console.log('logging user: ', userId);
  
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);

  useEffect(() => {
    const fetchDangerZones = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('danger_zones')
        .select('*')
        .eq('created_by', userId);

      if (error) {
        console.error('Error fetching danger zones:', error);
      } else {
        // console.log('Fetched danger zones:', data);
        setDangerZones(data || []);
        dispatch(updateAlertZones(data || []));
      }
    };

    fetchDangerZones();

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log(t('sensorDataCollector.permissionDenied'));
        return;
      }

      if (!userId){
        console.log('No user');
        return;
      }

      await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 10 },
        async (loc) => {
          if (loc) {
            setLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
            console.log(t('sensorDataCollector.location'), loc);

            const kmConv =  3.6;
            setSpeed(loc.coords.speed ? loc.coords.speed * kmConv : 0);
            dispatch(updateLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude }));
            dispatch(updateSpeed(loc.coords.speed ? loc.coords.speed * kmConv : 0));

            // Check for speed limit violation
            const currentSpeedLimit = await getSpeedLimitMapbox(loc.coords.latitude, loc.coords.longitude);
            // console.log('spped limit: ', loc.coords.speed, currentSpeedLimit);
            dispatch(updateSpeedLimit(currentSpeedLimit));

            if (loc.coords.speed !== null && loc.coords.speed > currentSpeedLimit) {
              const violationCode = 'SPEEDING';
              // dispatch(addViolation(violationCode));
              if (userId) {
                console.log(t('sensorDataCollector.dispatchingViolation'), userId, violationCode);
                dispatch(addViolationToSupabase({ userId: userId, violationCode: violationCode }));
              }
            }

            // Check if location is in danger zones
            dangerZones.forEach(dangerZone => {
              const userPoint = point([loc.coords.longitude, loc.coords.latitude]); // [longitude, latitude]
              const polygon = dangerZone.geometry;

              if (booleanPointInPolygon(userPoint, polygon)) {
                const violationCode = 'GEOFENCE_VIOLATION';
                // dispatch(addViolation(violationCode));
                if (userId) {
                  console.log(t('sensorDataCollector.dispatchingViolation'), userId, violationCode);
                  dispatch(addViolationToSupabase({ userId: userId, violationCode: violationCode }));
                }
              }
            });

            // Collect driver data
            const driverData = {
              speed: loc.coords.speed || 0,
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              timestamp: new Date().toISOString(),
              user_id: userId,
            };

            // Send driver data to the database
            if (userId) {
              sendDriverData(driverData);
            }
          }
        },
        (error) => {
          console.log('Error watching position: ', error);
        }
      );
    })();
  }, [dispatch, userId]);

  useEffect(() => {
    Accelerometer.setUpdateInterval(200);
    const subscription = Accelerometer.addListener((data) => {
      const calculatedAcceleration = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
      setAcceleration(calculatedAcceleration);
      dispatch(updateAcceleration(calculatedAcceleration));
    });

    return () => subscription.remove();
  }, [dispatch, userId]);

  return null;
};

export default SensorDataCollector;
