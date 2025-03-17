import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { signIn } from '../../lib/supabase';
import { useAppDispatch } from '../../hooks/useRedux';
import { setAuth } from '../../store/authSlice';
import { Dispatch, SetStateAction } from 'react';
import { useNavigation } from '@react-navigation/native';

interface SignInProps {
  setActiveScreen: Dispatch<SetStateAction<string>>;
}

const SignIn = ({ setActiveScreen }: SignInProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const handleSignIn = async () => {
    const { data, error } = await signIn({ email, password });

    if (error) {
      Alert.alert('Sign In Failed', error.message);
    } else {
      if (data.session && data.session.user) {
        dispatch(setAuth({ userId: data.session.user.id!, email: data.session.user.email!, role: data.session.user.app_metadata.role as 'family' | 'parent' }));
        navigation.navigate('(tabs)' as never);
      } else {
        Alert.alert('Sign In Failed', 'Could not retrieve user data.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Sign In" onPress={handleSignIn} />

      <View style={styles.buttonContainer}>
        <Button title="Sign Up" onPress={() => setActiveScreen('SignUp')} />
        <Button title="Forgot Password" onPress={() => setActiveScreen('ForgotPassword')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'left',
    width: '100%',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    height: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
});

export default SignIn;
