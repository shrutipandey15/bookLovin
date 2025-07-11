import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecentPosts, fetchPopularPosts } from '@redux/postsSlice';
import { Link } from 'react-router-dom';
import PostCard from '@components/PostCard';

const FeedPage = () => {
  const dispatch = useDispatch();
  const [activeFeed, setActiveFeed] = useState('recent');

  const { recent, popular, status, error } = useSelector((state) => state.posts);
  const postsToShow = activeFeed === 'recent' ? recent : popular;

  useEffect(() => {
    if (activeFeed === 'recent') {
      dispatch(fetchRecentPosts());
    } else {
      dispatch(fetchPopularPosts());
    }
  }, [dispatch, activeFeed]);

  const renderContent = () => {
    if (status === 'loading') {
      return <div className="text-center text-secondary py-10">Loading reflections...</div>;
    }
    if (status === 'failed') {
      return <div className="text-center text-red-500 py-10">{error}</div>;
    }
    if (postsToShow.length === 0) {
      return <div className="text-center text-secondary py-16 italic">No reflections found here yet.</div>;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {postsToShow.map((post) => (
          <PostCard key={post.uid} post={post} />
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-body">
      <header className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-secondary pb-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Shared Reflections</h1>
          <p className="text-secondary">Discover what's resonating within the community.</p>
        </div>
        <Link
          to="/posts/new"
          className="rounded-lg bg-primary px-5 py-2 font-medium text-text-contrast transition-transform hover:scale-105"
        >
          Share a Thought
        </Link>
      </header>

      <div className="mb-8 flex border-b border-secondary">
        <button
          onClick={() => setActiveFeed('recent')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeFeed === 'recent' ? 'border-b-2 border-primary text-primary' : 'text-secondary hover:text-primary'}`}
        >
          For You
        </button>
        <button
          onClick={() => setActiveFeed('popular')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeFeed === 'popular' ? 'border-b-2 border-primary text-primary' : 'text-secondary hover:text-primary'}`}
        >
          Community Echoes
        </button>
      </div>

      {renderContent()}
    </div>
  );
};

export default FeedPage;
