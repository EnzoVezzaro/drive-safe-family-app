import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Specific selectors for each slice
export const useAuthSelector = () => useAppSelector((state) => state.auth);
export const useDrivingSelector = () => useAppSelector((state) => state.driving);
export const useGamificationSelector = () => useAppSelector((state) => state.gamification);

/**
 * Custom hook for selecting Redux state with proper typing.
 * @returns A selector function typed to the RootState.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
