import React, { useState, useCallback, useEffect } from 'react';
import { View, Image, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../hooks/useRedux';
import { getDriverDataAndViolations } from '../../api/trafficApi';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const email = useSelector((state: RootState) => state.auth.email ?? 'test@example.com');
  const userId = useSelector((state: RootState) => state.auth.userId ?? '');
  const [drivingData, setDrivingData] = useState({
    drivingScore: 72,
    reaction: 0,
    smoothness: 0,
    wariness: 0,
    chartData: {
      labels: [],
      datasets: [],
    },
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDriverDataAndViolations(userId);
        console.log('data: ', data);
        setDrivingData(data);
      } catch (error) {
        console.error('Error fetching driver data:', error);
      }
    };

    fetchData();
  }, [userId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const fetchData = async () => {
      try {
        const data = await getDriverDataAndViolations(userId);
        setDrivingData(data);
      } catch (error) {
        console.error('Error fetching driver data:', error);
      } finally {
        setRefreshing(false);
      }
    };

    fetchData();
  }, [userId]);

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
    fillShadowGradientOpacity: 0,
    propsForDots: {
      r: '0',
    },
    propsForBackgroundLines: {
      strokeWidth: 0
    },
  };

  // Circular progress calculation
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const drivingScore = drivingData.drivingScore || 100;
  const strokeDashoffset = circumference - (drivingScore / 100) * circumference;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: '#F0F2F5' }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} style={{backgroundColor: '#F0F2F5'}} />
        }
      >
        {/* Profile Section */}
        <View style={styles.headerCard}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
                style={styles.avatar}
              />
              <View style={styles.starBadge}>
                <Text style={styles.starText}>★</Text>
              </View>
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

          <View style={styles.circularProgressContainer}>
            <View style={styles.circularProgress}>
              <View style={styles.progressBackgroundCircle} />
              <View style={styles.progressIndicator} />
              <Text style={styles.progressPercentage}>
                {drivingData.drivingScore}%
              </Text>
              <Text style={styles.progressLabel}>{t('home.currentLevel')}</Text>
            </View>
          </View>

          {/* Driving Stats */}
          <View style={styles.drivingStatsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>
                {t('home.reaction')}
                <Text style={styles.statValuePurple}>
                  {drivingData.reaction}%
                </Text>
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>
                {t('home.smoothness')}
                <Text style={styles.statValueBlue}>
                  {drivingData.smoothness}%
                </Text>
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>
                {t('home.wariness')}
                <Text style={styles.statValueCyan}>
                  {drivingData.wariness}%
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Chart */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>{t('home.progress')}</Text>
            <Text style={styles.seeDetailsText}>{t('home.seeDetails')}</Text>
          </View>

          <View style={styles.chartContainer}>
            {drivingData.chartData && drivingData.chartData.labels.length > 0 ? (
              <LineChart
                data={drivingData.chartData}
                width={screenWidth - 60}
                height={120}
                chartConfig={chartConfig}
                bezier
                withVerticalLines={false}
                withHorizontalLines={false}
                withVerticalLabels={true}
                withHorizontalLabels={false}
                style={styles.chart}
              />
            ) : (
              <Text>No data available for chart</Text>
            )}
            <View style={styles.selectedPointContainer}>
              <View style={styles.selectedPoint} />
              <View style={styles.selectedPointLabel}>
                <Text style={styles.selectedPointText}>48%</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
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
    fontSize: 24,
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
    circularProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    },
    circularProgress: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    },
    progressBackgroundCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 10,
    borderColor: '#f0f0f0',
    },
    progressIndicator: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 10,
    borderColor: '#6366f1',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#6366f1',
    borderTopColor: '#6366f1',
    transform: [{ rotate: '45deg' }],
    },
    progressPercentage: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#343b6e',
    },
    progressLabel: {
    fontSize: 12,
    color: '#666',
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
    statValuePurple: {
    color: '#9370DB',
    fontWeight: 'bold',
    },
    statValueBlue: {
    color: '#6366f1',
    fontWeight: 'bold',
    },
    statValueCyan: {
    color: '#4DD0E1',
    fontWeight: 'bold',
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
