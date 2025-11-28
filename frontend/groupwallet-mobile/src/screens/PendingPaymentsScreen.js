import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PendingPaymentsScreen({ route, navigation }) {
  const { groupId } = route.params;
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

      // Load group data
      const groupData = await api.getGroup(groupId);
      setGroup(groupData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load payment details');
    } finally {
      setIsLoading(false);
    }
  };

  // Get approved deposits that need payment
  const getPendingPayments = () => {
    if (!group?.transactions) return [];
    return group.transactions.filter(t => 
      t.status === 'approved' && 
      t.type === 'deposit'
    );
  };

  const renderPaymentItem = ({ item }) => {
    const isCreator = item.createdBy === currentUser?.phone;

    return (
      <TouchableOpacity 
        style={styles.paymentItem}
        onPress={() => navigation.navigate('TransactionDetails', { 
          groupId: group.id, 
          transactionId: item.id 
        })}
      >
        <View style={styles.paymentLeft}>
          <Text style={styles.paymentIcon}>💰</Text>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentAmount}>₹{item.amount}</Text>
            <Text style={styles.paymentDescription}>
              {item.description || 'Deposit'}
            </Text>
            <Text style={styles.paymentCreator}>
              By: {item.createdBy === currentUser?.phone ? 'You' : item.createdBy}
            </Text>
          </View>
        </View>
        
        <View style={styles.paymentRight}>
          <Text style={styles.statusBadge}>APPROVED</Text>
          {isCreator ? (
            <TouchableOpacity 
              style={styles.payButton}
              onPress={() => navigation.navigate('Payment', { 
                groupId: group.id, 
                transactionId: item.id 
              })}
            >
              <Text style={styles.payButtonText}>Pay Now</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.waitingText}>Waiting for payment</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading payments...</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load group</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pendingPayments = getPendingPayments();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pending Payments</Text>
        <Text style={styles.subtitle}>
          {pendingPayments.length} deposit(s) waiting for payment
        </Text>
      </View>

      {pendingPayments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>💳</Text>
          <Text style={styles.emptyStateTitle}>No pending payments</Text>
          <Text style={styles.emptyStateText}>
            All approved deposits have been paid
          </Text>
        </View>
      ) : (
        <FlatList
          data={pendingPayments}
          renderItem={renderPaymentItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.paymentsList}
        />
      )}
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  paymentsList: {
    padding: 15,
  },
  paymentItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  paymentCreator: {
    fontSize: 12,
    color: '#999',
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    backgroundColor: '#FF9800',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  payButton: {
    backgroundColor: '#28A745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  payButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  waitingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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