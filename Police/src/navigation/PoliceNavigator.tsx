import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { PoliceStackParamList } from '../types';
import { PoliceLookupScreen } from '../screens/PoliceLookupScreen';
import { PoliceInspectionScreen } from '../screens/PoliceInspectionScreen';
import { DocumentViewScreen } from '../screens/DocumentViewScreen';
import { PoliceLoginScreen } from '../screens/PoliceLoginScreen';
import { PoliceRegisterScreen } from '../screens/PoliceRegisterScreen';
import { PolicePendingApprovalScreen } from '../screens/PolicePendingApprovalScreen';
import { PoliceForgotPasswordScreen } from '../screens/PoliceForgotPasswordScreen';
import { PoliceHomeScreen } from '../screens/PoliceHomeScreen';
import { PoliceTabNavigator } from './PoliceTabNavigator';
import { PoliceTheme } from '../theme/theme';

const Stack = createNativeStackNavigator<PoliceStackParamList>();

export const PoliceNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="PoliceLogin"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: PoliceTheme.colors.background },
        }}>
        <Stack.Screen name="PoliceLogin" component={PoliceLoginScreen} />
        <Stack.Screen name="PoliceRegister" component={PoliceRegisterScreen} />
        <Stack.Screen name="PoliceForgotPassword" component={PoliceForgotPasswordScreen} />
        <Stack.Screen name="PolicePendingApproval" component={PolicePendingApprovalScreen} />
        <Stack.Screen name="PoliceMain" component={PoliceTabNavigator} />
        <Stack.Screen name="PoliceHome" component={PoliceHomeScreen} />
        <Stack.Screen name="PoliceLookup" component={PoliceLookupScreen} />
        <Stack.Screen
          name="PoliceInspection"
          component={PoliceInspectionScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="DocumentView"
          component={DocumentViewScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default PoliceNavigator;
