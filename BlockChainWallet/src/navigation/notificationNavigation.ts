import { createNavigationContainerRef } from '@react-navigation/native';
import type { RemoteMessage } from '@react-native-firebase/messaging';
import type { RootStackParamList } from '../types/navigation';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

let pendingMessage: RemoteMessage | null = null;

/** Routes a notification tap to the screen associated with its server payload. */
export function openNotificationDestination(message: RemoteMessage): void {
  if (!navigationRef.isReady() || !navigationRef.getRootState()?.routeNames.includes('Main')) {
    pendingMessage = message;
    return;
  }

  const documentId = message.data?.documentId;
  const type = message.data?.type;
  const rootNavigation = navigationRef as any;

  if (typeof documentId === 'string' && documentId) {
    navigationRef.navigate('DocumentDetails', { documentId });
    return;
  }

  if (type === 'ACCOUNT_UPDATE' || type === 'SECURITY_ALERT') {
    rootNavigation.navigate('Main', { screen: 'Profile' });
    return;
  }

  rootNavigation.navigate('Main', { screen: 'Notifications' });
}

/** Called after NavigationContainer mounts to process a notification tap from cold start. */
export function openPendingNotificationDestination(): void {
  if (!pendingMessage) return;
  const message = pendingMessage;
  pendingMessage = null;
  openNotificationDestination(message);
}
