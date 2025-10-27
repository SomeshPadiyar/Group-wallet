import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OTPScreen({ route, navigation }) {
  const { name, phone, otp } = route.params;
  const [enteredOTP, setEnteredOTP] = useState('');

  const handleVerifyOTP = async () => {
    if (enteredOTP.length !== 4) {
      Alert.alert('Error', 'Please enter 4-digit OTP');
      return;
    }

    if (enteredOTP === otp) {
      // Create user object
      const user = {
        id: Date.now().toString(),
        name,
        phone,
        createdAt: new Date().toISOString(),
      };

      try {
        // Save user to AsyncStorage
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
        
        // Add to users list
        const existingUsers = await AsyncStorage.getItem('users');
        const users = existingUsers ? JSON.parse(existingUsers) : [];
        users.push(user);
        await AsyncStorage.setItem('users', JSON.stringify(users));

        Alert.alert('Success', 'Login successful!', [
          {
            text: 'OK',
            onPress: () => navigation.replace('Home'),
          },
        ]);
      } catch (error) {
        Alert.alert('Error', 'Failed to save user data');
      }
    } else {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 4-digit OTP sent to your phone
        </Text>
        
        <Text style={styles.phoneText}>Phone: {phone}</Text>
        <Text style={styles.demoOTP}>Demo OTP: {otp}</Text>

        <TextInput
          style={styles.otpInput}
          placeholder="Enter OTP"
          value={enteredOTP}
          onChangeText={setEnteredOTP}
          keyboardType="number-pad"
          maxLength={4}
          textAlign="center"
        />

        <TouchableOpacity style={styles.button} onPress={handleVerifyOTP}>
          <Text style={styles.buttonText}>Verify & Login</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  phoneText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  demoOTP: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 30,
    backgroundColor: '#e6f2ff',
    padding: 10,
    borderRadius: 8,
  },
  otpInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    letterSpacing: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});