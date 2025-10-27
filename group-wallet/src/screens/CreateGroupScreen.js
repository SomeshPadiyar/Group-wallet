import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Generate unique group code
const generateGroupCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function CreateGroupScreen({ navigation }) {
  const [groupName, setGroupName] = useState('');
  const [approvalThreshold, setApprovalThreshold] = useState('2');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [groupCode, setGroupCode] = useState('');

  useEffect(() => {
    loadCurrentUser();
    setGroupCode(generateGroupCode());
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setSelectedMembers([user]);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const shareGroupCode = async () => {
    try {
      const shareMessage = `Join my group "${groupName}" on Group Wallet App!\n\nGroup Code: ${groupCode}\n\nUse this code to join the group and start tracking expenses together!`;
      
      await Share.share({
        message: shareMessage,
        title: `Join ${groupName}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share group code');
    }
  };


// Replace handleCreateGroup function:
const handleCreateGroup = async () => {
  if (!groupName.trim()) {
    Alert.alert('Error', 'Please enter group name');
    return;
  }

  const threshold = parseInt(approvalThreshold);
  if (isNaN(threshold) || threshold < 1) {
    Alert.alert('Error', 'Approval threshold must be at least 1');
    return;
  }

  try {
    const newGroup = {
      name: groupName.trim(),
      code: groupCode,
      approvalThreshold: threshold,
      members: selectedMembers,
      createdBy: currentUser.phone,
    };

    // Save to backend
    const createdGroup = await api.createGroup(newGroup);
    
    Alert.alert(
      'Group Created Successfully!', 
      `Your group code is: ${groupCode}`,
      [
        {
          text: 'Share Code',
          onPress: shareGroupCode,
        },
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ]
    );
  } catch (error) {
    console.error('Create group error:', error);
    Alert.alert('Error', error.message || 'Failed to create group');
  }
};

  const renderSelectedMemberItem = ({ item }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberPhone}>{item.phone}</Text>
        {item.phone === currentUser?.phone && (
          <Text style={styles.adminBadge}>Admin (You)</Text>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Group Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter group name"
            value={groupName}
            onChangeText={setGroupName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Group Code</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{groupCode}</Text>
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={shareGroupCode}
            >
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>
            Share this code with friends so they can join your group
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Approval Threshold</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimum approvals needed"
            value={approvalThreshold}
            onChangeText={setApprovalThreshold}
            keyboardType="number-pad"
          />
          <Text style={styles.helperText}>
            Minimum {approvalThreshold || 0} approvals needed for transactions
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Group Members</Text>
          <Text style={styles.helperText}>
            You are automatically added as admin. Others can join using the group code.
          </Text>
        </View>

        <View style={styles.selectedMembers}>
          <FlatList
            data={selectedMembers}
            renderItem={renderSelectedMemberItem}
            keyExtractor={item => item.phone}
            style={styles.membersList}
            nestedScrollEnabled={true}
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.createButton,
            (!groupName.trim()) && styles.createButtonDisabled
          ]}
          onPress={handleCreateGroup}
          disabled={!groupName.trim()}
        >
          <Text style={styles.createButtonText}>Create Group</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  codeText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  shareButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  selectedMembers: {
    flex: 1,
    marginBottom: 20,
  },
  membersList: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  memberPhone: {
    fontSize: 12,
    color: '#666',
  },
  adminBadge: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 2,
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
});