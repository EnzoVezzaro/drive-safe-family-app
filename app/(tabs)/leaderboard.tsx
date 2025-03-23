import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getScores } from '../../lib/supabase';
import { useAppSelector, useAuthSelector } from '../../hooks/useRedux';
import * as Violations from '../../lib/violations';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/Loading';
import { supabase } from '../../lib/supabase';
import RecentViolations from '../../components/RecentViolations';

type ViolationType = {
  count: number;
  severity_1: number;
  severity_2: number;
  severity_3: number;
  severity_4: number;
  severity_5: number;
};

type ViolationTypesCount = Record<string, ViolationType>;

type ScoreEntry = {
  user_id: string;
  email: string;
  total_violations: number;
  violation_types_count: ViolationTypesCount;
  score: number;
};

const Leaderboard = () => {
  const { t } = useTranslation();
  const [scores, setScores] = useState<any[] | null>(null);
  const [violations, setViolations] = useState<ViolationTypesCount>({});
  const [recentViolations, setRecentViolations] = useState<any[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { userId } = useAuthSelector();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    async function fetchScores() {
      setLoading(true);
      if (!userId) {
        console.error(t('leaderboard.noUserId'));
        setRefreshing(false);
        setLoading(false);
        return;
      }
      const familyScore = await getScores(userId, true);
      if (familyScore && Array.isArray(familyScore) === true) {
        setScores(familyScore);
        setViolations(familyScore[0]?.violation_types_count || {});
      }

      // Fetch recent violations
      const { data: recentViolationsData, error: recentViolationsError } = await supabase
        .from('violations')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(5);

      if (recentViolationsError) {
        console.error('Error fetching recent violations:', recentViolationsError);
      } else {
        setRecentViolations(recentViolationsData);
      }

      setRefreshing(false);
      setLoading(false);
    }

    fetchScores();
  }, [userId, t]);

  useEffect(() => {
    async function fetchScores() {
      setLoading(true);
      if (!userId) {
        console.error(t('leaderboard.noUserId'));
        setLoading(false);
        return;
      }
      const familyScore = await getScores(userId, true);
      console.log('familyScore: ', JSON.stringify(familyScore));
      if (familyScore && Array.isArray(familyScore) === true) {
        setScores(familyScore);
        setViolations(familyScore[0]?.violation_types_count || {});
      }

      if (Array.isArray(familyScore) && familyScore.length > 0) {
        setScores(familyScore);
        
        // Sumar todas las violaciones dentro del grupo
        const sumViolations = (scores: ScoreEntry[]): ViolationTypesCount => {
          return scores.reduce((acc, { violation_types_count }) => {
            Object.entries(violation_types_count).forEach(([violation, data]) => {
              if (!acc[violation]) {
                acc[violation] = { count: 0, severity_1: 0, severity_2: 0, severity_3: 0, severity_4: 0, severity_5: 0 };
              }
              acc[violation].count += data.count || 0;
              acc[violation].severity_1 += data.severity_1 || 0;
              acc[violation].severity_2 += data.severity_2 || 0;
              acc[violation].severity_3 += data.severity_3 || 0;
              acc[violation].severity_4 += data.severity_4 || 0;
              acc[violation].severity_5 += data.severity_5 || 0;
            });
            return acc;
          }, {} as ViolationTypesCount);
        };
  
        const totalViolations = sumViolations(familyScore);
        setViolations(totalViolations);
      }
      // Fetch recent violations
      const { data: recentViolationsData, error: recentViolationsError } = await supabase
        .from('violations')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(5);

      if (recentViolationsError) {
        console.error('Error fetching recent violations:', recentViolationsError);
      } else {
        setRecentViolations(recentViolationsData);
      }

      setLoading(false);
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
        {loading ? (
          <Loading />
        ) : (
          <View>
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
                    <Text style={styles.leaderboardText}>{score.email.split('@')[0]}</Text>
                    <Text style={styles.leaderboardText}>{score.total_violations} violations</Text>
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
                <Text style={styles.violationStatsTitle}>{t('leaderboard.totalViolations')}</Text>
                {violations && Object.keys(violations).length > 0 ? (
                  Object.entries(violations).map(([type, violationData]) => (
                    <View key={type} style={styles.violationItem}>
                      <Text style={styles.violationText}>{t(Violations.ViolationLabels[type as keyof typeof Violations.ViolationLabels] || type)}</Text>
                      <Text style={styles.violationValue}>{String(violationData.count)}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.leaderboardLoading}>{t('leaderboard.noViolations')}</Text>
                )}
              </View>

              {/* Recent Violations */}
              <RecentViolations violations={recentViolations} />
            </View>
          </View>
        )}
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
