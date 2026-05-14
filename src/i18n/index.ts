import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getDeviceLanguage } from './languagePreference';

import en from './locales/en.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import bn from './locales/bn.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  fr: { translation: fr },
  bn: { translation: bn },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
