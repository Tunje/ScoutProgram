import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
import { db } from '../lib/firebase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Project, Group } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Scan'>;
  route: RouteProp<RootStackParamList, 'Scan'>;
};

export default function ScanScreen({ navigation, route }: Props) {
  const { projectId } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [project, setProject] = useState<Project | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [scanning, setScanning] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [controlCode, setControlCode] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (projectDoc.exists()) {
        setProject({ id: projectDoc.id, ...projectDoc.data() } as Project);
      }

      const groupsQuery = query(
        collection(db, 'groups'),
        where('projectId', '==', projectId),
        where('isClaimed', '==', true)
      );
      const groupsSnapshot = await getDocs(groupsQuery);
      const groupsData = groupsSnapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Group[];
      setGroups(groupsData);

      const savedGroupId = await SecureStore.getItemAsync('groupId');
      if (savedGroupId) {
        const savedGroup = groupsData.find(g => g.id === savedGroupId);
        if (savedGroup) {
          setSelectedGroup(savedGroup);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const processControl = async (controlId: string) => {
    if (!selectedGroup) return;

    try {
      // Look up control by ID (from QR) or by code (from manual entry)
      let controlDoc;
      
      // Try as direct ID first (QR code)
      controlDoc = await getDoc(doc(db, 'controls', controlId));
      
      // If not found, try as control code
      if (!controlDoc.exists()) {
        const q = query(
          collection(db, 'controls'),
          where('projectId', '==', projectId),
          where('controlCode', '==', controlId.toUpperCase())
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          controlDoc = snapshot.docs[0];
        }
      }

      if (!controlDoc.exists()) {
        console.log('Control not found');
        return;
      }

      // Navigate to control detail screen
      navigation.navigate('ControlDetail', {
        projectId,
        controlId: controlDoc.id,
        groupId: selectedGroup.id,
      });
      
    } catch (error) {
      console.error('Error processing control:', error);
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanning) return;
    setScanning(false);

    processControl(data.trim());
    
    setTimeout(() => setScanning(true), 2000);
  };

  const handleManualSubmit = async () => {
    if (controlCode.length === 5) {
      await processControl(controlCode);
      setControlCode('');
    }
  };

  if (showManualEntry) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowManualEntry(false)}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.projectName}>Enter Control Code</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>Control Code (5 letters):</Text>
          <TextInput
            style={styles.codeInput}
            value={controlCode}
            onChangeText={(text) => setControlCode(text.toUpperCase())}
            placeholder="ABC12"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={5}
          />

          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleManualSubmit}
          >
            <Text style={styles.optionButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (showCamera) {
    if (!permission?.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Camera permission required</Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowCamera(false)}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.projectName}>{project?.name}</Text>
          <Text style={styles.groupInfo}>{selectedGroup?.kår} - {selectedGroup?.name}</Text>
        </View>

        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.instructionText}>Point camera at QR code</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.projectName}>{project?.name || 'Loading...'}</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.label}>Select Group:</Text>
        <View style={styles.groupsContainer}>
          {groups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={[
                styles.groupCard,
                selectedGroup?.id === group.id && styles.groupCardSelected
              ]}
              onPress={() => {
                setSelectedGroup(group);
                SecureStore.setItemAsync('groupId', group.id);
              }}
            >
              <Text style={[
                styles.groupCardText,
                selectedGroup?.id === group.id && styles.groupCardTextSelected
              ]}>
                {group.kår}
              </Text>
              <Text style={[
                styles.groupCardSubtext,
                selectedGroup?.id === group.id && styles.groupCardTextSelected
              ]}>
                {group.name}
              </Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={styles.addGroupCard}
            onPress={() => navigation.navigate('GroupRegistration', { projectId })}
          >
            <Text style={styles.addGroupIcon}>+</Text>
            <Text style={styles.addGroupText}>Add Group</Text>
          </TouchableOpacity>
        </View>

        {selectedGroup && (
          <>
            <Text style={styles.title}>How would you like to register this control?</Text>
            
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => setShowCamera(true)}
            >
              <Text style={styles.optionButtonText}>📷 Scan QR Code</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => setShowManualEntry(true)}
            >
              <Text style={styles.optionButtonText}>⌨️ Enter Control Code</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2FE',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  projectName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  groupInfo: {
    fontSize: 16,
    color: '#6B7280',
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  instructionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    fontSize: 18,
    color: '#3B82F6',
    marginBottom: 12,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  groupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  groupCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    minWidth: '45%',
  },
  groupCardSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  groupCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  groupCardSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  groupCardTextSelected: {
    color: 'white',
  },
  addGroupCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    minWidth: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addGroupIcon: {
    fontSize: 32,
    color: '#3B82F6',
    marginBottom: 4,
  },
  addGroupText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 32,
  },
  optionButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  optionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  codeInput: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 4,
  },
});
