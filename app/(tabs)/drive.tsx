import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, PanResponder, TouchableWithoutFeedback, StatusBar, ScrollView } from 'react-native';
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
  
  // Add ref for the map to control zoom
  const mapRef = useRef(null);
  const cameraRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(15);
  
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

  // Modified panResponder to allow ScrollView to work
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to gestures that start near the handle
        const y = evt.nativeEvent.locationY;
        return y < 40; // Only respond if touch is near the top handle
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to vertical gestures
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 0;
      },
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
  
  // Helper function to get zone type
  const getZoneTypeFromLabel = (label) => {
    const lowerLabel = (label || '').toLowerCase();
    if (lowerLabel.includes('school') || lowerLabel.includes('escuela')) return 'school';
    if (lowerLabel.includes('accident') || lowerLabel.includes('accidente')) return 'accident';
    return 'other';
  };
  
  // Helper function to get zone color
  const getZoneColor = (zoneType) => {
    switch (zoneType) {
      case 'school': return '#FFC107';
      case 'accident': return '#F44336';
      default: return '#3454e5';
    }
  };

  // Function to render zone polygons
  const renderAlertZones = () => {
    if (!alertZones || alertZones.length === 0) return null;
    
    return alertZones.map((zone, index) => {
      // Skip if zone doesn't have valid coordinates
      if (!zone.coordinates?.features?.length) return null;
      
      const zoneType = getZoneTypeFromLabel(zone.label);
      const zoneColor = getZoneColor(zoneType);
      
      return (
        <MapboxGL.ShapeSource
          key={`alert-zone-${zone.id || index}`}
          id={`alert-zone-source-${zone.id || index}`}
          shape={zone.coordinates}
        >
          <MapboxGL.FillLayer
            id={`alert-zone-fill-${zone.id || index}`}
            style={{
              fillColor: zoneColor,
              fillOpacity: 0.3,
            }}
          />
          <MapboxGL.LineLayer
            id={`alert-zone-line-${zone.id || index}`}
            style={{
              lineColor: zoneColor,
              lineWidth: 2,
              lineOpacity: 0.8,
            }}
          />
          <MapboxGL.SymbolLayer
            id={`alert-zone-label-${zone.id || index}`}
            style={{
              textField: zone.label || `Alert Zone ${index + 1}`,
              textSize: 12,
              textColor: '#000',
              textHaloColor: '#fff',
              textHaloWidth: 1,
              textAnchor: 'center',
              textAllowOverlap: true,
            }}
          />
        </MapboxGL.ShapeSource>
      );
    });
  };
  
  // Zoom control functions - fixed to use the camera directly
  const handleZoomIn = () => {
    setZoomLevel(prevZoom => {
      const newZoom = prevZoom + 1;
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          zoomLevel: newZoom,
          animationDuration: 300,
        });
      }
      return newZoom;
    });
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prevZoom => {
      const newZoom = Math.max(1, prevZoom - 1); // Prevent negative zoom
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          zoomLevel: newZoom,
          animationDuration: 300,
        });
      }
      return newZoom;
    });
  };

  // Function to render alert zone items in the bottom sheet
  const renderAlertZoneList = () => {
    if (!alertZones || alertZones.length === 0) {
      return (
        <View style={styles.noZonesContainer}>
          <Text style={styles.noZonesText}>{t('drive.noAlertZones')}</Text>
        </View>
      );
    }

    // Create dummy data for testing if needed
    const testData = alertZones.length < 5 ? 
      [...alertZones, ...Array(10).fill(0).map((_, i) => ({
        id: `test-${i}`,
        label: `Test Zone ${i+1}`,
        type: i % 3 === 0 ? 'school' : i % 3 === 1 ? 'accident' : 'other'
      }))] 
      : alertZones;
    
    return testData.map((zone, index) => {
      const zoneType = getZoneTypeFromLabel(zone.label);
      const zoneColor = getZoneColor(zoneType);
      
      return (
        <View key={`zone-item-${zone.id || index}`} style={styles.zoneItem}>
          <View style={[styles.zoneColorIndicator, { backgroundColor: zoneColor }]} />
          <View style={styles.zoneDetails}>
            <Text style={styles.zoneTitle}>{zone.label || `Alert Zone ${index + 1}`}</Text>
            <Text style={styles.zoneDescription}>
              {zoneType === 'school' ? t('drive.schoolZoneDescription') : 
               zoneType === 'accident' ? t('drive.accidentZoneDescription') : 
               t('drive.otherZoneDescription')}
            </Text>
          </View>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapboxGL.MapView 
          ref={mapRef}
          style={styles.map} 
          styleURL="mapbox://styles/mapbox/streets-v11" 
        >
          {location && location.latitude && location.longitude && (
            <>
              <MapboxGL.Camera 
                ref={cameraRef}
                centerCoordinate={[location.longitude, location.latitude]} 
                zoomLevel={zoomLevel} 
                animationMode="flyTo"
              />
              <MapboxGL.PointAnnotation id="user-location" coordinate={[location.longitude, location.latitude]}>
                <View style={styles.userMarker} />
              </MapboxGL.PointAnnotation>
            </>
          )}
          
          {/* Render Alert Zones */}
          {renderAlertZones()}
        </MapboxGL.MapView>

        {/* Zoom Controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
            <Text style={styles.zoomButtonText}>-</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tripButtonTop}>
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
        // Remove TouchableWithoutFeedback to prevent intercepting scroll events
        <Animated.View 
          style={[
            styles.scorePanel,
            { transform: [{ translateY: bottomSheetY }] },
          ]}
        >
          {/* Handle area that responds to pan gesture */}
          <View 
            style={styles.bottomSheetHandleContainer} 
            {...panResponder.panHandlers}
          >
            <View style={styles.bottomSheetHandle} />
          </View>
          
          <Text style={styles.alertZonesTitle}>{t('drive.alertZones')}</Text>
          
          {/* ScrollView with nestedScrollEnabled */}
          <ScrollView 
            style={styles.alertZonesScrollView}
            contentContainerStyle={styles.alertZonesContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            scrollEnabled={true}
            scrollEventThrottle={16}
          >
            {renderAlertZoneList()}
          </ScrollView>
          
          <TouchableOpacity style={styles.detailsButton} onPress={hideBottomSheet}>
            <Text style={styles.detailsButtonText}>{t('drive.closePanel')}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
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
  // New zoom control styles
  zoomControls: {
    position: 'absolute',
    left: 16,
    bottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  zoomButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  zoomButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343b6e',
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
    height: '60%', // Fixed height to ensure content is scrollable
  },
  // New container just for the handle
  bottomSheetHandleContainer: {
    height: 40,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#888',
    borderRadius: 5,
  },
  alertZonesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#343b6e',
  },
  alertZonesScrollView: {
    flex: 1, // Make the ScrollView take available space
  },
  alertZonesContent: {
    paddingHorizontal: 4,
    paddingBottom: 20,
  },
  zoneItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  zoneColorIndicator: {
    width: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  zoneDetails: {
    flex: 1,
  },
  zoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  zoneDescription: {
    fontSize: 14,
    color: '#666',
  },
  noZonesContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noZonesText: {
    color: '#888',
    fontSize: 16,
  },
  detailsButton: {
    backgroundColor: '#343b6e',
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  detailsButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Drive;