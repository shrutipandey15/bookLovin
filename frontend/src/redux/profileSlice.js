import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockBookService } from '@api/mockBookService';

export const fetchUserProfile = createAsyncThunk('profile/fetchUser', async (username) => {
  const profileData = await mockBookService.getUserProfile(username);
  return profileData;
});

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
        state.data = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default profileSlice.reducer;