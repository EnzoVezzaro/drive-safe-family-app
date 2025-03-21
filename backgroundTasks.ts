import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { collectSensorData } from './components/SensorDataCollector';
import { RootState } from './store';
import { store } from './store';

export const BACKGROUND_FETCH_TASK = 'sensor-data-fetch';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  const now = Date.now();

  console.log(`[BackgroundFetch] Task started at: ${new Date(now).toISOString()}`);

  const state = store.getState() as RootState;
  const userId = state.auth.userId;
  const dangerZones = state.driving.alertZones;

  console.log(`[BackgroundFetch] User ID: ${userId}`);

  // Call the collectSensorData function
  if (userId) {
    console.log('[BackgroundFetch] Collecting sensor data...');
    await collectSensorData(store.dispatch, userId, dangerZones);
    console.log('[BackgroundFetch] Sensor data collection complete.');
  } else {
    console.log('No user ID available for background task.');
  }

  return BackgroundFetch.BackgroundFetchResult.NewData;
});

export async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60 * 5, // 5 minutes
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });
}

export async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}
