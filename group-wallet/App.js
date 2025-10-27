import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Import all screens
import LoginScreen from './src/screens/LoginScreen';
import OTPScreen from './src/screens/OTPScreen';
import HomeScreen from './src/screens/HomeScreen';
import CreateGroupScreen from './src/screens/CreateGroupScreen';
import GroupDetailsScreen from './src/screens/GroupDetailsScreen';
import TransactionScreen from './src/screens/TransactionScreen';
import MembersScreen from './src/screens/MembersScreen';
import PendingScreen from './src/screens/PendingScreen';
import JoinGroupScreen from './src/screens/JoinGroupScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OTP" component={OTPScreen} options={{ title: 'Verify OTP' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'My Groups' }} />
        <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ title: 'Create Group' }} />
        <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} options={{ title: 'Group Details' }} />
        <Stack.Screen name="Transaction" component={TransactionScreen} options={{ title: 'New Transaction' }} />
        <Stack.Screen name="Members" component={MembersScreen} options={{ title: 'Group Members' }} />
        <Stack.Screen name="Pending" component={PendingScreen} options={{ title: 'Pending Approvals' }} />
        <Stack.Screen name="JoinGroup" component={JoinGroupScreen} options={{ title: 'Join Group' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}