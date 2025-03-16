import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GamificationState {
  badges: string[];
  points: number;
  leaderboard: {
    family: {
      userId: string;
      score: number;
    }[];
  };
}

const initialState: GamificationState = {
  badges: [],
  points: 0,
  leaderboard: {
    family: [],
  },
};

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    addBadge: (state, action: PayloadAction<string>) => {
      state.badges.push(action.payload);
    },
    updatePoints: (state, action: PayloadAction<number>) => {
      state.points += action.payload;
    },
    updateFamilyLeaderboard: (state, action: PayloadAction<{ userId: string; score: number }[]>) => {
      state.leaderboard.family = action.payload;
    },
  },
});

export const {
  addBadge,
  updatePoints,
  updateFamilyLeaderboard,
} = gamificationSlice.actions;

export default gamificationSlice.reducer;
