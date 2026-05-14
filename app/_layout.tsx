import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import * as SplashScreen from 'expo-splash-screen';
import { setupChannels } from '../src/notifications/channels';
import { resolveAndDisplay } from '../src/notifications/handler';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      try {
        await setupChannels();
      } catch (e) {
        console.warn('[Notifee] setupChannels failed:', e);
      } finally {
        SplashScreen.hideAsync().catch(() => {});
      }
    })();

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      try {
        await resolveAndDisplay(remoteMessage);
      } catch (e) {
        console.warn('[FCM] foreground handler failed:', e);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </>
  );
}
