// app/settings.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const Settings = () => {
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
        <Text variant="headlineMedium">Settings</Text>

        <View style={styles.settingItem}>
          <Text variant="bodyLarge">Enable Notifications</Text>
          <Switch value={notificationEnabled} onValueChange={handleNotificationToggle} />
        </View>

        <View style={styles.settingItem}>
          <Text variant="bodyLarge">Enable Location Tracking</Text>
          <Switch value={locationTrackingEnabled} onValueChange={handleLocationTrackingToggle} />
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
