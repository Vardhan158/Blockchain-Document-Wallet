import React, { useEffect, useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { SplashScreen } from '../screens/SplashScreen';
import { AuthNavigator } from './AuthNavigator';
import { SecureMainNavigator } from './SecureMainNavigator';
import { DocumentDetailsScreen } from '../screens/DocumentDetailsScreen';
import { UserIdScreen } from '../screens/UserIdScreen';
import { useAuthStore } from '../store/useAuthStore';
import { VaultTheme } from '../theme/theme';
import { navigationRef, openPendingNotificationDestination } from './notificationNavigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const token = useAuthStore(state => state.token);
  const hasAuthenticatedInThisSession = useRef(false);

  useEffect(() => {
    if (token) {
      hasAuthenticatedInThisSession.current = true;
      openPendingNotificationDestination();
      return;
    }

    // Keep Splash in charge of the first route, but send an already-open
    // wallet back to Sign In when the user explicitly signs out.
    if (hasAuthenticatedInThisSession.current && navigationRef.isReady()) {
      navigationRef.reset({ index: 0, routes: [{ name: 'Auth' }] });
    }
  }, [token]);

  return (
    <NavigationContainer ref={navigationRef} onReady={openPendingNotificationDestination}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: VaultTheme.colors.background },
        }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        {/* These routes must always be registered. Splash authenticates first
            and then replaces itself with one of them. Conditional route
            registration can make `replace('Main')` run before Main exists. */}
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={SecureMainNavigator} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

