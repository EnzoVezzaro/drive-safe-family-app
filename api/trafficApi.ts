import { supabase } from '../lib/supabase';

type SpeedLimitCache = {
  latitude?: number;
  longitude?: number;
  speedLimit?: number;
};

const SPEED_LIMIT_CACHE: SpeedLimitCache = { latitude: undefined, longitude: undefined, speedLimit: undefined };
export const SPEED_LIMIT_DEFAULT: number = 55;
export const SPEED_LIMIT_THRESHOLD = 500; // 100 meters

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180; // lat1 in radians
  const φ2 = lat2 * Math.PI / 180; // lat2 in radians
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance;
};

export async function getSpeedLimitMapbox(latitude: number, longitude: number): Promise<number> {
  const accessToken = process.env.EXPO_PUBLIC_MAPBOX_API_KEY;

  if (!accessToken) {
    console.error('Mapbox API key is missing.');
    return SPEED_LIMIT_DEFAULT; // Default speed limit
  }

  // Check the cache
  const cachedData = SPEED_LIMIT_CACHE;
  if (cachedData.latitude && cachedData.longitude) {
    const distance = haversine(latitude, longitude, cachedData.latitude, cachedData.longitude);
    console.log('Distance from last cached location:', distance);

    if (distance <= SPEED_LIMIT_THRESHOLD) {
      console.log('Using cached speed limit:', cachedData.speedLimit);
      return cachedData.speedLimit || SPEED_LIMIT_DEFAULT;
    } else {
      console.log('Location has changed significantly, fetching new speed limit');
    }
  }

  // API Request to Mapbox
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${longitude},${latitude};${longitude + 0.01},${latitude + 0.01}?geometries=geojson&annotations=maxspeed&steps=true&alternatives=false&overview=full&access_token=${accessToken}`;

  try {
    console.log('Fetching speed limit data from Mapbox:', url);
    const response = await fetch(url);

    if (!response.ok) {
      console.warn('Failed to fetch speed limit from Mapbox.');
      return SPEED_LIMIT_DEFAULT; // Default speed limit
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      console.warn('No route data found.');
      return SPEED_LIMIT_DEFAULT;
    }

    // Extract speed limit (if available)
    const maxspeedArray = data.routes[0]?.legs[0]?.annotation?.maxspeed ?? [];

    let speedLimit = SPEED_LIMIT_DEFAULT;
    for (const speedData of maxspeedArray) {
      if (speedData?.speed && speedData.speed !== "unknown") {
        speedLimit = speedData.speed;
        console.log(`Speed Limit Found: ${speedData.speed} km/h`);
        break;
      }
    }

    // Update the cache with the latest location and speed limit
    SPEED_LIMIT_CACHE.latitude = latitude;
    SPEED_LIMIT_CACHE.longitude = longitude;
    SPEED_LIMIT_CACHE.speedLimit = speedLimit;

    console.log('Updated speed limit cache:', SPEED_LIMIT_CACHE);
    return speedLimit;
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
    
    console.log('sending data 2: ', {
      "latitude": driverData.latitude, 
      "longitude": driverData.longitude, 
      "speed": driverData.speed, 
      "timestamp": driverData.timestamp, 
      "user_id": driverData.user_id,
      "activity": driverData.activity
    });
    const { data, error } = await supabase
      .from('driving_data')
      .insert([{
        "latitude": driverData.latitude, 
        "longitude": driverData.longitude, 
        "speed": driverData.speed, 
        "timestamp": driverData.timestamp, 
        "user_id": driverData.user_id,
        "activity": driverData.activity
      }]);

    if (error) {
      console.error('Error inserting driving data:', error);
    } else {
      console.log('Driving data inserted successfully:', data);
    }
  } catch (error) {
    console.error('Error inserting driving data:', error);
  }
}
