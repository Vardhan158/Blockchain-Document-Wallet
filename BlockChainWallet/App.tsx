import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getInitialNotification, getMessaging, onNotificationOpenedApp, onTokenRefresh } from '@react-native-firebase/messaging';
import { RootNavigator } from './src/navigation/RootNavigator';
import { VaultTheme } from './src/theme/theme';
import { useAuthStore } from './src/store/useAuthStore';
import { listenForForegroundPushNotifications, registerDeviceForPushNotifications } from './src/services/pushNotificationService';
import { requestNotificationPermission } from './src/services/systemNotificationService';
import { openNotificationDestination } from './src/navigation/notificationNavigation';
import { tokenStorage } from './src/services/tokenStorage';
import { AppLockScreen } from './src/components/AppLockScreen';

function App() {
  const user = useAuthStore(state => state.user);
  const [isLocked, setIsLocked] = useState(false);
  const appState = useRef<string | null | undefined>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      const wasInBackground = appState.current === 'inactive' || appState.current === 'background';
      const isReturning = nextAppState === 'active' && wasInBackground;

      if (nextAppState === 'inactive' || nextAppState === 'background') {
        // PhonePe-style behaviour: protect an open wallet as soon as the
        // application leaves the foreground.
        if (user) {
          tokenStorage.lockSession();
          setIsLocked(true);
        }
      } else if (isReturning && user) {
        setIsLocked(true);
      }

      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [user]);

  useEffect(() => {
    const unsubscribeForeground = listenForForegroundPushNotifications();
    const unsubscribeTokenRefresh = onTokenRefresh(getMessaging(), () => {
      if (user) registerDeviceForPushNotifications().catch(error => console.warn('Unable to refresh FCM device token', error));
    });
    return () => {
      unsubscribeForeground();
      unsubscribeTokenRefresh();
    };
  }, [user]);

  useEffect(() => {
    const messaging = getMessaging();
    const unsubscribeNotificationOpen = onNotificationOpenedApp(messaging, openNotificationDestination);

    // Covers a tap that launched the application from a terminated state.
    getInitialNotification(messaging)
      .then(message => {
        if (message) openNotificationDestination(message);
      })
      .catch(error => console.warn('Unable to read initial notification', error));

    return unsubscribeNotificationOpen;
  }, []);

  useEffect(() => {
    if (!user) return;

    const register = async () => {
      const granted = await requestNotificationPermission();
      if (granted) await registerDeviceForPushNotifications();
    };
    register().catch(error => console.warn('Unable to register device for push notifications', error));
  }, [user]);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        {...({ backgroundColor: VaultTheme.colors.surfaceContainerLowest } as any)}
      />
      <View style={styles.container}>
        <RootNavigator />
        {isLocked && user ? <AppLockScreen onUnlocked={() => setIsLocked(false)} /> : null}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: VaultTheme.colors.background,
  },
});

export default App;
