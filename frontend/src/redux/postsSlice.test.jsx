// src/redux/postsSlice.test.js

import reducer, { fetchPosts, createPost } from './postsSlice';
import { describe, it, expect } from 'vitest';

describe('postsSlice', () => {
  const initialState = {
    posts: [],
    loading: false,
    error: null,
    createStatus: 'idle',
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  // FETCH POSTS

  it('should handle fetchPosts.pending', () => {
    const action = { type: fetchPosts.pending.type };
    const state = reducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
      loading: true,
      error: null,
    });
  });

  it('should handle fetchPosts.fulfilled', () => {
    const action = {
      type: fetchPosts.fulfilled.type,
      payload: [{ id: '1', title: 'Sample Post' }],
    };
    const state = reducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
      posts: [{ id: '1', title: 'Sample Post' }],
      loading: false,
    });
  });

  it('should handle fetchPosts.rejected', () => {
    const action = {
      type: fetchPosts.rejected.type,
      payload: 'Fetch failed',
    };
    const state = reducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
      loading: false,
      error: 'Fetch failed',
    });
  });

  // CREATE POST

  it('should handle createPost.pending', () => {
    const action = { type: createPost.pending.type };
    const state = reducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
      createStatus: 'loading',
      error: null,
    });
  });

  it('should handle createPost.fulfilled', () => {
    const newPost = { id: '2', title: 'New Post' };
    const action = { type: createPost.fulfilled.type, payload: newPost };
    const state = reducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
      createStatus: 'success',
      posts: [newPost],
    });
  });

  it('should handle createPost.rejected', () => {
    const action = {
      type: createPost.rejected.type,
      payload: 'Create failed',
    };
    const state = reducer(initialState, action);
    expect(state).toEqual({
      ...initialState,
      createStatus: 'error',
      error: 'Create failed',
    });
  });
});
