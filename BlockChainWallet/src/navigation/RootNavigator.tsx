import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { SplashScreen } from '../screens/SplashScreen';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { DocumentDetailsScreen } from '../screens/DocumentDetailsScreen';
import { UserIdScreen } from '../screens/UserIdScreen';
import { useAuthStore } from '../store/useAuthStore';
import { VaultTheme } from '../theme/theme';
import { navigationRef, openPendingNotificationDestination } from './notificationNavigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    if (token) openPendingNotificationDestination();
  }, [token]);

  return (
    <NavigationContainer ref={navigationRef} onReady={openPendingNotificationDestination}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: VaultTheme.colors.background },
        }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        {token ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="DocumentDetails"
              component={DocumentDetailsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="UserId"
              component={UserIdScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

