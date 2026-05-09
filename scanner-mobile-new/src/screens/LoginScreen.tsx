import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInAnonymously } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [projectCode, setProjectCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto-login anonymously on mount
    const autoLogin = async () => {
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (error: any) {
        console.log('Auth error:', error);
      }
    };
    
    autoLogin();
  }, []);

  const handleSubmit = async () => {
    if (!projectCode.trim()) {
      Alert.alert('Error', 'Please enter a project code');
      return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(db, 'projects'),
        where('projectCode', '==', projectCode.toUpperCase())
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        Alert.alert('Invalid Code', 'No project found with this code');
        setLoading(false);
        return;
      }

      const projectDoc = snapshot.docs[0];
      const projectId = projectDoc.id;
      
      navigation.replace('GroupRegistration', { projectId });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to find project');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Scout Scanner</Text>
        <Text style={styles.subtitle}>Enter your project code to begin</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={projectCode}
            onChangeText={(text) => setProjectCode(text.toUpperCase())}
            placeholder="DEMO959"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={20}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Finding Project...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2FE',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 20,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
