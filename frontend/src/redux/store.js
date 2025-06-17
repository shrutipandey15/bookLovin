import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './postsSlice';
import confessionsReducer from './confessionSlice';

const store = configureStore({
  reducer: {
    posts: postsReducer,
    confessions: confessionsReducer,

  },
});

export default store;
