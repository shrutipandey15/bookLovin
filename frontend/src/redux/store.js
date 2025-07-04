import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './postsSlice';
import confessionsReducer from './confessionSlice';
import journalReducer from './journalSlice';
import letterReducer from './letterSlice';

const store = configureStore({
  reducer: {
    posts: postsReducer,
    confessions: confessionsReducer,
    journal: journalReducer,
    letter: letterReducer

  },
});

export default store;
