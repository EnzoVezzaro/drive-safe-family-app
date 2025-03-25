import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import SignUp from '../components/auth/SignUp';
import SignIn from '../components/auth/SignIn';
import ForgotPassword from '../components/auth/ForgotPassword';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { clearAuth } from '../store/authSlice';
import * as Location from 'expo-location';
import { BACKGROUND_FETCH_TASK } from '../backgroundTasks/backgroundTasks';

const Auth = () => {
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useAppSelector((state) => state.auth);

  const [activeScreen, setActiveScreen] = useState('SignIn');

  const handleSignOut = async () => {
    const stopTracking = async () => {
      try {
        console.log('Stopping background tracking');
        if (await Location.hasStartedLocationUpdatesAsync(BACKGROUND_FETCH_TASK)) {
          await Location.stopLocationUpdatesAsync(BACKGROUND_FETCH_TASK);
          console.log('Background tracking stopped');
        }
      } catch (error) {
        console.error('Error stopping background tracking:', error);
      }
    };

    await stopTracking();
    await dispatch(clearAuth());
  };

  let content;
  if (isLoggedIn) {
    content = (
      <View>
        <Text>You are logged in!</Text>
        <Button title="Sign Out" onPress={handleSignOut} />
      </View>
    );
  } else {
    switch (activeScreen) {
      case 'SignUp':
        content = <SignUp setActiveScreen={setActiveScreen} />;
        break;
      case 'SignIn':
        content = <SignIn setActiveScreen={setActiveScreen}  />;
        break;
      case 'ForgotPassword':
        content = <ForgotPassword setActiveScreen={setActiveScreen} />;
        break;
      default:
        content = <SignIn setActiveScreen={setActiveScreen} />;
    }
  }

  return (
    <View style={styles.container}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});

export default Auth;
