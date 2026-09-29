import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PoliceNavigator } from './src/navigation/PoliceNavigator';
import { PoliceTheme } from './src/theme/theme';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <PoliceNavigator />
    </SafeAreaProvider>
  );
}

export default App;
