import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockCreationsService } from '@api/aiCreationmock';

export const generateImage = createAsyncThunk('creations/generateImage', async (prompt) => {
  const data = await mockCreationsService.generateAiImage(prompt);
  return data.imageUrl;
});

export const saveCreation = createAsyncThunk('creations/saveCreation', async (creationData) => {
    return await mockCreationsService.saveCreationToPrivateCollection(creationData);
});

export const fetchPrivateCreations = createAsyncThunk('creations/fetchPrivate', async () => {
    return await mockCreationsService.getPrivateCreations();
});

const creationsSlice = createSlice({
  name: 'creations',
  initialState: {
    privateCreations: [],
    generatedImageUrl: null,
    status: 'idle', 
    fetchStatus: 'idle', 
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
      .addCase(saveCreation.fulfilled, (state, action) => {
        state.privateCreations.unshift(action.payload);
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