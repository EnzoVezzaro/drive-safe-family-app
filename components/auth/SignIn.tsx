import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView, Image, Pressable } from 'react-native';
import { signIn } from '../../lib/supabase';
import { useAppDispatch } from '../../hooks/useRedux';
import { setAuth } from '../../store/authSlice';
import { Dispatch, SetStateAction } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

interface SignInProps {
  setActiveScreen: Dispatch<SetStateAction<string>>;
}

const SignIn = ({ setActiveScreen }: SignInProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const handleSignIn = async () => {
    const { data, error } = await signIn({ email, password });

    if (error) {
      Alert.alert('Sign In Failed', error.message);
    } else {
      if (data.session && data.session.user) {
        
        // Fetch user data from the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (userError) {
          Alert.alert('Error', 'Failed to fetch user data.');
          console.error('Error fetching user data:', userError);
          return;
        }

        if (userData) {
          dispatch(setAuth({
            userId: userData.id,
            email: data.session.user.email!,
            role: data.session.user.app_metadata.role as 'family' | 'parent'
          }));
          navigation.navigate('(tabs)' as never);
        } else {
          Alert.alert('Sign In Failed', 'Could not retrieve user data from users table.');
        }
      } else {
        Alert.alert('Sign In Failed', 'Could not retrieve user data.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Login to DriveSafe Family</Text>
        
        <View style={styles.loginPrompt}>
          <Text style={styles.promptText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => setActiveScreen('SignUp')}>
            <Text style={styles.loginLink}>Signup</Text>
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

        <TouchableOpacity onPress={() => setActiveScreen('ForgotPassword')}>
          <Text style={styles.forgotPassword}>Recovery Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.continueButton} onPress={handleSignIn}>
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
  forgotPassword: {
    color: '#888',
    textAlign: 'right',
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
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

export default SignIn;
