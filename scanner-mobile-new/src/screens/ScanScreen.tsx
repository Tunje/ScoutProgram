import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Scan'>;
  route: RouteProp<RootStackParamList, 'Scan'>;
};

export default function ScanScreen({ navigation, route }: Props) {
  const { projectId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Screen</Text>
      <Text style={styles.text}>Project: {projectId}</Text>
      <Text style={styles.text}>Camera scanning will be implemented here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
});
