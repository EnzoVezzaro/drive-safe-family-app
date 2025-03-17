import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { passwordReset } from '../../lib/supabase';
import { Dispatch, SetStateAction } from 'react';
import { Ionicons } from '@expo/vector-icons';

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
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Recovery Password</Text>
        
        <View style={styles.loginPrompt}>
          <Text style={styles.promptText}>Remember your password? </Text>
          <TouchableOpacity onPress={() => setActiveScreen('SignIn')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.descriptionText}>
          Enter the email address associated with your account and we'll send you a link to reset your password.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleResetPassword}>
          <Text style={styles.continueButtonText}>Send Reset Link</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setActiveScreen('SignIn')}
        >
          <Ionicons name="arrow-back" size={20} color="#6C63FF" />
          <Text style={styles.backButtonText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#111',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  promptText: {
    color: '#333',
  },
  loginLink: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
    position: 'relative',
  },
  input: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#6C63FF',
    fontSize: 16,
    marginLeft: 8,
  }
});

export default ForgotPassword;