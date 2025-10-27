import React, { useState } from 'react';
import { api } from '../services/api';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function JoinGroupScreen({ navigation }) {
  const [groupCode, setGroupCode] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    loadCurrentUser();
  }, []);

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


// Replace handleJoinGroup function:
const handleJoinGroup = async () => {
  if (!groupCode.trim()) {
    Alert.alert('Error', 'Please enter group code');
    return;
  }

  try {
    // Join via backend
    const updatedGroup = await api.joinGroup(groupCode.toUpperCase(), currentUser);
    
    Alert.alert(
      'Success!', 
      `You have joined "${updatedGroup.name}" successfully!`,
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ]
    );
  } catch (error) {
    console.error('Join error:', error);
    Alert.alert('Error', error.message || 'Failed to join group');
  }
};

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Join Group</Text>
          <Text style={styles.subtitle}>
            Enter the group code shared by your friend to join their expense tracking group
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Group Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit group code"
            value={groupCode}
            onChangeText={setGroupCode}
            autoCapitalize="characters"
            maxLength={6}
            textAlign="center"
          />
          <Text style={styles.helperText}>
            Example: FRIEND, TRIP24, etc.
          </Text>
        </View>

        <TouchableOpacity 
          style={[
            styles.joinButton,
            (!groupCode.trim()) && styles.joinButtonDisabled
          ]}
          onPress={handleJoinGroup}
          disabled={!groupCode.trim()}
        >
          <Text style={styles.joinButtonText}>Join Group</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How to join a group?</Text>
          <Text style={styles.infoText}>1. Ask your friend for their group code</Text>
          <Text style={styles.infoText}>2. Enter the code above</Text>
          <Text style={styles.infoText}>3. Click "Join Group"</Text>
          <Text style={styles.infoText}>4. Start tracking expenses together!</Text>
        </View>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  joinButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  joinButtonDisabled: {
    backgroundColor: '#ccc',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#e6f2ff',
    padding: 20,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
});