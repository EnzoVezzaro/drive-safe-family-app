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
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return distance <= geofence.radius;
}

export async function sendDriverData(driverData: any): Promise<void> {
  try {
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
