import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GroupDetailsScreen({ route, navigation }) {
  const { groupId } = route.params;
  const [group, setGroup] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadGroupData();
    }
  }, [isFocused]);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadGroupData();
    }
  }, [currentUser, refreshKey]);

  const loadCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadGroupData = async () => {
    try {
      setRefreshing(true);
      const groupData = await api.getGroup(groupId);
      setGroup(groupData);
    } catch (error) {
      console.error('Error loading group data:', error);
      // Fallback to local storage
      const groupsData = await AsyncStorage.getItem('groups');
      if (groupsData) {
        const groups = JSON.parse(groupsData);
        const currentGroup = groups.find(g => g.id === groupId);
        setGroup(currentGroup);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  const onRefresh = async () => {
    await loadGroupData();
  };

  // FIXED: Only count PAID transactions for balance
  const calculateGroupBalance = () => {
    if (!group?.transactions) return 0;
    const paidTransactions = group.transactions.filter(t => t.status === 'paid');
    return paidTransactions.reduce((total, transaction) => {
      if (transaction.type === 'deposit') {
        return total + transaction.amount;
      } else {
        return total - transaction.amount;
      }
    }, 0);
  };

  const getPendingTransactionsCount = () => {
    return group?.transactions?.filter(t => t.status === 'pending').length || 0;
  };

  const getApprovedDepositsCount = () => {
    return group?.transactions?.filter(t => 
      t.status === 'approved' && t.type === 'deposit'
    ).length || 0;
  };

  const getAllTransactions = () => {
    if (!group?.transactions) return [];
    
    // Sort transactions by createdAt date (newest first)
    return [...group.transactions].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA; // Newest first
    });
  };

  const handleApproveTransaction = async (transactionId) => {
    try {
      if (!currentUser?.phone) {
        Alert.alert('Error', 'User information not found');
        return;
      }

      console.log('Approving transaction:', transactionId);
      
      // Use the API endpoint
      const result = await api.approveTransaction(groupId, transactionId, currentUser.phone);
      
      // Refresh data to get latest state
      await loadGroupData();
      
      console.log('Approval Response:', {
        status: result.transaction.status,
        needsPayment: result.votingStatus.needsPayment,
        isCreator: result.transaction.createdBy === currentUser.phone
      });

      if (result.votingStatus.isApproved) {
        if (result.votingStatus.needsPayment) {
          Alert.alert('Approved!', 'Transaction has been approved. Creator needs to complete the payment.');
        } else {
          Alert.alert('Approved!', 'Transaction has been approved and completed.');
        }
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
              if (!currentUser?.phone) {
                Alert.alert('Error', 'User information not found');
                return;
              }

              // Use the API endpoint
              const result = await api.rejectTransaction(groupId, transactionId, currentUser.phone);
              
              // Refresh data to get latest state
              await loadGroupData();
              
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

  const canUserApprove = (transaction) => {
    // User cannot vote if transaction is not pending
    if (transaction.status !== 'pending') {
      return false;
    }
    
    // User cannot vote if they already approved
    if (transaction.approvals && transaction.approvals.includes(currentUser?.phone)) {
      return false;
    }
    
    // User cannot vote if they already rejected
    if (transaction.rejections && transaction.rejections.includes(currentUser?.phone)) {
      return false;
    }
    
    return true;
  };

  const getTransactionIcon = (type) => {
    return type === 'deposit' ? '💰' : '💸';
  };

  const getTransactionColor = (type) => {
    return type === 'deposit' ? '#34C759' : '#FF3B30';
  };

  const getStatusColor = (status, type) => {
    if (status === 'paid') return '#34C759';
    if (status === 'approved' && type === 'deposit') return '#FF9500'; // Orange for needs payment
    if (status === 'approved') return '#34C759';
    if (status === 'rejected') return '#FF3B30';
    if (status === 'pending') return '#007AFF';
    return '#666';
  };

  const renderTransactionItem = ({ item }) => {
    const approvalsCount = item.approvals ? item.approvals.length : 0;
    const rejectionsCount = item.rejections ? item.rejections.length : 0;
    const userApproved = item.approvals && item.approvals.includes(currentUser?.phone);
    const userRejected = item.rejections && item.rejections.includes(currentUser?.phone);
    const canApprove = canUserApprove(item);
    const isCreator = item.createdBy === currentUser?.phone;

    // Debug logging
    console.log('Transaction Debug:', {
      id: item.id,
      type: item.type,
      status: item.status,
      createdBy: item.createdBy,
      currentUser: currentUser?.phone,
      isCreator: isCreator,
      showPayButton: item.status === 'approved' && item.type === 'deposit' && isCreator
    });

    return (
      <TouchableOpacity 
        style={styles.transactionItem}
        onPress={() => navigation.navigate('TransactionDetails', { 
          groupId: group.id, 
          transactionId: item.id 
        })}
      >
        <View style={styles.transactionLeft}>
          <Text style={styles.transactionIcon}>{getTransactionIcon(item.type)}</Text>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionDescription}>
              {item.description || `Transaction #${item.id.slice(-4)}`}
            </Text>
            <Text style={[styles.transactionAmount, { color: getTransactionColor(item.type) }]}>
              ₹{item.amount}
            </Text>
            <Text style={styles.transactionDetails}>
              By: {item.createdBy === currentUser?.phone ? 'You' : item.createdBy} • {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            
            {/* Status Badge */}
            <View style={[styles.statusBadge, 
              { backgroundColor: getStatusColor(item.status, item.type) }
            ]}>
              <Text style={styles.statusBadgeText}>
                {item.status.toUpperCase()}
                {item.status === 'approved' && item.type === 'deposit' && ' - NEEDS PAYMENT'}
              </Text>
            </View>

            {/* Voting Status */}
            {item.status === 'pending' && (
              <View style={styles.votingStatus}>
                <Text style={styles.votingText}>
                  ✅ {approvalsCount} approve | ❌ {rejectionsCount} reject
                </Text>
                <Text style={styles.votingText}>
                  Need {group.approvalThreshold} approvals
                </Text>
                {(userApproved || userRejected) && (
                  <Text style={styles.yourVoteText}>
                    You voted: {userApproved ? '✅ Approve' : '❌ Reject'}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.transactionRight}>
          <Text style={[
            styles.transactionStatus,
            { color: getStatusColor(item.status, item.type) }
          ]}>
            {item.status.toUpperCase()}
          </Text>
          
          {item.status === 'pending' && canApprove && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.approveButton}
                onPress={() => handleApproveTransaction(item.id)}
              >
                <Text style={styles.approveButtonText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.rejectButton}
                onPress={() => handleRejectTransaction(item.id)}
              >
                <Text style={styles.rejectButtonText}>✗</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {item.status === 'pending' && (userApproved || userRejected) && (
            <Text style={styles.votedText}>You've voted</Text>
          )}

          {/* Pay Now Button - ONLY for creator of approved deposits */}
          {isCreator && item.status === 'approved' && item.type === 'deposit' && (
            <TouchableOpacity 
              style={styles.payButton}
              onPress={() => navigation.navigate('Payment', { 
                groupId: group.id, 
                transactionId: item.id 
              })}
            >
              <Text style={styles.payButtonText}>Pay Now</Text>
            </TouchableOpacity>
          )}


          {/* Withdrawal completion button */}
          {isCreator && item.status === 'approved' && item.type === 'withdrawal' && (
            <TouchableOpacity 
              style={styles.withdrawButton}
              onPress={() => navigation.navigate('Withdrawal', { 
                groupId: group.id, 
                transactionId: item.id 
              })}
            >
              <Text style={styles.withdrawButtonText}>Withdraw Now</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!group || !currentUser) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const currentBalance = calculateGroupBalance();
  const pendingCount = getPendingTransactionsCount();
  const approvedDepositsCount = getApprovedDepositsCount();
  const allTransactions = getAllTransactions();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={[styles.balance, { color: currentBalance >= 0 ? '#34C759' : '#FF3B30' }]}>
            ₹{currentBalance}
          </Text>
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Members', { groupId: group.id })}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>👥</Text>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonLabel}>Members</Text>
                <Text style={styles.buttonCount}>{group.members.length}</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <View style={styles.buttonDivider} />
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Pending', { groupId: group.id })}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>⏳</Text>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonLabel}>Pending</Text>
                <Text style={styles.buttonCount}>{pendingCount}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Separator Line */}
      <View style={styles.separatorLine} />

      {/* New Transaction Button */}
      <TouchableOpacity 
        style={styles.newTransactionButton}
        onPress={() => navigation.navigate('Transaction', { groupId: group.id })}
      >
        <Text style={styles.newTransactionButtonIcon}>+</Text>
        <Text style={styles.newTransactionButtonText}>New Transaction</Text>
      </TouchableOpacity>

      {/* Separator Line */}
      <View style={styles.separatorLine} />

      {/* Transactions List */}
      <FlatList
        data={allTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.transactionsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
      />
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
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  balance: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  buttonTextContainer: {
    alignItems: 'center',
  },
  buttonLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  buttonCount: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
    marginTop: 2,
  },
  withdrawButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
  },
  withdrawButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonDivider: {
    width: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 8,
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  newTransactionButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    marginVertical: 15,
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  newTransactionButtonIcon: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  newTransactionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionsList: {
    paddingBottom: 20,
  },
  transactionItem: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  transactionDetails: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
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
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#34C759',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  approveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  rejectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  votedText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  payButton: {
    backgroundColor: '#28A745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
  },
  payButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});