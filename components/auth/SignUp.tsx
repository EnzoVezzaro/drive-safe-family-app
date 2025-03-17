import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { signUp } from '../../lib/supabase';
import { SelectList } from 'react-native-dropdown-select-list';
import { Dispatch, SetStateAction } from 'react';

interface SignUpProps {
  setActiveScreen: Dispatch<SetStateAction<string>>;
}

const SignUp = ({ setActiveScreen }: SignUpProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const data = [
    { key: 'parent', value: 'parent' },
    { key: 'family_member', value: 'family_member' },
  ];

  const handleSignUp = async () => {
    const { data, error } = await signUp({ email, password, role });

    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else {
      Alert.alert('Sign Up Successful', 'Please check your email to verify your account.');
      setActiveScreen('SignIn');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

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

      <Text style={styles.label}>Role</Text>
      <SelectList
        setSelected={(val: string) => setRole(val)}
        data={data}
        save="value"
        boxStyles={{ borderRadius: 0 }}
        dropdownStyles={{backgroundColor:'#eee'}}
      />

      <Button title="Sign Up" onPress={handleSignUp} />
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
  selectList: {
    width: '100%',
    marginBottom: 10,
  },
});

export default SignUp;
