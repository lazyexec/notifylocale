import './src/i18n'; // MUST BE FIRST
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import messaging from '@react-native-firebase/messaging';
import { resolveAndDisplay } from './src/notifications/handler';
import { setupChannels } from './src/notifications/channels';
import React, { useEffect } from 'react';

// Background message handler
messaging().setBackgroundMessageHandler(resolveAndDisplay);

function AppFake() {
  useEffect(() => {
    setupChannels();
  }, []);
  return null;
}

function HeadlessCheck(props) {
  if (props.isHeadless) {
    return <AppFake />;
  }
  
  // Expo Router entry logic
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(HeadlessCheck);
