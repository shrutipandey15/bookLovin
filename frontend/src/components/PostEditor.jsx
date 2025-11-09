import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '@redux/postsSlice';
import { useNavigate } from 'react-router-dom';
import { BiImageAdd, BiX } from 'react-icons/bi';

const PostEditor = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status } = useSelector(state => state.posts);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newFiles = [...files, ...selectedFiles].slice(0, 5);
    setFiles(newFiles);

    previews.forEach(URL.revokeObjectURL);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeImage = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setPreviews((prevPreviews) => {
      const newPreviews = prevPreviews.filter((_, i) => i !== index);
      URL.revokeObjectURL(prevPreviews[index]);
      return newPreviews;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    formData.append('title', title);
    formData.append('content', content);
    formData.append('links', JSON.stringify([]));
    
    files.forEach((file) => {
      formData.append('images', file);
    });
    await dispatch(createPost(formData));
    
    navigate('/feed'); 
  };
    
  return (
    <div className="mx-auto max-w-3xl p-4 font-body text-text-primary">
      <h1 className="mb-2 text-3xl font-bold text-primary">
        Share a New Post
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-secondary bg-card-background p-6 shadow-md backdrop-blur-md">
        
        {/* --- Title Field --- */}
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-text-primary">Title</label>
          <input
            type="text"
            id="title" value={title} onChange={(e) => setTitle(e.target.value)} required
            className="w-full rounded-md border border-secondary bg-background px-4 py-2 text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="A catchy title for your post..."
          />
        </div>

        <div>
          <label htmlFor="content" className="mb-1 block text-sm font-medium text-text-primary">Your Post</label>
          <textarea
            id="content" rows="8" value={content} onChange={(e) => setContent(e.target.value)} required
            className="w-full resize-y rounded-md border border-secondary bg-background px-4 py-2 text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Share your thoughts..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">Add Images (up to 5)</label>
          {/* Image Previews */}
          {previews.length > 0 && (
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative group aspect-square">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black"
                  >
                    <BiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* File Input Button */}
          <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-secondary p-4 justify-center text-text-primary hover:bg-background">
            <BiImageAdd size={24} />
            <span>{previews.length > 0 ? 'Add More Images' : 'Select Images'}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        <div className="flex gap-4 border-t border-secondary pt-6">
          <button
            type="submit"
            disabled={status === 'loading' || !content.trim() || !title.trim()}
            className="rounded-md bg-primary px-6 py-2 text-text-contrast transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Share Post
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
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