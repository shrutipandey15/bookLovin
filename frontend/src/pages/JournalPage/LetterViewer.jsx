import { useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { MOOD_CONFIG } from '@config/moods';

export const LetterViewer = ({ letter, onClose, onMarkAsOpened }) => {
  const [isRevealed, setIsRevealed] = useState(letter.status === 'opened' || letter.type === 'past');

  const handleReveal = () => {
    if (letter.type === 'future' && letter.status !== 'opened') {
      onMarkAsOpened(letter._id);
    }
    setIsRevealed(true);
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const moodEmoji = MOOD_CONFIG[letter.moodKey]?.emoji || '💙';

  return (
    <div className="mx-auto max-w-4xl min-h-screen p-6 text-text-primary font-body">
      <header className="mb-8 flex items-center justify-between">
        <button onClick={onClose} className="flex items-center space-x-2 text-text-primary transition-colors hover:opacity-80"><ArrowLeft className="h-5 w-5" /><span>Back to Inbox</span></button>
        <div className="flex items-center space-x-2 text-lg font-semibold text-primary"><Mail className="h-5 w-5" /><span>Letter {letter.type === 'future' ? 'from Your Past' : 'to Your Past'}</span></div>
      </header>

      <article className="rounded-2xl border border-secondary bg-background p-8 shadow-lg">
        <div className="mb-8 border-b border-secondary pb-8 text-center">
            <h1 className="text-2xl font-bold text-text-primary">{letter.type === 'future' ? 'A Message from Your Past Self' : 'A Message to Your Past Self'}</h1>
            <p className="mt-2 text-sm text-secondary">{letter.type === 'future' ? `Written on ${formatDate(letter.createdAt)}` : `Addressed to your ${formatDate(letter.targetDate)} self`}</p>
        </div>

        {!isRevealed && letter.type === 'future' ? (
          <div className="py-16 text-center">
            <div className="mb-6 inline-block rounded-full bg-background/50 p-8"><Mail className="h-16 w-16 text-primary" /></div>
            <h2 className="text-xl font-semibold mb-4 text-text-primary">Your Letter Has Arrived!</h2>
            <p className="mb-8 text-secondary">This message has been waiting for you. Are you ready to see what your past self had to say?</p>
            <button onClick={handleReveal} className="rounded-lg bg-primary px-8 py-3 font-medium text-text-contrast transition-opacity hover:opacity-90">Open Letter</button>
          </div>
        ) : (
          <div className="prose prose-lg dark:prose-invert max-w-none text-text-primary font-body">
            <p className="whitespace-pre-wrap">{letter.content}</p>
            <footer className="mt-12 border-t border-secondary pt-8">
              <div className="flex items-center justify-between text-sm text-secondary">
                <div><p>Mood: {moodEmoji}</p><p>{letter.wordCount} words</p></div>
                <div className="text-right"><p className="font-medium text-text-primary">{letter.type === 'future' ? 'Sincerely, Your Past Self' : 'With Wisdom, Your Future Self'}</p><p>{formatDate(letter.createdAt)}</p></div>
              </div>
            </footer>
          </div>
        )}
      </article>
    </div>
  );
};

export default LetterViewer;