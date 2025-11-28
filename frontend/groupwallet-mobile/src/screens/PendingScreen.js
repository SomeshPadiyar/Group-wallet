import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { api } from '../services/api';

export default function PendingScreen({ route, navigation }) {
  const { groupId } = route.params;
  const [group, setGroup] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    loadData();
  }, [isFocused]);

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
      console.log('Loading group for pending screen:', groupId);
      
      // Try backend first
      const groupData = await api.getGroup(groupId);
      console.log('✅ Pending screen - Group loaded:', groupData.name);
      setGroup(groupData);
      
    } catch (error) {
      console.error('❌ Pending screen - Backend error:', error);
      
      // Fallback to local storage
      try {
        const groupsData = await AsyncStorage.getItem('groups');
        if (groupsData) {
          const groups = JSON.parse(groupsData);
          const currentGroup = groups.find(g => g.id === groupId);
          if (currentGroup) {
            console.log('✅ Pending screen - Local group loaded:', currentGroup.name);
            setGroup(currentGroup);
          }
        }
      } catch (localError) {
        console.error('❌ Pending screen - Local error:', localError);
      }
    }
  };

  const getPendingTransactions = () => {
    if (!group?.transactions) return [];
    return group.transactions.filter(t => t.status === 'pending');
  };

// In PendingScreen.js - REPLACE these two functions

const handleApproveTransaction = async (transactionId) => {
  try {
    console.log('Approving transaction:', transactionId);
    
    const result = await api.approveTransaction(groupId, transactionId, currentUser.phone);
    
    await loadGroupData();
    
    // FIX: Use votingStatus instead of approvalProgress
    if (result.votingStatus.isApproved) {
      Alert.alert('Approved!', 'Transaction has been approved and is now completed.');
    } else if (result.votingStatus.isRejected) {
      Alert.alert('Rejected!', 'Transaction has been rejected by the group.');
    } else {
      Alert.alert('Vote Recorded!', 
        `Voting: ${result.votingStatus.approvals} approve, ${result.votingStatus.rejections} reject\nNeed ${result.votingStatus.requiredApprovals} approvals from ${result.votingStatus.totalMembers} members`);
    }
    
  } catch (error) {
    console.error('Error approving transaction:', error);
    Alert.alert('Error', error.message || 'Failed to approve transaction');
  }
};

const handleRejectTransaction = async (transactionId) => {
  Alert.alert(
    'Reject Transaction',
    'Are you sure you want to reject this transaction?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await api.rejectTransaction(groupId, transactionId, currentUser.phone);
            await loadGroupData();
            
            // FIX: Use votingStatus instead of approvalProgress
            if (result.votingStatus.isApproved) {
              Alert.alert('Approved!', 'Transaction has been approved and is now completed.');
            } else if (result.votingStatus.isRejected) {
              Alert.alert('Rejected!', 'Transaction has been rejected by the group.');
            } else {
              Alert.alert('Vote Recorded!', 
                `Voting: ${result.votingStatus.approvals} approve, ${result.votingStatus.rejections} reject\nNeed ${result.votingStatus.requiredApprovals} approvals from ${result.votingStatus.totalMembers} members`);
            }
            
          } catch (error) {
            console.error('Error rejecting transaction:', error);
            Alert.alert('Error', error.message || 'Failed to reject transaction');
          }
        },
      },
    ]
  );
};

// In PendingScreen.js - REPLACE the renderTransactionItem function

const renderTransactionItem = ({ item }) => {
  const approvalsCount = item.approvals ? item.approvals.length : 0;
  const rejectionsCount = item.rejections ? item.rejections.length : 0;
  const totalMembers = group.members ? group.members.length : 0;
  const userApproved = item.approvals && item.approvals.includes(currentUser.phone);
  const userRejected = item.rejections && item.rejections.includes(currentUser.phone);

  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <Text style={styles.transactionType}>
          {item.type === 'deposit' ? '💰 Deposit' : '💸 Withdrawal'}
        </Text>
        <Text style={styles.transactionAmount}>₹{item.amount}</Text>
        <Text style={styles.transactionDescription}>
          {item.description || 'No description'}
        </Text>
        <Text style={styles.transactionBy}>By: {item.createdBy}</Text>
        
        {/* Voting Status */}
        <View style={styles.votingStatus}>
          <Text style={styles.votingText}>
            ✅ {approvalsCount} approve | ❌ {rejectionsCount} reject
          </Text>
          <Text style={styles.votingText}>
            Need {group.approvalThreshold} approvals from {totalMembers} members
          </Text>
          {(userApproved || userRejected) && (
            <Text style={styles.yourVoteText}>
              You voted: {userApproved ? '✅ Approve' : '❌ Reject'}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.transactionRight}>
        {item.status === 'pending' && !userApproved && !userRejected && (
          <>
            <TouchableOpacity 
              style={styles.approveButton}
              onPress={() => handleApproveTransaction(item.id)}
            >
              <Text style={styles.approveButtonText}>✅ Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.rejectButton}
              onPress={() => handleRejectTransaction(item.id)}
            >
              <Text style={styles.rejectButtonText}>❌ Reject</Text>
            </TouchableOpacity>
          </>
        )}
        {item.status === 'pending' && (userApproved || userRejected) && (
          <Text style={styles.votedText}>You've voted</Text>
        )}
        {item.status !== 'pending' && (
          <Text style={[
            styles.statusText,
            { color: item.status === 'approved' ? '#34C759' : '#FF3B30' }
          ]}>
            {item.status.toUpperCase()}
          </Text>
        )}
      </View>
    </View>
  );
};

  // Debug current state
  console.log('🔄 Pending screen - Render state:', {
    isLoading,
    group: group ? `"${group.name}"` : 'null',
    pendingTransactions: getPendingTransactions().length
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading pending transactions...</Text>
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

  const pendingTransactions = getPendingTransactions();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pending Approvals</Text>
        <Text style={styles.subtitle}>
          {group.approvalThreshold} approvals needed for each transaction
        </Text>
      </View>

      {pendingTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No pending transactions</Text>
          <Text style={styles.emptyStateSubtext}>
            All transactions have been approved or rejected
          </Text>
        </View>
      ) : (
        <FlatList
          data={pendingTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={item => item.id}
          style={styles.transactionsList}
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  transactionsList: {
    flex: 1,
  },
  // Add to styles in PendingScreen.js
statusText: {
  fontSize: 12,
  fontWeight: '600',
},
  transactionItem: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  transactionBy: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  approvalsText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  // In PendingScreen.js - Add to the styles object

votingStatus: {
  marginTop: 8,
  padding: 8,
  backgroundColor: '#f8f9fa',
  borderRadius: 6,
},
votingText: {
  fontSize: 12,
  color: '#666',
},
yourVoteText: {
  fontSize: 12,
  color: '#007AFF',
  fontWeight: '600',
  marginTop: 4,
},
votedText: {
  fontSize: 12,
  color: '#666',
  fontStyle: 'italic',
},
  transactionRight: {
    justifyContent: 'center',
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
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