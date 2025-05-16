// src/components/Feed.test.jsx

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Feed from '../Feed';
import thunk from 'redux-thunk';
import * as postsSlice from '../../redux/postsSlice';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('Feed component', () => {
  it('renders loading state initially', () => {
    const store = mockStore({
      posts: { posts: [], loading: true, error: null },
    });

    render(
      <Provider store={store}>
        <Feed />
      </Provider>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders posts when loaded', () => {
    const store = mockStore({
      posts: {
        posts: [{ title: 'Test Post', uid: '1', content: 'Sample', imageUrl: '', likes: 0 }],
        loading: false,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <Feed />
      </Provider>
    );

    expect(screen.getByText(/test post/i)).toBeInTheDocument();
  });

  it('renders error message on failure', () => {
    const store = mockStore({
      posts: { posts: [], loading: false, error: 'Failed to fetch' },
    });

    render(
      <Provider store={store}>
        <Feed />
      </Provider>
    );

    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
  });

  it('dispatches fetchPosts on mount', () => {
    const store = mockStore({
      posts: { posts: [], loading: false, error: null },
    });

    const fetchSpy = vi.spyOn(postsSlice, 'fetchPosts');

    render(
      <Provider store={store}>
        <Feed />
      </Provider>
    );

    expect(fetchSpy).toHaveBeenCalled();
  });
});
