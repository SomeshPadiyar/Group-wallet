import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { memberStyles } from './styles';

export default function MemberDetailsScreen({ route, navigation }) {
  const { member, group, currentUser } = route.params;
  
  // FIXED: Only count PAID transactions for money calculations
  const calculateMemberStats = () => {
    if (!group?.transactions) return { recentTransactions: [] };
    
    const memberTransactions = group.transactions.filter(t => 
      t.createdBy === member.name || t.createdBy === member.phone
    );
    
    // ✅ ONLY count PAID transactions for money calculations
    const paidTransactions = memberTransactions.filter(t => t.status === 'paid');
    const pendingTransactions = memberTransactions.filter(t => t.status === 'pending');
    const approvedTransactions = memberTransactions.filter(t => t.status === 'approved');
    const rejectedTransactions = memberTransactions.filter(t => t.status === 'rejected');
    
    // ✅ Only PAID deposits and withdrawals affect the money totals
    const paidDeposits = paidTransactions.filter(t => t.type === 'deposit');
    const paidWithdrawals = paidTransactions.filter(t => t.type === 'withdrawal');
    
    const totalDeposit = paidDeposits.reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawal = paidWithdrawals.reduce((sum, t) => sum + t.amount, 0);
    const netAmount = totalDeposit - totalWithdrawal;
    
    return {
      totalDeposit,        // Only paid deposits
      totalWithdrawal,     // Only paid withdrawals  
      netAmount,           // Only paid transactions
      totalRequests: memberTransactions.length,
      approvedRequests: approvedTransactions.length,
      pendingRequests: pendingTransactions.length,
      rejectedRequests: rejectedTransactions.length,
      paidRequests: paidTransactions.length,
      recentTransactions: memberTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
    };
  };

  const stats = calculateMemberStats();
  const isAdmin = member.phone === group?.createdBy;

  // FIXED: Status display for recent transactions
  const getStatusDisplay = (transaction) => {
    if (transaction.status === 'paid') {
      return transaction.type === 'deposit' ? '✅ COMPLETED' : ' COMPLETED';
    }
    if (transaction.status === 'approved') return '✅ APPROVED';
    if (transaction.status === 'rejected') {
      if (transaction.rejectionReason === 'Not enough balance') return '❌ NOT ENOUGH BALANCE';
      return '❌ REJECTED';
    }
    return '⏳ PENDING';
  };

  const getTransactionIcon = (type) => type === 'deposit' ? '💰' : '💸';

  return (
    <View style={memberStyles.container}>
      <ScrollView>
        <View style={memberStyles.header}>
          <View style={memberStyles.avatar}>
            <Text style={memberStyles.avatarText}>{member.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={memberStyles.memberName}>{member.name}</Text>
          <Text style={memberStyles.memberPhone}>{member.phone}</Text>
          {isAdmin && (
            <View style={memberStyles.adminBadge}>
              <Text style={memberStyles.adminBadgeText}>👑 Group Admin</Text>
            </View>
          )}
        </View>

        <View style={memberStyles.statsContainer}>
          <TouchableOpacity 
            style={memberStyles.statCard}
            onPress={() => navigation.navigate('DepositHistory', { member, group })}
          >
            <Text style={memberStyles.statIcon}>💰</Text>
            <Text style={memberStyles.statValue}>₹{stats.totalDeposit}</Text>
            <Text style={memberStyles.statLabel}>Total Deposit</Text>
            {/* <Text style={memberStyles.statSubtext}>{stats.paidRequests} completed</Text> */}
          </TouchableOpacity>

          <TouchableOpacity 
            style={memberStyles.statCard}
            onPress={() => navigation.navigate('WithdrawHistory', { member, group })}
          >
            <Text style={memberStyles.statIcon}>💸</Text>
            <Text style={memberStyles.statValue}>₹{stats.totalWithdrawal}</Text>
            <Text style={memberStyles.statLabel}>Total Withdraw</Text>
            {/* <Text style={memberStyles.statSubtext}>{stats.paidRequests} completed</Text> */}
          </TouchableOpacity>

          <TouchableOpacity 
            style={memberStyles.statCard}
            onPress={() => navigation.navigate('NetBalance', { member, group })}
          >
            <Text style={memberStyles.statIcon}>💎</Text>
            <Text style={[memberStyles.statValue, { color: stats.netAmount >= 0 ? '#34C759' : '#FF3B30' }]}>
              ₹{stats.netAmount}
            </Text>
            <Text style={memberStyles.statLabel}>Net Balance</Text>
           
          </TouchableOpacity>

          <TouchableOpacity 
            style={memberStyles.statCard}
            onPress={() => navigation.navigate('RequestSummary', { member, group })}
          >
            <Text style={memberStyles.statIcon}>📋</Text>
            <Text style={memberStyles.statValue}>{stats.totalRequests}</Text>
            <Text style={memberStyles.statLabel}>Total Requests</Text>
            {/* <Text style={memberStyles.statSubtext}>
              ✅{stats.approvedRequests} ⏳{stats.pendingRequests} ❌{stats.rejectedRequests}
            </Text> */}
          </TouchableOpacity>
        </View>

        <View style={memberStyles.section}>
          <Text style={memberStyles.sectionTitle}>Recent Transactions</Text>
          {stats.recentTransactions.length === 0 ? (
            <View style={memberStyles.emptyState}>
              <Text style={memberStyles.emptyStateText}>No transactions yet</Text>
            </View>
          ) : (
            <View>
              {stats.recentTransactions.map((item) => (
                <View key={item.id} style={memberStyles.transactionItem}>
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
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={memberStyles.transactionRight}>
                    <Text style={[
                      memberStyles.transactionStatus,
                      { 
                        color: item.status === 'paid' ? '#34C759' : 
                               item.status === 'approved' ? '#34C759' : 
                               item.status === 'rejected' ? '#FF3B30' : '#FF9500'
                      }
                    ]}>
                      {getStatusDisplay(item)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}