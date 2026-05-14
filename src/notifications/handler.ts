import i18n from '../i18n';
import { displayNotification } from './channels';
import { useNotificationStore } from '../store/notificationStore';

export async function resolveAndDisplay(remoteMessage: any) {
  console.log('Received remote message:', remoteMessage);
  
  const { titleKey, bodyKey, vars } = remoteMessage.data || {};
  
  if (!titleKey || !bodyKey) {
    console.warn('Missing titleKey or bodyKey in message data');
    return;
  }

  const parsed = vars ? JSON.parse(vars) : {};

  const title = i18n.t(titleKey, parsed) as string;
  const body = i18n.t(bodyKey, parsed) as string;

  useNotificationStore.getState().addLog({
    title,
    body,
    locale: i18n.language,
  });

  await displayNotification({ title, body });
}
