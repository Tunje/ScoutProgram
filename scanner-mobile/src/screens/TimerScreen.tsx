import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Control, Group } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Timer'>;
  route: RouteProp<RootStackParamList, 'Timer'>;
};

export default function TimerScreen({ navigation, route }: Props) {
  const { control, group, projectId } = route.params;
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(control.timerConfig!.durationMinutes * 60); // in seconds
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            Alert.alert('Time\'s Up!', 'The countdown has finished!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const handleStart = async () => {
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);

    // Save scan with timer start
    try {
      const scanData: any = {
        projectId,
        groupId: group.id,
        controlId: control.id,
        scannedBy: auth.currentUser?.uid || 'unknown',
        scannedAt: Timestamp.now(),
        timerData: {
          startTime: Timestamp.now(),
          durationMinutes: control.timerConfig!.durationMinutes
        }
      };

      if (control.hasPoints && control.pointsValue) {
        scanData.pointsAwarded = control.pointsValue;
      }

      await addDoc(collection(db, 'scans'), scanData);
    } catch (error) {
      console.error('Error saving scan:', error);
      Alert.alert('Error', 'Failed to start timer');
    }
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(control.timerConfig!.durationMinutes * 60);
    setStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    const percentage = (timeLeft / (control.timerConfig!.durationMinutes * 60)) * 100;
    if (percentage > 50) return '#10B981'; // green
    if (percentage > 25) return '#F59E0B'; // orange
    return '#EF4444'; // red
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back to Scan</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.controlName}>{control.name}</Text>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.displayText}>{control.displayText}</Text>
          {control.hasPoints && control.pointsValue && (
            <Text style={styles.points}>+{control.pointsValue} points</Text>
          )}
        </View>

        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Time Remaining</Text>
          <Text style={[styles.timerDisplay, { color: getTimeColor() }]}>
            {formatTime(timeLeft)}
          </Text>
          <Text style={styles.timerDuration}>
            of {control.timerConfig!.durationMinutes} minutes
          </Text>
        </View>

        <View style={styles.controls}>
          {!isRunning && timeLeft === control.timerConfig!.durationMinutes * 60 ? (
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startButtonText}>▶ START COUNTDOWN</Text>
            </TouchableOpacity>
          ) : (
            <>
              {isRunning ? (
                <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
                  <Text style={styles.stopButtonText}>⏸ PAUSE</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.resumeButton} onPress={() => setIsRunning(true)}>
                  <Text style={styles.resumeButtonText}>▶ RESUME</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <Text style={styles.resetButtonText}>↻ RESET</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {startTime && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ✓ Scanned at: {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Text>
            <Text style={styles.infoText}>
              Timer started: {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Text>
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
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  controlName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  displayText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  points: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  timerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timerLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  timerDisplay: {
    fontSize: 72,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  timerDuration: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  controls: {
    gap: 12,
  },
  startButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  stopButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  stopButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  resumeButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  resumeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#6B7280',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  infoText: {
    color: '#1E40AF',
    fontSize: 14,
    textAlign: 'center',
  },
});
