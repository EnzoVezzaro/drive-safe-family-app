import React, { useState, useEffect, useRef } from 'react';
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
import Modal from 'react-native-modal';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

interface LocationObject {
  latitude: number | null;
  longitude: number | null;
}

interface DangerZone {
  id: string;
  created_by: string;
  coordinates: any;
  label: string
}

let isViolationTimerRunning = false;
let lastViolation: any = null;
let acknowledgeViolation = false;

export const collectSensorData = async (dispatch: AppDispatch, userId: string, dangerZones: DangerZone[]) => {
  try {
    console.log('[BackgroundFetch] Sensor data collection checking permissions.');
    let { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied.');
      return;
    }

    await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 10 },
      async (loc) => {
        if (loc) {
          console.log('[BackgroundFetch] Sensor data collection getting coords.');
          const kmConv = 3.6;
          const speedKMH = (loc?.coords?.speed || 0) * kmConv;
          dispatch(updateLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude }));
          dispatch(updateSpeed(speedKMH));

          const currentSpeedLimit = await getSpeedLimitMapbox(loc.coords.latitude, loc.coords.longitude);
          dispatch(updateSpeedLimit(currentSpeedLimit));
          console.log('check speed: ', speedKMH, currentSpeedLimit);
          if ((speedKMH !== null || speedKMH !== 0) && speedKMH > currentSpeedLimit) {
            console.log('sending speed violation: ', speedKMH, currentSpeedLimit);
            const violationCode = 'SPEEDING'; 
            const sev = detectSeverity(violationCode, speedKMH)
            // handleViolation(violationCode, violationCode); // Need to figure out how to handle violations in background
            if (!acknowledgeViolation){
              dispatch(addViolationToSupabase({ userId: userId, violationCode: violationCode, severity: sev }));
            }
          }

          {
            dangerZones.length > 0 && dangerZones.forEach(dangerZone => {
              const userPoint = point([loc.coords.longitude, loc.coords.latitude]);
              const coords = dangerZone.coordinates;
              if (coords && (typeof coords === 'object' && Object.keys(coords).length > 0)) {
                const polygon = dangerZone.coordinates.features[0].geometry;
                if (booleanPointInPolygon(userPoint, polygon)) {
                  const violationCode = 'GEOFENCE_VIOLATION';
                  const sev = detectSeverity(violationCode, speedKMH || 0)
                  // handleViolation(violationCode, dangerZone.label); // Need to figure out how to handle violations in background
                  if (!acknowledgeViolation){
                    dispatch(addViolationToSupabase({ userId: userId, violationCode: violationCode, severity: sev }));
                  }
                }
              }
            });
          }

          if (loc.coords.speed) {
            const driverData = {
              speed: loc.coords.speed || 0,
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              timestamp: new Date().toISOString(),
              user_id: userId,
              activity: await detectActivity(loc.coords.speed || 0)
            };
  
            sendDriverData(driverData);
          }
        }
      },
      (error) => {
        console.log('Error watching position: ', error);
      }
    );
  } catch (error) {
    console.error('Error collecting sensor data:', error);
  }
};

export const detectActivity = (speed: number) => {
  // Threshold for walking and driving at low speed
  if (speed < 5) {
    return 'WALKING';  // Considered walking
  } else if (speed >= 5 && speed <= 15) {
    return 'DRIVING_LOW_SPEED';  // Considered low-speed driving
  } else {
    return 'DRIVING';  // Considered normal driving
  }
};

// Thresholds for speeding
const SPEEDING_THRESHOLDS = {
  LOW: 20, // Mild speeding (e.g., 20 km/h over the limit)
  MODERATE: 40, // Moderate speeding (e.g., 40 km/h over the limit)
  HIGH: 60, // High speeding (e.g., 60 km/h over the limit)
};

export const detectSeverity = (violationType: string, speed?: number) => {
  let severity = 1;

  switch (violationType) {
    case 'RED_LIGHT':
      severity = 5; // High severity for running a red light
      break;
    case 'SPEEDING':
      if (speed !== undefined) {
        // Severity based on how much the speed exceeds the speed limit
        if (speed <= SPEEDING_THRESHOLDS.LOW) {
          severity = 1; // Mild speeding
        } else if (speed <= SPEEDING_THRESHOLDS.MODERATE) {
          severity = 2; // Moderate speeding
        } else if (speed <= SPEEDING_THRESHOLDS.HIGH) {
          severity = 3; // High speeding
        } else {
          severity = 4; // Extremely high speeding
        }
      } else {
        severity = 1; // No speed provided
      }
      break;
    case 'PARKING':
      severity = 2; // Moderate severity for illegal parking
      break;
    case 'CROSSWALK':
      severity = 3; // High severity for crossing on a crosswalk improperly
      break;
    case 'GEOFENCE':
      severity = 1; // Mild severity for geofence violations
      break;
    default:
      severity = 1; // Default severity for unrecognized violation types
      break;
  }

  return severity;
};

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

  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  const [isViolationModalVisible, setViolationModalVisible] = useState(false);
  const [violationTimer, setViolationTimer] = useState(10);
  
  const fetchDangerZones = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('danger_zones')
      .select('*')
      .eq('created_by', userId);

    if (error) {
      console.error('Error fetching danger zones:', error);
    } else {
      setDangerZones(data || []);
      dispatch(updateAlertZones(data || []));
    }
  };

  const resetViolationState = () => {
    setViolationModalVisible(false);
    setViolationTimer(10);
    isViolationTimerRunning = false
  };

  const handleViolation = (code: string, label: string) => {
    // console.log('aqui open: ', isViolationTimerRunning, lastViolation);
    if (isViolationTimerRunning) {
      return; // Ignore violations if timer is running
    }

    if (lastViolation?.timestamp){
      const fiveMinutesInMilliseconds = 2 * 60 * 1000; // 2 minutes in milliseconds
      const currentTime = Date.now();
      const timeDifference = currentTime - lastViolation.timestamp;
      // console.log('timeDifference: ', timeDifference, fiveMinutesInMilliseconds);
      if (timeDifference < fiveMinutesInMilliseconds){
        return; // Ingore violations if the same has been added 5 mins ago
      }
    }
    setViolationModalVisible(true);
    isViolationTimerRunning = true;

    let timerId: NodeJS.Timeout;

    const tick = () => {
      setViolationTimer((prevTimer) => {
        if (prevTimer > 1) {
          return prevTimer - 1;
        } else {
          if (userId && code) {
            // console.log(t('sensorDataCollector.dispatchingViolation'), userId, code);
            lastViolation = {
              code: code,
              label: label,
              timestamp: Date.now()
            } 
            const sev = detectSeverity(code, speed)
            if (!acknowledgeViolation){
              dispatch(addViolationToSupabase({ userId: userId, violationCode: code, severity: sev }));
            }
          }
          resetViolationState();
          clearTimeout(timerId);
          return 0;
        }
      });
    };

    timerId = setInterval(tick, 1000);

    return () => clearInterval(timerId); // Cleanup the timer
  };

  const handleAcknowledgeViolation = () => {
    resetViolationState();
    lastViolation = {
      code: 'ACKNOWLEDGE',
      label: 'ACKNOWLEDGE',
      timestamp: Date.now()
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log(t('sensorDataCollector.permissionDenied'));
        return;
      }

      if (!userId) {
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

            const kmConv = 3.6;
            const speedKMH = (loc?.coords?.speed || 0) * kmConv;
            setSpeed(speedKMH);
            dispatch(updateLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude }));
            dispatch(updateSpeed(speedKMH));

            const currentSpeedLimit = await getSpeedLimitMapbox(loc.coords.latitude, loc.coords.longitude);
            dispatch(updateSpeedLimit(currentSpeedLimit));
            console.log('check speed: ', speedKMH, currentSpeedLimit);
            if ((speedKMH !== null || speedKMH !== 0) && speedKMH > currentSpeedLimit) {
              console.log('sending speed violation: ', speedKMH, currentSpeedLimit);
              const violationCode = 'SPEEDING';
              handleViolation(violationCode, violationCode);
            }

            {
              dangerZones.length > 0 && dangerZones.forEach(dangerZone => {
                const userPoint = point([loc.coords.longitude, loc.coords.latitude]);
                const coords = dangerZone.coordinates;
                // console.log('label: ', dangerZone.label);
                if (coords && (typeof coords === 'object' && Object.keys(coords).length > 0)) {
                  const polygon = dangerZone.coordinates.features[0].geometry;
                  if (booleanPointInPolygon(userPoint, polygon)) {
                    const violationCode = 'GEOFENCE_VIOLATION';
                    handleViolation(violationCode, dangerZone.label);
                  }
                }
              });
            }

            if (loc.coords.speed) {
              const driverData = {
                speed: loc.coords.speed || 0,
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                timestamp: new Date().toISOString(),
                user_id: userId,
                activity: await detectActivity(loc.coords.speed || 0)
              };
  
              sendDriverData(driverData);
            }
          }
        },
        (error) => {
          console.log('Error watching position: ', error);
        }
      );
    })();
  }, [dispatch, dangerZones, userId]);

  useEffect(() => {
    Accelerometer.setUpdateInterval(200);
    const subscription = Accelerometer.addListener((data) => {
      const calculatedAcceleration = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
      setAcceleration(calculatedAcceleration);
      dispatch(updateAcceleration(calculatedAcceleration));
    });

    return () => subscription.remove();
  }, [dispatch, userId]);

  useEffect(()=>{
    fetchDangerZones();
  }, [userId])

  return (
    <Modal isVisible={isViolationModalVisible}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalText}>
          {t('sensorDataCollector.violationDetected')}! {violationTimer}
        </Text>
        <TouchableOpacity style={styles.modalButton} onPress={handleAcknowledgeViolation}>
          <Text style={styles.modalButtonText}>{t('sensorDataCollector.acknowledge')}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 12,
  },
  modalButton: {
    backgroundColor: '#343b6e',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SensorDataCollector;