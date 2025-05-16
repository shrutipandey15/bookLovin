import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts } from '../redux/postsSlice';
import PostCard from '@components/PostCard';
import labels from '@constants/labels';
import { Link } from 'react-router-dom';

const Feed = () => {
  const dispatch = useDispatch();
  const { posts, loading, error } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

    if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-coffee-text dark:text-dragon-text text-xl italic">
        {labels.post.loading}
      </div>
    );
  }
    if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-coffee-error dark:text-red-500 text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-coffee-accent dark:border-dragon-card">
        <h1 className="text-4xl font-bold text-coffee-text dark:text-dragon-gold font-fantasy">
          {labels.post.feedTitle}
        </h1>
        <Link
          to="/posts/create"
          className="px-6 py-3 bg-coffee-button hover:bg-coffee-hover dark:bg-dragon-blue dark:hover:bg-dragon-blueHover text-white rounded-md font-medium transition-colors duration-300"
        >
          {labels.post.create}
        </Link>
      </header>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-coffee-text/70 dark:text-dragon-subtext text-xl italic">
          <p>{labels.post.noPostsMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
