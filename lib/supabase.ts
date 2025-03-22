import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 
  process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signUp({ email, password, role }: { email: string; password: string; role: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.EXPO_PUBLIC_SITE_URL}/api/auth/callback`,
      data: {
        role: role,
      }
    },
  });

  if (data && data.user) {
    const { error: userError } = await supabase
      .from('users')
      .insert([
        { id: data.user.id, email: email, role: role },
      ]);

    if (userError) {
      console.error('Error creating user record:', userError);
    }
  }

  return { data, error };
}

export async function signIn({ email, password }: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function passwordReset({ email }: { email: string }) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.EXPO_PUBLIC_SITE_URL}/api/auth/callback`,
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

export async function getDrivingStats(userId: string): Promise<{ totalTrips: number; mileage: number; timeDriven: number; speed: number; violations: any[]; score: number } | null> {
  const { data, error } = await supabase
    .from('violations')
    .select('*')
    .eq('user_id', userId)
    .limit(50);

  if (error) {
    console.error('Error fetching driving stats:', error);
    return null;
  }

  return {
    totalTrips: 0,
    mileage: 0,
    timeDriven: 0,
    speed: 0,
    violations: data || [],
    score: 0,
  };
}

export async function getScores(userId: string) {
  if (!userId) {
    console.error('No user ID provided');
    return null;
  }

  // Call the PostgreSQL function get_scores with the userId as input
  let { data, error } = await supabase
    .rpc('get_scores', { input_user_id: userId })

  if (error) {
    console.error('Error fetching scores:', error);
    return null;
  }

  // The returned data will contain the scores for the family members
  if (!data || data.length === 0) {
    console.log('No scores found for user:', userId);
    return []; // Return empty array if no scores found
  }

  // console.log('[SCORE] data score: ', data);

  return data;
}
