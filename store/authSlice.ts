import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { signUp as supabaseSignUp, signIn as supabaseSignIn } from '../lib/supabase';

interface AuthState {
  userId: string | null;
  email: string | null;
  isLoggedIn: boolean;
  role: 'parent' | 'family_member' | null;
  loading: boolean;
  error: string | null;
  hasCompletedOnboarding: boolean;
}

const initialState: AuthState = {
  userId: null,
  email: null,
  isLoggedIn: false,
  role: null,
  loading: false,
  error: null,
  hasCompletedOnboarding: false,
};

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, role }: { email: string; password: string; role: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabaseSignUp({ email, password, role });
      if (error) {
        return rejectWithValue(error.message);
      }
      if (!data.user) {
        return rejectWithValue('User not found after signup');
      }
      return { userId: data.user.id, email: email, role };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabaseSignIn({ email, password });
      if (error) {
        return rejectWithValue(error.message);
      }
      if (!data.user) {
        return rejectWithValue('User not found after signin');
      }
      return { userId: data.user.id, email: email, role: 'family' as 'family'};
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ userId: string; email: string; role: string }>) => {
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.isLoggedIn = true;
      state.role = action.payload.role as 'parent' | 'family_member';
    },
    clearAuth: (state) => {
      state.userId = null;
      state.email = null;
      state.isLoggedIn = false;
      state.role = null;
      state.hasCompletedOnboarding = false;
    },
    setOnboardingComplete: (state) => {
      state.hasCompletedOnboarding = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action: PayloadAction<{ userId: string; email: string; role: string }>) => {
        state.loading = false;
        state.userId = action.payload.userId;
        state.email = action.payload.email;
        state.isLoggedIn = true;
        state.role = action.payload.role as 'parent' | 'family_member';
      })
      .addCase(signUp.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action: PayloadAction<{ userId: string; email: string; role: string }>) => {
        state.loading = false;
        state.userId = action.payload.userId;
        state.email = action.payload.email;
        state.isLoggedIn = true;
        state.role = action.payload.role as 'parent' | 'family_member';
      })
      .addCase(signIn.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setAuth, clearAuth, setOnboardingComplete } = authSlice.actions;

export default authSlice.reducer;
