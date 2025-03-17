import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Provider } from 'react-redux';
import { store } from '../store';
import { ScrollView, RefreshControl, Alert } from 'react-native';
import i18n from '../i18n';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import React, { useEffect, useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter, Stack } from 'expo-router';
import { setAuth } from '../store/authSlice';
import { StatusBar } from 'expo-status-bar';

function RootLayoutInner() {
  useFrameworkReady();
  const [refreshing, setRefreshing] = useState(false);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate fetching data
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        dispatch(setAuth({ userId: session.user.id!, email: session.user.email!, role: 'family' }));
      } else {
        Alert.alert('Session Expired', 'Please log in again.', [
          {
            text: 'OK',
            onPress: () => router.replace('/auth'),
          },
        ]);
      }
    };

    checkSession();
  }, []);

  return (
    <Stack
      screenOptions={{ headerShown: false }}
      initialRouteName={isLoggedIn ? '(tabs)' : 'auth'}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="+not-found" />
      <StatusBar style="auto" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutInner />
    </Provider>
  );
}
