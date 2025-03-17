import { Tabs, useRouter } from 'expo-router';
import { Car, Home, Medal, Settings, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import SensorDataCollector from '../../components/SensorDataCollector';
import { useAppSelector } from '../../hooks/useRedux';
import { useEffect, useState } from 'react';

export default function TabLayout() {
  const { t } = useTranslation();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoggedIn) {
      router.replace('/auth');
    }
  }, [isLoggedIn, isMounted]);

  return (
    <>
      {isLoggedIn && <SensorDataCollector />}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#007AFF',
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: t('tabs.home'),
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="drive"
          options={{
            title: t('tabs.drive'),
            tabBarIcon: ({ color, size }) => <Car size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="leaderboard"
          options={{
            title: t('tabs.leaderboard'),
            tabBarIcon: ({ color, size }) => <Medal size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('tabs.profile'),
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t('tabs.settings'),
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
