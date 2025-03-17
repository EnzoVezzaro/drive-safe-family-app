import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import drivingReducer from './drivingSlice';
import gamificationReducer from './gamificationSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer } from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // only persist authReducer
};

const rootReducer = combineReducers({
  auth: authReducer,
  driving: drivingReducer,
  gamification: gamificationReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
