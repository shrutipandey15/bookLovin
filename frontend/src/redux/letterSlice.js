import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockLetterApi } from '@api/letters';

export const fetchLetters = createAsyncThunk('letters/fetchAll', async () => {
  const response = await mockLetterApi.fetchLetters();
  return response;
});

export const saveLetter = createAsyncThunk('letters/save', async (letterData) => {
  const response = await mockLetterApi.saveLetter(letterData);
  return response;
});

export const deleteLetter = createAsyncThunk('letters/delete', async (letterId) => {
  await mockLetterApi.deleteLetter(letterId);
  return letterId;
});

export const markLetterAsOpened = createAsyncThunk('letters/open', async (letterId) => {
  const response = await mockLetterApi.markLetterAsOpened(letterId);
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
        state.items = action.payload.map(l => ({...l, targetDate: l.target_date, wordCount: l.word_count, createdAt: l.created_at, openedAt: l.opened_at}));
      })
      .addCase(saveLetter.fulfilled, (state, action) => {
        const newOrUpdatedLetter = { ...action.payload, targetDate: action.payload.target_date, wordCount: action.payload.word_count, createdAt: action.payload.created_at, openedAt: action.payload.opened_at};
        const index = state.items.findIndex(l => l._id === newOrUpdatedLetter._id);
        if (index !== -1) { state.items[index] = newOrUpdatedLetter; }
        else { state.items.push(newOrUpdatedLetter); }
      })
      .addCase(deleteLetter.fulfilled, (state, action) => {
        state.items = state.items.filter(l => l._id !== action.payload);
      })
      .addCase(markLetterAsOpened.fulfilled, (state, action) => {
        const updatedLetter = { ...action.payload, targetDate: action.payload.target_date, wordCount: action.payload.word_count, createdAt: action.payload.created_at, openedAt: action.payload.opened_at};
        const index = state.items.findIndex(l => l._id === updatedLetter._id);
        if (index !== -1) { state.items[index] = updatedLetter; }
      });
  },
});

export default lettersSlice.reducer;