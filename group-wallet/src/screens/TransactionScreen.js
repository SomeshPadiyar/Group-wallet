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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

export default function TransactionScreen({ route, navigation }) {
  const { groupId } = route.params;
  const [type, setType] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load current user
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        
        // Load group data
        await loadGroupData();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroupData = async () => {
    try {
      console.log('Loading group for transaction screen:', groupId);
      
      // Try backend first
      const groupData = await api.getGroup(groupId);
      console.log('✅ Transaction screen - Group loaded:', groupData.name);
      setGroup(groupData);
      
    } catch (error) {
      console.error('❌ Transaction screen - Backend error:', error);
      
      // Fallback to local storage
      try {
        const groupsData = await AsyncStorage.getItem('groups');
        if (groupsData) {
          const groups = JSON.parse(groupsData);
          const currentGroup = groups.find(g => g.id === groupId);
          if (currentGroup) {
            console.log('✅ Transaction screen - Local group loaded:', currentGroup.name);
            setGroup(currentGroup);
          }
        }
      } catch (localError) {
        console.error('❌ Transaction screen - Local error:', localError);
      }
    }
  };

  const calculateCurrentBalance = () => {
    if (!group?.transactions) return 0;
    const approvedTransactions = group.transactions.filter(t => t.status === 'approved');
    return approvedTransactions.reduce((total, transaction) => {
      if (transaction.type === 'deposit') {
        return total + transaction.amount;
      } else {
        return total - transaction.amount;
      }
    }, 0);
  };

  const handleCreateTransaction = async () => {
    if (!amount.trim() || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const transactionAmount = parseFloat(amount);

    // Check if withdrawal would make balance negative
    if (type === 'withdrawal') {
      const currentBalance = calculateCurrentBalance();
      if (transactionAmount > currentBalance) {
        Alert.alert('Insufficient Balance', 
          `Cannot withdraw ₹${transactionAmount}. Available balance is ₹${currentBalance}`);
        return;
      }
    }

    try {
      const newTransaction = {
        id: Date.now().toString(),
        type,
        amount: transactionAmount,
        description: description.trim(),
        status: 'pending',
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
        approvals: [],
      };

      // Update transactions array
      const updatedTransactions = [...(group.transactions || []), newTransaction];
      const updatedGroup = { ...group, transactions: updatedTransactions };

      // Update locally first
      setGroup(updatedGroup);

      // Sync with backend
      await api.updateGroup(groupId, { transactions: updatedTransactions });

      Alert.alert(
        'Success', 
        'Transaction created successfully! It is now pending approval.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating transaction:', error);
      Alert.alert('Error', 'Failed to create transaction');
    }
  };

  // Debug current state
  console.log('🔄 Transaction screen - Render state:', {
    isLoading,
    group: group ? `"${group.name}"` : 'null',
    currentUser: currentUser ? 'loaded' : 'null'
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
        <Text style={styles.loadingSubtext}>Please wait</Text>
      </View>
    );
  }

  if (!group || !currentUser) {
    return (
      <View style={styles.container}>
        <Text>Failed to load data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentBalance = calculateCurrentBalance();

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.infoText}>
            Needs {group.approvalThreshold} approvals
          </Text>
          <Text style={styles.balanceText}>
            Current Balance: ₹{currentBalance}
          </Text>
        </View>

        <View style={styles.typeSelector}>
          <Text style={styles.label}>Transaction Type</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'deposit' && styles.typeButtonSelected,
              ]}
              onPress={() => setType('deposit')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'deposit' && styles.typeButtonTextSelected,
                ]}
              >
                Deposit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'withdrawal' && styles.typeButtonSelected,
              ]}
              onPress={() => setType('withdrawal')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'withdrawal' && styles.typeButtonTextSelected,
                ]}
              >
                Withdrawal
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Transaction Details</Text>
          <Text style={styles.infoText}>
            • Type: {type === 'deposit' ? 'Add to group balance' : 'Deduct from group balance'}
          </Text>
          <Text style={styles.infoText}>
            • Status: Will be pending until approved by {group.approvalThreshold} members
          </Text>
          <Text style={styles.infoText}>
            • You can approve your own transaction
          </Text>
        </View>

        <TouchableOpacity 
          style={[
            styles.createButton,
            !amount.trim() && styles.createButtonDisabled
          ]}
          onPress={handleCreateTransaction}
          disabled={!amount.trim()}
        >
          <Text style={styles.createButtonText}>
            Create Transaction Request
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  typeSelector: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  typeButtons: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeButtonSelected: {
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  typeButtonTextSelected: {
    color: 'white',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  textArea: {
    height: 80,
  },
  infoBox: {
    backgroundColor: '#e6f2ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 10,
    color: '#666',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});