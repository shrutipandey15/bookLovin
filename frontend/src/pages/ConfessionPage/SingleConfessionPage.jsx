import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSingleConfession } from '@redux/confessionSlice';
import { ArrowLeft } from 'lucide-react';
import { MOOD_CONFIG } from '@config/moods';

const SingleConfessionPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentConfession, status, error } = useSelector((state) => state.confessions);

  useEffect(() => {
    if (id) {
      dispatch(fetchSingleConfession(id));
    }
  }, [dispatch, id]);

  if (status === 'loading') {
    return <div className="flex h-screen items-center justify-center bg-background text-text-primary">Loading confession...</div>;
  }
  
  if (error || !currentConfession) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-red-500">
        Could not load confession. It might not exist.
        <button onClick={() => navigate('/confessions')} className="ml-4 underline">Go Back</button>
      </div>
    );
  }

  const moodColor = MOOD_CONFIG[currentConfession.moodKey]?.themes.dragon['--primary'] || '#9ca3af';

  return (
    <div className="mx-auto max-w-3xl p-8 font-body text-text-primary">
      <header className="mb-8">
        <button onClick={() => navigate('/confessions')} className="flex items-center space-x-2 text-secondary transition-colors hover:text-primary">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to the Confession Wall</span>
        </button>
      </header>
      
      <article className="rounded-2xl border bg-background p-8 shadow-lg" style={{ borderColor: moodColor }}>
        <p className="whitespace-pre-wrap text-lg leading-relaxed">{currentConfession.content}</p>
        <footer className="mt-8 border-t pt-4 text-right">
          <span className="text-base italic text-secondary">~ {currentConfession.soulName}</span>
        </footer>
      </article>
    </div>
  );
};

export default SingleConfessionPage;