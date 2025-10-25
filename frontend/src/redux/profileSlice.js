import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const mockProfileService = {
  getUserProfile: async (username) => {
    console.log(`MOCK PROFILE: Fetching profile for ${username}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      user: { username: 'Mock User', email: 'user@example.com', /* other profile fields */ },
      posts: [
          { uid: 'post1', title: 'On the nature of solitude', content: '...', author: { penName: 'Mock User' } },
          { uid: 'post2', title: 'Feeling empowered!', content: '...', author: { penName: 'Mock User' } }
      ],
    };
  }
};


export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUser',
  async (username, { rejectWithValue }) => {
    try {
      const profileData = await mockProfileService.getUserProfile(username);
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
  reducers: {},
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

export default profileSlice.reducer;