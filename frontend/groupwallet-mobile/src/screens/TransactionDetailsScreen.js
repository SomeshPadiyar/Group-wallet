import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TransactionDetailsScreen({ route, navigation }) {
  const { groupId, transactionId } = route.params;
  const [transaction, setTransaction] = useState(null);
  const [group, setGroup] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load current user
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }

      // Load group and transaction data
      const groupData = await api.getGroup(groupId);
      setGroup(groupData);
      
      const currentTransaction = groupData.transactions?.find(t => t.id === transactionId);
      setTransaction(currentTransaction);
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load transaction details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status, type) => {
    if (status === 'paid') return '#34C759';
    if (status === 'approved' && type === 'deposit') return '#FF9500';
    if (status === 'approved') return '#34C759';
    if (status === 'rejected') return '#FF3B30';
    if (status === 'pending') return '#007AFF';
    return '#666';
  };

  const getStatusText = (transaction) => {
    if (transaction.status === 'approved' && transaction.type === 'deposit') {
      return 'APPROVED - Waiting for Payment';
    }
    if (transaction.status === 'approved' && transaction.type === 'withdrawal') {
      return 'APPROVED - Ready for Withdrawal';
    }
    return transaction.status.toUpperCase();
  };

  const isCreator = transaction?.createdBy === currentUser?.phone;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading transaction details...</Text>
      </View>
    );
  }

  if (!transaction || !group) {
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
        <Text style={styles.transactionId}>Transaction #{transactionId.slice(-6)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status, transaction.type) }]}>
          <Text style={styles.statusText}>{getStatusText(transaction)}</Text>
        </View>
      </View>

      {/* Transaction Details Card */}
      <View style={styles.detailsCard}>
        <Text style={styles.amount}>₹{transaction.amount}</Text>
        <Text style={styles.type}>
          {transaction.type === 'deposit' ? '💰 Deposit' : '💸 Withdrawal'}
        </Text>
        
        {transaction.description && (
          <Text style={styles.description}>{transaction.description}</Text>
        )}

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Created By</Text>
            <Text style={styles.detailValue}>
              {transaction.createdBy === currentUser?.phone ? 'You' : transaction.createdBy}
              {transaction.createdBy === currentUser?.phone && ' 👤'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Created On</Text>
            <Text style={styles.detailValue}>
              {new Date(transaction.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Group</Text>
            <Text style={styles.detailValue}>{group.name}</Text>
          </View>

          {transaction.approvedAt && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Approved On</Text>
              <Text style={styles.detailValue}>
                {new Date(transaction.approvedAt).toLocaleDateString()}
              </Text>
            </View>
          )}

          {transaction.paidAt && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Paid On</Text>
              <Text style={styles.detailValue}>
                {new Date(transaction.paidAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Voting Information */}
      {transaction.status === 'pending' && (
        <View style={styles.votingCard}>
          <Text style={styles.cardTitle}>Voting Status</Text>
          <View style={styles.votingStats}>
            <View style={styles.voteStat}>
              <Text style={styles.voteCount}>✅ {transaction.approvals?.length || 0}</Text>
              <Text style={styles.voteLabel}>Approve</Text>
            </View>
            <View style={styles.voteStat}>
              <Text style={styles.voteCount}>❌ {transaction.rejections?.length || 0}</Text>
              <Text style={styles.voteLabel}>Reject</Text>
            </View>
            <View style={styles.voteStat}>
              <Text style={styles.voteCount}>{group.approvalThreshold}</Text>
              <Text style={styles.voteLabel}>Required</Text>
            </View>
          </View>
          <Text style={styles.votingInfo}>
            Need {group.approvalThreshold} approvals from {group.members.length} members
          </Text>
        </View>
      )}

      {/* Payment Section - Only for creator and approved deposits */}
      {isCreator && transaction.status === 'approved' && transaction.type === 'deposit' && (
        <View style={styles.paymentCard}>
          <Text style={styles.cardTitle}>Complete Payment</Text>
          <Text style={styles.paymentInfo}>
            Your deposit has been approved! Complete the payment to add ₹{transaction.amount} to the group wallet.
          </Text>
          
          <TouchableOpacity 
            style={styles.paymentButton}
            onPress={() => navigation.navigate('Payment', { 
              groupId: group.id, 
              transactionId: transaction.id 
            })}
          >
            <Text style={styles.paymentButtonText}>Pay with Razorpay</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.testPaymentButton}
            onPress={() => navigation.navigate('Payment', { 
              groupId: group.id, 
              transactionId: transaction.id 
            })}
          >
            <Text style={styles.testPaymentButtonText}>Test Payment (Demo)</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* NEW: Withdrawal Section - Only for creator and approved withdrawals */}
      {isCreator && transaction.status === 'approved' && transaction.type === 'withdrawal' && (
        <View style={styles.withdrawalCard}>
          <Text style={styles.cardTitle}>Complete Withdrawal</Text>
          <Text style={styles.paymentInfo}>
            Your withdrawal has been approved! Complete the withdrawal to receive ₹{transaction.amount} to your UPI account.
          </Text>
          
          <TouchableOpacity 
            style={styles.withdrawalButton}
            onPress={() => navigation.navigate('Withdrawal', { 
              groupId: group.id, 
              transactionId: transaction.id 
            })}
          >
            <Text style={styles.withdrawalButtonText}>💸 Withdraw Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* View for non-creators */}
      {!isCreator && transaction.status === 'approved' && transaction.type === 'deposit' && (
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Waiting for Payment</Text>
          <Text style={styles.infoText}>
            This deposit has been approved and is waiting for {transaction.createdBy === currentUser?.phone ? 'you' : transaction.createdBy} to complete the payment.
          </Text>
        </View>
      )}

      {/* View for non-creators - Withdrawal */}
      {!isCreator && transaction.status === 'approved' && transaction.type === 'withdrawal' && (
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Waiting for Withdrawal</Text>
          <Text style={styles.infoText}>
            This withdrawal has been approved and is waiting for {transaction.createdBy === currentUser?.phone ? 'you' : transaction.createdBy} to complete the withdrawal process.
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Group</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  transactionId: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  type: {
    fontSize: 18,
    color: '#666',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  detailsGrid: {
    width: '100%',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
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
    fontWeight: '500',
  },
  votingCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  paymentCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  // NEW: Withdrawal card styles
  withdrawalCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  votingStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  voteStat: {
    alignItems: 'center',
  },
  voteCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  voteLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  votingInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  paymentInfo: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  paymentButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testPaymentButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  testPaymentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // NEW: Withdrawal button styles
  withdrawalButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  withdrawalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionContainer: {
    padding: 15,
  },
  backButton: {
    backgroundColor: '#6C757D',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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