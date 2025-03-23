import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Image, Text, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Violations from '../lib/violations';

interface RecentViolationsProps {
  violations: any[] | null;
}

const RecentViolations: React.FC<RecentViolationsProps> = ({ violations }) => {
  const { t } = useTranslation();

  const getMapImageURL = (location: string) => {
    if (!location) return '';
    const [latitude, longitude] = location.replace(/[()]/g, "").split(',').map(coord => parseFloat(coord.trim()));
    const accessToken = process.env.EXPO_PUBLIC_MAPBOX_API_KEY;
    const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/geojson({"type":"Point","coordinates":[${longitude},${latitude}]})/${longitude},${latitude},12/300x200?access_token=${accessToken}`;
    return url;
  };

  const openMap = (location: string) => {
    const [latitude, longitude] = location.replace(/[()]/g, "").split(',').map(coord => parseFloat(coord.trim()));
    const url = `https://www.google.com/maps/?q=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const getSeverity = (severity: number) => {
    if (severity === 1) {
      return t('home.low');
    } else if (severity === 2 || severity === 3) {
      return t('home.medium');
    } else if (severity >= 4) {
      return t('home.high');
    }
    return t('home.unknown');
  };

  return (
    <View style={styles.recentViolations}>
      <Text style={styles.recentViolationsTitle}>{t('leaderboard.recentViolations')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
        {violations && violations.map((violation: any, index: number) => (
          <TouchableOpacity key={index} style={styles.violationCard} onPress={() => openMap(violation.location)}>
            <Image
              style={styles.violationImage}
              source={{ uri: getMapImageURL(violation.location) }}
            />
            <View style={styles.violationCardContent}>
              <Text style={styles.violationCardTitle}>{t(Violations.ViolationLabels[violation.type as keyof typeof Violations.ViolationLabels])}</Text>
              <Text style={styles.violationCardDetails}>{new Date(violation.timestamp).toLocaleDateString()}</Text>
              {violation.severity && (
                <Text style={styles.violationCardDetails}>Severity: {getSeverity(violation.severity)}</Text>
              )}
              {violation.speed && (
                <Text style={styles.violationCardDetails}>Speed: {parseFloat(violation.speed).toFixed(2)} {t('drive.kmh')}</Text> 
              )}
              {/*violation.geo_id && (
                <Text style={styles.violationCardDetails}>Name: {violation.geo_id}</Text> 
              )*/}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
  leaderboardLoading: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
});

export default RecentViolations;
