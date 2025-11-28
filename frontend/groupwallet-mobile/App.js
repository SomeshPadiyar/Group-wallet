import React, { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { StatusBar } from 'expo-status-bar'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { View, Text, ActivityIndicator } from 'react-native'

// Import all screens
import LoginScreen from './src/screens/LoginScreen'
import OTPScreen from './src/screens/OTPScreen'
import HomeScreen from './src/screens/HomeScreen'
import CreateGroupScreen from './src/screens/CreateGroupScreen'
import GroupDetailsScreen from './src/screens/GroupDetailsScreen'
import TransactionScreen from './src/screens/TransactionScreen'
import MembersScreen from './src/screens/MembersScreen'
import PendingScreen from './src/screens/PendingScreen'
import JoinGroupScreen from './src/screens/JoinGroupScreen'
import MemberDetailsScreen from './src/screens/MemberDetails/MemberDetailsScreen'
import DepositHistoryScreen from './src/screens/MemberDetails/DepositHistoryScreen'
import WithdrawHistoryScreen from './src/screens/MemberDetails/WithdrawHistoryScreen'
import NetBalanceScreen from './src/screens/MemberDetails/NetBalanceScreen'
import RequestSummaryScreen from './src/screens/MemberDetails/RequestSummaryScreen'

// NEW: Import payment-related screens
import TransactionDetailsScreen from './src/screens/TransactionDetailsScreen'
import PaymentScreen from './src/screens/PaymentScreen'
import PendingPaymentsScreen from './src/screens/PendingPaymentsScreen'
import WithdrawalScreen from './src/screens/WithdrawalScreen'

const Stack = createStackNavigator()

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [initialRoute, setInitialRoute] = useState('Login')

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser')
      if (userData) {
        const user = JSON.parse(userData)
        // Check if user data is valid
        if (user.email && user.name && user.phone) {
          setInitialRoute('Home')
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>{' '}
        {/* ✅ Text wrapped in <Text> component */}
      </View>
    )
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OTP"
          component={OTPScreen}
          options={{ title: 'Verify OTP' }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'My Groups' }}
        />
        <Stack.Screen
          name="CreateGroup"
          component={CreateGroupScreen}
          options={{ title: 'Create Group' }}
        />
        <Stack.Screen
          name="GroupDetails"
          component={GroupDetailsScreen}
          options={{ title: 'Group Details' }}
        />
        <Stack.Screen
          name="Transaction"
          component={TransactionScreen}
          options={{ title: 'New Transaction' }}
        />
        <Stack.Screen
          name="Members"
          component={MembersScreen}
          options={{ title: 'Group Members' }}
        />
        <Stack.Screen
          name="Pending"
          component={PendingScreen}
          options={{ title: 'Pending Approvals' }}
        />
        <Stack.Screen
          name="JoinGroup"
          component={JoinGroupScreen}
          options={{ title: 'Join Group' }}
        />
        <Stack.Screen
          name="MemberDetails"
          component={MemberDetailsScreen}
          options={{ title: 'Member Details' }}
        />
        <Stack.Screen
          name="DepositHistory"
          component={DepositHistoryScreen}
          options={{ title: 'Deposit History' }}
        />
        <Stack.Screen
          name="WithdrawHistory"
          component={WithdrawHistoryScreen}
          options={{ title: 'Withdraw History' }}
        />
        <Stack.Screen
          name="NetBalance"
          component={NetBalanceScreen}
          options={{ title: 'Net Balance' }}
        />
        <Stack.Screen
          name="RequestSummary"
          component={RequestSummaryScreen}
          options={{ title: 'Request Summary' }}
        />

        {/* NEW: Payment-related screens */}
        <Stack.Screen
          name="TransactionDetails"
          component={TransactionDetailsScreen}
          options={{ title: 'Transaction Details' }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ title: 'Complete Payment' }}
        />
        <Stack.Screen
          name="PendingPayments"
          component={PendingPaymentsScreen}
          options={{ title: 'Pending Payments' }}
        />
        <Stack.Screen
          name="Withdrawal"
          component={WithdrawalScreen}
          options={{ title: 'Complete Withdrawal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
