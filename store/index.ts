import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import drivingReducer from './drivingSlice';
import gamificationReducer from './gamificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    driving: drivingReducer,
    gamification: gamificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
