import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockBookService } from '@api/mockBookService'; // Import our new mock service

// --- ASYNC THUNKS ---

export const searchBooks = createAsyncThunk('books/search', async (query) => {
  const results = await mockBookService.search(query);
  return results;
});

export const fetchShelves = createAsyncThunk('books/fetchShelves', async () => {
    const shelves = await mockBookService.getShelves();
    return shelves;
});

export const addBookToShelf = createAsyncThunk('books/addToShelf', async ({ book, status }) => {
    const updatedShelves = await mockBookService.addToShelf(book, status);
    return updatedShelves;
});

// --- SLICE DEFINITION ---

const booksSlice = createSlice({
  name: 'books',
  initialState: {
    searchResults: [],
    userShelves: [],
    searchStatus: 'idle',
    shelfStatus: 'idle',
    error: null,
  },
  reducers: {
    clearSearchResults: (state) => {
        state.searchResults = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Search Books
      .addCase(searchBooks.pending, (state) => {
        state.searchStatus = 'loading';
      })
      .addCase(searchBooks.fulfilled, (state, action) => {
        state.searchStatus = 'succeeded';
        state.searchResults = action.payload;
      })
      .addCase(searchBooks.rejected, (state, action) => {
        state.searchStatus = 'failed';
        state.error = action.error.message;
      })
      // Fetch and Add to Shelves
      .addMatcher(
        (action) => action.type === fetchShelves.fulfilled.type || action.type === addBookToShelf.fulfilled.type,
        (state, action) => {
            state.shelfStatus = 'succeeded';
            state.userShelves = action.payload;
        }
      )
  },
});

export const { clearSearchResults } = booksSlice.actions;
export default booksSlice.reducer;