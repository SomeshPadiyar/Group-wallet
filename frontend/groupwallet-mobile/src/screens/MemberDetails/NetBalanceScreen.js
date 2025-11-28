import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Alert,
  Share,
  Modal
} from 'react-native';
import { memberStyles } from './styles';
import { LineChart, PieChart } from 'react-native-chart-kit';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const { width: screenWidth } = Dimensions.get('window');

export default function NetBalanceScreen({ route, navigation }) {
  const { member, group } = route.params;
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('charts');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // FIXED: Calculate enhanced balance stats - Only count PAID transactions
  const calculateEnhancedBalanceStats = () => {
    if (!group?.transactions) return {};
    
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
    
    // Largest transactions (only PAID ones)
    const largestDeposits = [...paidDeposits]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    const largestWithdrawals = [...paidWithdrawals]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Balance trend data (last 6 months) - Only PAID transactions
    const balanceTrend = calculateBalanceTrend(paidTransactions);
    
    // Income vs Expense data for pie chart - Only PAID transactions
    const incomeExpenseData = [
      { name: 'Income', amount: totalDeposit, color: '#4CAF50', legendFontColor: '#7F7F7F' },
      { name: 'Expenses', amount: totalWithdrawal, color: '#FF5252', legendFontColor: '#7F7F7F' }
    ];

    // Cash flow calendar data - Only PAID transactions
    const calendarData = generateCalendarData(paidTransactions, selectedMonth, selectedYear);

    return {
      totalDeposit,
      totalWithdrawal,
      netAmount,
      depositCount: paidDeposits.length,
      withdrawalCount: paidWithdrawals.length,
      totalTransactions: paidTransactions.length,
      pendingCount: pendingTransactions.length,
      approvedCount: approvedTransactions.length,
      rejectedCount: rejectedTransactions.length,
      largestDeposits,
      largestWithdrawals,
      balanceTrend,
      incomeExpenseData,
      calendarData,
      allTransactions: paidTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    };
  };

  // Calculate balance trend over time - Only PAID transactions
  const calculateBalanceTrend = (transactions) => {
    const months = [];
    const balances = [];
    let runningBalance = 0;
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      months.push(monthKey);
      
      // Calculate balance for this month (only PAID transactions)
      const monthTransactions = transactions.filter(t => {
        const transDate = new Date(t.createdAt);
        return transDate.getMonth() === date.getMonth() && 
               transDate.getFullYear() === date.getFullYear();
      });
      
      const monthBalance = monthTransactions.reduce((sum, t) => {
        return t.type === 'deposit' ? sum + t.amount : sum - t.amount;
      }, 0);
      
      runningBalance += monthBalance;
      balances.push(runningBalance);
    }
    
    return { months, balances };
  };

  // Generate calendar data for cash flow - Only PAID transactions
  const generateCalendarData = (transactions, month, year) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendar = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayTransactions = transactions.filter(t => {
        const transDate = new Date(t.createdAt);
        return transDate.getDate() === day && 
               transDate.getMonth() === month && 
               transDate.getFullYear() === year;
      });
      
      const dayBalance = dayTransactions.reduce((sum, t) => {
        return t.type === 'deposit' ? sum + t.amount : sum - t.amount;
      }, 0);
      
      calendar.push({
        day,
        date,
        balance: dayBalance,
        transactions: dayTransactions
      });
    }
    
    return calendar;
  };

  // Export to PDF
  const exportToPDF = async () => {
    try {
      const stats = calculateEnhancedBalanceStats();
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 25px; }
              .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
              .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
              .positive { color: #4CAF50; }
              .negative { color: #FF5252; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Financial Report - ${member.name}</h1>
              <p>Group: ${group.name} | Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="section">
              <h2>Summary (Completed Transactions Only)</h2>
              <div class="stats-grid">
                <div class="stat-card">
                  <h3>Total Income</h3>
                  <p class="positive">₹${stats.totalDeposit}</p>
                </div>
                <div class="stat-card">
                  <h3>Total Expenses</h3>
                  <p class="negative">₹${stats.totalWithdrawal}</p>
                </div>
                <div class="stat-card">
                  <h3>Net Balance</h3>
                  <p class="${stats.netAmount >= 0 ? 'positive' : 'negative'}">₹${stats.netAmount}</p>
                </div>
                <div class="stat-card">
                  <h3>Completed Transactions</h3>
                  <p>${stats.totalTransactions}</p>
                </div>
              </div>
              <p><small>Pending: ${stats.pendingCount} | Approved: ${stats.approvedCount} | Rejected: ${stats.rejectedCount}</small></p>
            </div>
            
            <div class="section">
              <h2>Largest Completed Transactions</h2>
              <h3>Top Deposits</h3>
              <table>
                <tr><th>Amount</th><th>Date</th><th>Description</th></tr>
                ${stats.largestDeposits.map(t => `
                  <tr>
                    <td class="positive">₹${t.amount}</td>
                    <td>${new Date(t.createdAt).toLocaleDateString()}</td>
                    <td>${t.description || 'No description'}</td>
                  </tr>
                `).join('')}
              </table>
              
              <h3>Top Withdrawals</h3>
              <table>
                <tr><th>Amount</th><th>Date</th><th>Description</th></tr>
                ${stats.largestWithdrawals.map(t => `
                  <tr>
                    <td class="negative">₹${t.amount}</td>
                    <td>${new Date(t.createdAt).toLocaleDateString()}</td>
                    <td>${t.description || 'No description'}</td>
                  </tr>
                `).join('')}
              </table>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Financial Report'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF report');
    }
  };

  // Export to CSV
  const exportToCSV = async () => {
    try {
      const stats = calculateEnhancedBalanceStats();
      let csvContent = 'Financial Report - ' + member.name + '\n';
      csvContent += 'Group: ' + group.name + '\n';
      csvContent += 'Generated on: ' + new Date().toLocaleDateString() + '\n\n';
      
      csvContent += 'Summary (Completed Transactions Only)\n';
      csvContent += 'Total Income,₹' + stats.totalDeposit + '\n';
      csvContent += 'Total Expenses,₹' + stats.totalWithdrawal + '\n';
      csvContent += 'Net Balance,₹' + stats.netAmount + '\n';
      csvContent += 'Completed Transactions,' + stats.totalTransactions + '\n';
      csvContent += 'Pending Transactions,' + stats.pendingCount + '\n';
      csvContent += 'Approved Transactions,' + stats.approvedCount + '\n';
      csvContent += 'Rejected Transactions,' + stats.rejectedCount + '\n\n';
      
      csvContent += 'Largest Completed Deposits\n';
      csvContent += 'Amount,Date,Description\n';
      stats.largestDeposits.forEach(t => {
        csvContent += `₹${t.amount},${new Date(t.createdAt).toLocaleDateString()},"${t.description || 'No description'}"\n`;
      });
      
      csvContent += '\nLargest Completed Withdrawals\n';
      csvContent += 'Amount,Date,Description\n';
      stats.largestWithdrawals.forEach(t => {
        csvContent += `₹${t.amount},${new Date(t.createdAt).toLocaleDateString()},"${t.description || 'No description'}"\n`;
      });

      const fileUri = FileSystem.documentDirectory + 'financial_report.csv';
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate CSV report');
    }
  };

  const stats = calculateEnhancedBalanceStats();

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
  };

  const renderChartsTab = () => (
    <ScrollView>
      {/* Balance Trend Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Balance Trend (Last 6 Months - Completed Only)</Text>
        <LineChart
          data={{
            labels: stats.balanceTrend.months,
            datasets: [{ data: stats.balanceTrend.balances }]
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Income vs Expense Pie Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Income vs Expenses (Completed Only)</Text>
        <PieChart
          data={stats.incomeExpenseData}
          width={screenWidth - 40}
          height={200}
          chartConfig={chartConfig}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      {/* Largest Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Largest Completed Transactions</Text>
        
        <Text style={styles.subSectionTitle}>Top Deposits</Text>
        {stats.largestDeposits.map((transaction, index) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <Text style={styles.transactionAmount}>₹{transaction.amount}</Text>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionDescription}>
                {transaction.description || 'No description'}
              </Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))}

        <Text style={styles.subSectionTitle}>Top Withdrawals</Text>
        {stats.largestWithdrawals.map((transaction, index) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <Text style={[styles.transactionAmount, { color: '#FF5252' }]}>
              ₹{transaction.amount}
            </Text>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionDescription}>
                {transaction.description || 'No description'}
              </Text>
              <Text style={styles.transactionDate}>
                {new Date(transaction.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderCalendarTab = () => (
    <ScrollView>
      <View style={styles.calendarContainer}>
        <Text style={styles.calendarTitle}>
          Cash Flow - {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
        
        <View style={styles.calendarGrid}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.calendarHeader}>{day}</Text>
          ))}
          
          {stats.calendarData.map(dayData => (
            <TouchableOpacity 
              key={dayData.day}
              style={[
                styles.calendarDay,
                dayData.balance > 0 && styles.positiveDay,
                dayData.balance < 0 && styles.negativeDay
              ]}
              onPress={() => {
                if (dayData.transactions.length > 0) {
                  Alert.alert(
                    `Transactions - ${dayData.day}`,
                    `Net Change: ₹${dayData.balance}\nTransactions: ${dayData.transactions.length}`
                  );
                }
              }}
            >
              <Text style={styles.calendarDayNumber}>{dayData.day}</Text>
              {dayData.balance !== 0 && (
                <Text style={styles.calendarDayAmount}>
                  ₹{Math.abs(dayData.balance)}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={memberStyles.container}>
      {/* Header with Export Options */}
      <View style={styles.header}>
        <View style={styles.exportButtons}>
          <TouchableOpacity style={styles.exportButton} onPress={exportToPDF}>
            <Text style={styles.exportButtonText}>Export PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton} onPress={exportToCSV}>
            <Text style={styles.exportButtonText}>Export CSV</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'charts' && styles.activeTab]}
          onPress={() => setActiveTab('charts')}
        >
          <Text style={[styles.tabText, activeTab === 'charts' && styles.activeTabText]}>
            Charts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'calendar' && styles.activeTab]}
          onPress={() => setActiveTab('calendar')}
        >
          <Text style={[styles.tabText, activeTab === 'calendar' && styles.activeTabText]}>
            Calendar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'charts' ? renderChartsTab() : renderCalendarTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  exportButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  chart: {
    borderRadius: 8,
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 8,
    color: '#666',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    width: 80,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  calendarContainer: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 12,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarHeader: {
    width: '14.28%',
    textAlign: 'center',
    fontWeight: '600',
    paddingVertical: 8,
    color: '#666',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  positiveDay: {
    backgroundColor: '#E8F5E8',
  },
  negativeDay: {
    backgroundColor: '#FFEBEE',
  },
  calendarDayNumber: {
    fontSize: 12,
    fontWeight: '500',
  },
  calendarDayAmount: {
    fontSize: 8,
    marginTop: 2,
  },
});