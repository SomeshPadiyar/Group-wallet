import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WithdrawalScreen({ route, navigation }) {
  const { groupId, transactionId } = route.params;
  const [transaction, setTransaction] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }

      const transactionDetails = await api.getPaymentDetails(groupId, transactionId);
      setTransaction(transactionDetails);
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load withdrawal details');
    } finally {
      setIsLoading(false);
    }
  };

  const validateUpiId = (upi) => {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return upiRegex.test(upi);
  };

  const handleCompleteWithdrawal = async () => {
    if (!validateUpiId(upiId)) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID (e.g., username@oksbi)');
      return;
    }

    if (!transaction || transaction.type !== 'withdrawal') {
      Alert.alert('Error', 'Invalid withdrawal transaction');
      return;
    }

    if (transaction.status !== 'approved') {
      Alert.alert('Error', 'This withdrawal is not ready for processing');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Show processing state
      Alert.alert(
        'Processing Withdrawal',
        'Sending money to your UPI ID...',
        [],
        { cancelable: false }
      );

      // Simulate UPI payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Complete withdrawal on backend
      const result = await api.completeWithdrawal(groupId, transactionId, {
        upiId: upiId,
        paymentId: 'withdrawal_' + Date.now()
      });

      Alert.alert(
        '✅ Withdrawal Successful!',
        `₹${transaction.amount} has been sent to your UPI ID: ${upiId}`,
        [
          {
            text: 'View Group',
            onPress: () => navigation.navigate('GroupDetails', { groupId })
          }
        ]
      );

    } catch (error) {
      console.error('Withdrawal error:', error);
      Alert.alert('Withdrawal Failed', 'Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading withdrawal details...</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Withdrawal not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Complete Withdrawal</Text>
          <Text style={styles.transactionId}>#{transactionId.slice(-6)}</Text>
        </View>

        {/* Transaction Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.amount}>₹{transaction.amount}</Text>
          <Text style={styles.description}>
            {transaction.description || 'Group Withdrawal'}
          </Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>Withdrawal</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[styles.detailValue, styles.statusApproved]}>
              Approved - Ready for Withdrawal
            </Text>
          </View>
        </View>

        {/* UPI Input */}
        <View style={styles.upiContainer}>
          <Text style={styles.upiLabel}>Enter Your UPI ID</Text>
          <TextInput
            style={styles.upiInput}
            placeholder="e.g., username@oksbi, username@ybl"
            value={upiId}
            onChangeText={setUpiId}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          <Text style={styles.upiHelper}>
            We'll send ₹{transaction.amount} to this UPI ID
          </Text>
        </View>

        {/* UPI Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Popular UPI Apps</Text>
          <Text style={styles.infoText}>
            • Google Pay: username@okicici{'\n'}
            • PhonePe: username@ybl{'\n'}
            • Paytm: username@paytm{'\n'}
            • Any UPI app: username@bankname
          </Text>
        </View>

        {/* Withdrawal Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.withdrawalButton,
              (!upiId || isProcessing) && styles.buttonDisabled
            ]}
            onPress={handleCompleteWithdrawal}
            disabled={!upiId || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.withdrawalButtonText}>
                💸 Withdraw to UPI
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isProcessing}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionId: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  detailsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
  },
  statusApproved: {
    color: '#FF9800',
    fontWeight: '600',
  },
  upiContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  upiLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  upiInput: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  upiHelper: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  withdrawalButton: {
    backgroundColor: '#FF3B30',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  withdrawalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  loadingText: {
    marginTop: 15,
    textAlign: 'center',
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
});