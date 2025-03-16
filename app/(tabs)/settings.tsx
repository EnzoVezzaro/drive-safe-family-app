// app/settings.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const Settings = () => {
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [locationTrackingEnabled, setLocationTrackingEnabled] = useState(true);

  const handleNotificationToggle = () => {
    setNotificationEnabled(!notificationEnabled);
  };

  const handleLocationTrackingToggle = () => {
    setLocationTrackingEnabled(!locationTrackingEnabled);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text variant="headlineMedium">Settings</Text>

        <View style={styles.settingItem}>
          <Text variant="bodyLarge">Enable Notifications</Text>
          <Switch value={notificationEnabled} onValueChange={handleNotificationToggle} />
        </View>

        <View style={styles.settingItem}>
          <Text variant="bodyLarge">Enable Location Tracking</Text>
          <Switch value={locationTrackingEnabled} onValueChange={handleLocationTrackingToggle} />
        </View>
      </View>
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
