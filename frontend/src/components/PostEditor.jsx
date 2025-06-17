import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost, updatePost, fetchSinglePost } from '@redux/postsSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { useMood } from '@components/MoodContext';

const PostEditor = () => {
  const { id: postId } = useParams();
  const isEditing = Boolean(postId);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { mood, moodConfig } = useMood();
  const { currentPost, status } = useSelector(state => state.posts);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Fetch data if in "edit" mode
  useEffect(() => {
    if (isEditing && (!currentPost || currentPost._id !== postId)) {
      dispatch(fetchSinglePost(postId));
    }
  }, [dispatch, isEditing, postId, currentPost]);
  
  // Populate form with fetched data when editing
  useEffect(() => {
    if (isEditing && currentPost && currentPost._id === postId) {
      setTitle(currentPost.title);
      setContent(currentPost.content);
      setImageUrl(currentPost.imageUrl || '');
    }
  }, [isEditing, currentPost, postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const moodKey = Object.keys(moodConfig).find(key => moodConfig[key].enum === mood);
    const postData = { title, content, imageUrl, moodKey };

    if (isEditing) {
      await dispatch(updatePost({ postId, postData }));
    } else {
      await dispatch(createPost(postData));
    }
    
    navigate('/posts');
  };
  
  const currentMoodLabel = moodConfig[Object.keys(moodConfig).find(key => moodConfig[key].enum === mood)]?.label || '...';
  
  return (
    <div className="mx-auto max-w-3xl min-h-screen p-4 font-body text-text-primary bg-background">
      <h1 className="mb-2 text-3xl font-bold text-primary">
        {isEditing ? 'Edit Reflection' : 'Share a Reflection'}
      </h1>
      <p className="mb-6 text-sm italic text-secondary">
        Writing in a {currentMoodLabel} mood
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-secondary bg-background p-6 shadow-md">
        
        {/* FIX: Re-integrated the missing form input fields */}
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-text-primary">Title</label>
          <input
            id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
            className="w-full rounded-md border border-secondary bg-background px-4 py-2 text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="A title for your thoughts..."
          />
        </div>
        <div>
          <label htmlFor="content" className="mb-1 block text-sm font-medium text-text-primary">Reflection</label>
          <textarea
            id="content" rows="6" value={content} onChange={(e) => setContent(e.target.value)} required
            className="w-full resize-y rounded-md border border-secondary bg-background px-4 py-2 text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Share your thoughts, feelings, or a moment of reflection..."
          />
        </div>
        <div>
          <label htmlFor="imageUrl" className="mb-1 block text-sm font-medium text-text-primary">Image URL (Optional)</label>
          <input
            id="imageUrl" type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
            className="w-full rounded-md border border-secondary bg-background px-4 py-2 text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="https://example.com/image.jpg"
          />
        </div>
        {/* End of fixed section */}

        <div className="flex gap-4 border-t border-secondary pt-6">
          <button
            type="submit"
            disabled={status === 'loading' || !title.trim() || !content.trim()}
            className="rounded-md bg-primary px-6 py-2 text-text-contrast transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'loading' ? 'Saving...' : (isEditing ? 'Update Reflection' : 'Share Reflection')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/posts')}
            className="rounded-md border border-primary px-6 py-2 text-primary transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostEditor;