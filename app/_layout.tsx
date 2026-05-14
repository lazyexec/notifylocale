import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { setupChannels } from '../src/notifications/channels';
import { resolveAndDisplay } from '../src/notifications/handler';
import 'react-native-reanimated';

export default function RootLayout() {
  useEffect(() => {
    setupChannels();
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      await resolveAndDisplay(remoteMessage);
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
