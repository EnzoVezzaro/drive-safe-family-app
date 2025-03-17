// app/settings.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { Text, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native';
import i18n from '../../i18n';
import { useTranslation } from 'react-i18next';
import * as Localization from 'expo-localization';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { useNavigation } from '@react-navigation/native';
import { signOut } from '../../lib/supabase';
import { clearAuth } from '../../store/authSlice';

const Settings = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const dispatch = useAppDispatch();
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [locationTrackingEnabled, setLocationTrackingEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('es');

  const handleSignOut = async () => {
    await signOut();
    dispatch(clearAuth());
    navigation.replace('auth');
  };

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
          <TouchableOpacity style={styles.selectContainer} onPress={() => setModalVisible(true)}>
            <Text>{selectedLanguage === 'en' ? t('settings.english') : t('settings.spanish')}</Text>
          </TouchableOpacity>
        </View>

        <Button title="Sign Out" onPress={handleSignOut} />

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
                style={[styles.button, styles.buttonClose]}
                onPress={() => {
                  i18n.changeLanguage('en');
                  setSelectedLanguage('en');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.textStyle}>{t('settings.english')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => {
                  i18n.changeLanguage('es');
                  setSelectedLanguage('es');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.textStyle}>{t('settings.spanish')}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    width: 150,
    marginVertical: 5,
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
