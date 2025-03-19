import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Provider } from 'react-redux';
import { store, persistor } from '../store';
import { PersistGate } from 'redux-persist/integration/react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';
import i18next from '../i18n';

function RootLayoutInner() {
  useFrameworkReady();

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
