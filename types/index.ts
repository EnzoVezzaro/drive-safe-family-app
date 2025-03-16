export interface User {
  id: string;
  email: string;
  role: 'parent' | 'family_member';
  created_at: string;
}

export interface DrivingData {
  id: string;
  user_id: string;
  speed: number;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface Violation {
  id: string;
  user_id: string;
  type: 'speeding' | 'red_light' | 'harsh_braking' | 'geofence';
  severity: number;
  location: {
    x: number;
    y: number;
  };
  timestamp: string;
}

export interface Score {
  id: string;
  user_id: string;
  score: number;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface GeofenceZone {
  id: string;
  name: string;
  type: 'restricted' | 'school' | 'home';
  coordinates: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  criteria: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  completed: boolean;
}
