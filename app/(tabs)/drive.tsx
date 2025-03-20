import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, PanResponder, TouchableWithoutFeedback, StatusBar } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchDrivingData } from '../../store/drivingSlice';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootParamList } from '../../types';
import { useAppSelector } from '../../hooks/useRedux';
import { useTranslation } from 'react-i18next';
import MapboxGL from '@rnmapbox/maps';

const accessToken = process.env.EXPO_PUBLIC_MAPBOX_API_KEY;
console.log("Mapbox access token:", accessToken);
MapboxGL.setAccessToken(accessToken || '');

const Drive = () => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<RootParamList, 'profile'>>();
  const userId = useSelector((state: RootState) => state.auth.userId);
  const speed = useSelector((state: RootState) => state.driving.speed);
  const acceleration = useSelector((state: RootState) => state.driving.acceleration);
  const violations = useSelector((state: RootState) => state.driving.violations);
  const location = useSelector((state: RootState) => state.driving.location);
  const score = useSelector((state: RootState) => state.driving.drivingScore);
  const { speedLimit } = useAppSelector(state => state.driving);
  const alertZones = useSelector((state: RootState) => state.driving.alertZones);
  
  useEffect(() => {
    if (userId) {
      dispatch(fetchDrivingData(userId));
    } else {
      navigation.navigate('profile');
    }
  }, [dispatch, userId, navigation]);

  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const bottomSheetHeight = 280; // Adjust as needed
  const bottomSheetY = useRef(new Animated.Value(bottomSheetHeight)).current;
  
  const showBottomSheet = () => {
    setBottomSheetVisible(true);
    Animated.spring(bottomSheetY, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };
  
  const hideBottomSheet = () => {
    Animated.timing(bottomSheetY, {
      toValue: bottomSheetHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setBottomSheetVisible(false);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          bottomSheetY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          hideBottomSheet();
        } else {
          Animated.spring(bottomSheetY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const speedKmh = (speed * 1.60934).toFixed(0);

  console.log('location: ', location);
  

  return (
    <TouchableWithoutFeedback onPress={() => {
      if (bottomSheetVisible) {
        hideBottomSheet();
      }
    }}>
      <View style={styles.container}>
        <View style={styles.mapContainer}>

          <MapboxGL.MapView style={styles.map} styleURL="mapbox://styles/mapbox/streets-v11">
            {location && location.latitude && location.longitude && (
              <>
                <MapboxGL.Camera centerCoordinate={[location.longitude, location.latitude]} zoomLevel={15} animationMode="flyTo" />
                <MapboxGL.PointAnnotation id="user-location" coordinate={[location.longitude, location.latitude]}>
                  <View style={styles.userMarker} />
                </MapboxGL.PointAnnotation>
              </>
            )}
          </MapboxGL.MapView>

          <View 
            style={styles.tripButtonTop} 
          >
            <View style={styles.speedIconContainer}>
              <View style={styles.speedIcon}>
                <Text style={styles.lightningIcon}>🚘</Text>
              </View>
            </View>
            <View style={styles.speedTextContainer}>
              <Text style={styles.speedTitle}>{t('drive.speed')} ({speedKmh || 0} km/h)</Text>
              <Text style={styles.speedTitle}>{t('drive.acceleration')} ({acceleration.toFixed(2) || 0} m/s)</Text>
              <Text style={styles.speedLimit}>{t('drive.speedLimit')} - {speedLimit} km/h</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.tripButton} 
            onPress={showBottomSheet}
          >
            <Text style={styles.tripButtonText}>{t('drive.showResults')}</Text>
          </TouchableOpacity>
        </View>

        {bottomSheetVisible && (
          <Animated.View 
            style={[
              styles.scorePanel,
              { transform: [{ translateY: bottomSheetY }] },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.bottomSheetHandle} />
            <View style={styles.scoreContainer}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreText}>{score || 0}</Text>
              </View>
              <View style={styles.tripInfoContainer}>
                <Text style={styles.tripTitle}>{t('drive.niceTrip')}</Text>
                <Text style={styles.violationsText}>{t('drive.totalViolations')} - {violations?.length || 0}</Text>
              </View>
            </View>
            <Text style={styles.feedbackText}>{t('drive.feedback')}</Text>
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>{t('drive.tripDetails')}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  mapContainer: {
    flex: 1,
    position: 'relative', 
  },
  userMarker: {
    width: 15,
    height: 15,
    backgroundColor: 'blue',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  map: {
    flex: 1,
  },
  speedIconContainer: {
    marginRight: 12,
  },
  speedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3454e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightningIcon: {
    color: 'white',
    fontSize: 18,
  },
  speedTextContainer: {
    flex: 1,
  },
  speedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  speedLimit: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  tripButtonTop: {
    flexDirection: 'row',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    top: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'white',
    borderRadius: 24,
    elevation: 5,
  },
  tripButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#343b6e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  tripButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scorePanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#888',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCircle: {
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scoreText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tripInfoContainer: {
    flex: 1,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  violationsText: {
    fontSize: 14,
    color: '#555',
  },
  feedbackText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginVertical: 12,
  },
  detailsButton: {
    backgroundColor: '#343b6e',
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Drive;
