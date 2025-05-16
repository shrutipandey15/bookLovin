import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postsService from '../api/posts';

// Async thunk to fetch all posts
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, thunkAPI) => {
    try {
      const data = await postsService.getAllPosts();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, thunkAPI) => {
    try {
      const data = await postsService.createPost(postData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    loading: false,
    error: null,
    createStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  },
  reducers: {
    // will add like/comment actions here later
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPost.pending, (state) => {
        state.createStatus = 'loading';
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.createStatus = 'success';
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.createStatus = 'error';
        state.error = action.payload;
      });
  },
});

export default postsSlice.reducer;
