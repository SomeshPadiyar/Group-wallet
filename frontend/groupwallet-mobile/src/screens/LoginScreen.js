import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loginMethod, setLoginMethod] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    checkExistingLogin();
  }, []);

  const checkExistingLogin = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.email && user.name && user.phone) {
          navigation.replace('Home');
        }
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    return phone.length === 10 && /^\d+$/.test(phone);
  };

  const handleSignup = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://group-wallet-backend.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase()
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        
        if (response.status === 400) {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Registration failed');
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      Alert.alert(
        'OTP Sent',
        `OTP has been sent to your email: ${email}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('OTP', { 
              name: name.trim(),
              phone: phone.trim(),
              email: email.trim().toLowerCase(),
              loginMethod: 'signup',
              debugOtp: data.debugOtp,
              isDemoMode: isDemoMode
            })
          }
        ]
      );
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Registration Failed', error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://group-wallet-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim()
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        
        if (response.status === 404) {
          throw new Error('User not found. Please check your details or sign up for a new account.');
        }
        
        if (response.status === 400) {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Login failed');
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      Alert.alert(
        'OTP Sent',
        `OTP has been sent to your registered email: ${data.email}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('OTP', { 
              name: name.trim(),
              phone: phone.trim(),
              email: data.email,
              loginMethod: 'login',
              debugOtp: data.debugOtp,
              isDemoMode: isDemoMode
            })
          }
        ]
      );
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodChange = (method) => {
    setLoginMethod(method);
  };

  const handleAction = () => {
    if (loginMethod === 'signup') {
      handleSignup();
    } else {
      handleLogin();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo */}
        <View style={styles.header}>
          <Text style={styles.title}>Group Wallet</Text>
          <Text style={styles.subtitle}>Secure multi-signature expense tracking</Text>
        </View>

        {/* SIMPLE LOGIN/SIGNUP TOGGLE */}
        <View style={styles.methodToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              loginMethod === 'login' && styles.toggleButtonActive
            ]}
            onPress={() => handleMethodChange('login')}
          >
            <Text style={[
              styles.toggleButtonText,
              loginMethod === 'login' && styles.toggleButtonTextActive
            ]}>
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              loginMethod === 'signup' && styles.toggleButtonActive
            ]}
            onPress={() => handleMethodChange('signup')}
          >
            <Text style={[
              styles.toggleButtonText,
              loginMethod === 'signup' && styles.toggleButtonTextActive
            ]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Container */}
        <View style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
              editable={!isLoading}
            />
          </View>

          {/* Email Field - Only for Signup */}
          {loginMethod === 'signup' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>
          )}

          {/* Demo Mode Option - Replaces Remember Me */}
          <View style={styles.rememberMeContainer}>
            <Switch
              value={isDemoMode}
              onValueChange={setIsDemoMode}
              trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
              thumbColor={isDemoMode ? '#2563EB' : '#9CA3AF'}
            />
            <View style={styles.demoLabelContainer}>
              <Text style={styles.rememberMeText}>Demo Mode</Text>
              {isDemoMode && (
                <View style={styles.demoBadge}>
                  <Text style={styles.demoBadgeText}>OTP Visible</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={[
            styles.button,
            (!name.trim() || !phone.trim() || (loginMethod === 'signup' && !email.trim()) || isLoading) && styles.buttonDisabled
          ]}
          onPress={handleAction}
          disabled={!name.trim() || !phone.trim() || (loginMethod === 'signup' && !email.trim()) || isLoading}
        >
          {isLoading ? (
            <View style={styles.buttonLoading}>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.buttonLoadingText}>
                {loginMethod === 'signup' ? 'Creating Account...' : 'Logging in...'}
              </Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>
              {loginMethod === 'signup' ? 'Create Account' : 'Login to Account'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>Secure OTP-based authentication</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748B',
    lineHeight: 22,
  },
  // SIMPLE TOGGLE STYLES
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 6,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleButton: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  toggleButtonActive: {
    backgroundColor: '#2563EB',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleButtonTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 16,
    color: '#1E293B',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  demoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberMeText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  demoBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  demoBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonLoadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  securityBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  securityIcon: {
    fontSize: 16,
  },
  securityText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
});