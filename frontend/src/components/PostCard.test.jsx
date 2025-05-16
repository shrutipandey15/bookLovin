import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PostCard from './PostCard';

describe('PostCard', () => {
  const post = {
    uid: '123',
    title: 'A Court of Thorns and Roses',
    content: 'Loved the world-building and fae lore!',
    imageUrl: 'https://example.com/image.jpg',
    likes: 42,
  };

  it('renders post title and content', () => {
    render(<PostCard post={post} />);
    expect(screen.getByText(post.title)).toBeInTheDocument();
    expect(screen.getByText(post.content)).toBeInTheDocument();
  });

  it('renders post likes', () => {
    render(<PostCard post={post} />);
    expect(screen.getByText(/likes: 42/i)).toBeInTheDocument();
    // expect(screen.getByText(`${post.likes}`)).toBeInTheDocument();
  });

  it('renders post image when imageUrl is provided', () => {
    render(<PostCard post={post} />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', post.imageUrl);
    expect(image).toHaveAttribute('alt', post.title);
  });

  it('does not render image if imageUrl is empty', () => {
    const postWithoutImage = { ...post, imageUrl: '' };
    render(<PostCard post={postWithoutImage} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
