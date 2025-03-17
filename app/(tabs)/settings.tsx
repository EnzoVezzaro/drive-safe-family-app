// app/settings.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native';
import i18n from '../../i18n';
import RNPickerSelect from 'react-native-picker-select';
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const { t } = useTranslation();
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [locationTrackingEnabled, setLocationTrackingEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleNotificationToggle = () => {
    setNotificationEnabled(!notificationEnabled);
  };

  const handleLocationTrackingToggle = () => {
    setLocationTrackingEnabled(!locationTrackingEnabled);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate fetching data
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: '#F0F2F5' }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text variant="headlineMedium">{t('settings.title')}</Text>

        <View style={styles.settingItem}>
          <Text variant="bodyLarge">{t('settings.enableNotifications')}</Text>
          <Switch value={notificationEnabled} onValueChange={handleNotificationToggle} />
        </View>

        <View style={styles.settingItem}>
          <Text variant="bodyLarge">{t('settings.enableLocationTracking')}</Text>
          <Switch value={locationTrackingEnabled} onValueChange={handleLocationTrackingToggle} />
        </View>

        <View style={styles.settingItem}>
          <Text variant="bodyLarge">{t('settings.changeLanguage')}</Text>
          <RNPickerSelect
            style={{
              inputIOS: {
                fontSize: 16,
                paddingVertical: 12,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderColor: 'gray',
                borderRadius: 4,
                color: 'black',
                paddingRight: 30, // to ensure the text is never behind the icon
              },
              inputAndroid: {
                fontSize: 16,
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderWidth: 0.5,
                borderColor: 'purple',
                borderRadius: 8,
                color: 'black',
                paddingRight: 30, // to ensure the text is never behind the icon
              },
            }}
            onValueChange={(value) => {
              console.log('Language changed to:', value);
              i18n.changeLanguage(value);
            }}
            items={[
              { label: t('settings.english'), value: 'en' },
              { label: t('settings.spanish'), value: 'es' },
            ]}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
});

export default Settings;
