// app/profile.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const role = useSelector((state: RootState) => state.auth.role);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text variant="headlineMedium">Profile</Text>
        <Text variant="bodyLarge">User ID: {userId}</Text>
        <Text variant="bodyLarge">Role: {role}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  subtitle: {
    marginTop: 10,
    textAlign: 'center',
  },
});

export default Profile;
