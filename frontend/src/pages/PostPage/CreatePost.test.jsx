import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import CreatePost from './CreatePost';
import store from '@redux/store';
import { vi } from 'vitest';
import * as postsSlice from '@redux/postsSlice';
import { MoodProvider } from '@components/MoodContext';

vi.mock('@redux/postsSlice', async () => {
  const actual = await vi.importActual('@redux/postsSlice');
  return {
    ...actual,
    createPost: vi.fn(() => () => Promise.resolve()),
  };
});

const renderWithProviders = (ui) =>
  render(
    <Provider store={store}>
      <BrowserRouter>
        <MoodProvider>
          {ui}
        </MoodProvider>
      </BrowserRouter>
    </Provider>
  );

describe('CreatePost', () => {
  it('renders form and submits post', async () => {
    renderWithProviders(<CreatePost />);

    const titleInput = screen.getByLabelText(/title/i);
    const contentInput = screen.getByLabelText(/content/i);
    const imageInput = screen.getByLabelText(/image url/i);
    const submitButton = screen.getByRole('button', { name: /publish/i });

    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(contentInput, { target: { value: 'Test Content' } });
    fireEvent.change(imageInput, { target: { value: 'https://image.com' } });
    fireEvent.click(submitButton);

    expect(postsSlice.createPost).toHaveBeenCalledWith({
      title: 'Test Title',
      content: 'Test Content',
      imageUrl: 'https://image.com',
    });
  });
});
