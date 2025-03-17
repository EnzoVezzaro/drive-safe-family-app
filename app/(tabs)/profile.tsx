// app/profile.tsx
import React from 'react';
import { View, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Profile = () => {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const role = useSelector((state: RootState) => state.auth.role);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          {/* Main Title */}
          <Text style={styles.mainTitle}>Traffic violations</Text>
          
          {/* Violations per 100 mile section */}
          <Text style={styles.sectionTitle}>Violations per 100 mile</Text>
          
          {/* Parking violation */}
          <View style={styles.violationItem}>
            <View style={styles.violationHeader}>
              <Text style={styles.violationType}>Parking</Text>
              <Text style={styles.violationCount}>11,9</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { backgroundColor: '#9C27B0', width: '85%' }]} />
            </View>
          </View>
          
          {/* Speed limit violation */}
          <View style={styles.violationItem}>
            <View style={styles.violationHeader}>
              <Text style={styles.violationType}>Speed limit</Text>
              <Text style={styles.violationCount}>15,4</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { backgroundColor: '#2196F3', width: '65%' }]} />
            </View>
          </View>
          
          {/* Crosswalk violation */}
          <View style={styles.violationItem}>
            <View style={styles.violationHeader}>
              <Text style={styles.violationType}>Crosswalk and road priority</Text>
              <Text style={styles.violationCount}>8,2</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { backgroundColor: '#4CAF50', width: '40%' }]} />
            </View>
          </View>
          
          {/* Traffic violations section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.mainTitle}>Traffic violations</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllLink}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {/* Image carousel */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
            {/* First violation card */}
            <View style={styles.violationCard}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }} 
                style={styles.violationImage} 
              />
              <View style={styles.violationCardContent}>
                <Text style={styles.violationCardTitle}>Speed limit exceeded</Text>
                <Text style={styles.violationCardDetails}>Speed limit at this point - 30 mph.</Text>
              </View>
            </View>
            
            {/* Second violation card */}
            <View style={styles.violationCard}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1542574271-7f3b92e6c821?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }} 
                style={styles.violationImage} 
              />
              <View style={styles.violationCardContent}>
                <Text style={styles.violationCardTitle}>Parking violation</Text>
                <Text style={styles.violationCardDetails}>Parking near a crosswalk is prohibited.</Text>
              </View>
            </View>
          </ScrollView>
          
          {/* Personal recommendations */}
          <Text style={styles.mainTitle}>Personal recommendations</Text>
          
          {/* Speed limit recommendation */}
          <View style={styles.recommendationItem}>
            <View style={[styles.recommendationIcon, { backgroundColor: '#3F51B5' }]}>
              <MaterialCommunityIcons name="speedometer" size={24} color="white" />
            </View>
            <Text style={styles.recommendationText}>
              Don't forget to follow speed limits in cities.
            </Text>
          </View>
          
          {/* Crosswalk recommendation */}
          <View style={styles.recommendationItem}>
            <View style={[styles.recommendationIcon, { backgroundColor: '#4DB6AC' }]}>
              <MaterialCommunityIcons name="walk" size={24} color="white" />
            </View>
            <Text style={styles.recommendationText}>
              Be careful near crosswalks. Remember to give way.
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
  }
});

export default Profile;