import React, { useState, useEffect, useCallback } from 'react';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { updateAcceleration, updateLocation, updateSpeed, updateSpeedLimit, updateAlertZones, addViolationToSupabase } from '../store/drivingSlice';
import { getSpeedLimitMapbox, sendDriverData, SPEED_LIMIT_DEFAULT } from '../api/trafficApi';
import { RootState, AppDispatch } from '../store';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import Modal from 'react-native-modal';
import { View, StyleSheet, TouchableOpacity, Text, AppState, AppStateStatus } from 'react-native';
import { BACKGROUND_FETCH_TASK } from '@/backgroundTasks';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

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

export const detectActivity = (speed: number) => {
  if (speed < 2) {
    return 'STATIONARY';
  } else if (speed >= 2 && speed <= 5) {
    return 'WALKING';
  } else if (speed >= 5 && speed <= 15) {
    return 'DRIVING_LOW_SPEED';
  } else if (speed >= 120) {
    return 'DRIVING_HIGH_SPEED';
  } else {
    return 'DRIVING';
  }
};

// Thresholds for speeding
export const SPEEDING_THRESHOLDS = {
  LOW: 20,
  MODERATE: 40,
  HIGH: 60,
};

export const DISTANCE_THRESHOLD = 100; // 100 meters

export const detectSeverity = (violationType: string, speed?: number, speedLimit?: number) => {
  let severity = 1;

  switch (violationType) {
    case 'RED_LIGHT':
      severity = 5;
      break;
    case 'SPEEDING':
      if (speed !== undefined) {
        const limit = speedLimit || SPEED_LIMIT_DEFAULT;
        if ((speed - limit) <= SPEEDING_THRESHOLDS.LOW) {
          severity = 1;
        } else if ((speed - limit) <= SPEEDING_THRESHOLDS.MODERATE) {
          severity = 2;
        } else if ((speed - limit) <= SPEEDING_THRESHOLDS.HIGH) {
          severity = 3;
        } else {
          severity = 4;
        }
      } else {
        severity = 1;
      }
      break;
    case 'PARKING':
      severity = 2;
      break;
    case 'CROSSWALK':
      severity = 3;
      break;
    case 'GEOFENCE':
    case 'GEOFENCE_VIOLATION':
      severity = 1;
      break;
    default:
      severity = 1;
      break;
  }

  return severity;
};

export const collectSensorData = async (dispatch: AppDispatch, userId: string, dangerZones: DangerZone[], loc: any) => {
  try {
    console.log('[collectSensorData] Sensor data collection checking permissions.');
    let { status } = await Location.getBackgroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied.');
      return;
    }

    if (loc) {
      console.log('[collectSensorData] Sensor data collection getting coords.');
      console.log('[collectSensorData] Sensor data collection SPEED: ', loc?.coords?.speed);
      const speedKMH = loc?.coords?.speed || 0;
      dispatch(updateLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude }));
      dispatch(updateSpeed(speedKMH));
      console.log('[collectSensorData] Save speed.');
      const currentSpeedLimit = await getSpeedLimitMapbox(loc.coords.latitude, loc.coords.longitude); 
      console.log('[collectSensorData] currentSpeedLimit: ', currentSpeedLimit);
      dispatch(updateSpeedLimit(currentSpeedLimit));
      console.log('[collectSensorData] Updated speed limit:', currentSpeedLimit);
      if ((speedKMH > 0) && speedKMH > currentSpeedLimit) {
        console.log('[collectSensorData] Sending speed violation: ', speedKMH, currentSpeedLimit);
        const violationCode = 'SPEEDING'; 
        const sev = detectSeverity(violationCode, speedKMH, currentSpeedLimit);
        dispatch(addViolationToSupabase({ userId: userId, violationCode: violationCode, severity: sev }));
      }

      if (dangerZones.length > 0) {
        dangerZones.forEach(async (dangerZone) => {
          const userPoint = point([loc.coords.longitude, loc.coords.latitude]);
          const coords = dangerZone.coordinates;
          if (coords && (typeof coords === 'object' && Object.keys(coords).length > 0)) {
            const polygon = dangerZone.coordinates.features[0].geometry;
            if (booleanPointInPolygon(userPoint, polygon)) {
              const violationCode = 'GEOFENCE_VIOLATION';
              const sev = detectSeverity(violationCode, speedKMH || 0);
              console.log('[collectSensorData] Sending Geofence violation: ', violationCode);
              dispatch(addViolationToSupabase({ userId: userId, violationCode: violationCode, severity: sev, geo_id: dangerZone.id }));
            }
          }
        });
      }

      if (loc.coords.speed !== null) {
        const driverData = {
          speed: loc.coords.speed || 0,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          timestamp: new Date().toISOString(),
          user_id: userId,
          activity: detectActivity(loc.coords.speed || 0)
        };

        sendDriverData(driverData);
      }
    }
  } catch (error) {
    console.error('Error collecting sensor data:', error);
  }
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
  const locationTrackingEnabled = useSelector((state: RootState) => state.driving.locationTrackingEnabled);
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  const [isViolationModalVisible, setViolationModalVisible] = useState(false);
  const [violationTimer, setViolationTimer] = useState(10);
  const [isViolationTimerRunning, setIsViolationTimerRunning] = useState(false);
  const [lastViolation, setLastViolation] = useState<{code: string; label: string; timestamp: string} | null>(null);
  const [acknowledgeViolation, setAcknowledgeViolation] = useState(false);

  const [isRegistered, setIsRegistered] = useState(false);
  const [status, setStatus] = useState<BackgroundFetch.BackgroundFetchStatus | null>(null);
  const [locationStarted, setLocationStarted] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);

  const checkStatusAsync = async () => {
    const statusBackground = await BackgroundFetch.getStatusAsync();
    console.log('Checking background status: ', statusBackground);
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    console.log('Checking background register: ', isRegistered);
    setStatus(statusBackground);
    setIsRegistered(isRegistered);
    console.log('Status: ', BackgroundFetch.BackgroundFetchStatus[statusBackground || 0]);
  };

  const toggleFetchTask = async () => {
    await checkStatusAsync();
  };

  useEffect(() => {
    const fetchData = async () => {
      await toggleFetchTask();
    };
  
    fetchData();
  }, []);

  const fetchDangerZones = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('danger_zones')
      .select('*')
      .eq('created_by', userId)
      .eq('deleted', false);

    if (error) {
      console.error('Error fetching danger zones:', error);
    } else {
      setDangerZones(data || []);
      dispatch(updateAlertZones(data || []));
    }
  }, [dispatch, userId]);

  const resetViolationState = () => {
    setViolationModalVisible(false);
    setViolationTimer(10);
    setIsViolationTimerRunning(false);
  };

  const handleViolation = (code: string, label: string, geo_id?: string) => {
    if (isViolationTimerRunning) {
      return; // Ignore violations if timer is running
    }

    if (lastViolation?.timestamp) {
      const currentTime = new Date(); // Create a Date object for the current time
      const lastViolationTime = new Date(lastViolation.timestamp); // Create a Date object for last violation's timestamp
    
      const twoMinutesInMilliseconds = 2 * 60 * 1000; // 2 minutes in milliseconds
    
      // Calculate the time difference in milliseconds
      const timeDifference = currentTime.getTime() - lastViolationTime.getTime();
    
      if (timeDifference < twoMinutesInMilliseconds) {
        return; // Ignore violations if the same has been added 2 minutes ago
      }
    }
    setViolationModalVisible(true);
    setIsViolationTimerRunning(true);

    let timerId: NodeJS.Timeout;

    const tick = () => {
      setViolationTimer((prevTimer) => {
        if (prevTimer > 1) {
          return prevTimer - 1;
        } else {
          if (userId && code) {
            setLastViolation({
              code: code,
              label: label,
              timestamp: new Date().toISOString(),
            });
            const sev = detectSeverity(code, speed);
            if (!acknowledgeViolation) {
              dispatch(addViolationToSupabase({ userId: userId, violationCode: code, severity: sev, geo_id: geo_id }));
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
    setLastViolation({
      code: 'ACKNOWLEDGE',
      label: 'ACKNOWLEDGE',
      timestamp: new Date().toISOString()
    });
  };

  const startBackgroundTracking = async () => {
    try {
      console.log('Starting background tracking');

      // First check if background tracking is already running
      const isRunning = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_FETCH_TASK).catch(() => false);
      if (isRunning) {
        console.log('Background tracking is already running');
        setLocationStarted(true);
        return;
      }
      
      await Location.startLocationUpdatesAsync(BACKGROUND_FETCH_TASK, {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: DISTANCE_THRESHOLD,
        foregroundService: {
          notificationTitle: "Location Tracking",
          notificationBody: "Tracking your driving activity"
        },
        // This ensures it keeps running in background
        deferredUpdatesDistance: DISTANCE_THRESHOLD
      });
      
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_FETCH_TASK);
      setLocationStarted(hasStarted);
      console.log('Background tracking started:', hasStarted);
    } catch (error) {
      console.error('Error starting background tracking:', error);
    }
  };

  const stopBackgroundTracking = async () => {
    try {
      console.log('Stopping background tracking');
      if (await Location.hasStartedLocationUpdatesAsync(BACKGROUND_FETCH_TASK)) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_FETCH_TASK);
        setLocationStarted(false);
        console.log('Background tracking stopped');
      }
    } catch (error) {
      console.error('Error stopping background tracking:', error);
    }
  };

  const throttledLocationUpdate = async (loc: any) => {
    if (!loc) return;

    const locationTrackingEnabled = useSelector((state: RootState) => state.driving.locationTrackingEnabled);
    console.log('[throttledLocationUpdate] Location update:', loc, locationTrackingEnabled);

    if (!locationTrackingEnabled) {
      console.log('Location tracking disabled, skipping update');
      return;
    }
    
    // Update basic location info immediately
    dispatch(updateLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude }));
    const currentSpeed = loc?.coords?.speed || 0;
    dispatch(updateSpeed(currentSpeed));
    setSpeed(currentSpeed);
    
    // Process geofences if needed
    checkGeofences(loc);
    
    // Send basic driver data without waiting
    const driverData = {
      speed: loc.coords.speed || 0,
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      timestamp: new Date().toISOString(),
      user_id: userId,
      activity: detectActivity(loc.coords.speed || 0)
    };
    
    // Don't await this - let it run in the background
    sendDriverData(driverData);
    
    // Queue up the speed limit check (runs less frequently)
    debouncedSpeedLimitCheck(loc, currentSpeed);
  };
  
  // Create a debounced version of the speed limit API call
  const debouncedSpeedLimitCheck = async (loc: any, currentSpeed: any) => {
    try {
      const currentSpeedLimit = await getSpeedLimitMapbox(loc.coords.latitude, loc.coords.longitude);
      dispatch(updateSpeedLimit(currentSpeedLimit));
      
      // Check for speed violation
      if (currentSpeed > 0 && currentSpeed > currentSpeedLimit) {
        console.log('Speed violation detected:', currentSpeed, currentSpeedLimit);
        const violationCode = 'SPEEDING';
        if (!acknowledgeViolation) {
          handleViolation(violationCode, violationCode);
        }
      }
    } catch (error) {
      console.error('Error checking speed limit:', error);
    }
  };
  
  // Function to check geofences
  const checkGeofences = (loc: any) => {
    if (dangerZones.length === 0) return;
    
    const userPoint = point([loc.coords.longitude, loc.coords.latitude]);
    
    for (const dangerZone of dangerZones) {
      const coords = dangerZone.coordinates;
      if (!coords || typeof coords !== 'object' || Object.keys(coords).length === 0) continue;
      
      try {
        const polygon = dangerZone.coordinates.features[0].geometry;
        if (booleanPointInPolygon(userPoint, polygon)) {
          const violationCode = 'GEOFENCE_VIOLATION';
          if (!acknowledgeViolation) {
            handleViolation(violationCode, dangerZone.label, dangerZone.id); 
          }
          break; // Exit after finding first match to reduce processing
        }
      } catch (error) {
        console.error('Error checking geofence:', error);
      }
    }
  };

  const startForegroundTracking = async () => {
    console.log('Starting foreground tracking');
    
    // Stop any ongoing subscription first
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log(t('sensorDataCollector.permissionDenied'));
      return;
    }

    if (!userId) {
      console.log('No user ID available');
      return;
    }

    try {
      const subscription = await Location.watchPositionAsync(
        { 
          accuracy: Location.Accuracy.BestForNavigation, 
          distanceInterval: DISTANCE_THRESHOLD
        },
        (loc) => {
          // Use throttled handler instead of doing everything inline
          throttledLocationUpdate(loc);
        }
      );
      
      setLocationSubscription(subscription);
      console.log('Foreground tracking started');
    } catch (error) {
      console.log('Error starting foreground tracking:', error);
    }
  };

  const stopForegroundTracking = () => {
    console.log('Stopping foreground tracking: ', locationSubscription);
    if (locationSubscription) {
      locationSubscription.remove();
      console.log('Foreground tracking stopped');
      setLocationSubscription(null);
    }
  };

  // Initial setup on component mount
  useEffect(() => {
    const setupLocationTracking = async () => {
      try {
        // Request permissions
        let forePermission = await Location.requestForegroundPermissionsAsync();
        let backPermission = await Location.requestBackgroundPermissionsAsync();
        
        if (forePermission.status !== 'granted' && backPermission.status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }
        
        console.log('Permission to access location granted');
        
        // Determine initial tracking mode based on app state
        if (AppState.currentState === 'active') {
          console.log('App is active, starting foreground tracking');
          await startForegroundTracking();
          setTimeout(async () => {
            await startBackgroundTracking();
          }, 2000);
        } else {
          console.log('App is in background, starting background tracking');
          // await startBackgroundTracking();
        }
      } catch (error) {
        console.error('Error in setupLocationTracking:', error);
      }
    };

    setupLocationTracking();
  }, []);

  // Accelerometer setup
  useEffect(() => {
    Accelerometer.setUpdateInterval(200);
    const subscription = Accelerometer.addListener((data) => {
      const calculatedAcceleration = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
      setAcceleration(calculatedAcceleration);
      dispatch(updateAcceleration(calculatedAcceleration));
    });

    return () => subscription.remove();
  }, [dispatch]);

  useEffect(() => {
    console.log('[locationTrackingEnabled] Location tracking:', locationTrackingEnabled);
    if (locationTrackingEnabled){
      console.log('[locationTrackingEnabled] Starting again tracking');
      startForegroundTracking();
      setTimeout(async () => {
        await startBackgroundTracking();
      }, 2000);
    } else {
      console.log('[locationTrackingEnabled] Shutting down tracking');
      stopForegroundTracking();
      stopBackgroundTracking();
    }
  }, [locationTrackingEnabled]);

  // Fetch danger zones when userId changes
  useEffect(() => {
    fetchDangerZones();
  }, [fetchDangerZones, userId]);

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
