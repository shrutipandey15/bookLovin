import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getConfessionsApi, createConfessionApi, getConfessionByIdApi } from '../api/confession';

export const fetchConfessions = createAsyncThunk('confessions/fetchConfessions', async () => {
  const response = await getConfessionsApi();
  return response.data;
});

export const addNewConfession = createAsyncThunk('confessions/addNewConfession', async (newConfession) => {
  const response = await createConfessionApi(newConfession);
  return response.data;
});

export const fetchConfessionById = createAsyncThunk('confessions/fetchConfessionById', async (id) => {
  const response = await getConfessionByIdApi(id);
  return response.data;
});


const initialState = {
  confessions: [],
  currentConfession: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const confessionSlice = createSlice({
  name: 'confessions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfessions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchConfessions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.confessions = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchConfessions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addNewConfession.fulfilled, (state, action) => {
        if (action.payload) {
            state.confessions.push(action.payload);
        }
      })
      .addCase(fetchConfessionById.pending, (state) => {
        state.status = 'loading';
        state.currentConfession = null;
      })
      .addCase(fetchConfessionById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentConfession = action.payload;
      })
      .addCase(fetchConfessionById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default confessionSlice.reducer;