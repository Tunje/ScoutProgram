import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types';
import LoginScreen from './src/screens/LoginScreen';
import ProjectSelectScreen from './src/screens/ProjectSelectScreen';
import GroupRegistrationScreen from './src/screens/GroupRegistrationScreen';
import ScanScreen from './src/screens/ScanScreen';
import ManualCodeEntry from './src/screens/ManualCodeEntry';
import TimerScreen from './src/screens/TimerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ProjectSelect" component={ProjectSelectScreen} />
        <Stack.Screen name="GroupRegistration" component={GroupRegistrationScreen} />
        <Stack.Screen name="Scan" component={ScanScreen} />
        <Stack.Screen name="ManualCodeEntry" component={ManualCodeEntry} />
        <Stack.Screen name="Timer" component={TimerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
