// app/settings.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal, Platform, Linking, Alert } from 'react-native';
import { Text, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Pressable } from 'react-native';
import i18n from '../../i18n';
import { useTranslation } from 'react-i18next';
import * as Localization from 'expo-localization';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { useNavigation } from '@react-navigation/native';
import { signOut } from '../../lib/supabase';
import { clearAuth } from '../../store/authSlice';
import { updateLocation, updateLocationTracking } from '../../store/drivingSlice';
import * as Location from 'expo-location';
import { sendDriverData } from '@/api/trafficApi';
import { BACKGROUND_FETCH_TASK } from '@/backgroundTasks';

const Settings = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const userId = useAppSelector((state) => state.auth.userId);
  const dispatch = useAppDispatch();
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const locationTrackingEnabled = useAppSelector((state) => state.driving.locationTrackingEnabled);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('es');

  useEffect(() => {
    if (!isLoggedIn) {
      navigation.navigate('auth');
    }
  }, [isLoggedIn, navigation]);

  if (!isLoggedIn) {
    return null;
  }

  const handleNotificationToggle = () => {
    setNotificationEnabled(!notificationEnabled);
  };

  const handleSignOut = async () => {
    locationTrackingEnabled && await handleLocationTrackingToggle();
    await signOut();
    await dispatch(clearAuth()); 
    navigation.replace('auth');
  };

  const handleLocationTrackingToggle = async () => {
    const requestForegroundPermissions = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return false;
      }
      return true;
    };

    const requestBackgroundPermissions = async () => {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      return status === 'granted';
    };

    const getLocationData = async () => {
      const location = await Location.getCurrentPositionAsync({});
      return {
        speed: location.coords.speed || 0,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString(),
      };
    };

    const sendTrackingData = async (activity: string) => {
      const locationData = await getLocationData();
      const driverData = {
        ...locationData,
        user_id: userId,
        activity,
      };
      console.log('seding data: ', driverData);
      sendDriverData(driverData);
    };

    const showAppSettingsAlert = () => {
      const openAppSettings = () => Linking.openURL('app-settings:');
      Alert.alert(
        'Allow DriveSafe to Use your Location',
        'Open your app settings to allow DriveSafe to access your current position. Without it, you won’t be able to use the love compass',
        [
          { text: 'Cancel', onPress: () => console.warn('Cancel pressed') },
          { text: 'Open settings', onPress: openAppSettings },
        ]
      );
    };

    if (!locationTrackingEnabled) {
      const foregroundPermissionGranted = await requestForegroundPermissions();
      if (foregroundPermissionGranted) {
        await sendTrackingData('TRACKING_ON');
        dispatch(updateLocationTracking(true));
        const backgroundPermissionGranted = await requestBackgroundPermissions();
        if (!backgroundPermissionGranted) {
          console.warn('Background permission not granted');
        }
      } else {
        showAppSettingsAlert();
      }
    } else {
      const foregroundPermissionGranted = await requestForegroundPermissions();
      if (foregroundPermissionGranted) {
        await sendTrackingData('TRACKING_OFF')
      } else {
        const driverData = {
          speed: 0,
          latitude: 0,
          longitude: 0,
          timestamp: new Date().toISOString(),
          user_id: userId,
          activity: 'TRACKING_OFF',
        };
        sendDriverData(driverData);
      }
      dispatch(updateLocationTracking(false));
    }
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
        <Text style={styles.mainTitle}>{t('settings.title')}</Text>

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
          <TouchableOpacity style={styles.selectContainer} onPress={() => setModalVisible(true)}>
            <Text>{selectedLanguage === 'en' ? t('settings.english') : t('settings.spanish')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingLogout}>
          <TouchableOpacity onPress={handleSignOut} style={styles.button}>
            <Text style={styles.text}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <TouchableOpacity
                style={styles.modalOptionButton}
                onPress={() => {
                  i18n.changeLanguage('en');
                  setSelectedLanguage('en');
                  setModalVisible(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText, 
                  selectedLanguage === 'en' && styles.modalOptionTextSelected
                ]}>
                  {t('settings.english')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOptionButton}
                onPress={() => {
                  i18n.changeLanguage('es');
                  setSelectedLanguage('es');
                  setModalVisible(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText, 
                  selectedLanguage === 'es' && styles.modalOptionTextSelected
                ]}>
                  {t('settings.spanish')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? 20 : 0,
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
  selectContainer: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  modalView: {
    backgroundColor: "#E5E5E5", // Light gray background
    borderRadius: 16, // More rounded corners
    width: '80%', // Maintain existing width
    overflow: 'hidden', // Ensure rounded corners are respected
  },
  modalOptionButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)', // Light separator
  },
  modalOptionText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#000000',
  },
  modalOptionTextSelected: {
    color: '#007AFF', // Blue color for selected option
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FF3B30', // Nice red shade
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
    alignItems: 'center',
  },
  text: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingLogout: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});

export default Settings;
