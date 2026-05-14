import i18n from '../i18n';
import { displayNotification } from './channels';
import { useNotificationStore } from '../store/notificationStore';
import { applyPreferredLanguage } from '../i18n/languagePreference';

export async function resolveAndDisplay(remoteMessage: any) {
  console.log('Received remote message:', remoteMessage);
  
  const { titleKey, bodyKey, vars } = remoteMessage.data || {};
  
  if (!titleKey || !bodyKey) {
    console.warn('Missing titleKey or bodyKey in message data');
    return;
  }

  await applyPreferredLanguage(i18n);

  let parsed = {};
  try {
    parsed = vars ? JSON.parse(vars) : {};
  } catch (e) {
    console.warn('Failed to parse notification vars JSON:', e);
  }

  const title = i18n.t(titleKey, parsed) as string;
  const body = i18n.t(bodyKey, parsed) as string;

  useNotificationStore.getState().addLog({
    title,
    body,
    locale: i18n.language,
  });

  await displayNotification({ title, body });
}
