import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Group } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GroupRegistration'>;
  route: RouteProp<RootStackParamList, 'GroupRegistration'>;
};

export default function GroupRegistrationScreen({ navigation, route }: Props) {
  const { projectId } = route.params;
  const [registrationCode, setRegistrationCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundGroup, setFoundGroup] = useState<Group | null>(null);

  const handleVerifyCode = async () => {
    if (!registrationCode.trim()) {
      Alert.alert('Error', 'Please enter a registration code');
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
        Alert.alert('Invalid Code', 'Invalid registration code. Please check and try again.');
        setLoading(false);
        return;
      }

      const groupDoc = snapshot.docs[0];
      const group = { id: groupDoc.id, ...groupDoc.data() } as Group;

      if (group.isClaimed) {
        Alert.alert('Already Claimed', `This code has already been claimed by "${group.name}"`);
        setLoading(false);
        return;
      }

      setFoundGroup(group);
      setLoading(false);
    } catch (err) {
      console.error('Error verifying code:', err);
      Alert.alert('Error', 'Error verifying code. Please try again.');
      setLoading(false);
    }
  };

  const handleRegisterGroup = async () => {
    if (!groupName.trim() || !foundGroup) return;

    setLoading(true);

    try {
      await updateDoc(doc(db, 'groups', foundGroup.id), {
        name: groupName,
        isClaimed: true,
        claimedBy: auth.currentUser?.uid,
        claimedAt: Timestamp.now()
      });

      Alert.alert('Success!', 'Group registered successfully', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Scan', { projectId })
        }
      ]);
    } catch (err) {
      console.error('Error registering group:', err);
      Alert.alert('Error', 'Error registering group. Please try again.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Register Group</Text>
        <Text style={styles.subtitle}>Enter your registration code to claim your group</Text>
      </View>

      <View style={styles.content}>
        {!foundGroup ? (
          <View style={styles.card}>
            <Text style={styles.label}>🔑 Registration Code</Text>
            <TextInput
              style={styles.codeInput}
              value={registrationCode}
              onChangeText={(text) => setRegistrationCode(text.toUpperCase())}
              placeholder="Enter 6-character code..."
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Text style={styles.hint}>Ask your event organizer for the registration code</Text>

            <TouchableOpacity
              style={[styles.button, (loading || registrationCode.length !== 6) && styles.buttonDisabled]}
              onPress={handleVerifyCode}
              disabled={loading || registrationCode.length !== 6}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.successBanner}>
              <Text style={styles.successTitle}>✓ Code Verified!</Text>
              <Text style={styles.successText}>
                Kår: <Text style={styles.successBold}>{foundGroup.kår}</Text>
              </Text>
            </View>

            <Text style={styles.label}>Group/Patrol Name</Text>
            <TextInput
              style={styles.input}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="e.g., Eagles, Wolves, Patrol 1..."
              autoFocus
            />
            <Text style={styles.hint}>Choose a name for your group/patrol</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => {
                  setFoundGroup(null);
                  setRegistrationCode('');
                  setGroupName('');
                }}
              >
                <Text style={styles.buttonSecondaryText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
                onPress={handleRegisterGroup}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Registering...' : 'Register Group'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2FE',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    color: '#10B981',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  codeInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    fontFamily: 'monospace',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 24,
  },
  successBanner: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#065F46',
  },
  successBold: {
    fontWeight: 'bold',
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  buttonPrimary: {
    flex: 1,
  },
  buttonSecondaryText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
