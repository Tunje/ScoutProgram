import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types';
import LoginScreen from './src/screens/LoginScreen';
import GroupRegistrationScreen from './src/screens/GroupRegistrationScreen';
import ScanScreen from './src/screens/ScanScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="GroupRegistration" 
          component={GroupRegistrationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Scan" 
          component={ScanScreen}
          options={{ title: 'Scan Controls' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
