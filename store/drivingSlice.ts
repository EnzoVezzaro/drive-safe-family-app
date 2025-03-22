import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase, getDrivingStats } from '../lib/supabase';

interface DrivingState {
  speed: number;
  acceleration: number;
  location: {
    latitude: number | null;
    longitude: number | null;
  };
  violations: any[];
  drivingScore: number;
  speedLimit: number;
  alertZones: any[];
  locationTrackingEnabled: boolean;
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
  speedLimit: 30,
  alertZones: [],
  locationTrackingEnabled: true,
};

export const addViolationToSupabase = createAsyncThunk(
  'driving/addViolationToSupabase',
  async ({ userId, violationCode, severity }: { userId: string; violationCode: string, severity: number }, { getState }) => {
    console.log('addViolationToSupabase called with:', { userId, violationCode });
    const state: any = getState();
    const { latitude, longitude } = state.driving.location;

    try {
      console.log('addViolationToSupabase inserting:', { user_id: userId, type: violationCode, location: `${latitude},${longitude}`, severity: severity });
      const { data, error } = await supabase
        .from('violations')
        .insert([{ 
          user_id: userId, 
          type: violationCode, 
          location: `${latitude},${longitude}`,
          severity: severity 
        }]);

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
    updateDrivingScore: (state, action: PayloadAction<number>) => {
      state.drivingScore = action.payload;
    },
    updateViolations: (state, action: PayloadAction<any[]>) => {
      state.violations = action.payload;
    },
    updateSpeedLimit: (state, action: PayloadAction<number>) => {
      state.speedLimit = action.payload;
    },
    updateAlertZones: (state, action: PayloadAction<any[]>) => {
      state.alertZones = action.payload;
    },
    updateLocationTracking: (state, action: PayloadAction<boolean>) => {
      state.locationTrackingEnabled = action.payload;
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

export const fetchDrivingData = createAsyncThunk(
  'driving/fetchDrivingData',
  async (userId: string, { dispatch }) => {
    try {
      // Fetch danger zones
      const { data: dangerZonesData, error: dangerZonesError } = await supabase
        .from('danger_zones')
        .select('*')
        .eq('created_by', userId)
        .eq('deleted', false);

      if (dangerZonesError) {
        console.error('Error fetching danger zones:', dangerZonesError);
      } else {
        dispatch(updateAlertZones(dangerZonesData || []));
      }

      const drivingData = await getDrivingStats(userId);

      if (drivingData) {
        dispatch(updateViolations(drivingData.violations || []));
        return drivingData;
      } else {
        console.error('Failed to fetch driving data');
        throw new Error('Failed to fetch driving data');
      }
    } catch (error) {
      console.error('Error in fetchDrivingData:', error);
      throw error;
    }
  }
);

export const {
  updateSpeed,
  updateAcceleration,
  updateLocation,
  updateDrivingScore,
  updateViolations,
  updateSpeedLimit,
  updateAlertZones,
  updateLocationTracking
} = drivingSlice.actions;

export default drivingSlice.reducer;
