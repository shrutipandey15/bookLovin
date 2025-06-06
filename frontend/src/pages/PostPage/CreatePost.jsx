import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createPost } from '@redux/postsSlice';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createPost({ title, content, imageUrl }));
    navigate('/posts');
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-coffee-text dark:text-dragon-gold">
        Create a New Post
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block mb-1 text-sm font-medium text-coffee-text dark:text-dragon-text">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="content" className="block mb-1 text-sm font-medium text-coffee-text dark:text-dragon-text">
            Content
          </label>
          <textarea
            id="content"
            rows="5"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className="block mb-1 text-sm font-medium text-coffee-text dark:text-dragon-text">
            Image URL
          </label>
          <input
            id="imageUrl"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        <button
          type="submit"
          className="bg-coffee-button dark:bg-dragon-blue hover:bg-coffee-hover dark:hover:bg-dragon-blueHover text-white px-6 py-2 rounded-md"
        >
          Publish
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
