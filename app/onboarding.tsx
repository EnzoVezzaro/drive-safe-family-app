import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { useAppDispatch } from '../hooks/useRedux';
import { setOnboardingComplete } from '../store/authSlice';
import { useRouter } from 'expo-router';
import i18n from '../i18n';

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
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      dispatch(setOnboardingComplete());
      router.navigate('/(tabs)');
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
        <Text style={styles.description}>{onboardingData[currentIndex].description}</Text>
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
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === onboardingData.length - 1 ? i18n.t('onboarding.getStarted') : i18n.t('onboarding.next')}
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
