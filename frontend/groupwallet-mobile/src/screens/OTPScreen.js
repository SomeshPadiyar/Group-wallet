import React, { useState, useRef, useEffect } from 'react';
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
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OTPScreen({ route, navigation }) {
  const { name, phone, email, loginMethod, debugOtp, isDemoMode } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const autoFillOTP = () => {
    if (debugOtp && debugOtp.length === 6) {
      const otpArray = debugOtp.split('');
      setOtp(otpArray);
      
      setTimeout(() => {
        inputRefs.current[5]?.focus();
      }, 100);
    }
  };

  const handleVerifyOTP = async (enteredOtp = otp.join('')) => {
    if (enteredOtp.length !== 6) {
      Alert.alert('Error', 'Please enter 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = loginMethod === 'signup' 
        ? 'https://group-wallet-backend.onrender.com/api/auth/verify-signup'
        : 'https://group-wallet-backend.onrender.com/api/auth/verify-login';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          otp: enteredOtp
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Verification error response:', errorText);
        
        if (response.status === 400) {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Invalid OTP');
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      await AsyncStorage.setItem('currentUser', JSON.stringify(data.user));
      
      Alert.alert(
        'Success!',
        loginMethod === 'signup' ? 'Account created successfully!' : 'Login successful!',
        [
          {
            text: 'Continue',
            onPress: () => navigation.replace('Home')
          }
        ]
      );
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert('Verification Failed', error.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    
    try {
      const endpoint = loginMethod === 'signup' 
        ? 'https://group-wallet-backend.onrender.com/api/auth/signup'
        : 'https://group-wallet-backend.onrender.com/api/auth/login';

      const body = loginMethod === 'signup'
        ? { name, phone, email }
        : { name, phone };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Resend OTP error response:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      setTimeLeft(600);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
      
      Alert.alert('OTP Sent', 'New OTP has been sent to your email');
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const maskedEmail = () => {
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 3 
      ? local.substring(0, 3) + '*'.repeat(local.length - 3)
      : '*'.repeat(local.length);
    return `${maskedLocal}@${domain}`;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit verification code to your email address
          </Text>
        </View>

        {/* Email Display */}
        <View style={styles.emailContainer}>
          <Text style={styles.emailLabel}>Email sent to:</Text>
          <Text style={styles.emailText}>{maskedEmail()}</Text>
        </View>

        {/* DEBUG OTP Display - Only show in Demo Mode */}
        {isDemoMode && debugOtp && (
          <TouchableOpacity 
            style={styles.debugOtpContainer}
            onPress={autoFillOTP}
          >
            <Text style={styles.debugOtpTitle}>DEMO OTP</Text>
            <Text style={styles.debugOtpCode}>{debugOtp}</Text>
            <Text style={styles.debugOtpHint}>Tap to auto-fill OTP</Text>
          </TouchableOpacity>
        )}

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          <Text style={styles.otpLabel}>Enter Verification Code</Text>
          <View style={styles.otpInputsContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!isLoading}
              />
            ))}
          </View>
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            Code expires in: <Text style={styles.timerHighlight}>{formatTime(timeLeft)}</Text>
          </Text>
        </View>

        {/* Verify Button */}
        <TouchableOpacity 
          style={[
            styles.verifyButton,
            (otp.join('').length !== 6 || isLoading) && styles.verifyButtonDisabled
          ]}
          onPress={() => handleVerifyOTP()}
          disabled={otp.join('').length !== 6 || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.verifyButtonText}>
              Verify & {loginMethod === 'signup' ? 'Create Account' : 'Login'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Resend OTP */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity 
            onPress={handleResendOTP}
            disabled={!canResend || isLoading}
          >
            <Text style={[
              styles.resendButtonText,
              (!canResend || isLoading) && styles.resendButtonDisabled
            ]}>
              {canResend ? 'Resend OTP' : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.backButtonText}>← Back to {loginMethod === 'signup' ? 'Sign Up' : 'Login'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  emailContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  emailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  // DEBUG OTP Styles
  debugOtpContainer: {
    backgroundColor: '#28A745',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1e7e34',
    shadowColor: '#28A745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  debugOtpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  debugOtpCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 8,
    marginBottom: 8,
  },
  debugOtpHint: {
    fontSize: 14,
    color: 'white',
    fontStyle: 'italic',
    opacity: 0.9,
  },
  otpContainer: {
    marginBottom: 20,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  otpInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#f8f9fa',
  },
  otpInputFilled: {
    borderColor: '#007AFF',
    backgroundColor: '#e6f2ff',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    color: '#666',
  },
  timerHighlight: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  resendButtonDisabled: {
    color: '#ccc',
  },
  backButton: {
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
});