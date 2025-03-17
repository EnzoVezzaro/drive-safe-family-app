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

export async function getDrivingStats(userId: string): Promise<{ totalTrips: number; mileage: number; timeDriven: number; speed: number; violations: any[]; score: number } | null> {
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
    violations: data || [],
    score: 0,
  };
}

export async function getScores(userId: string) {
  if (!userId) {
    console.error('No user ID provided');
    return null;
  }

  // Fetch family members (users where id = current user id or parent = current user id)
  const { data: familyMembers, error: familyError } = await supabase
    .from('users')
    .select('id, email')
    .or(`id.eq.${userId},parent.eq.${userId}`);

  if (familyError) {
    console.error('Error fetching family members:', familyError);
    return null;
  }

  if (!familyMembers || familyMembers.length === 0) {
    console.log('No family members found for user:', userId);
    return []; // Return empty array if no family members found
  }

  // Fetch violations for all family members
  const familyMemberIds = familyMembers.map(member => member.id);
  const { data: violations, error: violationsError } = await supabase
    .from('violations')
    .select('*')
    .in('user_id', familyMemberIds);
  console.log('fetching violations family: ', violations);
  
  if (violationsError) {
    console.error('Error fetching violations:', violationsError);
    return null;
  }

  // Calculate score for each family member (example: score = number of violations)
  const familyScores = familyMembers.map(member => {
    const memberViolations = violations ? violations.filter(violation => violation.user_id === member.id) : [];
    const score = memberViolations.length; // Score is based on number of violations
    return {
      score: score,
      user_id: member.id,
      users: {
        id: member.id,
        email: member.email
      }
    };
  });

  // Sort family scores by score in descending order
  familyScores.sort((a, b) => b.score - a.score);

  return {
    scores: familyScores,
    violations: violations || []
  };
}
