import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { collection, query, where, onSnapshot, addDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Group, Control } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Scan'>;
  route: RouteProp<RootStackParamList, 'Scan'>;
};

export default function ScanScreen({ navigation, route }: Props) {
  const { projectId } = route.params;
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [scanning, setScanning] = useState(false);
  const [showCodeEntry, setShowCodeEntry] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [lastScan, setLastScan] = useState<{ control: Control; success: boolean } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'groups'),
      where('projectId', '==', projectId),
      where('isClaimed', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groupsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Group[];
      setGroups(groupsData);
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (!selectedGroup || !scanning) return;

    setScanning(false);

    try {
      // QR code contains just the control ID
      const controlId = data.trim();

      if (!controlId) {
        Alert.alert('Invalid QR Code', 'This QR code is not valid');
        return;
      }

      const controlDoc = await getDoc(doc(db, 'controls', controlId));
      if (!controlDoc.exists()) {
        Alert.alert('Error', 'Control not found');
        return;
      }

      const control = { id: controlDoc.id, ...controlDoc.data() } as Control;

      if (control.projectId !== projectId) {
        Alert.alert('Error', 'This control belongs to a different project');
        return;
      }

      // If control has timer, navigate to timer screen
      if (control.hasTimer && control.timerConfig) {
        setScanning(false);
        navigation.navigate('Timer', {
          control,
          group: selectedGroup,
          projectId
        });
        return;
      }

      // Otherwise, save scan immediately
      const scanData: any = {
        projectId,
        groupId: selectedGroup.id,
        controlId: control.id,
        scannedBy: auth.currentUser?.uid || 'unknown',
        scannedAt: Timestamp.now()
      };

      if (control.hasPoints && control.pointsValue) {
        scanData.pointsAwarded = control.pointsValue;
      }

      await addDoc(collection(db, 'scans'), scanData);

      setLastScan({ control, success: true });

      setTimeout(() => {
        setLastScan(null);
      }, 5000);

    } catch (error) {
      console.error('Error processing scan:', error);
      Alert.alert('Error', 'Error processing scan. Please try again.');
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        <Text style={styles.subtitle}>Please enable camera permissions in settings</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scan Controls</Text>
      </View>

      <View style={styles.groupSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Group</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('GroupRegistration', { projectId })}
            style={styles.registerButton}
          >
            <Text style={styles.registerButtonText}>+ Register New</Text>
          </TouchableOpacity>
        </View>

        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No registered groups yet</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('GroupRegistration', { projectId })}
            >
              <Text style={styles.primaryButtonText}>Register Your Group</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupScroll}>
            {groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                onPress={() => setSelectedGroup(group)}
                style={[
                  styles.groupCard,
                  selectedGroup?.id === group.id && styles.groupCardSelected
                ]}
              >
                <View style={[styles.groupColor, { backgroundColor: group.color }]} />
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupKar}>Kår: {group.kår}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {lastScan && (
        <View style={styles.successBanner}>
          <Text style={styles.successTitle}>✓ Scan Successful!</Text>
          <Text style={styles.successControl}>{lastScan.control.name}</Text>
          <Text style={styles.successText}>{lastScan.control.displayText}</Text>
          {lastScan.control.hasPoints && lastScan.control.pointsValue && (
            <Text style={styles.successPoints}>+{lastScan.control.pointsValue} points</Text>
          )}
          {lastScan.control.hasTimer && lastScan.control.timerConfig && (
            <Text style={styles.successPoints}>⏱️ {lastScan.control.timerConfig.durationMinutes} min countdown started!</Text>
          )}
          <Text style={styles.successTime}>
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </Text>
        </View>
      )}

      <View style={styles.scanSection}>
        {!scanning ? (
          <View style={styles.scanPrompt}>
            <Text style={styles.scanIcon}>📷</Text>
            <Text style={styles.scanText}>
              {selectedGroup
                ? `Ready to scan for ${selectedGroup.name}`
                : 'Select a group to start scanning'}
            </Text>
            <TouchableOpacity
              style={[styles.scanButton, !selectedGroup && styles.scanButtonDisabled]}
              onPress={() => setScanning(true)}
              disabled={!selectedGroup}
            >
              <Text style={styles.scanButtonText}>Start Scanning</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.manualButton, !selectedGroup && styles.scanButtonDisabled]}
              onPress={() => selectedGroup && navigation.navigate('ManualCodeEntry', { projectId, group: selectedGroup })}
              disabled={!selectedGroup}
            >
              <Text style={styles.manualButtonText}>⌨️ Enter Code Manually</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              facing="back"
              onBarcodeScanned={handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
            />
            <TouchableOpacity
              style={styles.stopButton}
              onPress={() => setScanning(false)}
            >
              <Text style={styles.stopButtonText}>Stop Scanning</Text>
            </TouchableOpacity>
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
  },
  groupSection: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  registerButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#6B7280',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  groupScroll: {
    flexDirection: 'row',
  },
  groupCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minWidth: 120,
  },
  groupCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  groupColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  groupName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  groupKar: {
    fontSize: 12,
    color: '#6B7280',
  },
  successBanner: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 8,
  },
  successControl: {
    fontSize: 16,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 4,
  },
  successText: {
    fontSize: 14,
    color: '#065F46',
  },
  successPoints: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 4,
  },
  successTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  scanSection: {
    flex: 1,
    margin: 16,
  },
  scanPrompt: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scanIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  scanText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  scanButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  scanButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  manualButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  manualButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  stopButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  stopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});
