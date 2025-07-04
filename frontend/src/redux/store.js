import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './postsSlice';
import confessionsReducer from './confessionSlice';
import journalReducer from './journalSlice';
import letterReducer from './letterSlice';
import booksReducer from './booksSlice';

const store = configureStore({
  reducer: {
    posts: postsReducer,
    confessions: confessionsReducer,
    journal: journalReducer,
    letter: letterReducer,
    books: booksReducer

  },
});

export default store;
