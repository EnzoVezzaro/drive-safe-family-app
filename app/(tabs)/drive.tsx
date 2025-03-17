import React, { useRef, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { SafeAreaView } from 'react-native-safe-area-context';

const Drive = () => {
  const speed = useSelector((state: RootState) => state.driving.speed ?? 38);
  const violations = useSelector((state: RootState) => state.driving.violations ?? 4);
  const score = useSelector((state: RootState) => state.driving.score ?? 7.8);

  // Bottom sheet animation
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const bottomSheetHeight = 280; // Adjust as needed
  const bottomSheetY = useRef(new Animated.Value(bottomSheetHeight)).current;
  
  // Show bottom sheet
  const showBottomSheet = () => {
    setBottomSheetVisible(true);
    Animated.spring(bottomSheetY, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };
  
  // Hide bottom sheet
  const hideBottomSheet = () => {
    Animated.timing(bottomSheetY, {
      toValue: bottomSheetHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setBottomSheetVisible(false);
    });
  };
  
  // Pan responder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          // Only allow dragging down
          bottomSheetY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // If dragged down more than 100, dismiss
          hideBottomSheet();
        } else {
          // Otherwise snap back
          Animated.spring(bottomSheetY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  // Sample map image - replace with actual map implementation
  const mapImage = "https://i.imgur.com/FjGEME0.png"; // Placeholder - use your map image

  return (
    <SafeAreaView style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <Image 
          source={{ uri: mapImage }} 
          style={styles.mapImage} 
          resizeMode="cover"
        />
        
        {/* Speed Limit Violation Popup */}
        <View style={styles.speedPopup}>
          <View style={styles.speedIconContainer}>
            <View style={styles.speedIcon}>
              <Text style={styles.lightningIcon}>⚡</Text>
            </View>
          </View>
          <View style={styles.speedTextContainer}>
            <Text style={styles.speedTitle}>Over speed (38 mph)</Text>
            <Text style={styles.speedLimit}>Speed limit - 30 mph</Text>
          </View>
        </View>
        
        {/* Route Markers - Start and End Points */}
        <View style={[styles.locationMarker, styles.topMarker]}>
          <View style={styles.purpleMarker} />
        </View>
        <View style={[styles.locationMarker, styles.bottomMarker]}>
          <View style={styles.purpleMarker} />
        </View>
        
        {/* Lightning Bolts for Violations */}
        <View style={[styles.violationMarker, styles.violation1]}>
          <Text style={styles.violationIcon}>⚡</Text>
        </View>
        <View style={[styles.violationMarker, styles.violation2]}>
          <Text style={styles.violationIcon}>⚡</Text>
        </View>
        <View style={[styles.violationMarker, styles.violation3]}>
          <Text style={styles.violationIcon}>⚡</Text>
        </View>
        <View style={[styles.violationMarker, styles.violation4]}>
          <Text style={styles.violationIcon}>⚡</Text>
        </View>
        
        {/* Button to show trip results */}
        <TouchableOpacity 
          style={styles.tripButton} 
          onPress={showBottomSheet}
        >
          <Text style={styles.tripButtonText}>Show Trip Results</Text>
        </TouchableOpacity>
      </View>
      
      {/* Bottom Sheet for Trip Results */}
      {bottomSheetVisible && (
        <Animated.View 
          style={[
            styles.scorePanel,
            {
              transform: [{ translateY: bottomSheetY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Handle for dragging */}
          <View style={styles.bottomSheetHandle} />
          
          <View style={styles.scoreContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>7,8</Text>
            </View>
            
            <View style={styles.tripInfoContainer}>
              <Text style={styles.tripTitle}>Nice trip!</Text>
              <Text style={styles.violationsText}>Total number of road violations - 4</Text>
            </View>
          </View>
          
          <Text style={styles.feedbackText}>
            Your progress is great, but don't forget about speed limits. We also recommend you to slow down near crosswalks.
          </Text>
          
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>See trip details</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
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
  mapImage: {
    width: '100%',
    height: '100%',
  },
  speedPopup: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
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
  },
  speedLimit: {
    fontSize: 14,
    color: '#888',
  },
  locationMarker: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topMarker: {
    top: '18%',
    right: '22%',
  },
  bottomMarker: {
    bottom: '15%',
    left: '18%',
  },
  purpleMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#9370db',
    borderWidth: 3,
    borderColor: 'white',
  },
  violationMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  violation1: {
    top: '30%',
    left: '35%',
  },
  violation2: {
    top: '50%',
    left: '40%',
  },
  violation3: {
    bottom: '35%',
    right: '30%',
  },
  violation4: {
    bottom: '25%',
    left: '40%',
  },
  violationIcon: {
    color: '#3454e5',
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: '#343b6e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#fff',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#4dc4e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  tripInfoContainer: {
    flex: 1,
  },
  tripTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  violationsText: {
    fontSize: 14,
    color: '#b0b0c0',
  },
  feedbackText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 22,
    marginBottom: 20,
  },
  detailsButton: {
    backgroundColor: '#4dc4e5',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default Drive;