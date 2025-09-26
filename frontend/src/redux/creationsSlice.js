import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockBookService } from '@api/mockBookService';

// --- ASYNC THUNKS (No changes here) ---

export const generateImage = createAsyncThunk('creations/generateImage', async (prompt) => {
  const data = await mockBookService.generateAiImage(prompt);
  return data.imageUrl;
});

export const saveCreation = createAsyncThunk('creations/saveCreation', async (creationData) => {
    return await mockBookService.saveCreationToPrivateCollection(creationData);
});

export const fetchPrivateCreations = createAsyncThunk('creations/fetchPrivate', async () => {
    return await mockBookService.getPrivateCreations();
});

// --- SLICE DEFINITION ---

const creationsSlice = createSlice({
  name: 'creations',
  initialState: {
    privateCreations: [],
    generatedImageUrl: null,
    status: 'idle', // This is for the AI image generation
    fetchStatus: 'idle', // MODIFIED: Added a new status for fetching creations
    error: null,
  },
  reducers: {
    clearGeneratedImage: (state) => {
        state.generatedImageUrl = null;
        state.status = 'idle';
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Image Generation (No changes here)
      .addCase(generateImage.pending, (state) => {
        state.status = 'generating';
        state.generatedImageUrl = null;
      })
      .addCase(generateImage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.generatedImageUrl = action.payload;
      })
      .addCase(generateImage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // MODIFIED: Updated saving and fetching logic to use the new fetchStatus
      .addCase(saveCreation.fulfilled, (state, action) => {
        state.privateCreations.unshift(action.payload);
        // If we add a creation, we can consider the list successfully loaded
        state.fetchStatus = 'succeeded';
      })
      .addCase(fetchPrivateCreations.pending, (state) => {
        state.fetchStatus = 'loading';
      })
      .addCase(fetchPrivateCreations.fulfilled, (state, action) => {
        state.privateCreations = action.payload;
        state.fetchStatus = 'succeeded';
      })
      .addCase(fetchPrivateCreations.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { clearGeneratedImage } = creationsSlice.actions;
export default creationsSlice.reducer;
