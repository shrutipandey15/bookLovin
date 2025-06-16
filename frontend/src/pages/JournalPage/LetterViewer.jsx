import { useState } from 'react';
import { ArrowLeft, Mail, Heart } from 'lucide-react';
import { MOOD_CONFIG } from '@components/MoodContext';

export const LetterViewer = ({ letter, onClose, onMarkAsOpened }) => {
  const [isRevealed, setIsRevealed] = useState(letter.status === 'opened' || letter.type === 'past');

  const handleReveal = () => {
    if (letter.type === 'future' && letter.status !== 'opened') {
      onMarkAsOpened(letter._id);
    }
    setIsRevealed(true);
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Rely on pre-calculated moodKey for simplicity and efficiency
  const moodEmoji = MOOD_CONFIG[letter.moodKey]?.emoji || '💙';

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen" style={{ backgroundColor: 'var(--mood-bg)', color: 'var(--mood-text)', fontFamily: 'var(--mood-font)' }}>
      <div className="flex items-center justify-between mb-8">
        <button onClick={onClose} className="flex items-center space-x-2 transition-colors hover:opacity-80" style={{ color: 'var(--mood-text)' }}>
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Inbox</span>
        </button>
        <div className="flex items-center space-x-2 text-lg font-semibold">
          <Mail className="w-5 h-5" style={{ color: 'var(--mood-primary)' }} />
          <span>Letter {letter.type === 'future' ? 'from Your Past' : 'to Your Past'}</span>
        </div>
      </div>

      <div className="rounded-2xl shadow-lg p-8" style={{ backgroundColor: 'var(--mood-contrast)', border: `1px solid var(--mood-secondary)` }}>
        {/* Header */}
        <div className="mb-8 text-center border-b pb-8" style={{borderColor: 'var(--mood-secondary)'}}>
            <h1 className="text-2xl font-bold">
              {letter.type === 'future' ? 'A Message from Your Past Self' : 'A Message to Your Past Self'}
            </h1>
          <div className="text-sm space-y-1 mt-2" style={{ color: 'var(--mood-secondary)' }}>
            <p>{letter.type === 'future' ? `Written on ${formatDate(letter.createdAt)}` : `Addressed to your ${formatDate(letter.targetDate)} self`}</p>
          </div>
        </div>

        {/* Content */}
        {!isRevealed && letter.type === 'future' ? (
          <div className="text-center py-16">
            <div className="inline-block p-8 rounded-full mb-6" style={{ backgroundColor: 'var(--mood-bg)' }}>
              <Mail className="w-16 h-16" style={{ color: 'var(--mood-primary)' }} />
            </div>
            <h2 className="text-xl font-semibold mb-4">Your Letter Has Arrived!</h2>
            <p className="mb-8" style={{ color: 'var(--mood-secondary)' }}>This message has been waiting for you. Are you ready to see what your past self had to say?</p>
            <button onClick={handleReveal} className="px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-all" style={{ backgroundColor: 'var(--mood-primary)', color: 'var(--mood-contrast)' }}>
              Open Letter
            </button>
          </div>
        ) : (
          <div className="prose max-w-none">
            <div className="text-lg leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--mood-text)', fontFamily: 'var(--mood-font)' }}>
              {letter.content}
            </div>
            {/* Footer */}
            <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--mood-secondary)' }}>
              <div className="flex items-center justify-between text-sm" style={{ color: 'var(--mood-secondary)' }}>
                <div>
                  <p>Mood: {moodEmoji}</p>
                  <p>{letter.wordCount} words</p>
                </div>
                <div className="text-right">
                  <p className="font-medium" style={{ color: 'var(--mood-text)' }}>
                    {letter.type === 'future' ? 'Sincerely, Your Past Self' : 'With Wisdom, Your Future Self'}
                  </p>
                  <p>{formatDate(letter.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
