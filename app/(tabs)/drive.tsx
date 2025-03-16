// app/drive.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { SafeAreaView } from 'react-native-safe-area-context';

const Drive = () => {
  const speed = useSelector((state: RootState) => state.driving.speed);
  const acceleration = useSelector((state: RootState) => state.driving.acceleration);
  const violations = useSelector((state: RootState) => state.driving.violations);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text variant="headlineMedium">Drive Screen</Text>
        <Text variant="bodyLarge">Current Speed: {speed}</Text>
        <Text variant="bodyLarge">Acceleration: {acceleration}</Text>
        <Text variant="bodyLarge">Violations: {violations.join(', ')}</Text>
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

export default Drive;
