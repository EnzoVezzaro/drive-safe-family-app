import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { signUp as supabaseSignUp, signIn as supabaseSignIn } from '../lib/supabase';

interface AuthState {
  userId: string | null;
  isLoggedIn: boolean;
  role: 'parent' | 'family' | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  userId: null,
  isLoggedIn: false,
  role: null,
  loading: false,
  error: null,
};

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, role }: { email: string; password: string; role: 'parent' | 'family' }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabaseSignUp({ email, password });
      if (error) {
        return rejectWithValue(error.message);
      }
      if (!data.user) {
        return rejectWithValue('User not found after signup');
      }
      return { userId: data.user.id, role };
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
      return { userId: data.user.id, role: 'family' as 'family'};
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ userId: string; role: 'parent' | 'family' }>) => {
      state.userId = action.payload.userId;
      state.isLoggedIn = true;
      state.role = action.payload.role;
    },
    clearAuth: (state) => {
      state.userId = null;
      state.isLoggedIn = false;
      state.role = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action: PayloadAction<{ userId: string; role: 'parent' | 'family' }>) => {
        state.loading = false;
        state.userId = action.payload.userId;
        state.isLoggedIn = true;
        state.role = action.payload.role;
      })
      .addCase(signUp.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action: PayloadAction<{ userId: string; role: 'family' }>) => {
        state.loading = false;
        state.userId = action.payload.userId;
        state.isLoggedIn = true;
        state.role = action.payload.role;
      })
      .addCase(signIn.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setAuth, clearAuth } = authSlice.actions;

export default authSlice.reducer;
