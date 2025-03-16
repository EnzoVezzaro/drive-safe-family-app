import { supabase } from '../lib/supabase';
import axios from 'axios';

export async function getSpeedLimit(latitude: number, longitude: number): Promise<number> {
  // remove when discover how to do it
  return 55;
  const accessToken = process.env.EXPO_PUBLIC_OPEN_ROUTE;
  const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${accessToken}&start=${latitude},${longitude}&end=${latitude},${longitude}`;

  try {
    console.log('url: ', url);
    const response = await axios.get(url);
    console.log('responsE: ', response);
    
    const speedLimit = response.data.routes[0].legs[0].steps[0].driving_side;
    return speedLimit || 55;  // Default speed limit
  } catch (error) {
    console.error('Error fetching speed limit:', error);
    return 55;  // Default speed limit
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
