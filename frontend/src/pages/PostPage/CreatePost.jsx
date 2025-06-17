// import React, { useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { createPost } from '@redux/postsSlice';
// import { useNavigate } from 'react-router-dom';
// import { useMood } from '@components/MoodContext';

// const CreatePost = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // FIX: Correctly destructure 'mood' and 'moodConfig' from the hook
//   const { mood, moodConfig } = useMood();

//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [imageUrl, setImageUrl] = useState('');
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     // We might also dispatch the current moodKey with the post
//     const moodKey = Object.keys(moodConfig).find(key => moodConfig[key].enum === mood);
//     await dispatch(createPost({ title, content, imageUrl, moodKey }));
//     navigate('/posts');
//   };

//   // FIX: Derive the label from the state and config object
//   const currentMoodLabel = moodConfig[Object.keys(moodConfig).find(key => moodConfig[key].enum === mood)]?.label || '...';

//   return (
//     <div className="mx-auto max-w-3xl min-h-screen p-4 font-body text-text-primary bg-background transition-colors duration-300">
//       <h1 className="mb-2 text-3xl font-bold text-primary">Share a Reflection</h1>
//       <p className="mb-6 text-sm italic text-secondary">
//         Writing in a {currentMoodLabel} mood
//       </p>

//       <form
//         onSubmit={handleSubmit}
//         className="space-y-6 rounded-2xl border border-secondary bg-background p-6 shadow-md"
//       >
//         <div>
//           <label htmlFor="title" className="mb-1 block text-sm font-medium text-text-primary">
//             Title
//           </label>
//           <input
//             id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
//             className="w-full rounded-md border border-secondary bg-background px-4 py-2 text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
//             placeholder="A title for your thoughts..."
//           />
//         </div>

//         <div>
//           <label htmlFor="content" className="mb-1 block text-sm font-medium text-text-primary">
//             Reflection
//           </label>
//           <textarea
//             id="content" rows="6" value={content} onChange={(e) => setContent(e.target.value)} required
//             className="w-full resize-y rounded-md border border-secondary bg-background px-4 py-2 text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
//             placeholder="Share your thoughts, feelings, or a moment of reflection..."
//           />
//         </div>

//         <div>
//           <label htmlFor="imageUrl" className="mb-1 block text-sm font-medium text-text-primary">
//             Image URL (Optional)
//           </label>
//           <input
//             id="imageUrl" type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
//             className="w-full rounded-md border border-secondary bg-background px-4 py-2 text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
//             placeholder="https://example.com/image.jpg"
//           />
//         </div>

//         <div className="flex gap-4 border-t border-secondary pt-6">
//           <button
//             type="submit"
//             disabled={!title.trim() || !content.trim()}
//             className="rounded-md bg-primary px-6 py-2 text-text-contrast transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             Share Reflection
//           </button>
//           <button
//             type="button"
//             onClick={() => navigate('/posts')}
//             className="rounded-md border border-primary px-6 py-2 text-primary transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default CreatePost;