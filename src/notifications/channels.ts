import notifee, { AndroidImportance } from '@notifee/react-native';

export async function setupChannels() {
  await notifee.requestPermission();
  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });
}

export async function displayNotification({ title, body }: { title: string; body: string }) {
  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId: 'default',
      importance: AndroidImportance.HIGH,
      pressAction: {
        id: 'default',
      },
    },
  });
}
