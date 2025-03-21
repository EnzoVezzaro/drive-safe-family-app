import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getScores } from '../../lib/supabase';
import { useAppSelector, useAuthSelector } from '../../hooks/useRedux';
import * as Violations from '../../lib/violations';
import { useTranslation } from 'react-i18next';

const Leaderboard = () => {
  const { t } = useTranslation();
  const [scores, setScores] = useState<any[] | null>(null);
  const [violations, setViolations] = useState<any[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { userId } = useAuthSelector();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    async function fetchScores() {
      if (!userId) {
        console.error(t('leaderboard.noUserId'));
        setRefreshing(false);
        return;
      }
      const fetchedData = await getScores(userId); 
      // console.log('fetchedData: ', fetchedData);

      if (fetchedData && Array.isArray(fetchedData) === false) {
        setScores(fetchedData.scores);
        setViolations(fetchedData.violations);
      }
      setRefreshing(false);
    }

    fetchScores();
  }, [userId, t]);

  useEffect(() => {
    async function fetchScores() {
      if (!userId) {
        console.error(t('leaderboard.noUserId'));
        return;
      }
      const fetchedData = await getScores(userId);
      // console.log('fetchedData: ', fetchedData);

      if (fetchedData && Array.isArray(fetchedData) === false) {
        setScores(fetchedData.scores);
        setViolations(fetchedData.violations);
      }
    }

    fetchScores();
  }, [userId, t]);

  return (
      <ScrollView
        style={[styles.scrollContainer, { backgroundColor: '#F0F2F5' }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Gamified Dashboard Header */}
        <View style={styles.dashboardHeader}>
          <Text style={styles.dashboardTitle}>{t('leaderboard.familyChallenge')}</Text>
          <Text style={styles.dashboardSubtitle}>{t('leaderboard.trackProgress')}</Text>
        </View>

        {/* Family Leaderboard */}
        <View style={styles.leaderboardSection}>
          <Text style={styles.leaderboardTitle}>{t('leaderboard.familyLeaderboard')}</Text>
          {scores && scores.length > 0 ? (
            scores.map((score, index) => (
              <View key={index} style={styles.leaderboardItem}>
                <Text style={styles.leaderboardText}>{score.users.email.split('@')[0]}</Text>
                <Text style={styles.leaderboardText}>{score.score} pts</Text>
              </View>
            ))
          ) : (
            <Text style={styles.leaderboardLoading}>{t('leaderboard.loading')}</Text>
          )}
        </View>

          {/* Personal Driving Stats */}
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>{t('leaderboard.yourStats')}</Text>

          {/* Violations per type */}
          <View style={styles.violationStats}>
            <Text style={styles.violationStatsTitle}>{t('leaderboard.totalViolations')} {violations?.length || 0}</Text>
            {violations && violations.length > 0 ? (
              Object.entries(
                violations.reduce((acc, violation) => {
                  const type = violation.type || 'Unknown'; // Assuming each violation has a 'type' property
                  acc[type] = (acc[type] || 0) + 1;
                  return acc;
                }, {})
              ).map(([type, count]) => (
                <View key={type} style={styles.violationItem}>
                  <Text style={styles.violationText}>{t(Violations.ViolationLabels[type as keyof typeof Violations.ViolationLabels])}</Text>
                  <Text style={styles.violationValue}>{String(count)}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.leaderboardLoading}>{t('leaderboard.noViolations')}</Text>
            )}
          </View>

          {/* Recent Violations */}
          <View style={styles.recentViolations}>
            <Text style={styles.recentViolationsTitle}>{t('leaderboard.recentViolations')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
              {violations && violations.length > 0 ? (
                violations.map((violation, index) => (
                  <View key={index} style={styles.violationDetails}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
                      style={styles.violationImage}
                    />
                    <View style={styles.violationInfo}>
                      <Text style={styles.violationTitle}>{t(Violations.ViolationLabels[violation.type as keyof typeof Violations.ViolationLabels])}</Text>
                      <Text style={styles.violationDescription}>{violation.timestamp}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.leaderboardLoading}>{t('leaderboard.noViolations')}</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
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
    marginTop: 50,
  },
  dashboardHeader: {
    alignItems: 'center',
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  dashboardSubtitle: {
    marginTop: 5,
    fontSize: 16,
    color: '#666',
  },
  leaderboardSection: {
    marginTop: 24,
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
