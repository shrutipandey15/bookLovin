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

export const fetchSingleConfession = createAsyncThunk('confessions/fetchOne', async (confessionId) => {
  const response = await mockConfessionApi.fetchSingleConfession(confessionId);
  return response;
});


const confessionsSlice = createSlice({
  name: 'confessions',
  initialState: {
    items: [],
    currentConfession: null, 
    status: 'idle', 
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfessions.pending, (state) => { state.status = 'loading'; })
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
      })
      .addCase(fetchSingleConfession.pending, (state) => {
        state.status = 'loading';
        state.currentConfession = null;
      })
      .addCase(fetchSingleConfession.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentConfession = action.payload;
      })
      .addCase(fetchSingleConfession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default confessionsSlice.reducer;