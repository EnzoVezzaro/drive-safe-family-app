// app/profile.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Linking, Platform, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase, getScores } from '../../lib/supabase';
import * as Violations from '../../lib/violations';
import { useTranslation } from 'react-i18next';
import Loading from '../../components/Loading';
import RecentViolations from '../../components/RecentViolations';

interface ViolationPercentage {
  type: string;
  percentage: number;
}

const Profile = () => {
  const { t } = useTranslation();
  const userId = useSelector((state: RootState) => state.auth.userId);
  const role = useSelector((state: RootState) => state.auth.role);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [violationData, setViolationData] = useState<ViolationPercentage[] | null>(null);
  const [violations, setViolations] = useState<any[] | null>(null);
  const [totalViolations, setTotalViolations] = useState<number>(0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchViolationData().then(() => setRefreshing(false));
  }, [t]);

  useEffect(() => {
    fetchViolationData();
  }, [t, userId]);

  const fetchViolationData = async () => {
    setLoading(true);
    try {
      if (!userId) {
        console.error('No user ID provided');
        setLoading(false);
        return;
      }
      const data: any = await getScores(userId, false);
      
      if (!data) {
        console.error(t('profile.fetchError'));
        setLoading(false);
        return;
      }

      // Process the data from get_scores
      const processedData = data[0]; // Assuming only one user's data is returned
      const violationCounts = processedData.violation_types_count;
      let totalViolations = 0;
      for (const type in violationCounts) {
        totalViolations += violationCounts[type].count;
      }

      setTotalViolations(totalViolations);
    
      const violationPercentages = Object.entries(processedData.violation_types_count).map(([type, violationData]: [string, any]) => {
        const percentage = (violationData.count / totalViolations) * 100;
        return { type: type, percentage: percentage };
      });
    
      // console.log('violationPercentages: ', violationPercentages);
      setViolationData(violationPercentages);

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const { data: recentViolationsData, error: recentViolationsError } = await supabase
        .from('violations')
        .select('*')
        .eq('user_id', userId)
        .limit(5)
        .order('timestamp', { ascending: false });
  
      if (recentViolationsError) {
        console.error('Error fetching recentViolations:', recentViolationsError);
      } else {
        // console.log('recent: ', recentViolationsData);
        setViolations(recentViolationsData);
      }
    } catch (error) {
      console.error(t('profile.fetchError'), error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: '#F0F2F5' }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.contentContainer}>
          {loading ? (
            <Loading />
          ) : (
            <>
              {/* Main Title */}
              <Text style={styles.mainTitle}>{t('profile.trafficViolations')}</Text>

              {/* Violations per 100 mile section */}
              <Text style={styles.sectionTitle}>{t('profile.totalViolations')} {totalViolations}</Text>

              {/* Display violations */}
              {violationData && violationData.map((violation, index) => (
                <View key={index} style={styles.violationItem}>
                  <View style={styles.violationHeader}>
                    <Text style={styles.violationType}>{t(Violations.ViolationLabels[violation.type as keyof typeof Violations.ViolationLabels])}</Text>
                    <Text style={styles.violationCount}>{violation.percentage.toFixed(1)}%</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          backgroundColor: Violations.ViolationColors(violation.type),
                          width: `${violation.percentage}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}

              {/* Traffic violations section */}
              <RecentViolations violations={violations} />

              {/* Personal recommendations */}
              <Text style={styles.mainTitle}>{t('profile.recommendations')}</Text>

              {/* Speed limit recommendation */}
              <View style={styles.recommendationItem}>
                <View style={[styles.recommendationIcon, { backgroundColor: '#3F51B5' }]}>
                  <MaterialCommunityIcons name="speedometer" size={24} color="white" />
                </View>
                <Text style={styles.recommendationText}>
                  {t('profile.speedLimitRecommendation')}
                </Text>
              </View>

              {/* Crosswalk recommendation */}
              <View style={styles.recommendationItem}>
                <View style={[styles.recommendationIcon, { backgroundColor: '#4DB6AC' }]}>
                  <MaterialCommunityIcons name="walk" size={24} color="white" />
                </View>
                <Text style={styles.recommendationText}>
                  {t('profile.crosswalkRecommendation')}
                </Text>
              </View>

              {/* User info kept from original code but hidden */}
              <View style={styles.hiddenUserInfo}>
                <Text>User ID: {userId}</Text>
                <Text>Role: {role}</Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    marginTop: Platform.OS === 'android' ? 20 : 0,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#566573',
    marginBottom: 16,
  },
  violationItem: {
    marginBottom: 16,
  },
  violationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  violationType: {
    fontSize: 16,
    color: '#566573',
  },
  violationCount: {
    fontSize: 16,
    color: '#566573',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7E9',
    borderRadius: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  seeAllLink: {
    color: '#3498DB',
    fontSize: 14,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#566573',
    flex: 1,
  },
  hiddenUserInfo: {
    display: 'none', // Hide this but keep the data for Redux state
  },
});

export default Profile;
