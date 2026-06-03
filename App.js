import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

function AppInner() {
  const { dark } = useTheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppInner />
      </ThemeProvider>
    </AuthProvider>
  );
}
