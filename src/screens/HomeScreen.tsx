import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, I18nManager, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import RNRestart from 'react-native-restart';
import * as Clipboard from 'expo-clipboard';
import messaging from '@react-native-firebase/messaging';
import { useNotificationStore } from '../store/notificationStore';
import { resolveAndDisplay } from '../notifications/handler';
import { persistPreferredLanguage } from '../i18n/languagePreference';

const HomeScreen = () => {
  const { t, i18n } = useTranslation();
  const logs = useNotificationStore((state) => state.logs);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === 'ios') {
          await messaging().requestPermission();
        }
        const token = await messaging().getToken();
        setFcmToken(token);
      } catch (err) {
        setTokenError(err instanceof Error ? err.message : String(err));
      }
    })();
  }, []);

  const copyToken = async () => {
    if (!fcmToken) return;
    await Clipboard.setStringAsync(fcmToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const changeLanguage = async (lng: string) => {
    await persistPreferredLanguage(lng);
    await i18n.changeLanguage(lng);
    const isRTL = lng === 'ar';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      RNRestart.Restart();
    }
  };

  const simulatePush = (type: string) => {
    let data = {};
    if (type === 'order') {
      data = {
        titleKey: 'notification.order_shipped',
        bodyKey: 'notification.order_shipped_body',
        vars: JSON.stringify({ orderId: '999', item: 'Laptop' }),
      };
    } else if (type === 'welcome') {
      data = {
        titleKey: 'notification.welcome',
        bodyKey: 'notification.welcome_body',
      };
    } else if (type === 'sale') {
      data = {
        titleKey: 'notification.flash_sale',
        bodyKey: 'notification.flash_sale_body',
        vars: JSON.stringify({ discount: '50', hours: '2' }),
      };
    }
    resolveAndDisplay({ data });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>NotifyLocale</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{i18n.language.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('ui.fcm_token')}</Text>
        {tokenError ? (
          <Text style={styles.tokenError}>{tokenError}</Text>
        ) : !fcmToken ? (
          <Text style={styles.emptyText}>{t('ui.token_loading')}</Text>
        ) : (
          <>
            <Text style={styles.tokenText} numberOfLines={3} selectable>
              {fcmToken}
            </Text>
            <TouchableOpacity style={styles.copyButton} onPress={copyToken}>
              <Text style={styles.copyButtonText}>
                {copied ? t('ui.copied') : t('ui.copy_token')}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('ui.change_language')}</Text>
        <View style={styles.row}>
          {[
            { id: 'en', label: 'EN' },
            { id: 'ar', label: 'AR' },
            { id: 'fr', label: 'FR' },
            { id: 'bn', label: 'বাংলা' },
          ].map((lang) => (
            <TouchableOpacity
              key={lang.id}
              style={[styles.button, i18n.language === lang.id && styles.activeButton]}
              onPress={() => changeLanguage(lang.id)}
            >
              <Text style={[styles.buttonText, i18n.language === lang.id && styles.activeButtonText]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('ui.test_notifications')}</Text>
        <TouchableOpacity style={styles.testButton} onPress={() => simulatePush('order')}>
          <Text style={styles.testButtonText}>{t('ui.simulate_order')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.testButton} onPress={() => simulatePush('welcome')}>
          <Text style={styles.testButtonText}>{t('ui.simulate_welcome')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.testButton} onPress={() => simulatePush('sale')}>
          <Text style={styles.testButtonText}>{t('ui.simulate_sale')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('ui.log_title')}</Text>
        {logs.length === 0 ? (
          <Text style={styles.emptyText}>{t('ui.log_empty')}</Text>
        ) : (
          logs.map((log, index) => (
            <View key={index} style={styles.logItem}>
              <View style={styles.logHeader}>
                <Text style={styles.logTitle}>{log.title}</Text>
                <Text style={styles.logMeta}>{log.locale} | {log.time}</Text>
              </View>
              <Text style={styles.logBody}>{log.body}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  badge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F0F0F0',
  },
  activeButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#333',
    fontWeight: '600',
  },
  activeButtonText: {
    color: '#FFF',
  },
  testButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  logItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  logMeta: {
    fontSize: 12,
    color: '#999',
  },
  logBody: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
  tokenText: {
    fontSize: 12,
    color: '#333',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    backgroundColor: '#F4F4F4',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  tokenError: {
    color: '#D32F2F',
    fontSize: 13,
    paddingVertical: 10,
  },
  copyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
});

export default HomeScreen;
