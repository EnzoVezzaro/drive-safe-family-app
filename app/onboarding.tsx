import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, SafeAreaView, Switch, Alert, Linking, AppState, Platform } from 'react-native';
import { useAppDispatch } from '../hooks/useRedux';
import { setOnboardingComplete } from '../store/authSlice';
import { useRouter } from 'expo-router';
import i18n from '../i18n';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const Logo = require('../assets/images/icon.png');

const onboardingData = [
  {
    title: i18n.t('onboarding.smartGpsTracking'),
    description: i18n.t('onboarding.smartGpsTrackingDescription'),
    image: Logo,
  },
  {
    title: i18n.t('onboarding.protectYourFamily'),
    description: i18n.t('onboarding.protectYourFamilyDescription'),
    image: Logo,
  },
  {
    title: i18n.t('onboarding.userFriendlyDesign'),
    description: i18n.t('onboarding.userFriendlyDesignDescription'),
    image: Logo,
  },
  {
    title: i18n.t('onboarding.permissions'),
    description: i18n.t('onboarding.permissionsDescription'),
    image: Logo,
  },
];

const Onboarding = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [locationAlwaysActive, setLocationAlwaysActive] = useState(false);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    const checkPermissions = async () => {
      await Location.requestForegroundPermissionsAsync();

      let { status: backgroundLocationStatus } = await Location.requestBackgroundPermissionsAsync();
      // For location always, we'll assume it's granted if backgroundLocation is granted
      setLocationAlwaysActive(backgroundLocationStatus === 'granted');
    };

    checkPermissions();
  }, []);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      dispatch(setOnboardingComplete());
      router.navigate('/(tabs)');
    }
  };

  const askPermissionsSettings = async () => {
    const openAppSettings = () => Linking.openURL('app-settings:');
    Alert.alert(
      t('alerts.locationAlways'),
      t('alerts.locationAlwaysDescription'),
      [
        { text: 'Cancel', onPress: () => console.warn('Cancel pressed') },
        { text: 'Open settings', onPress: openAppSettings },
      ]
    );
  }

  const toggleLocationAlways = async () => {
    console.log('toggleLocationAlways');
    let { status } = await Location.requestBackgroundPermissionsAsync();
    console.log('toggleLocationAlways status', status);
    if (status !== 'granted') {
      askPermissionsSettings();
    } else {
      setLocationAlwaysActive(status === 'granted');
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  /*
  const handleSkip = () => {
    dispatch(setOnboardingComplete());
    router.navigate('/(tabs)');
  };
  */

  return (
    <SafeAreaView style={styles.container}>
      {/**
       * <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>skip</Text>
      </TouchableOpacity>
       */}

      <View style={styles.content}>
        <Image 
          source={onboardingData[currentIndex].image}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>{onboardingData[currentIndex].title}</Text>
        {currentIndex === onboardingData.length - 1 ? (
          <View>
            <Text style={styles.description}>{i18n.t('onboarding.permissionsDescription')}</Text>
            <View style={{ marginTop: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text>Location Always</Text>
                <Switch
                  value={locationAlwaysActive}
                  onValueChange={toggleLocationAlways}
                />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text>Background Location</Text>
                <Switch
                  value={locationAlwaysActive}
                  onValueChange={toggleLocationAlways}
                />
              </View>
            </View>
          </View>
        ) : (
          <Text style={styles.description}>{onboardingData[currentIndex].description}</Text>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            disabled={currentIndex === 0}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>
              {i18n.t('onboarding.back')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.nextButton,
              currentIndex === onboardingData.length - 1 && (!locationAlwaysActive)
                ? { backgroundColor: '#DDD' }
                : { backgroundColor: '#4A3AFF' },
            ]}
            onPress={handleNext}
            disabled={currentIndex === onboardingData.length - 1 && (!locationAlwaysActive)}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === onboardingData.length - 1
                ? i18n.t('onboarding.getStarted')
                : i18n.t('onboarding.next')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  footer: {
    padding: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDD',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#4A3AFF',
    width: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#4A3AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    flex: 0.3,
    backgroundColor: '#4A3AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Onboarding;
