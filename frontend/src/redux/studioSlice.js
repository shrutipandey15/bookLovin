import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockBookService } from '@api/mockBookService';

export const generateImage = createAsyncThunk('aiStudio/generateImage', async (prompt, { rejectWithValue }) => {
  try {
    const data = await mockBookService.generateAiImage(prompt);
    return data.imageUrl;
  } catch (error) {
    return rejectWithValue(error.toString());
  }
});

const aiStudioSlice = createSlice({
  name: 'aiStudio',
  initialState: {
    generatedImageUrl: null,
    status: 'idle', // 'idle' | 'generating' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // This allows the user to clear the image and start over
    clearImage: (state) => {
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
        state.error = action.payload;
      });
  },
});

export const { clearImage } = aiStudioSlice.actions;
export default aiStudioSlice.reducer;