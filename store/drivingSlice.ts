import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';

interface DrivingState {
  speed: number;
  acceleration: number;
  location: {
    latitude: number | null;
    longitude: number | null;
  };
  violations: string[];
  drivingScore: number;
}

const initialState: DrivingState = {
  speed: 0,
  acceleration: 0,
  location: {
    latitude: null,
    longitude: null,
  },
  violations: [],
  drivingScore: 100,
};

export const addViolationToSupabase = createAsyncThunk(
  'driving/addViolationToSupabase',
  async ({ userId, violationCode }: { userId: string; violationCode: string }, { getState }) => {
    console.log('addViolationToSupabase called with:', { userId, violationCode });
    const state: any = getState();
    const { latitude, longitude } = state.driving.location;

    try {
      console.log('addViolationToSupabase inserting:', { user_id: userId, type: violationCode, location: `${latitude},${longitude}` });
      const { data, error } = await supabase
        .from('violations')
        .insert([{ user_id: userId, type: violationCode, location: `${latitude},${longitude}` }]);

      if (error) {
        console.error('Error inserting violation:', error);
        throw error;
      }

      console.log('Violation inserted successfully:', data);
      return data;
    } catch (error) {
      console.error('Error inserting violation:', error);
      throw error;
    }
  }
);

const drivingSlice = createSlice({
  name: 'driving',
  initialState,
  reducers: {
    updateSpeed: (state, action: PayloadAction<number>) => {
      state.speed = action.payload;
    },
    updateAcceleration: (state, action: PayloadAction<number>) => {
      state.acceleration = action.payload;
    },
    updateLocation: (state, action: PayloadAction<{ latitude: number; longitude: number }>) => {
      state.location = action.payload;
    },
    addViolation: (state, action: PayloadAction<string>) => {
      state.violations.push(action.payload);
    },
    updateDrivingScore: (state, action: PayloadAction<number>) => {
      state.drivingScore = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addViolationToSupabase.fulfilled, (state, action) => {
      console.log('Violation added to Supabase:', action.payload);
    });
    builder.addCase(addViolationToSupabase.rejected, (state, action) => {
      console.error('Failed to add violation to Supabase:', action.error);
    });
  },
});

export const {
  updateSpeed,
  updateAcceleration,
  updateLocation,
  addViolation,
  updateDrivingScore,
} = drivingSlice.actions;

export default drivingSlice.reducer;
