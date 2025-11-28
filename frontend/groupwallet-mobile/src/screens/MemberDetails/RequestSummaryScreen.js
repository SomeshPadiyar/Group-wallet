import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { memberStyles } from './styles';

const { width: screenWidth } = Dimensions.get('window');

export default function RequestSummaryScreen({ route, navigation }) {
  const { member, group } = route.params;
  const [filter, setFilter] = useState('all');
  const flatListRef = useRef(null);

  const allTransactions = group?.transactions?.filter(t => 
    t.createdBy === member.name || t.createdBy === member.phone
  ) || [];

  // FIXED: Filter logic - 'completed' now shows 'paid' transactions
  const filteredTransactions = allTransactions.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'completed') return t.status === 'paid';
    return t.status === filter;
  });

  // FIXED: Status display logic
  const getStatusDisplay = (transaction) => {
    if (transaction.status === 'paid') {
      return transaction.type === 'deposit' ? '✅ COMPLETED' : '❌ COMPLETED';
    }
    if (transaction.status === 'approved') return '✅ APPROVED';
    if (transaction.status === 'rejected') {
      if (transaction.rejectionReason === 'Not enough balance') return '❌ NOT ENOUGH BALANCE';
      return '❌ REJECTED';
    }
    return '⏳ PENDING';
  };

  const getStatusColor = (transaction) => {
    if (transaction.status === 'paid') {
      return transaction.type === 'deposit' ? '#34C759' : '#FF3B30';
    }
    if (transaction.status === 'approved') return '#34C759';
    if (transaction.status === 'rejected') return '#FF3B30';
    return '#FF9500';
  };

  const getTransactionIcon = (type) => type === 'deposit' ? '💰' : '💸';

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'completed', label: 'Completed' },
    { key: 'approved', label: 'Approved' },
    { key: 'pending', label: 'Pending' },
    { key: 'rejected', label: 'Rejected' }
  ];

  const renderFilterItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.filterItem,
        filter === item.key ? styles.filterItemActive : styles.filterItemInactive
      ]}
      onPress={() => {
        setFilter(item.key);
        // Scroll to the selected filter
        flatListRef.current?.scrollToIndex({ index, animated: true });
      }}
    >
      <Text style={[
        styles.filterItemText,
        filter === item.key ? styles.filterItemTextActive : styles.filterItemTextInactive
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderTransactionItem = ({ item }) => (
    <View style={memberStyles.transactionItem}>
      <View style={memberStyles.transactionLeft}>
        <Text style={memberStyles.transactionIcon}>{getTransactionIcon(item.type)}</Text>
        <View style={memberStyles.transactionInfo}>
          <Text style={memberStyles.transactionType}>
            {item.type === 'deposit' ? 'Deposit' : 'Withdrawal'} • ₹{item.amount}
          </Text>
          <Text style={memberStyles.transactionDescription}>
            {item.description || 'No description'}
          </Text>
          <Text style={memberStyles.transactionTime}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>
      <View style={memberStyles.transactionRight}>
        <Text style={[
          memberStyles.transactionStatus,
          { color: getStatusColor(item) }
        ]}>
          {getStatusDisplay(item)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={memberStyles.container}>
      {/* Horizontal Scrollable Filters */}
      <View style={styles.filterHeader}>
        <Text style={styles.filterTitle}>Filter by Status:</Text>
        <FlatList
          ref={flatListRef}
          horizontal
          data={filters}
          renderItem={renderFilterItem}
          keyExtractor={item => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        />
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
        renderItem={renderTransactionItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={true}
        ListEmptyComponent={
          <View style={memberStyles.emptyState}>
            <Text style={memberStyles.emptyStateText}>No {filter} transactions found</Text>
            <Text style={memberStyles.emptyStateText}>Scroll horizontally on the filters above to see all options</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = {
  filterHeader: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginLeft: 16,
  },
  filtersContainer: {
    paddingHorizontal: 16,
  },
  filterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterItemActive: {
    backgroundColor: '#007AFF',
  },
  filterItemInactive: {
    backgroundColor: '#f8f9fa',
  },
  filterItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterItemTextActive: {
    color: 'white',
  },
  filterItemTextInactive: {
    color: '#666',
  },
};