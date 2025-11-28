import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Share,
  TextInput,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { api } from '../services/api';

// New Member Details Screen Component
// function MemberDetailsScreen({ route, navigation }) {
//   const { member, group, currentUser } = route.params;
  
// const calculateMemberStats = () => {
//   if (!group?.transactions) return {};
  
//   const memberTransactions = group.transactions.filter(t => 
//     t.createdBy === member.name || t.createdBy === member.phone
//   );
  
//   // ONLY count APPROVED transactions for balance calculations
//   const approvedTransactions = memberTransactions.filter(t => t.status === 'approved');
//   const pendingTransactions = memberTransactions.filter(t => t.status === 'pending');
//   const rejectedTransactions = memberTransactions.filter(t => t.status === 'rejected');
  
//   const approvedDeposits = approvedTransactions.filter(t => t.type === 'deposit');
//   const approvedWithdrawals = approvedTransactions.filter(t => t.type === 'withdrawal');
  
//   const totalDeposit = approvedDeposits.reduce((sum, t) => sum + t.amount, 0);
//   const totalWithdrawal = approvedWithdrawals.reduce((sum, t) => sum + t.amount, 0);
//   const netAmount = totalDeposit - totalWithdrawal;
  
//   return {
//     totalDeposit,
//     totalWithdrawal,
//     netAmount,
//     totalRequests: approvedTransactions.length, // CHANGED: Only count approved
//     pendingRequests: pendingTransactions.length,
//     rejectedRequests: rejectedTransactions.length,
//     allRequests: memberTransactions.length, // Total including all statuses
//     transactions: memberTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//   };
// };

//   const stats = calculateMemberStats();
//   const isAdmin = member.phone === group?.createdBy;

//   return (
//     <View style={memberStyles.container}>
//       {/* Header */}
//       <View style={memberStyles.header}>
//         <View style={memberStyles.avatar}>
//           <Text style={memberStyles.avatarText}>
//             {member.name.charAt(0).toUpperCase()}
//           </Text>
//         </View>
//         <Text style={memberStyles.memberName}>{member.name}</Text>
//         <Text style={memberStyles.memberPhone}>{member.phone}</Text>
//         {isAdmin && (
//           <View style={memberStyles.adminBadge}>
//             <Text style={memberStyles.adminBadgeText}>👑 Group Admin</Text>
//           </View>
//         )}
//       </View>

//       {/* Stats Cards */}
//       <View style={memberStyles.statsContainer}>
//         <View style={memberStyles.statRow}>
//           <View style={memberStyles.statCard}>
//             <Text style={memberStyles.statValue}>₹{stats.totalDeposit}</Text>
//             <Text style={memberStyles.statLabel}>Total Deposit</Text>
//           </View>
//           <View style={memberStyles.statCard}>
//             <Text style={memberStyles.statValue}>₹{stats.totalWithdrawal}</Text>
//             <Text style={memberStyles.statLabel}>Total Withdraw</Text>
//           </View>
//         </View>
//         <View style={memberStyles.statRow}>
//           <View style={memberStyles.statCard}>
//             <Text style={[memberStyles.statValue, { color: stats.netAmount >= 0 ? '#34C759' : '#FF3B30' }]}>
//               ₹{stats.netAmount}
//             </Text>
//             <Text style={memberStyles.statLabel}>Net Amount</Text>
//           </View>
//           <View style={memberStyles.statCard}>
//             <Text style={memberStyles.statValue}>{stats.totalRequests}</Text>
//             <Text style={memberStyles.statLabel}>Total Requests</Text>
//           </View>
//         </View>
//       </View>

//       {/* Transaction History */}
//       <View style={memberStyles.transactionsSection}>
//         <Text style={memberStyles.sectionTitle}>Transaction History</Text>
//         <Text style={memberStyles.sectionSubtitle}>
//           {stats.pendingRequests} pending • {stats.transactions.length} total
//         </Text>
        
//         {stats.transactions.length === 0 ? (
//           <View style={memberStyles.emptyState}>
//             <Text style={memberStyles.emptyStateText}>No transactions yet</Text>
//           </View>
//         ) : (
//           <FlatList
//             data={stats.transactions}
//             renderItem={({ item }) => (
//               <View style={memberStyles.transactionItem}>
//                 <View style={memberStyles.transactionLeft}>
//                   <Text style={memberStyles.transactionIcon}>
//                     {item.type === 'deposit' ? '💰' : '💸'}
//                   </Text>
//                   <View style={memberStyles.transactionInfo}>
//                     <Text style={memberStyles.transactionType}>
//                       {item.type === 'deposit' ? 'Deposit' : 'Withdrawal'} • ₹{item.amount}
//                     </Text>
//                     <Text style={memberStyles.transactionDescription}>
//                       {item.description || 'No description'}
//                     </Text>
//                     <Text style={memberStyles.transactionTime}>
//                       {new Date(item.createdAt).toLocaleString()}
//                     </Text>
//                   </View>
//                 </View>
//                 <View style={memberStyles.transactionRight}>
//                   <Text style={[
//                     memberStyles.transactionStatus,
//                     { 
//                       color: item.status === 'approved' ? '#34C759' : 
//                              item.status === 'rejected' ? '#FF3B30' : '#FF9500'
//                     }
//                   ]}>
//                     {item.status.toUpperCase()}
//                   </Text>
//                 </View>
//               </View>
//             )}
//             keyExtractor={item => item.id}
//             style={memberStyles.transactionsList}
//           />
//         )}
//       </View>
//     </View>
//   );
// }

// const memberStyles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   header: {
//     backgroundColor: 'white',
//     padding: 20,
//     alignItems: 'center',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9ecef',
//   },
//   avatar: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: '#007AFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   avatarText: {
//     color: 'white',
//     fontSize: 32,
//     fontWeight: 'bold',
//   },
//   memberName: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 4,
//   },
//   memberPhone: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 8,
//   },
//   adminBadge: {
//     backgroundColor: '#FFF3CD',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: '#FFEAA7',
//   },
//   adminBadgeText: {
//     color: '#856404',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   statsContainer: {
//     padding: 20,
//   },
//   statRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   statCard: {
//     backgroundColor: 'white',
//     padding: 16,
//     borderRadius: 12,
//     flex: 1,
//     marginHorizontal: 6,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: '#f1f3f4',
//   },
//   statValue: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'center',
//   },
//   transactionsSection: {
//     flex: 1,
//     padding: 20,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 4,
//   },
//   sectionSubtitle: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 16,
//   },
//   transactionItem: {
//     backgroundColor: 'white',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 8,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//   },
//   transactionLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   transactionIcon: {
//     fontSize: 24,
//     marginRight: 12,
//   },
//   transactionInfo: {
//     flex: 1,
//   },
//   transactionType: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 2,
//   },
//   transactionDescription: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 2,
//   },
//   transactionTime: {
//     fontSize: 12,
//     color: '#999',
//   },
//   transactionRight: {
//     alignItems: 'flex-end',
//   },
//   transactionStatus: {
//     fontSize: 12,
//     fontWeight: '600',
//     backgroundColor: '#f8f9fa',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 40,
//   },
//   emptyStateText: {
//     fontSize: 16,
//     color: '#666',
//   },
// });

// Main MembersScreen Component
export default function MembersScreen({ route, navigation }) {
  const { groupId } = route.params;
  const [group, setGroup] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingThreshold, setIsEditingThreshold] = useState(false);
  const [newThreshold, setNewThreshold] = useState('');
  const isFocused = useIsFocused();

  useEffect(() => {
    loadData();
  }, [isFocused]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
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
      const groupData = await api.getGroup(groupId);
      setGroup(groupData);
    } catch (error) {
      console.error('Backend error:', error);
      try {
        const groupsData = await AsyncStorage.getItem('groups');
        if (groupsData) {
          const groups = JSON.parse(groupsData);
          const currentGroup = groups.find(g => g.id === groupId);
          if (currentGroup) {
            setGroup(currentGroup);
          }
        }
      } catch (localError) {
        console.error('Local storage error:', localError);
      }
    }
  };

  const shareGroupCode = async () => {
    try {
      if (!group || !group.code) {
        Alert.alert('Error', 'Group code not found');
        return;
      }

      const shareMessage = `Join my group "${group.name}" on Group Wallet App!\n\nGroup Code: ${group.code}\n\nUse this code to join the group and start tracking expenses together!`;
      
      await Share.share({
        message: shareMessage,
        title: `Join ${group.name}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share group code');
    }
  };

  const updateThreshold = async () => {
    if (!newThreshold.trim() || isNaN(newThreshold) || parseInt(newThreshold) < 1) {
      Alert.alert('Error', 'Please enter a valid number (minimum 1)');
      return;
    }

    const threshold = parseInt(newThreshold);
    if (threshold > group.members.length) {
      Alert.alert('Error', `Threshold cannot be more than total members (${group.members.length})`);
      return;
    }

    try {
      await api.updateGroup(groupId, { 
        approvalThreshold: threshold 
      });
      
      setGroup({ ...group, approvalThreshold: threshold });
      setIsEditingThreshold(false);
      setNewThreshold('');
      
      Alert.alert('Success', `Approval threshold updated to ${threshold}`);
    } catch (error) {
      console.error('Error updating threshold:', error);
      Alert.alert('Error', 'Failed to update threshold');
    }
  };

  // ✅ CORRECT: Only count PAID transactions for balance
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

  const handleDeleteGroup = async () => {
    const currentBalance = calculateGroupBalance();
    
    if (currentBalance !== 0) {
      Alert.alert(
        'Cannot Delete Group',
        `Group balance must be ₹0 to delete. Current balance: ₹${currentBalance}\n\nPlease settle all transactions first.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${group.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteGroup(groupId);
              Alert.alert('Success', 'Group deleted successfully');
              navigation.navigate('Home');
            } catch (error) {
              console.error('Error deleting group:', error);
              Alert.alert('Error', 'Failed to delete group');
            }
          },
        },
      ]
    );
  };

  const renderMemberItem = ({ item, index }) => {
    const memberName = item.name || item.username || `Member ${index + 1}`;
    const memberPhone = item.phone || item.userId || 'No phone';
    const isCurrentUser = item.phone === currentUser?.phone;
    const isAdmin = item.phone === group?.createdBy;

    return (
      <TouchableOpacity 
        style={styles.memberCard}
        onPress={() => navigation.navigate('MemberDetails', { 
          member: item, 
          group, 
          currentUser 
        })}
      >
        <View style={styles.memberLeft}>
          <View style={styles.memberAvatar}>
            <Text style={styles.avatarText}>
              {memberName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName} numberOfLines={1}>
              {memberName} {isCurrentUser && '(You)'}
            </Text>
            <Text style={styles.memberPhone} numberOfLines={1}>
              {memberPhone}
            </Text>
          </View>
        </View>
        
        <View style={styles.memberRight}>
          {isAdmin ? (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          ) : (
            <Text style={styles.memberRole}>Member</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!group || !currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const members = group.members || [];
  const isAdmin = group.createdBy === currentUser.phone;
  const currentBalance = calculateGroupBalance();

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
        <Text style={styles.headerInfo}>
          {members.length} members • {group.approvalThreshold} approvals needed
        </Text>
        
        {isAdmin && (
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={shareGroupCode}
          >
            <Text style={styles.shareButtonText}>Share Group Code</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Members List Section - MOVED TO TOP */}
        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>Group Members ({members.length})</Text>
          
          {members.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>👥</Text>
              <Text style={styles.emptyStateTitle}>No members yet</Text>
              <Text style={styles.emptyStateText}>
                Share the group code to invite members to join
              </Text>
            </View>
          ) : (
            <View style={styles.membersList}>
              {members.map((member, index) => {
                const memberName = member.name || member.username || `Member ${index + 1}`;
                const memberPhone = member.phone || member.userId || 'No phone';
                const isCurrentUser = member.phone === currentUser?.phone;
                const isAdmin = member.phone === group?.createdBy;

                return (
                  <TouchableOpacity 
                    key={member.phone || index} 
                    style={styles.memberCard}
                    onPress={() => navigation.navigate('MemberDetails', { 
                      member, 
                      group, 
                      currentUser 
                    })}
                  >
                    <View style={styles.memberLeft}>
                      <View style={styles.memberAvatar}>
                        <Text style={styles.avatarText}>
                          {memberName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName} numberOfLines={1}>
                          {memberName} {isCurrentUser && '(You)'}
                        </Text>
                        <Text style={styles.memberPhone} numberOfLines={1}>
                          {memberPhone}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.memberRight}>
                      {isAdmin ? (
                        <View style={styles.adminBadge}>
                          <Text style={styles.adminBadgeText}>Admin</Text>
                        </View>
                      ) : (
                        <Text style={styles.memberRole}>Member</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Admin Settings Section - MOVED TO BOTTOM */}
        {isAdmin && (
          <View style={styles.adminSection}>
            <Text style={styles.sectionTitle}>Group Settings</Text>
            
            {/* Approval Threshold */}
            <View style={styles.settingCard}>
              <Text style={styles.settingLabel}>Approvals Needed</Text>
              <Text style={styles.settingDescription}>
                Minimum number of approvals required for transactions
              </Text>
              
              {isEditingThreshold ? (
                <View style={styles.thresholdEditContainer}>
                  <TextInput
                    style={styles.thresholdInput}
                    value={newThreshold}
                    onChangeText={setNewThreshold}
                    keyboardType="number-pad"
                    placeholder={group.approvalThreshold.toString()}
                    maxLength={2}
                    autoFocus
                  />
                  <View style={styles.editButtons}>
                    <TouchableOpacity 
                      style={[styles.editButton, styles.saveButton]}
                      onPress={updateThreshold}
                    >
                      <Text style={styles.editButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.editButton, styles.cancelButton]}
                      onPress={() => {
                        setIsEditingThreshold(false);
                        setNewThreshold('');
                      }}
                    >
                      <Text style={styles.editButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.thresholdDisplay}>
                  <Text style={styles.thresholdValue}>
                    {group.approvalThreshold}
                  </Text>
                  <TouchableOpacity 
                    style={styles.editThresholdButton}
                    onPress={() => setIsEditingThreshold(true)}
                  >
                    <Text style={styles.editThresholdText}>Change</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Delete Group */}
            <View style={styles.settingCard}>
              <Text style={styles.deleteLabel}>Delete Group</Text>
              <Text style={styles.settingDescription}>
                {currentBalance === 0 
                  ? 'Permanently delete this group and all its data'
                  : `Group balance must be ₹0 to delete. Current balance: ₹${currentBalance}`
                }
              </Text>
              <TouchableOpacity 
                style={[
                  styles.deleteButton,
                  currentBalance !== 0 && styles.deleteButtonDisabled
                ]}
                onPress={handleDeleteGroup}
                disabled={currentBalance !== 0}
              >
                <Text style={styles.deleteButtonText}>
                  {currentBalance === 0 ? 'Delete Group' : 'Cannot Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center',
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    maxWidth: '100%',
  },
  headerInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  shareButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  adminSection: {
    padding: 20,
    paddingTop: 0,
  },
  membersSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  deleteLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  thresholdEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  thresholdInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    width: 80,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  thresholdDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  thresholdValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  editThresholdButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editThresholdText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  membersList: {
    gap: 12,
  },
  memberCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  memberPhone: {
    fontSize: 14,
    color: '#666',
  },
  memberRight: {
    marginLeft: 12,
  },
  adminBadge: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  adminBadgeText: {
    color: '#856404',
    fontSize: 12,
    fontWeight: '600',
  },
  memberRole: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Export both components