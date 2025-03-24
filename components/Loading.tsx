import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useAppSelector } from '../hooks/useRedux';
import { Redirect } from 'expo-router';
import { RootState } from '../store';
import { useTranslation } from 'react-i18next';

const Loading = () => {
  console.log("Loading component mounted");
  const { t } = useTranslation();

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
