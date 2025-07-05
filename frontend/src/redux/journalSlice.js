import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import journalService from '@api/journal';

export const fetchEntries = createAsyncThunk('journal/fetchEntries', async (params, { rejectWithValue }) => {
  try {
    return await journalService.fetchEntries(params);
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const createEntry = createAsyncThunk('journal/createEntry', async (entryData, { rejectWithValue }) => {
  try {
    return await journalService.createEntry(entryData);
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const updateEntry = createAsyncThunk('journal/updateEntry', async ({ entryId, entryData }, { rejectWithValue }) => {
  try {
    return await journalService.updateEntry(entryId, entryData);
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const deleteEntry = createAsyncThunk('journal/deleteEntry', async (entryId, { rejectWithValue }) => {
  try {
    await journalService.deleteEntry(entryId);
    return entryId; 
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const toggleFavorite = createAsyncThunk('journal/toggleFavorite', async (entry, { rejectWithValue }) => {
  try {
    await journalService.toggleFavorite(entry);

    return {
      ...entry,
      favorite: !entry.favorite 
    };
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const journalSlice = createSlice({
  name: 'journal',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEntries.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEntries.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchEntries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.details || 'Failed to fetch entries.';
      })

      .addCase(createEntry.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      
      .addCase(deleteEntry.fulfilled, (state, action) => {
        const deletedEntryId = action.payload;
        state.items = state.items.filter((entry) => entry.uid !== deletedEntryId);
      })

      .addMatcher(
        (action) => action.type === updateEntry.fulfilled.type || action.type === toggleFavorite.fulfilled.type,
        (state, action) => {
            const updatedEntry = action.payload;
            if (updatedEntry && updatedEntry.uid) {
                const index = state.items.findIndex(entry => entry.uid === updatedEntry.uid);
                if (index !== -1) {
                    state.items[index] = { ...state.items[index], ...updatedEntry };
                }
            }
        }
      )
  },
});

export default journalSlice.reducer;