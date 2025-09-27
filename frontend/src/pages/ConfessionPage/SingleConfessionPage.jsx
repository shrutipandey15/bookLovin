import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSingleConfession } from '@redux/confessionSlice';
import { X, Loader2 } from 'lucide-react';
import { MOOD_CONFIG } from '@config/moods';

const SingleConfessionPage = ({ confessionId, onClose }) => {
  const dispatch = useDispatch();

  const { currentConfession, status, error } = useSelector((state) => state.confessions);

  useEffect(() => {
    if (confessionId) {
      dispatch(fetchSingleConfession(confessionId));
    }
  }, [dispatch, confessionId]);

  // Handle clicks outside the modal to close it
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderModalContent = () => {
    if (status === 'loading') {
      return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
    }
    
    if (error || !currentConfession) {
      return (
        <div className="text-red-500">
          <p>Could not load confession. It might not exist.</p>
        </div>
      );
    }
  
    const moodColor = MOOD_CONFIG[currentConfession.moodKey]?.accents?.daydream?.primary || '#9ca3af';

    return (
      <div className="relative w-full max-w-2xl rounded-2xl bg-background p-8 shadow-2xl border" style={{ borderColor: moodColor }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-secondary transition-colors hover:text-primary">
            <X size={24} />
        </button>
        <article>
            <p className="whitespace-pre-wrap text-lg leading-relaxed text-text-primary">{currentConfession.content}</p>
            <footer className="mt-8 border-t border-border-color pt-4 text-right">
            <span className="text-base italic text-secondary">~ {currentConfession.soulName}</span>
            </footer>
        </article>
      </div>
    );
  };

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      {renderModalContent()}
    </div>
  );
};

export default SingleConfessionPage;