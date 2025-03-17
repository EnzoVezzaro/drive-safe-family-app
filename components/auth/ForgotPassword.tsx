import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { passwordReset } from '../../lib/supabase';
import { Dispatch, SetStateAction } from 'react';

interface ForgotPasswordProps {
  setActiveScreen: Dispatch<SetStateAction<string>>;
}

const ForgotPassword = ({ setActiveScreen }: ForgotPasswordProps) => {
  const [email, setEmail] = useState('');

  const handleResetPassword = async () => {
    const { data, error } = await passwordReset({ email });

    if (error) {
      Alert.alert('Reset Password Failed', error.message);
    } else {
      Alert.alert('Reset Password Successful', 'Please check your email to reset your password.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button title="Reset Password" onPress={handleResetPassword} />
      <Button title="Back to Sign In" onPress={() => setActiveScreen('SignIn')} />
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
});

export default ForgotPassword;
