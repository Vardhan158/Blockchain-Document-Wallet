import { NativeModules, Platform, PermissionsAndroid } from 'react-native';

const { LocalNotificationModule } = NativeModules;

const shownNotificationIds = new Set<string>();

export async function requestNotificationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Failed to request notification permission', err);
      return false;
    }
  }
  return true;
}

export async function triggerSystemStatusBarNotification(id: string, title: string, message: string) {
  if (shownNotificationIds.has(id)) {
    return;
  }
  shownNotificationIds.add(id);

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    return;
  }

  if (Platform.OS === 'android' && LocalNotificationModule) {
    try {
      LocalNotificationModule.showNotification(title, message);
    } catch (e) {
      console.warn('Error showing system notification:', e);
    }
  }
}
