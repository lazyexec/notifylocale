import './src/i18n';
import messaging from '@react-native-firebase/messaging';
import { resolveAndDisplay } from './src/notifications/handler';

try {
  messaging().setBackgroundMessageHandler(resolveAndDisplay);
} catch (e) {
  console.warn('[FCM] setBackgroundMessageHandler failed:', e);
}

require('expo-router/entry');
