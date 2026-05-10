import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInAnonymously } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
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
    // Auto-login anonymously and check for saved project
    const init = async () => {
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
        
        // Try to load saved project ID
        const savedProjectId = await SecureStore.getItemAsync('projectId');
        if (savedProjectId) {
          // Check if project still exists
          const projectDoc = await getDoc(doc(db, 'projects', savedProjectId));
          if (projectDoc.exists()) {
            // Auto-navigate to group registration
            navigation.replace('GroupRegistration', { projectId: savedProjectId });
          } else {
            // Project deleted, clear saved ID
            await SecureStore.deleteItemAsync('projectId');
          }
        }
      } catch (error: any) {
        console.log('Init error:', error);
      }
    };
    
    init();
  }, []);

  const handleSubmit = async () => {
    if (!projectCode.trim()) {
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
        setLoading(false);
        return;
      }

      const projectDoc = snapshot.docs[0];
      const projectId = projectDoc.id;
      
      // Save project ID for next time
      await SecureStore.setItemAsync('projectId', projectId);
      
      navigation.replace('GroupRegistration', { projectId });
    } catch (error: any) {
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
