import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockConfessionApi } from '@api/confession';

export const fetchConfessions = createAsyncThunk('confessions/fetchAll', async () => {
  const response = await mockConfessionApi.fetchConfessions();
  return response;
});

export const createConfession = createAsyncThunk('confessions/create', async (confessionData) => {
  const response = await mockConfessionApi.createConfession(confessionData);
  return response;
});

const confessionsSlice = createSlice({
  name: 'confessions',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfessions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchConfessions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchConfessions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createConfession.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export default confessionsSlice.reducer;