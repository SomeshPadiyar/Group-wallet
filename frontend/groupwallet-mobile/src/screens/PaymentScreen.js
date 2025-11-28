import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PaymentScreen({ route, navigation }) {
  const { groupId, transactionId } = route.params;
  const [transaction, setTransaction] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }

      const paymentDetails = await api.getPaymentDetails(groupId, transactionId);
      setTransaction(paymentDetails);
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load transaction details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantPayment = async () => {
    if (!transaction || transaction.type !== 'deposit') {
      Alert.alert('Error', 'Invalid transaction for payment');
      return;
    }

    if (transaction.status !== 'approved') {
      Alert.alert('Error', 'This transaction is not ready for payment');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Show processing state
      Alert.alert(
        'Processing Payment',
        'Completing your deposit...',
        [],
        { cancelable: false }
      );

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Complete payment on backend
      const result = await api.completePayment(groupId, transactionId, {
        paymentId: 'instant_payment_' + Date.now(),
        razorpayOrderId: 'instant_order_' + Date.now()
      });

      Alert.alert(
        '✅ Payment Successful!',
        `₹${transaction.amount} has been added to the group wallet.`,
        [
          {
            text: 'View Group',
            onPress: () => navigation.navigate('GroupDetails', { groupId })
          }
        ]
      );

    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', 'Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading payment details...</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Transaction not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Complete Payment</Text>
        <Text style={styles.transactionId}>#{transactionId.slice(-6)}</Text>
      </View>

      {/* Transaction Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.amount}>₹{transaction.amount}</Text>
        <Text style={styles.description}>
          {transaction.description || 'Group Deposit'}
        </Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type:</Text>
          <Text style={styles.detailValue}>Deposit</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <Text style={[styles.detailValue, styles.statusApproved]}>
            Approved - Ready for Payment
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created:</Text>
          <Text style={styles.detailValue}>
            {new Date(transaction.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Payment Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Instant Payment</Text>
        <Text style={styles.infoText}>
          • Click "Pay Now" to instantly complete this deposit{'\n'}
          • ₹{transaction.amount} will be added to group wallet{'\n'}
          • No real money required - instant confirmation
        </Text>
      </View>

      {/* Payment Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.paymentButton,
            isProcessing && styles.paymentButtonDisabled
          ]}
          onPress={handleInstantPayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.paymentButtonText}>💳 Pay Now</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    margin: 15,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
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
  infoCard: {
    backgroundColor: '#E3F2FD',
    margin: 15,
    padding: 15,
    borderRadius: 8,
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
    padding: 15,
  },
  paymentButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  paymentButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  paymentButtonText: {
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