import { supabase } from '../lib/supabase';
import axios from 'axios';

export async function getSpeedLimit(latitude: number, longitude: number): Promise<number> {
  const accessToken = process.env.EXPO_PUBLIC_TOMTOM_API_KEY;

  if (!accessToken) {
    console.error('API key is missing.');
    return 55; // Default speed limit
  }

  // First, get the reverse geocode data
  const reverseGeoUrl = `https://api.tomtom.com/search/2/reverseGeocode/${latitude},${longitude}.json?key=${accessToken}`;

  try {
    console.log('Fetching Reverse Geocode:', reverseGeoUrl);
    const reverseResponse = await axios.get(reverseGeoUrl);

    if (!reverseResponse.data || !reverseResponse.data.addresses.length) {
      console.warn('No reverse geocode data found.');
      return 55; // Default speed limit
    }

    // Use the point for the Traffic Flow API
    const trafficUrl = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${accessToken}&point=${latitude},${longitude}`;
    console.log('Fetching Traffic Data:', trafficUrl);

    const trafficResponse = await axios.get(trafficUrl);

    if (!trafficResponse.data || !trafficResponse.data.flowSegmentData) {
      console.warn('No traffic data found.');
      return 55; // Default speed limit
    }

    const speedLimit = trafficResponse.data.flowSegmentData.freeFlowSpeed; // Speed limit in km/h
    console.log(`Speed Limit Found: ${speedLimit} km/h`);
    return speedLimit || 55; // Default to 55 if missing
  } catch (error) {
    console.error('Error fetching speed limit:', error);
    return 55; // Default speed limit in case of error
  }
}

export async function getDriverDataAndViolations(userId: string): Promise<{ drivingScore: number; reaction: number; smoothness: number; wariness: number; chartData: any }> {
  try {
    // Fetch driving data
    const { data: drivingData, error: drivingError } = await supabase
      .from('driving_data')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (drivingError) {
      console.error('Error fetching driving data:', drivingError);
      return { drivingScore: NaN, reaction: NaN, smoothness: NaN, wariness: NaN, chartData: { labels: [], datasets: [] } };
    }

    // Fetch violation data
    const { data: violationData, error: violationError } = await supabase
      .from('violations')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (violationError) {
      console.error('Error fetching violation data:', violationError);
      return { drivingScore: NaN, reaction: NaN, smoothness: NaN, wariness: NaN, chartData: { labels: [], datasets: [] } };
    }

    // Process the data to calculate the stats
    let totalReaction = 0;
    let totalSmoothness = 0;
    let totalWariness = 0;
    let drivingScoreValue = 100;

    // Penalize driving score based on the number and severity of violations
    if (violationData && violationData.length > 0) {
      let violationPenalty = 0;
      for (const violation of violationData) {
        violationPenalty += violation.severity || 1; // Default severity to 1 if null
      }
      drivingScoreValue -= violationPenalty;

      // Ensure driving score is within the range of 0 to 100
      drivingScoreValue = Math.max(0, Math.min(100, drivingScoreValue));
    }

    /*
    const chartData = {
      labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
      datasets: [
        {
          data: [10, 25, 45, 48, 52, 60],
          color: (opacity = 1) => `rgba(75, 0, 130, ${opacity})`, // purple
          strokeWidth: 2
        },
        {
          data: [5, 20, 35, 45, 48, 42],
          color: (opacity = 1) => `rgba(65, 105, 225, ${opacity})`, // blue
          strokeWidth: 2
        },
        {
          data: [1, 5, 15, 25, 30, 35],
          color: (opacity = 1) => `rgba(0, 188, 212, ${opacity})`, // cyan
          strokeWidth: 2
        }
      ]
    };
    */

    // Create chart data
    const chartData = {
      labels: drivingData.map(data => new Date(data.timestamp).toLocaleDateString()),
      datasets: [
        {
          data: drivingData.map((data, index) => {
            let total = ((data.reaction ?? 0) + (data.smoothness ?? 0) + (data.wariness ?? 0)) / 3;
            const violation = violationData.find(v => new Date(v.timestamp).toLocaleDateString() === new Date(data.timestamp).toLocaleDateString());
            total += violation ? violation.severity ?? 1 : 0;
            return total;
          }),
          color: (opacity = 1) => `rgba(75, 0, 130, ${opacity})`, // purple
          strokeWidth: 2,
        },
      ],
    };

    console.log('chartData ', chartData);

    return {
      drivingScore: drivingScoreValue,
      reaction: totalReaction,
      smoothness: totalSmoothness,
      wariness: totalWariness,
      chartData: chartData,
    };
  } catch (error) {
    console.error('Error fetching driver data and violations:', error);
    return { drivingScore: NaN, reaction: NaN, smoothness: NaN, wariness: NaN, chartData: { labels: [], datasets: [] } };
  }
}

export async function getSpeedLimitMapbox(latitude: number, longitude: number): Promise<number> {
  const accessToken = process.env.EXPO_PUBLIC_MAPBOX_API_KEY;
  
  if (!accessToken) {
    console.error('Mapbox API key is missing.');
    return 55; // Default speed limit
  }

  // Using coordinates dynamically
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${longitude},${latitude};${longitude + 0.01},${latitude + 0.01}?geometries=geojson&annotations=maxspeed&steps=true&alternatives=false&overview=full&access_token=${accessToken}`;

  try {
    console.log('Fetching speed limit data from Mapbox:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn('Failed to fetch speed limit from Mapbox.');
      return 55; // Default speed limit
    }

    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      console.warn('No route data found.');
      return 55;
    }

    // Extract speed limit (if available)
    const maxspeedArray = data.routes[0]?.legs[0]?.annotation?.maxspeed ?? [];

    for (const speedData of maxspeedArray) {
      if (speedData?.speed && speedData.speed !== "unknown") {
        console.log(`Speed Limit Found: ${speedData.speed} km/h`);
        return speedData.speed;
      }
    }

    console.warn('No valid speed limit found.');
    return 55; // Default speed limit if none found
  } catch (error) {
    console.error('Error fetching speed limit:', error);
    return 55; // Default speed limit in case of error
  }
}


export function isLocationInGeofence(latitude: number, longitude: number, geofence: { latitude: number; longitude: number; radius: number }): boolean {
  const toRadians = (degree: number) => degree * (Math.PI / 180);

  // Radius of Earth in meters
  const R = 6371000;

  const lat1 = toRadians(latitude);
  const lon1 = toRadians(longitude);
  const lat2 = toRadians(geofence.latitude);
  const lon2 = toRadians(geofence.longitude);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return distance <= geofence.radius;
}

export async function sendDriverData(driverData: any): Promise<void> {
  try {
    console.log('sending data: ', driverData);
    
    const { data, error } = await supabase
      .from('driving_data')
      .insert([driverData]);

    if (error) {
      console.error('Error inserting driving data:', error);
    } else {
      console.log('Driving data inserted successfully:', data);
    }
  } catch (error) {
    console.error('Error inserting driving data:', error);
  }
}
