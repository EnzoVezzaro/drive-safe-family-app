import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserRank, getDrivingStats } from '../../lib/supabase';
import { ScrollView } from 'react-native';

export default function HomeScreen() {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const drivingScore = useSelector((state: RootState) => state.driving.drivingScore);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [drivingStats, setDrivingStats] = useState<{ totalTrips: number; mileage: number; timeDriven: number } | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      if (userId) {
        const rank = await getUserRank(userId);
        setUserRank(rank);

        const stats = await getDrivingStats(userId);
        setDrivingStats(stats);
      }
    }

    fetchUserData();
  }, [userId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/women/1.jpg' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text variant="titleLarge">{userId}</Text>
            <Text variant="bodyMedium">Verified Account</Text>
          </View>
          <Text variant="titleMedium" style={styles.rank}>Rank #{userRank !== null ? userRank : 'N/A'}</Text>
        </View>

        {/* Safe Driving Score */}
        <Card style={styles.scoreCard}>
          <Card.Content>
            <Text variant="displayMedium" style={styles.score}>{drivingScore}</Text>
            <Text variant="titleMedium" style={styles.scoreLabel}>Safe Driving Score</Text>
          </Card.Content>
        </Card>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text variant="titleLarge">{drivingStats?.totalTrips || 0}</Text>
            <Text variant="bodyMedium">Total Trips</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleLarge">{drivingStats?.mileage || 0}</Text>
            <Text variant="bodyMedium">Mileage</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="titleLarge">{drivingStats?.timeDriven || 0}</Text>
            <Text variant="bodyMedium">Time Driven</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  profileInfo: {
    flex: 1,
  },
  rank: {
    fontWeight: 'bold',
  },
  scoreCard: {
    marginBottom: 20,
  },
  score: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  scoreLabel: {
    textAlign: 'center',
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
});
