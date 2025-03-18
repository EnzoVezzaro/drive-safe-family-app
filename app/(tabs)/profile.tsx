// app/profile.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Image, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Linking, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import * as Violations from '../../lib/violations';
import { useTranslation } from 'react-i18next';

interface ViolationPercentage {
  type: string;
  percentage: number;
}

const Profile = () => {
  const { t } = useTranslation();
  const userId = useSelector((state: RootState) => state.auth.userId);
  const role = useSelector((state: RootState) => state.auth.role);
  const [refreshing, setRefreshing] = useState(false);
  const [violationData, setViolationData] = useState<ViolationPercentage[] | null>(null);
  const [violations, setViolations] = useState<any[] | null>(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchViolationData().then(() => setRefreshing(false));
  }, [t]);

  useEffect(() => {
    fetchViolationData();
  }, [t]);

  const fetchViolationData = async () => {
    try {
      const { data, error } = await supabase
        .from('violations')
        .select('*')
        .eq('user_id', userId);

        console.log('viol: ', userId);
        

      if (error) {
        console.error(t('profile.fetchError'), error);
      } else {
        setViolations(data);
        // Group violations by type
        const groupedViolations = data.reduce((acc, violation) => {
          const type = violation.type;
          if (!acc[type]) {
            acc[type] = [];
          }
          acc[type].push(violation);
          return acc;
        }, {});

        // Calculate percentages for each violation type
        const totalViolations: number = data.length;
        let violationPercentages: ViolationPercentage[] = [];
        Object.keys(groupedViolations).forEach(type => {
          const count = groupedViolations[type].length;
          const percentage: number = (count / totalViolations) * 100;
          violationPercentages.push({ type, percentage });
        });

        setViolationData(violationPercentages);
      }
    } catch (error) {
      console.error(t('profile.fetchError'), error);
    }
  };

  const openMap = (location: string) => {
    const [latitude, longitude] = location.split(',').map(parseFloat);
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  // If violationData is null, show a loading screen
  if (!violationData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>{t('profile.loading')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: '#F0F2F5' }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.contentContainer}>
          {/* Main Title */}
          <Text style={styles.mainTitle}>{t('profile.trafficViolations')}</Text>

          {/* Violations per 100 mile section */}
          <Text style={styles.sectionTitle}>{t('profile.totalViolations')} {violations?.length || 0}</Text>

          {/* Display violations */}
          {violationData && violationData.map((violation, index) => (
            <View key={index} style={styles.violationItem}>
              <View style={styles.violationHeader}>
                <Text style={styles.violationType}>{Violations.ViolationLabels[violation.type as keyof typeof Violations.ViolationLabels]}</Text>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.mainTitle}>{t('profile.trafficViolations')}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllLink}>{t('profile.seeAll')}</Text>
            </TouchableOpacity>
          </View>

          {/* Image carousel */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
            {violations && violations.map((violation, index) => (
              <TouchableOpacity key={index} style={styles.violationCard} onPress={() => openMap(violation.location)}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
                  style={styles.violationImage}
                />
                <View style={styles.violationCardContent}>
                  <Text style={styles.violationCardTitle}>{Violations.ViolationLabels[violation.type as keyof typeof Violations.ViolationLabels]}</Text>
                  <Text style={styles.violationCardDetails}>{violation.timestamp}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

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
  carousel: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  violationCard: {
    width: 150,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  violationImage: {
    width: '100%',
    height: 100,
  },
  violationCardContent: {
    padding: 8,
  },
  violationCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  violationCardDetails: {
    fontSize: 12,
    color: '#7F8C8D',
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
