import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as bookApi from '../api/books';

export const searchOpenLibrary = createAsyncThunk(
  'books/search',
  async ({ query, limit }, { rejectWithValue }) => {
    try {
      const data = await bookApi.searchBooks(query, limit);
      return data.docs;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Search failed');
    }
  }
);

export const fetchShelf = createAsyncThunk(
  'books/fetchShelf',
  async (_, { rejectWithValue }) => {
    try {
      const data = await bookApi.getShelf();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Could not fetch shelf');
    }
  }
);

export const addBookToShelf = createAsyncThunk(
  'books/addBookToShelf',
  async (bookData, { getState, rejectWithValue }) => {
    const oldItems = getState().books.items;
    try {
      const data = await bookApi.addToShelf(bookData);
      return data;
    } catch (error) {
      return rejectWithValue({ 
        error: error.response?.data?.detail || 'Could not add book',
        oldItems: oldItems 
      });
    }
  }
);

export const removeBookFromShelf = createAsyncThunk(
  'books/removeBookFromShelf',
  async (olKey, { rejectWithValue }) => {
    try {
      await bookApi.removeFromShelf(olKey);
      return olKey;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Could not remove book');
    }
  }
);

export const updateBookFavorite = createAsyncThunk(
  'books/updateBookFavorite',
  async ({ olKey, is_favorite }, { rejectWithValue }) => {
    try {
      const data = await bookApi.updateBookFavorite(olKey, is_favorite);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Could not update favorite');
    }
  }
);

export const updateBookProgress = createAsyncThunk(
  'books/updateBookProgress',
  async ({ olKey, progress }, { rejectWithValue }) => {
    try {
      const data = await bookApi.updateBookProgress(olKey, progress);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Could not update progress');
    }
  }
);

export const updateShelfOrder = createAsyncThunk(
  'books/updateShelfOrder',
  async (newOrderedList, { getState, rejectWithValue }) => {
    const oldItems = getState().books.items;
    try {
      const ordered_keys = newOrderedList.map((item) => item.ol_key);
      const data = await bookApi.updateShelfOrder(ordered_keys);
      return data;
    } catch (error) {
      return rejectWithValue({
        error: error.response?.data?.detail || 'Could not re-order shelf',
        oldItems: oldItems
      });
    }
  }
);

const booksSlice = createSlice({
  name: 'books',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    searchResults: [],
    searchStatus: 'idle',
  },
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShelf.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchShelf.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchShelf.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      .addCase(addBookToShelf.pending, (state, action) => {
        const newItem = action.meta.arg;
        const existingIndex = state.items.findIndex(
          (item) => item.ol_key === newItem.ol_key
        );
        if (existingIndex !== -1) {
          state.items[existingIndex] = newItem;
        } else {
          state.items.push(newItem);
        }
      })
      .addCase(addBookToShelf.fulfilled, (state, action) => {
        const newItem = action.payload;
        const existingIndex = state.items.findIndex(
          (item) => item.ol_key === newItem.ol_key
        );
        if (existingIndex !== -1) {
          state.items[existingIndex] = newItem;
        } else {
          state.items.push(newItem);
        }
      })
      .addCase(addBookToShelf.rejected, (state, action) => {
        state.items = action.payload.oldItems;
        state.error = action.payload.error;
      })
      
      .addCase(removeBookFromShelf.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.ol_key !== action.payload
        );
      })
      .addCase(updateBookFavorite.fulfilled, (state, action) => {
        const updatedItem = action.payload;
        const existingIndex = state.items.findIndex(
          (item) => item.ol_key === updatedItem.ol_key
        );
        if (existingIndex !== -1) {
          state.items[existingIndex] = updatedItem;
        }
      })
      
      .addCase(updateBookProgress.fulfilled, (state, action) => {
        const updatedItem = action.payload;
        const existingIndex = state.items.findIndex(
          (item) => item.ol_key === updatedItem.ol_key
        );
        if (existingIndex !== -1) {
          state.items[existingIndex] = updatedItem;
        }
      })
      
      .addCase(updateShelfOrder.pending, (state, action) => {
        state.items = action.meta.arg;
      })
      .addCase(updateShelfOrder.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(updateShelfOrder.rejected, (state, action) => {
        state.items = action.payload.oldItems;
        state.error = action.payload.error;
      })

      .addCase(searchOpenLibrary.pending, (state) => {
        state.searchStatus = 'loading';
      })
      .addCase(searchOpenLibrary.fulfilled, (state, action) => {
        state.searchStatus = 'succeeded';
        state.searchResults = action.payload;
      })
      .addCase(searchOpenLibrary.rejected, (state, action) => {
        state.searchStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearSearchResults } = booksSlice.actions;
export default booksSlice.reducer;