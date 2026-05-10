import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
import { db } from '../lib/firebase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Group } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GroupRegistration'>;
  route: RouteProp<RootStackParamList, 'GroupRegistration'>;
};

export default function GroupRegistrationScreen({ navigation, route }: Props) {
  const { projectId } = route.params;
  const [registrationCode, setRegistrationCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [verifiedGroup, setVerifiedGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);


  const handleVerifyCode = async () => {
    if (!registrationCode.trim()) {
      return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(db, 'groups'),
        where('projectId', '==', projectId),
        where('registrationCode', '==', registrationCode.toUpperCase())
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setLoading(false);
        return;
      }

      const groupDoc = snapshot.docs[0];
      const group = { id: groupDoc.id, ...groupDoc.data() } as Group;
      
      // Pre-fill name if already claimed
      if (group.isClaimed && group.name !== 'Unclaimed') {
        setGroupName(group.name);
      }
      
      setVerifiedGroup(group);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
    }
  };

  const handleRegisterGroup = async () => {
    if (!groupName.trim() || !verifiedGroup) {
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'groups', verifiedGroup.id), {
        name: groupName,
        isClaimed: true
      });

      // Save group ID for next time
      await SecureStore.setItemAsync('groupId', verifiedGroup.id);

      navigation.navigate('Scan', { projectId });
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Register Group</Text>
        <Text style={styles.subtitle}>Enter your registration code to claim your group</Text>

        <View style={styles.form}>
          {!verifiedGroup ? (
            <>
              <TextInput
                style={styles.input}
                value={registrationCode}
                onChangeText={(text) => setRegistrationCode(text.toUpperCase())}
                placeholder="A1A0XM"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={6}
              />
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyCode}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.verifiedBox}>
              <Text style={styles.verifiedText}>✓ Code Verified!</Text>
              <Text style={styles.karText}>Kår: {verifiedGroup.kår}</Text>
              
              <Text style={styles.label}>Group/Patrol Name</Text>
              <TextInput
                style={styles.input}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="e.g., Eagles, Wolves, Patrol 1..."
              />
              
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegisterGroup}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Registering...' : 'Register Group'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
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
  verifiedBox: {
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  verifiedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 8,
  },
  karText: {
    fontSize: 16,
    color: '#047857',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
});
