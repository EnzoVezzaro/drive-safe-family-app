import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { collectSensorData } from './components/SensorDataCollector';
import { RootState } from './store';
import { store } from './store';

export const BACKGROUND_FETCH_TASK = 'sensor-data-fetch';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async ({ data, error }: any) => {
  const now = Date.now();

  console.log(`[BackgroundFetch] Task started at: ${new Date(now).toISOString()}`);

  const state = store.getState() as RootState;
  const userId = state.auth.userId;
  const dangerZones = state.driving.alertZones;

  console.log(`[BackgroundFetch] User ID: ${userId}`);
  console.log(`[BackgroundFetch] Data:`, data ? 'true' : 'false');
  // console.log(`[BackgroundFetch] Data Object:`, JSON.stringify(data));
  console.log(`[BackgroundFetch] Error:`, error ? 'true' : 'false');

  // Call the collectSensorData function
  if (userId) {
    console.log(`[BackgroundFetch] Location:`, data?.locations ? 'true' : 'false');
    if (data?.locations){
      const coords = data?.locations[0];
      console.log('[BackgroundFetch] Collecting sensor data...');
      await collectSensorData(store.dispatch, userId, dangerZones, coords);
      console.log('[BackgroundFetch] Sensor data collection complete.');
    }
  } else {
    console.log('No user ID available for background task.');
  }
});