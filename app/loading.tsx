import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { supabase } from '../lib/supabase';
import { setAuth } from '../store/authSlice';
import { useRouter, Redirect } from 'expo-router';
import { RootState } from '../store';

const Loading = () => {
  console.log("Loading component mounted");
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('is loading, check section: ', session);

      if (session) {
        dispatch(setAuth({ userId: session.user.id!, email: session.user.email!, role: session.user.app_metadata.role as 'family' | 'parent' }));
      }
    };

    checkSession();
  }, []);

  const { isLoggedIn, hasCompletedOnboarding } = useAppSelector((state: RootState) => state.auth);
  console.log('Aqui: ', hasCompletedOnboarding);
  if (isLoggedIn) {
    console.log('Aqui: ', hasCompletedOnboarding);
    if (!hasCompletedOnboarding) {
      return <Redirect href="/onboarding" />;
    }
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/auth" />;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Loading;
