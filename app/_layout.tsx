import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Provider } from 'react-redux';
import { store, persistor } from '../store';
import { PersistGate } from 'redux-persist/integration/react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';
import i18next from '../i18n';
import { BACKGROUND_FETCH_TASK, registerBackgroundFetchAsync, unregisterBackgroundFetchAsync } from '../backgroundTasks';
import { useEffect, useState } from 'react';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

function RootLayoutInner() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [status, setStatus] = useState<BackgroundFetch.BackgroundFetchStatus | null>(null);

  useFrameworkReady();

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
    if (isRegistered) {
      await unregisterBackgroundFetchAsync();
    } else {
      await registerBackgroundFetchAsync();
    }

    checkStatusAsync();
  };

  useEffect(() => {
    toggleFetchTask();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{ headerShown: false }}
        initialRouteName="loading"
      >
        <Stack.Screen name="loading" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <I18nextProvider i18n={i18next}>
          <RootLayoutInner />
        </I18nextProvider>
      </PersistGate>
    </Provider>
  );
}
