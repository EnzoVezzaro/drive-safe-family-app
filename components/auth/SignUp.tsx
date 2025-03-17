import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView, Image, Pressable } from 'react-native';
import { signUp } from '../../lib/supabase';
import { SelectList } from 'react-native-dropdown-select-list';
import { Dispatch, SetStateAction } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface SignUpProps {
  setActiveScreen: Dispatch<SetStateAction<string>>;
}

const SignUp = ({ setActiveScreen }: SignUpProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Create an account</Text>
        
        <View style={styles.loginPrompt}>
          <Text style={styles.promptText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => setActiveScreen('SignIn')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>

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

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={24} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Select your role</Text>
          <SelectList
            setSelected={(val: string) => setRole(val)}
            data={data}
            save="value"
            boxStyles={styles.selectBox}
            dropdownStyles={styles.dropdown}
            inputStyles={styles.selectInput}
            dropdownTextStyles={styles.dropdownText}
            search={false}
            placeholder="Select role"
          />
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleSignUp}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        {/**
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or sign up with</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Image 
              source={{ uri: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png' }} 
              style={styles.socialIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.socialButton}>
            <Image 
              source={{ uri: 'https://www.apple.com/ac/globalnav/7/en_US/images/be15095f-5a20-57d0-ad14-cf4c638e223a/globalnav_apple_image__b5er5ngrzxqq_large.svg' }} 
              style={styles.socialIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.socialButton}>
            <Image 
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/1200px-Facebook_f_logo_%282019%29.svg.png' }} 
              style={styles.socialIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
         */}

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By clicking Create account you agree to Recognotes 
          </Text>
          <View style={styles.termsLinksContainer}>
            <TouchableOpacity>
              <Text style={styles.termsLink}>Terms of use</Text>
            </TouchableOpacity>
            <Text style={styles.termsText}> and </Text>
            <TouchableOpacity>
              <Text style={styles.termsLink}>Privacy policy</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    justifyContent: 'center',
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
    marginBottom: 40,
  },
  promptText: {
    color: '#333',
  },
  loginLink: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
  selectBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 0,
    height: 50,
    alignItems: 'center',
  },
  selectInput: {
    fontSize: 16,
    color: '#333',
  },
  dropdown: {
    backgroundColor: '#F5F5F5',
    borderWidth: 0,
    marginTop: 4,
    borderRadius: 8,
  },
  dropdownText: {
    color: '#333',
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDD',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#777',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  socialButton: {
    width: 80,
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  socialIcon: {
    width: '100%',
    height: '100%',
  },
  termsContainer: {
    alignItems: 'center',
  },
  termsText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  termsLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  termsLink: {
    color: '#6C63FF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SignUp;