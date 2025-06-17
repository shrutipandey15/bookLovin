import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@api/axiosInstance';

// --- ASYNC THUNKS (Now with fully implemented payloadCreators) ---

export const fetchRecentPosts = createAsyncThunk('posts/fetchRecent', async () => {
  const response = await axiosInstance.get('/posts/recent');
  return response.data;
});

export const fetchPopularPosts = createAsyncThunk('posts/fetchPopular', async () => {
  const response = await axiosInstance.get('/posts/popular');
  return response.data;
});

export const fetchSinglePost = createAsyncThunk('posts/fetchOne', async (postId) => {
  const response = await axiosInstance.get(`/posts/${postId}`);
  return response.data;
});

export const fetchCommentsForPost = createAsyncThunk('posts/fetchComments', async (postId) => {
  const response = await axiosInstance.get(`/posts/${postId}/comments`);
  return { postId, comments: response.data };
});

export const createPost = createAsyncThunk('posts/create', async (postData) => {
  const response = await axiosInstance.post('/posts/', postData);
  return response.data;
});

export const updatePost = createAsyncThunk('posts/update', async ({ postId, postData }) => {
  const response = await axiosInstance.put(`/posts/${postId}`, postData);
  return response.data;
});

export const deletePost = createAsyncThunk('posts/delete', async (postId) => {
  await axiosInstance.delete(`/posts/${postId}`);
  return postId;
});

export const likePost = createAsyncThunk('posts/like', async (postId) => {
  await axiosInstance.put(`/posts/${postId}/like`);
  return { postId };
});

export const addComment = createAsyncThunk('posts/addComment', async ({ postId, commentData }) => {
    const response = await axiosInstance.post(`/posts/${postId}/comments`, commentData);
    // Assuming the backend returns the newly created comment with its author details
    return { postId, newComment: response.data };
});

export const deleteComment = createAsyncThunk('posts/deleteComment', async ({ postId, commentId }) => {
    await axiosInstance.delete(`/posts/${postId}/comments/${commentId}`);
    return { postId, commentId };
});


// --- SLICE DEFINITION (The extraReducers are now correctly ordered) ---
const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    recent: [],
    popular: [],
    currentPost: null,
    comments: {},
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Specific cases for fulfilled actions ---
      .addCase(fetchRecentPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.recent = action.payload;
      })
      .addCase(fetchPopularPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.popular = action.payload;
      })
      // ... (all other .addCase handlers are correct and remain here) ...
      .addCase(fetchSinglePost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentPost = action.payload;
      })
      .addCase(fetchCommentsForPost.fulfilled, (state, action) => {
        state.comments[action.payload.postId] = action.payload.comments;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.recent.unshift(action.payload);
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedPost = action.payload;
        const postId = updatedPost._id;
        const update = (p) => p._id === postId ? updatedPost : p;
        state.recent = state.recent.map(update);
        state.popular = state.popular.map(update);
        if (state.currentPost?._id === postId) {
            state.currentPost = updatedPost;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const postId = action.payload;
        state.recent = state.recent.filter(p => p._id !== postId);
        state.popular = state.popular.filter(p => p._id !== postId);
      })
      .addCase(likePost.fulfilled, (state, action) => {
          const { postId } = action.payload;
          const findAndLike = (post) => {
              if (post?._id === postId) post.likes = (post.likes || 0) + 1;
          };
          state.recent.forEach(findAndLike);
          state.popular.forEach(findAndLike);
          findAndLike(state.currentPost);
      })
      .addCase(addComment.fulfilled, (state, action) => {
          const { postId, newComment } = action.payload;
          if (!state.comments[postId]) state.comments[postId] = [];
          state.comments[postId].unshift(newComment);
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
          const { postId, commentId } = action.payload;
          if (state.comments[postId]) {
              state.comments[postId] = state.comments[postId].filter(c => c.uid !== commentId);
          }
      })

      // --- Generic matchers for pending and rejected states ---
      .addMatcher(
        (action) => action.type.startsWith('posts/') && action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('posts/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.error.message;
        }
      );
  },
});

export default postsSlice.reducer;