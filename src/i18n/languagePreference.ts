import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';

const LANGUAGE_KEY = '@notifylocale:selected_language';
const SUPPORTED_LANGUAGES = ['en', 'ar', 'fr', 'bn'] as const;

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const isSupportedLanguage = (value: string): value is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
};

export const getDeviceLanguage = (): SupportedLanguage => {
  try {
    const locales = RNLocalize.getLocales();
    const code = locales[0]?.languageCode ?? 'en';
    return isSupportedLanguage(code) ? code : 'en';
  } catch (e) {
    console.warn('[i18n] getLocales failed, falling back to en:', e);
    return 'en';
  }
};

export const loadPreferredLanguage = async (): Promise<SupportedLanguage> => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (saved && isSupportedLanguage(saved)) {
      return saved;
    }
  } catch (e) {
    console.warn('[i18n] loadPreferredLanguage failed:', e);
  }

  return getDeviceLanguage();
};

export const persistPreferredLanguage = async (lng: string): Promise<void> => {
  if (!isSupportedLanguage(lng)) {
    return;
  }
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lng);
  } catch (e) {
    console.warn('[i18n] persistPreferredLanguage failed:', e);
  }
};

type I18nLike = {
  language: string;
  changeLanguage: (lng: string) => Promise<unknown>;
};

export const applyPreferredLanguage = async (i18n: I18nLike): Promise<void> => {
  const preferred = await loadPreferredLanguage();
  if (i18n.language !== preferred) {
    await i18n.changeLanguage(preferred);
  }
};
