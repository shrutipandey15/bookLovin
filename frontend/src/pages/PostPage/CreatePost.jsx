import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createPost } from '@redux/postsSlice';
import { useNavigate } from 'react-router-dom';
import { useMood } from '@components/MoodContext';

const CreatePost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get mood context
  const { getMoodLabel } = useMood();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createPost({ title, content, imageUrl }));
    navigate('/posts');
  };

  return (
    <div
      className="max-w-3xl mx-auto p-4 min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: 'var(--mood-bg)',
        color: 'var(--mood-text)',
        fontFamily: 'var(--mood-font)'
      }}
    >
      <h1
        className="text-3xl font-bold mb-6"
        style={{
          color: 'var(--mood-primary)',
          fontFamily: 'var(--mood-font)'
        }}
      >
        Create a New Post
      </h1>

      {/* Optional mood indicator */}
      <p
        className="text-sm mb-4 italic"
        style={{ color: 'var(--mood-secondary)' }}
      >
        Writing in {getMoodLabel()} mood
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-6 rounded-2xl shadow-md transition-colors duration-300"
        style={{
          backgroundColor: 'var(--mood-contrast)',
          border: '1px solid var(--mood-primary)'
        }}
      >
        <div>
          <label
            htmlFor="title"
            className="block mb-1 text-sm font-medium"
            style={{
              color: 'var(--mood-text)',
              fontFamily: 'var(--mood-font)'
            }}
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors duration-200"
            style={{
              backgroundColor: 'var(--mood-bg)',
              color: 'var(--mood-text)',
              border: '1px solid var(--mood-secondary)',
              fontFamily: 'var(--mood-font)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--mood-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--mood-secondary)'}
            placeholder="Enter your post title..."
          />
        </div>

        <div>
          <label
            htmlFor="content"
            className="block mb-1 text-sm font-medium"
            style={{
              color: 'var(--mood-text)',
              fontFamily: 'var(--mood-font)'
            }}
          >
            Content
          </label>
          <textarea
            id="content"
            rows="5"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 resize-vertical"
            style={{
              backgroundColor: 'var(--mood-bg)',
              color: 'var(--mood-text)',
              border: '1px solid var(--mood-secondary)',
              fontFamily: 'var(--mood-font)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--mood-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--mood-secondary)'}
            placeholder="Share your thoughts..."
          />
        </div>

        <div>
          <label
            htmlFor="imageUrl"
            className="block mb-1 text-sm font-medium"
            style={{
              color: 'var(--mood-text)',
              fontFamily: 'var(--mood-font)'
            }}
          >
            Image URL
          </label>
          <input
            id="imageUrl"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors duration-200"
            style={{
              backgroundColor: 'var(--mood-bg)',
              color: 'var(--mood-text)',
              border: '1px solid var(--mood-secondary)',
              fontFamily: 'var(--mood-font)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--mood-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--mood-secondary)'}
            placeholder="https://example.com/image.jpg (optional)"
          />
          {imageUrl && (
            <div className="mt-2">
              <p
                className="text-xs mb-2"
                style={{ color: 'var(--mood-secondary)' }}
              >
                Image Preview:
              </p>
              <img
                src={imageUrl}
                alt="Preview"
                className="max-w-full h-32 object-cover rounded-md"
                style={{ border: '1px solid var(--mood-secondary)' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={!title.trim() || !content.trim()}
            className="px-6 py-2 rounded-md hover:opacity-80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: 'var(--mood-primary)',
              color: 'var(--mood-contrast)',
              fontFamily: 'var(--mood-font)',
              border: '1px solid var(--mood-primary)'
            }}
          >
            Publish
          </button>

          <button
            type="button"
            onClick={() => navigate('/posts')}
            className="px-6 py-2 rounded-md hover:opacity-80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--mood-primary)',
              fontFamily: 'var(--mood-font)',
              border: '1px solid var(--mood-primary)'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
