import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import SignUp from '../components/auth/SignUp';
import SignIn from '../components/auth/SignIn';
import ForgotPassword from '../components/auth/ForgotPassword';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { clearAuth } from '../store/authSlice';

const Auth = () => {
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useAppSelector((state) => state.auth);

  const [activeScreen, setActiveScreen] = useState('SignIn');

  const handleSignOut = () => {
    dispatch(clearAuth());
  };

  let content;
  if (isLoggedIn) {
    content = (
      <View style={styles.content}>
        <Text style={styles.title}>You are logged in!</Text>
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
      {!isLoggedIn && (
        <View style={styles.buttonContainer}>
          <Button title="Sign Up" onPress={() => setActiveScreen('SignUp')} />
          <Button title="Sign In" onPress={() => setActiveScreen('SignIn')} />
          <Button title="Forgot Password" onPress={() => setActiveScreen('ForgotPassword')} />
        </View>
      )}
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
});

export default Auth;
