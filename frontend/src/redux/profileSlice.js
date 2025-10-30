import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as profileApi from '../api/profile';

export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUser',
  async (username, { rejectWithValue }) => {
    try {
      const profileData = await profileApi.getUserProfile(username);
      return profileData;
    } catch (error) {
       return rejectWithValue(error.response?.data?.detail || 'Could not fetch profile');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
reducers: {
    updateProfileQuote: (state, action) => {
      if (state.data && state.data.user) {
        state.data.user.favorite_quote = action.payload;
      }
    },
    updateProfileArchetype: (state, action) => {
      if (state.data && state.data.user && state.data.user.reading_personality) {
        state.data.user.reading_personality.literary_archetype = action.payload;
      }
    },
  },
    extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
        state.data = null; 
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; 
      });
  },
});

export const { updateProfileQuote, updateProfileArchetype } = profileSlice.actions;

export default profileSlice.reducer;