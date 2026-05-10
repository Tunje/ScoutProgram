import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Control } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ControlDetail'>;
  route: RouteProp<RootStackParamList, 'ControlDetail'>;
};

export default function ControlDetailScreen({ navigation, route }: Props) {
  const { projectId, controlId, groupId } = route.params;
  const [control, setControl] = useState<Control | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [points, setPoints] = useState('');
  const [categoryPoints, setCategoryPoints] = useState<{ [key: string]: string }>({});
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    loadControl();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedSeconds(diff);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, startTime]);

  const loadControl = async () => {
    try {
      const controlDoc = await getDoc(doc(db, 'controls', controlId));
      if (controlDoc.exists()) {
        setControl({ id: controlDoc.id, ...controlDoc.data() } as Control);
      }
    } catch (error) {
      console.error('Error loading control:', error);
    }
  };

  const handleStartTimer = () => {
    setStartTime(new Date());
    setTimerRunning(true);
  };

  const handleStopTimer = () => {
    setTimerRunning(false);
  };

  const handleSubmit = async () => {
    if (!control) return;
    
    // Validate points don't exceed maximum
    if (control.pointsValue && control.pointsValue > 0) {
      const enteredPoints = parseInt(points) || 0;
      if (enteredPoints > control.pointsValue) {
        alert(`Points cannot exceed maximum of ${control.pointsValue}`);
        return;
      }
    }

    // Validate category points don't exceed maximum
    if (control.pointCategories && control.pointCategories.length > 0) {
      for (const category of control.pointCategories) {
        const enteredCategoryPoints = parseInt(categoryPoints[category.name]) || 0;
        if (enteredCategoryPoints > category.maxPoints) {
          alert(`${category.name} points cannot exceed maximum of ${category.maxPoints}`);
          return;
        }
      }
    }
    
    try {
      // Find the scan document for this group
      const scansQuery = query(
        collection(db, 'scans'),
        where('groupId', '==', groupId)
      );
      const scansSnapshot = await getDocs(scansQuery);
      
      if (scansSnapshot.empty) {
        console.error('No scan document found for group');
        return;
      }

      const scanDoc = scansSnapshot.docs[0];
      const scanData = scanDoc.data();
      const controls = scanData.controls || {};

      // Calculate total points
      let totalPoints = 0;
      
      // Add entered points value
      if (control.pointsValue && control.pointsValue > 0) {
        totalPoints += parseInt(points) || 0;
      }
      
      // Add category points if any
      if (control.pointCategories && control.pointCategories.length > 0) {
        totalPoints += Object.values(categoryPoints).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
      }
      
      // If no categories and no fixed points, use manual entry
      if ((!control.pointCategories || control.pointCategories.length === 0) && (!control.pointsValue || control.pointsValue === 0)) {
        totalPoints = parseInt(points) || 0;
      }

      // Update the controls object with this control's data
      controls[controlId] = {
        points: totalPoints,
        categoryPoints: control.pointCategories && control.pointCategories.length > 0 ? categoryPoints : undefined,
        timerSeconds: elapsedSeconds,
        completedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'scans', scanDoc.id), {
        controls
      });

      navigation.navigate('Scan', { projectId });
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!control) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{control.name}</Text>
        <Text style={styles.subtitle}>Control Code: {control.controlCode}</Text>
        {control.displayText && (
          <Text style={styles.displayText}>{control.displayText}</Text>
        )}
      </View>

      <View style={styles.content}>
        {control.hasTimer && (
          <View style={styles.timerSection}>
            <Text style={styles.label}>Timer:</Text>
            <Text style={styles.timerDisplay}>{formatTime(elapsedSeconds)}</Text>
            
            {!timerRunning ? (
              <TouchableOpacity style={styles.startButton} onPress={handleStartTimer}>
                <Text style={styles.buttonText}>▶ Start Timer</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.stopButton} onPress={handleStopTimer}>
                <Text style={styles.buttonText}>⏸ Stop Timer</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {control.hasPoints && (
          <View style={styles.pointsSection}>
            {control.pointsValue && control.pointsValue > 0 && (
              <View style={styles.categoryRow}>
                <Text style={styles.categoryName}>Points</Text>
                <TextInput
                  style={styles.categoryInput}
                  value={points}
                  onChangeText={setPoints}
                  placeholder="0"
                  keyboardType="numeric"
                />
                <Text style={styles.categoryMax}>/ {control.pointsValue}</Text>
              </View>
            )}

            {control.pointCategories && control.pointCategories.length > 0 && (
              <>
                <Text style={styles.label}>Points by Category:</Text>
                {control.pointCategories.map((category, index) => (
                  <View key={index} style={styles.categoryRow}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <TextInput
                      style={styles.categoryInput}
                      value={categoryPoints[category.name] || ''}
                      onChangeText={(text) => setCategoryPoints({
                        ...categoryPoints,
                        [category.name]: text
                      })}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                    <Text style={styles.categoryMax}>/ {category.maxPoints}</Text>
                  </View>
                ))}
              </>
            )}

            {(!control.pointCategories || control.pointCategories.length === 0) && control.pointsValue === 0 && (
              <>
                <Text style={styles.label}>Points Earned:</Text>
                <TextInput
                  style={styles.pointsInput}
                  value={points}
                  onChangeText={setPoints}
                  placeholder="Enter points"
                  keyboardType="numeric"
                />
              </>
            )}
          </View>
        )}

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Submit & Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Scan', { projectId })}
        >
          <Text style={styles.backButtonText}>Cancel</Text>
        </TouchableOpacity>
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
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  displayText: {
    fontSize: 16,
    color: '#1F2937',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  timerSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  startButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  pointsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  pointsInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  fixedPointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    marginBottom: 16,
  },
  fixedPointsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
  },
  fixedPointsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  categoryInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
    width: 60,
    marginRight: 8,
  },
  categoryMax: {
    fontSize: 16,
    color: '#6B7280',
    width: 40,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#6B7280',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
