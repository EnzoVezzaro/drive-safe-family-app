import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 
  process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signUp({ email, password }: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.EXPO_PUBLIC_SITE_URL}/api/auth/callback`,
    },
  });
  return { data, error };
}

export async function signIn({ email, password }: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function getUserRank(userId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('rank')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user rank:', error);
    return null;
  }

  return data?.rank || null;
}

export async function getDrivingStats(userId: string): Promise<{ totalTrips: number; mileage: number; timeDriven: number; speed: number; violations: number; score: number } | null> {
  const { data, error } = await supabase
    .from('violations')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching driving stats:', error);
    return null;
  }

  return {
    totalTrips: 0,
    mileage: 0,
    timeDriven: 0,
    speed: 0,
    violations: data ? data.length : 0,
    score: 0,
  };
}

export async function getScores() {
  const { data, error } = await supabase
  .from('scores')
  .select(`
    score,
    updated_at,
    user_id,
    users:users(id, email)
  `)
  .order('score', { ascending: false });

  if (error) {
    console.error('Error fetching scores:', error);
    return null;
  }

  return data;
}
