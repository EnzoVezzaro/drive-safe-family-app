import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { collectAccelerationData } from '../components/SensorDataCollector';
import { RootState } from '../store';
import { store } from '../store';

export const BACKGROUND_ACCELERATION_FETCH_TASK = 'sensor-acceleration-fetch';

TaskManager.defineTask(BACKGROUND_ACCELERATION_FETCH_TASK, async ({ data, error }: any) => {
  const now = Date.now();

  console.log(`[BackgroundAcceleration] Task started at: ${new Date(now).toISOString()}`);

  const state = store.getState() as RootState;
  const userId = state.auth.userId;
  
  console.log(`[BackgroundAcceleration] User ID: ${userId}`);
  console.log(`[BackgroundAcceleration] Data:`, data ? 'true' : 'false');
  console.log(`[BackgroundAcceleration] Error:`, error ? 'true' : 'false');

  // Call the collectSensorData function
  if (userId) {
    console.log(`[BackgroundAcceleration] Location:`, data?.locations ? 'true' : 'false');
    if (data?.locations){
      console.log('[BackgroundAcceleration] Collecting Accelerometer sensor data...');
      await collectAccelerationData(store.dispatch, userId)
      console.log('[BackgroundAcceleration] Sensor data collection complete.');
    }
  } else {
    console.log('No user ID available for background task.');
  }

  // After the task runs, stop further updates to avoid unnecessary calls
  await Location.stopLocationUpdatesAsync(BACKGROUND_ACCELERATION_FETCH_TASK);
  console.log('Background task stopped after first execution');
});