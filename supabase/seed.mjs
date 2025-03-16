import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedDatabase() {
  try {
    // Insert dummy data into profiles table
    const { data: profilesData, error: profilesError } = await supabase
      .from('users')
      .insert([
        { email: 'test@test.com', role: 'parent' },
        { email: 'test@test.com', role: 'family_member' },
        { email: 'test@test.com', role: 'family_member' },
      ]);

    if (profilesError) {
      console.error('Error seeding profiles table:', profilesError);
    } else {
      console.log('Successfully seeded profiles table:', profilesData);
    }

    // Insert dummy data into driving_stats table
    const { data: drivingStatsData, error: drivingStatsError } = await supabase
      .from('driving_data')
      .insert([
        { 
            user_id: 'user1', 
            speed: 55.4, 
            latitude: 19.4326, 
            longitude: -99.1332, 
            timestamp: '2025-03-16T14:30:00Z'
          },
          { 
            user_id: 'user2', 
            speed: 60.1, 
            latitude: 18.7357, 
            longitude: -70.1627, 
            timestamp: '2025-03-16T14:45:00Z'
          },
          { 
            user_id: 'user3', 
            speed: 50.2, 
            latitude: 20.2925, 
            longitude: -85.7799, 
            timestamp: '2025-03-16T15:00:00Z'
          }        
      ]);

    if (drivingStatsError) {
      console.error('Error seeding driving_stats table:', drivingStatsError);
    } else {
      console.log('Successfully seeded driving_stats table:', drivingStatsData);
    }

    console.log('Database seeding complete!');
  } catch (error) {
    console.error('Error during database seeding:', error);
  }
}

seedDatabase();
