import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockBookService } from '@api/mockBookService';

// --- ASYNC THUNKS ---

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
    status: 'idle', // 'idle' | 'generating' | 'succeeded' | 'failed'
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
      // Image Generation
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
      // Saving and Fetching Private Creations
      .addCase(saveCreation.fulfilled, (state, action) => {
        state.privateCreations.unshift(action.payload);
      })
      .addCase(fetchPrivateCreations.fulfilled, (state, action) => {
        state.privateCreations = action.payload;
      });
  },
});

export const { clearGeneratedImage } = creationsSlice.actions;
export default creationsSlice.reducer;