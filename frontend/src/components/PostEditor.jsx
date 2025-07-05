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

  // CHANGED: Simplified state to just a single caption text
  const [captionText, setCaptionText] = useState('');

  // Fetch and populate data when editing a post
  useEffect(() => {
    if (isEditing && (!currentPost || currentPost.uid !== postId)) {
      dispatch(fetchSinglePost(postId));
    }
    if (isEditing && currentPost && currentPost.uid === postId) {
      // Use caption_text if it exists from the new model, otherwise fallback to old fields
      setCaptionText(currentPost.caption_text || currentPost.content);
    }
  }, [dispatch, isEditing, postId, currentPost]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const moodKey = Object.keys(moodConfig).find(key => moodConfig[key].enum === mood);
    
    // CHANGED: The payload now reflects our final 'Post' model for a text-only post
    const postData = {
      caption_text: captionText,
      moodKey,
      bookId: 'mockBookId123', // In a real app, you'd select a book
      mediaUrl: null, // Explicitly null for text-only posts
    };

    if (isEditing) {
      await dispatch(updatePost({ postId, postData }));
    } else {
      await dispatch(createPost(postData));
    }
    
    navigate('/posts'); // Or to the new unified feed page
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
        
        {/* CHANGED: Simplified form for just the reflection text */}
        <div>
          <label htmlFor="captionText" className="mb-1 block text-sm font-medium text-text-primary">Your Reflection</label>
          <textarea
            id="captionText" rows="8" value={captionText} onChange={(e) => setCaptionText(e.target.value)} required
            className="w-full resize-y rounded-md border border-secondary bg-background px-4 py-2 text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Share your thoughts, feelings, or a moment of reflection about a book..."
          />
        </div>

        <div className="flex gap-4 border-t border-secondary pt-6">
          <button
            type="submit"
            disabled={status === 'loading' || !captionText.trim()}
            className="rounded-md bg-primary px-6 py-2 text-text-contrast transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isEditing ? 'Update Post' : 'Share Post'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/posts')}
            className="rounded-md border border-primary px-6 py-2 text-primary transition-colors hover:bg-primary/10"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostEditor;