/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// This must be registered before the React tree starts. Android invokes it when
// FCM wakes a background/terminated application for a data message.
setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  console.log('Background FCM message received:', remoteMessage.messageId);
});

AppRegistry.registerComponent(appName, () => App);
