import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { supabase } from '../lib/supabase';
import { setAuth } from '../store/authSlice';
import { useRouter, Redirect } from 'expo-router';
import { RootState } from '../store';
import { useTranslation } from 'react-i18next';

const Loading = () => {
  console.log("Loading component mounted");
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  
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

  const { hasCompletedOnboarding } = useAppSelector((state: RootState) => state.auth);
  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/icon.png')} style={styles.logo} />
      <Text>{t('loading.loading')}...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Loading;
