import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isFocused = useIsFocused();

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (isFocused && currentUser) {
      loadGroups();
    }
  }, [isFocused, currentUser]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setIsLoading(false);
    }
  };

  const loadGroups = async () => {
    if (!currentUser || !currentUser.phone) {
      return;
    }

    try {
      const userGroups = await api.getUserGroups(currentUser.phone);
      setGroups(userGroups);
    } catch (error) {
      console.error('Error loading groups from backend:', error);
      try {
        const localGroupsData = await AsyncStorage.getItem('groups');
        if (localGroupsData) {
          const localGroups = JSON.parse(localGroupsData);
          setGroups(localGroups);
        }
      } catch (localError) {
        console.error('Error loading local groups:', localError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('currentUser');
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  // In HomeScreen.js - Replace calculateGroupBalance function:

// ✅ CORRECT: Only count PAID transactions for balance
const calculateGroupBalance = (group) => {
  if (!group.transactions || group.transactions.length === 0) return 0;
  
  const paidTransactions = group.transactions.filter(t => t.status === 'paid');
  return paidTransactions.reduce((total, transaction) => {
    if (transaction.type === 'deposit') {
      return total + transaction.amount;
    } else {
      return total - transaction.amount;
    }
  }, 0);
};

  const getPendingRequestsCount = (group) => {
    if (!group.transactions) return 0;
    return group.transactions.filter(t => t.status === 'pending').length;
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.groupItem}
      onPress={() => navigation.navigate('GroupDetails', { groupId: item.id })}
    >
      <View style={styles.groupHeader}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={[
          styles.groupBalance,
          { color: calculateGroupBalance(item) >= 0 ? '#34C759' : '#FF3B30' }
        ]}>
          ₹{calculateGroupBalance(item)}
        </Text>
      </View>
      
      <View style={styles.groupDetails}>
        <Text style={styles.groupInfo}>
          {item.members ? item.members.length : 0} members • {item.approvalThreshold} approvals needed
        </Text>
        
        {getPendingRequestsCount(item) > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>
              {getPendingRequestsCount(item)} pending
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.createdDate}>
        Created: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcome}>Group Wallet</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Welcome!</Text>
          <Text style={styles.emptySubtitle}>Please login to continue</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.replace('Login')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome back!</Text>
          <Text style={styles.userName}>{currentUser.name}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('JoinGroup')}
          >
            <Text style={styles.actionButtonIcon}>👥</Text>
            <Text style={styles.actionButtonText}>Join Group</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateGroup')}
          >
            <Text style={styles.actionButtonIcon}>➕</Text>
            <Text style={styles.actionButtonText}>Create Group</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Groups List */}
      <View style={styles.groupsContainer}>
        <View style={styles.groupsHeader}>
          <Text style={styles.sectionTitle}>My Groups</Text>
          <Text style={styles.groupsCount}>({groups.length})</Text>
        </View>

        {groups.length === 0 ? (
          <View style={styles.emptyGroups}>
            <Text style={styles.emptyGroupsIcon}>🏠</Text>
            <Text style={styles.emptyGroupsTitle}>No groups yet</Text>
            <Text style={styles.emptyGroupsText}>
              Join an existing group or create your first group to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={groups}
            renderItem={renderGroupItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.groupsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#007AFF']}
              />
            }
          />
        )}
      </View>
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
    fontSize: 18,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  welcome: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  logoutText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  actionsContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  groupsContainer: {
    flex: 1,
    padding: 20,
  },
 groupsHeader: {
  flexDirection: 'row',
  alignItems: 'baseline', // Changed from 'center' to 'baseline'
  marginBottom: 15,
},
  groupsCount: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  groupsList: {
    paddingBottom: 20,
  },
  groupItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f3f4',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  groupBalance: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  groupDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupInfo: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  pendingBadge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  pendingText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
  },
  createdDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyGroups: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyGroupsIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyGroupsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyGroupsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});