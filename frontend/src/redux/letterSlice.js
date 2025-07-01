import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import lettersService from '@api/letters';

export const fetchLetters = createAsyncThunk('letters/fetchAll', async () => {
  const response = await lettersService.fetchLetters();
  return response;
});

export const saveLetter = createAsyncThunk('letters/save', async (letterData) => {
  const response = await lettersService.saveLetter(letterData);
  return response;
});

export const deleteLetter = createAsyncThunk('letters/delete', async (letterId) => {
  await lettersService.deleteLetter(letterId);
  return letterId;
});

export const markLetterAsOpened = createAsyncThunk('letters/open', async (letterId) => {
  const response = await lettersService.markLetterAsOpened(letterId);
  return response;
});

const lettersSlice = createSlice({
  name: 'letters',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLetters.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchLetters.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload; 
      })
      .addCase(saveLetter.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteLetter.fulfilled, (state, action) => {
        state.items = state.items.filter(l => l.uid !== action.payload);
      })
      .addCase(markLetterAsOpened.fulfilled, (state, action) => {
        const updatedLetter = action.payload;
        const index = state.items.findIndex(l => l.uid === updatedLetter.uid);
        if (index !== -1) { state.items[index] = updatedLetter; }
      });
  },
});

export default lettersSlice.reducer;