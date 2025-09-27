import { Mail } from 'lucide-react';
import { MOOD_CONFIG } from '@config/moods';

export const LetterViewer = ({ letter, onMarkAsOpened }) => {
  if (!letter) {
    // This can happen briefly while data is loading
    return <div className="text-center text-secondary">Loading letter...</div>;
  }
  
  // Mark as read when viewed
  if (letter.status === 'scheduled' && new Date(letter.targetDate) <= new Date()) {
    onMarkAsOpened(letter.uid);
  }

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const moodEmoji = MOOD_CONFIG[letter.moodKey]?.emoji || '💌';

  return (
    <article className="h-full flex flex-col rounded-2xl border border-secondary bg-background p-8 shadow-lg">
      <header className="mb-6 border-b border-border-color pb-6">
          <h1 className="text-2xl font-bold text-text-primary">{letter.subject || `A Letter ${letter.isSender ? "to " + letter.recipient : "from " + letter.sender}`}</h1>
          <p className="mt-2 text-sm text-secondary">
            {letter.isSender ? `Sent on ${formatDate(letter.createdAt)}` : `Received on ${formatDate(letter.createdAt)}`}
          </p>
      </header>

      <div className="prose prose-lg dark:prose-invert max-w-none text-text-primary font-body flex-grow overflow-y-auto">
        <p className="whitespace-pre-wrap">{letter.content}</p>
      </div>

      <footer className="mt-8 border-t border-secondary pt-6">
        <div className="flex items-center justify-between text-sm text-secondary">
          <div>
            <p>Mood when written: {moodEmoji}</p>
            <p>{letter.wordCount} words</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-text-primary">
              {letter.isSender ? 'Sincerely, You' : `With literary love,\n${letter.sender}`}
            </p>
          </div>
        </div>
      </footer>
    </article>
  );
};