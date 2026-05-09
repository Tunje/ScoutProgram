import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Control, Group } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ManualCodeEntry'>;
  route: RouteProp<RootStackParamList, 'ManualCodeEntry'>;
};

export default function ManualCodeEntry({ navigation, route }: Props) {
  const { projectId, group } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (code.length !== 5) {
      Alert.alert('Invalid Code', 'Please enter a 5-letter code');
      return;
    }

    setLoading(true);

    try {
      const q = query(
        collection(db, 'controls'),
        where('projectId', '==', projectId),
        where('controlCode', '==', code.toUpperCase())
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        Alert.alert('Invalid Code', 'No control found with this code');
        setLoading(false);
        return;
      }

      const controlDoc = snapshot.docs[0];
      const control = { id: controlDoc.id, ...controlDoc.data() } as Control;

      // Navigate to timer screen if has timer, otherwise show success
      if (control.hasTimer && control.timerConfig) {
        navigation.replace('Timer', {
          control,
          group,
          projectId
        });
      } else {
        // For now, just navigate to timer screen anyway (we'll add point awarding screen later)
        navigation.replace('Timer', {
          control,
          group,
          projectId
        });
      }
    } catch (error) {
      console.error('Error finding control:', error);
      Alert.alert('Error', 'Failed to find control');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Enter Control Code</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.subtitle}>Type the 5-letter code from the control</Text>

          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={(text) => setCode(text.toUpperCase())}
            placeholder="K3H7N"
            maxLength={5}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
          />

          <TouchableOpacity
            style={[styles.button, (loading || code.length !== 5) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading || code.length !== 5}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Finding Control...' : 'Submit Code'}
            </Text>
          </TouchableOpacity>

          <View style={styles.hint}>
            <Text style={styles.hintText}>💡 Can't scan the QR code?</Text>
            <Text style={styles.hintText}>Type the code shown on the control instead</Text>
          </View>
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
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
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
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  codeInput: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 32,
    fontFamily: 'monospace',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 24,
    letterSpacing: 8,
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
  hint: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
  },
  hintText: {
    color: '#1E40AF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
});
