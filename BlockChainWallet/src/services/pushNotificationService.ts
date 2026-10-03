import { getMessaging, getToken, onMessage } from '@react-native-firebase/messaging';
import api from './api';
import { triggerSystemStatusBarNotification } from './systemNotificationService';

/** Registers the physical device's FCM token with the authenticated user. */
export async function registerDeviceForPushNotifications(): Promise<void> {
  const token = await getToken(getMessaging());
  if (!token) {
    throw new Error('Firebase did not return a device token.');
  }

  await api.post('/devices/register', { fcmToken: token });
}

/** Shows FCM pushes while the app is already in the foreground. */
export function listenForForegroundPushNotifications() {
  return onMessage(getMessaging(), async remoteMessage => {
    const dataTitle = remoteMessage.data?.title;
    const dataBody = remoteMessage.data?.body;
    const title = remoteMessage.notification?.title || (typeof dataTitle === 'string' ? dataTitle : 'Blockchain Wallet');
    const message = remoteMessage.notification?.body || (typeof dataBody === 'string' ? dataBody : '');
    await triggerSystemStatusBarNotification(
      remoteMessage.messageId || `${Date.now()}`,
      title,
      message,
    );
  });
}
