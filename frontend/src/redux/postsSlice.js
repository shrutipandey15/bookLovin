import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@api/axiosInstance";

export const fetchRecentPosts = createAsyncThunk(
  "posts/fetchRecent",
  async () => {
    const response = await axiosInstance.get("/posts/recent");
    return response.data;
  }
);

export const fetchPopularPosts = createAsyncThunk(
  "posts/fetchPopular",
  async () => {
    const response = await axiosInstance.get("/posts/popular");
    return response.data;
  }
);

export const fetchSinglePost = createAsyncThunk(
  "posts/fetchOne",
  async (postId) => {
    const response = await axiosInstance.get(`/posts/${postId}`);
    return response.data;
  }
);

export const fetchCommentsForPost = createAsyncThunk(
  "posts/fetchComments",
  async (postId) => {
    const response = await axiosInstance.get(`/posts/${postId}/comments`);
    return { postId, comments: response.data };
  }
);

export const createPost = createAsyncThunk(
  "posts/create",
  async (postData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/posts/", // The URL
        postData,   // The FormData
        {           // The new config object
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating post:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updatePost = createAsyncThunk(
  "posts/update",
  async ({ postId, postData }) => {
    const response = await axiosInstance.put(`/posts/${postId}`, postData);
    return response.data;
  }
);

export const deletePost = createAsyncThunk("posts/delete", async (postId) => {
  await axiosInstance.delete(`/posts/${postId}`);
  return postId;
});

export const reactToPost = createAsyncThunk(
  "posts/react",
  async ({ postId, reactionType }) => {
    const response = await axiosInstance.put(`/posts/${postId}/react`, {
      reaction: reactionType,
    });
    return { postId, updatedReactions: response.data };
  }
);

export const addComment = createAsyncThunk(
  "posts/addComment",
  async ({ postId, commentData }) => {
    const response = await axiosInstance.post(
      `/posts/${postId}/comments`,
      commentData
    );
    return { postId, newComment: response.data };
  }
);

export const deleteComment = createAsyncThunk(
  "posts/deleteComment",
  async ({ postId, commentId }) => {
    await axiosInstance.delete(`/posts/${postId}/comments/${commentId}`);
    return { postId, commentId };
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState: {
    recent: [],
    popular: [],
    currentPost: null,
    comments: {},
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecentPosts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPopularPosts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSinglePost.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRecentPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.recent = action.payload;
      })
      .addCase(fetchPopularPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.popular = action.payload;
      })
      .addCase(fetchSinglePost.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentPost = action.payload;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.recent.unshift(action.payload);
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedPost = action.payload;
        const postId = updatedPost.uid;
        const update = (p) => (p.uid === postId ? updatedPost : p);
        state.recent = state.recent.map(update);
        state.popular = state.popular.map(update);
        if (state.currentPost?.uid === postId) {
          state.currentPost = updatedPost;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.status = "succeeded";
        const postId = action.payload;
        state.recent = state.recent.filter((p) => p.uid !== postId);
        state.popular = state.popular.filter((p) => p.uid !== postId);
      })
      .addCase(reactToPost.fulfilled, (state, action) => {
        const { postId, updatedReactions } = action.payload;
        const findAndApplyReactions = (post) => {
          if (post?.uid === postId) {
            post.reactions = updatedReactions;
          }
        };
        state.recent.forEach(findAndApplyReactions);
        state.popular.forEach(findAndApplyReactions);
        findAndApplyReactions(state.currentPost);
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, newComment } = action.payload;
        if (!state.comments[postId]) state.comments[postId] = [];
        state.comments[postId].unshift(newComment);
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;
        if (state.comments[postId]) {
          state.comments[postId] = state.comments[postId].filter(
            (c) => c.uid !== commentId
          );
        }
      })
      .addCase(fetchCommentsForPost.fulfilled, (state, action) => {
        state.comments[action.payload.postId] = action.payload.comments;
      })

      .addMatcher(
        (action) =>
          action.type.startsWith("posts/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.status = "failed";
          state.error = action.error.message;
        }
      );
  },
});

export default postsSlice.reducer;
