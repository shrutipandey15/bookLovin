import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@api/axiosInstance'; // Correct default import

// 1. UPDATED to call your real backend
export const generateImage = createAsyncThunk(
  'creations/generateImage',
  async (prompt, { rejectWithValue }) => {
    try {
    const response = await axiosInstance.post('/studio/generate-image', { prompt });      
    return response.data.imageUrl; // This will be the real URL from the backend
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate image');
    }
  }
);

// 2. UPDATED to call your real backend
export const saveCreation = createAsyncThunk(
  'creations/saveCreation',
  async (creationData, { rejectWithValue }) => {
    try {
    const response = await axiosInstance.post('/studio/save-creation', creationData);      // We return the response from the save endpoint, which includes the new ID
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to save creation');
    }
  }
);

// 3. This is the ONLY fetch function we need
export const fetchMyCreations = createAsyncThunk(
  'creations/fetchMyCreations',
  async (_, { rejectWithValue }) => {
    try {
    const response = await axiosInstance.get('/studio/my-creations');
     return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch creations');
    }
  }
);

// 4. All mock thunks (like fetchPrivateCreations) are GONE.

const creationsSlice = createSlice({
  name: 'creations',
  initialState: {
    myCreations: [], // This is the only array we need for creations
    generatedImageUrl: null,
    status: 'idle', // 'idle' | 'generating' | 'saving' | 'fetching' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    clearGeneratedImage: (state) => {
        state.generatedImageUrl = null;
        state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Generate Image Cases
      .addCase(generateImage.pending, (state) => {
        state.status = 'generating';
        state.generatedImageUrl = null;
        state.error = null;
      })
      .addCase(generateImage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.generatedImageUrl = action.payload;
      })
      .addCase(generateImage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Save Creation Cases
      .addCase(saveCreation.pending, (state) => {
        state.status = 'saving';
      })
      .addCase(saveCreation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // The backend returns {status: "success", ..., creationId: "..."}
        // But our save_creation API in studio.py doesn't return the full new object.
        // For now, we just succeed. To see it, the user will need to re-fetch.
      })
      .addCase(saveCreation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch My Creations Cases
      .addCase(fetchMyCreations.pending, (state) => {
        state.status = 'fetching';
        state.error = null;
      })
      .addCase(fetchMyCreations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.myCreations = action.payload;
      })
      .addCase(fetchMyCreations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearGeneratedImage } = creationsSlice.actions;
export default creationsSlice.reducer;