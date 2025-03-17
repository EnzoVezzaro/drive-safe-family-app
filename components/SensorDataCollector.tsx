import React, { useState, useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { updateAcceleration, updateLocation, updateSpeed, updateViolations, addViolationToSupabase, updateSpeedLimit } from '../store/drivingSlice';
import { getSpeedLimitMapbox, isLocationInGeofence, sendDriverData } from '../api/trafficApi';
import { sendNotification } from '../api/notificationApi';
import { RootState, AppDispatch } from '../store';

interface LocationObject {
  latitude: number | null;
  longitude: number | null;
}

const SensorDataCollector = () => {
  console.log('SensorDataCollector is running');
  const [location, setLocation] = useState<LocationObject>({
    latitude: null,
    longitude: null,
  });
  const [speed, setSpeed] = useState(0);
  const [acceleration, setAcceleration] = useState(0);
  const dispatch: AppDispatch = useDispatch();
  const userId = useSelector((state: RootState) => state.auth.userId);
  // const userId = 'deb3221a-ac1b-46a6-83e2-c3509095ab3a';

  // Define a geofence for a school zone
  const schoolZone = {
    latitude: 37.7749, // Example latitude
    longitude: -122.4194, // Example longitude
    radius: 0.01, // Example radius (in degrees, approximate)
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
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
            console.log('location: ', loc);

            setSpeed(loc.coords.speed ? loc.coords.speed * 3.6 : 0);
            dispatch(updateLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude }));
            dispatch(updateSpeed(loc.coords.speed || 0));

            // Check for speed limit violation
            const currentSpeedLimit = await getSpeedLimitMapbox(loc.coords.latitude, loc.coords.longitude);
            // console.log('spped limit: ', loc.coords.speed, currentSpeedLimit);
            dispatch(updateSpeedLimit(currentSpeedLimit));

            if (loc.coords.speed !== null && loc.coords.speed > currentSpeedLimit) {
              const violationCode = 'SPEEDING';
              // dispatch(addViolation(violationCode));
              if (userId) {
                console.log('Dispatching addViolationToSupabase with userId:', userId, 'and violationCode:', violationCode);
                dispatch(addViolationToSupabase({ userId: userId, violationCode: violationCode }));
              }
            }

            // Check if location is in geofence
            if (isLocationInGeofence(loc.coords.latitude, loc.coords.longitude, schoolZone)) {
              const violationCode = 'GEOFENCE_VIOLATION';
              // dispatch(addViolation(violationCode));
              if (userId) {
                console.log('Dispatching addViolationToSupabase with userId:', userId, 'and violationCode:', violationCode);
                dispatch(addViolationToSupabase({ userId: userId, violationCode: violationCode }));
              }
            }

            // Collect driver data
            const driverData = {
              speed: loc.coords.speed || 0,
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              timestamp: new Date().toISOString(),
              user_id: userId,
            };

            // Send driver data to the database
            sendDriverData(driverData); 
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
