import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAuthSelector } from '../../hooks/useRedux';
import * as Violations from '../../lib/violations';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getScores } from '@/lib/supabase';
import Loading from '../../components/Loading';
import { supabase } from '../../lib/supabase';
import Svg, { Circle, G, LinearGradient, Defs, Stop } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

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

interface CircularProgressProps {
  score: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ score }) => {
  // Calculate percentage based on max value of 3000
  const maxScore = 3000;
  // Ensure score is a valid number between 0-maxScore
  const validScore = Math.min(Math.max(0, score || 0), maxScore);
  // Calculate percentage
  const percentage = Math.round((validScore / maxScore) * 100);

  const radius = 45;
  const strokeWidth = 10;
  const size = 120;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate the stroke dashoffset to fill the circle based on the percentage
  // Subtract from circumference to start from the top and go clockwise
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.circularProgressContainer}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#ef4444" />
            <Stop offset="0.5" stopColor="#8b5cf6" />
            <Stop offset="1" stopColor="#3b82f6" />
          </LinearGradient>
        </Defs>
        {/* Background Circle (inactive portion) */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="#e6e6e6"
          fill="transparent"
        />
        {/* Foreground Circle (the progress) with gradient */}
        <G rotation={-90} origin={`${center}, ${center}`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            stroke="url(#progressGradient)"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </G>
      </Svg>
      <View style={styles.progressTextContainer}>
        <Text style={styles.progressPercentage}>{percentage}%</Text>
        <Text style={styles.progressLabel}>Current Level</Text>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const email = useSelector((state: RootState) => state.auth.email);
  const { userId } = useAuthSelector();
  const [scores, setScores] = useState<any[] | null>(null);
  const [violations, setViolations] = useState<ViolationTypesCount>({});
  const [chartData, setChatData] = useState<any | null>(null);
  const [formattedChartData, setFormattedChartData] = useState<any | null>(null);

  const [recentViolations, setRecentViolations] = useState<any[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [violationChartData, setViolationChartData] = useState<any>(null);

  const getData = async () => {
    setLoading(true);
    if (!userId) {
      console.error(t('leaderboard.noUserId'));
      setLoading(false);
      return;
    }
    const myScore = await getScores(userId);
    if (myScore && Array.isArray(myScore) === true) {
      setScores(myScore);
      setViolations(myScore[0]?.violation_types_count || {});

      // Extract chart data
      const chartData = myScore.map((score: any) => {
        // Ensure the timestamp is valid or fallback to a default value (e.g., current timestamp)
        const timestamp = score.timestamp ? new Date(score.timestamp).getTime() : Date.now();

        // Create an object with severity counts for each violation type
        const severityData = Object.keys(score.violation_types_count).map((violationType) => {
          const violation = score.violation_types_count[violationType];
          return {
            violationType,
            severity_1: violation.severity_1,
            severity_2: violation.severity_2,
            severity_3: violation.severity_3,
            severity_4: violation.severity_4,
            severity_5: violation.severity_5,
          };
        });

        return {
          timestamp, // Use timestamp as a valid number
          severityData, // All severity data for each violation type
        };
      });

      setChatData(chartData);
      const formattedData = chartData.map(v => {
        const totalSeverity = v.severityData.reduce((acc, violation) => {
          const severityValue = violation && typeof violation.severity_1 === 'number' ? violation.severity_1 : 0;
          return acc + severityValue;
        }, 0);
        return {
          x: new Date(v.timestamp).toLocaleString(),
          y: totalSeverity,
        };
      });
      // console.log('formattedData: ', JSON.stringify(formattedData));

      setFormattedChartData(formattedData);
    }

    // Fetch recent violations
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { data: recentViolationsData, error: recentViolationsError } = await supabase
      .from('violations')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', sevenDaysAgo.toISOString())
      .order('timestamp', { ascending: true });

    if (recentViolationsError) {
      console.error('Error fetching recentViolations:', recentViolationsError);
    } else {
      setRecentViolations(recentViolationsData);
      // Process recent violations to create chart data
      if (recentViolationsData) {
        const processedData = processViolationsForChart(recentViolationsData);
        setViolationChartData(processedData);
      }
    }

    setLoading(false);
  }

  const processViolationsForChart = (violations: any[]) => {
    const violationCounts: { [date: string]: { [type: string]: number } } = {};
    const labels: string[] = [];
    const today = new Date();
    const dayNames = [t('dayNames.sun'), t('dayNames.mon'), t('dayNames.tue'), t('dayNames.wed'), t('dayNames.thu'), t('dayNames.fri'), t('dayNames.sat')];

    // Generate labels for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(dayNames[date.getDay()].charAt(0));
    }

    // Process violations to count by date and type
    violations.forEach((violation: any) => {
      const date = new Date(violation.timestamp).toLocaleDateString();
      if (!violationCounts[date]) {
        violationCounts[date] = {};
      }
      if (!violationCounts[date][violation.type]) {
        violationCounts[date][violation.type] = 0;
      }
      violationCounts[date][violation.type]++;
    });

    const datasets = Object.keys(
      violations.reduce((types: any, v: any) => {
        types[v.type] = true;
        return types;
      }, {})
    ).map(type => {
      const data = labels.map((label, index) => {
        let day = new Date(today);
        day.setDate(today.getDate() - (6 - index));
        const violationDate = day.toLocaleDateString();
        return violationCounts[violationDate]?.[type] || 0;
      });

      let color = (opacity = 1) => `rgba(128, 128, 128, ${opacity})`; // Gray
      switch (type) {
        case 'SPEEDING': color = (opacity = 1) => `rgba(255, 0, 0, ${opacity})`; break;
        case 'GEOFENCE_VIOLATION': color = (opacity = 1) => `rgba(0, 255, 0, ${opacity})`; break;
        case 'HARD_ACCELERATION': color = (opacity = 1) => `rgba(0, 0, 255, ${opacity})`; break;
        case 'HARD_BRAKING': color = (opacity = 1) => `rgba(255, 255, 0, ${opacity})`; break;
      }
      return {
        data,
        label: type,
        color,
        strokeWidth: 2,
      };
    });

    return {
      labels,
      datasets,
    };
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    async function fetchScores() {
      await getData();
      setRefreshing(false);
    }

    fetchScores();
  }, [userId, t]);

  useEffect(() => {
    async function fetchScores() {
      getData()
    }

    fetchScores();
  }, [userId, t]);

  const chartData1 = formattedChartData ? formattedChartData.map((v: any) => v.y) : [];
  const chartData2 = formattedChartData ? formattedChartData.map((v: any) => v.y / 2) : [];

  const data = {
    labels: formattedChartData ? formattedChartData.map((v: any) => v.x) : [],
    datasets: [
      {
        data: chartData1,
        color: (opacity = 1) => `rgba(138, 86, 206, ${opacity})`, // purple
        strokeWidth: 2,
      },
      {
        data: chartData2,
        color: (opacity = 1) => `rgba(86, 172, 206, ${opacity})`, // blue
        strokeWidth: 2,
      },
    ],
  };

  // console.log('recent viol: ', recentViolations);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: '#F0F2F5' }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} style={{backgroundColor: '#F0F2F5'}} />
        }
      >
        {loading ? (
          <Loading />
        ) : (
          <View>
            {/* Profile Section */}
            <View style={styles.headerCard}>
              <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <MaterialCommunityIcons name="account" size={36} color="white" />
                  </View>
                  {/**
                   * TODO: premium users
                   * <View style={styles.starBadge}>
                    <Text style={styles.starText}>★</Text>
                  </View>
                   */}
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {t('home.hi')} {email}
                  </Text>
                  <Text style={styles.userSubtext}>{t('home.glad')}</Text>
                </View>
              </View>
            </View>

            {/* Start a new route */}
            <TouchableOpacity
              style={styles.startRouteButton}
              onPress={() => navigation.navigate('leaderboard')}
            >
              <Text style={styles.startRouteText}>{t('home.familyDashboard')}</Text>
            </TouchableOpacity>

            {/* Driving Skill Score */}
            <View style={styles.skillCard}>
              <Text style={styles.sectionTitle}>{t('home.averageSkill')}</Text>

              <View style={styles.circularProgressWrapper}>
                {scores && scores.length > 0 ? (
                  <CircularProgress score={scores[0].score} />
                ) : (
                  <CircularProgress score={0} />
                )}
              </View>

              {/* Driving Stats */}
              <View style={styles.drivingStatsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>
                    {t('home.high')}{' '}
                    <Text style={styles.statValueHigh}>
                      {scores && scores.length > 0 && scores[0].violation_types_count ? (
                        scores[0].violation_types_count.SPEEDING?.severity_5 || 0
                      ) : (
                        0
                      )}
                    </Text>
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>
                    {t('home.medium')}{' '}
                    <Text style={styles.statValueMedium}>
                      {scores && scores.length > 0 && scores[0].violation_types_count ? (
                        scores[0].violation_types_count.SPEEDING?.severity_3 || 0
                      ) : (
                        0
                      )}
                    </Text>
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>
                    {t('home.low')}{' '}
                    <Text style={styles.statValueLow}>
                      {scores && scores.length > 0 && scores[0].violation_types_count ? (
                        scores[0].violation_types_count.SPEEDING?.severity_1 || 0
                      ) : (
                        0
                      )}
                    </Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Progress Chart */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>{t('home.progress')}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('profile')}>
                  <Text style={styles.seeDetailsText}>{t('home.seeDetails')}</Text>
                </TouchableOpacity>
              </View>
              <View>
                {violationChartData && violationChartData.datasets && violationChartData.datasets.length > 0 ? (
                  <BarChart
                    data={{
                      labels: violationChartData.labels,
                      datasets: violationChartData.datasets,
                    }}
                    width={screenWidth - 80}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                      backgroundColor: "#FFF",
                      backgroundGradientFrom: "#FFF",
                      backgroundGradientTo: "#FFF",
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      style: {
                        borderRadius: 16
                      },
                      barPercentage: 0.8,
                      propsForBackgroundLines: {
                        color: 'gray',
                      },
                    }}
                    style={{
                      borderRadius: 16
                    }}
                  />
                ) : (
                  <Text style={{ color: 'white', textAlign: 'center' }}>No violation data available</Text>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    marginTop: Platform.OS === 'android' ? 50 : 0,
  },
  scrollView: {
    flex: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerCard: {
    backgroundColor: '#343b6e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A5297',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#9370DB',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starText: {
    color: 'white',
    fontSize: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userSubtext: {
    color: '#d0d0d0',
    fontSize: 14,
  },
  startRouteButton: {
    backgroundColor: '#3dc2ff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  startRouteText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skillCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  circularProgressWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  circularProgressContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 10,
    color: '#666',
  },
  progressText: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  drivingStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValueLow: {
    color: '#3b82f6',
    fontWeight: 'bold'
  },
  statValueMedium: {
    color: '#8b5cf6',
    fontWeight: 'bold'
  },
  statValueHigh: {
    color: '#ef4444',
    fontWeight: 'bold'
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  seeDetailsText: {
    color: '#6366f1',
    fontSize: 14,
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  selectedPointContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    alignItems: 'center',
    transform: [{ translateX: -15 }, { translateY: 0 }],
  },
  selectedPoint: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3dc2ff',
    borderWidth: 2,
    borderColor: 'white',
  },
  selectedPointLabel: {
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#3dc2ff',
    marginTop: -25,
  },
  selectedPointText: {
    color: '#333',
    fontSize: 12,
  },
});
