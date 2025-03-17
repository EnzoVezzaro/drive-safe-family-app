import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getScores } from '../../lib/supabase'; // Assuming you have this function

const Leaderboard = () => {
  const [scores, setScores] = useState<any[] | null>(null);

  useEffect(() => {
    async function fetchScores() {
      const fetchedScores = await getScores();
      console.log('fetchedScores: ', fetchedScores);
      setScores(fetchedScores);
    }

    fetchScores();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Gamified Dashboard Header */}
        <View style={styles.dashboardHeader}>
          <Text style={styles.dashboardTitle}>Family Driving Challenge</Text>
          <Text style={styles.dashboardSubtitle}>Track your progress & compete!</Text>
        </View>

        {/* Family Leaderboard */}
        <View style={styles.leaderboardSection}>
          <Text style={styles.leaderboardTitle}>Family Leaderboard</Text>
          {scores && scores.length > 0 ? (
            scores.map((score, index) => (
              <View key={index} style={styles.leaderboardItem}>
                <Text style={styles.leaderboardText}>{score.users.email.split('@')[0]}</Text>
                <Text style={styles.leaderboardText}>{score.score} pts</Text>
              </View>
            ))
          ) : (
            <Text style={styles.leaderboardLoading}>Loading leaderboard...</Text>
          )}
        </View>

        {/* Personal Driving Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Your Driving Stats</Text>

          {/* Violations per 100 mile */}
          <View style={styles.violationStats}>
            <Text style={styles.violationStatsTitle}>Violations per 100 mile</Text>
            <View style={styles.violationItem}>
              <Text style={styles.violationText}>Parking</Text>
              <Text style={styles.violationValue}>11.9</Text>
            </View>
            <View style={styles.violationItem}>
              <Text style={styles.violationText}>Speed limit</Text>
              <Text style={styles.violationValue}>15.4</Text>
            </View>
            <View style={styles.violationItem}>
              <Text style={styles.violationText}>Crosswalk</Text>
              <Text style={styles.violationValue}>8.2</Text>
            </View>
          </View>

          {/* Recent Violations */}
          <View style={styles.recentViolations}>
            <Text style={styles.recentViolationsTitle}>Recent Violations</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
              <View style={styles.violationDetails}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
                  style={styles.violationImage}
                />
                <View style={styles.violationInfo}>
                  <Text style={styles.violationTitle}>Speeding</Text>
                  <Text style={styles.violationDescription}>30 mph in a 25 mph zone</Text>
                </View>
              </View>
              <View style={styles.violationDetails}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1542574271-7f3b92e6c821?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
                  style={styles.violationImage}
                />
                <View style={styles.violationInfo}>
                  <Text style={styles.violationTitle}>Parking</Text>
                  <Text style={styles.violationDescription}>Near a crosswalk</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  dashboardHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  dashboardSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  leaderboardSection: {
    marginBottom: 24,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  leaderboardText: {
    fontSize: 16,
    color: '#333',
  },
  leaderboardLoading: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  statsSection: {
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  violationStats: {
    marginBottom: 16,
  },
  violationStatsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  violationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  violationText: {
    fontSize: 16,
    color: '#333',
  },
  violationValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recentViolations: {
    marginBottom: 16,
  },
  recentViolationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  carousel: {
    flexDirection: 'row',
  },
  violationDetails: {
    flexDirection: 'column',
    width: 150,
    marginRight: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  violationImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  violationInfo: {
    flex: 1,
  },
  violationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  violationDescription: {
    fontSize: 12,
    color: '#666',
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
});

export default Leaderboard;