import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Provider } from 'react-redux';
import { store } from '../store';
import SensorDataCollector from '../components/SensorDataCollector';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <Provider store={store}>
      <SensorDataCollector />
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </>
    </Provider>
  );
}
