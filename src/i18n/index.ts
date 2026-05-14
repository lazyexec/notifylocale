import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

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

let languageCode = 'en';
try {
  const locales = RNLocalize.getLocales();
  languageCode = locales[0]?.languageCode || 'en';
} catch (e) {
  console.warn('[i18n] getLocales failed, falling back to en:', e);
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: languageCode,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
