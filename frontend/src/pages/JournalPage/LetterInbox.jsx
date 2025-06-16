import { Mail, Clock, Calendar, Lock, Trash2, Eye } from 'lucide-react';

export const LettersInbox = ({ letters, onViewLetter, onDeleteLetter }) => {
  const scheduledLetters = letters.filter(l => l.status === 'scheduled' && new Date(l.targetDate) > new Date());
  const readyLetters = letters.filter(l => l.status === 'scheduled' && new Date(l.targetDate) <= new Date());
  const openedLetters = letters.filter(l => l.status === 'opened' || l.type === 'past');

  const formatTimeUntil = (targetDateStr) => {
    const diffDays = Math.ceil((new Date(targetDateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return 'in 1 day';
    if (diffDays < 30) return `in ${diffDays} days`;
    if (diffDays < 365) return `in ${Math.floor(diffDays / 30)} months`;
    return `in ${Math.floor(diffDays / 365)} years`;
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const LetterItem = ({ letter, children, onClick }) => (
    <div
      key={letter._id}
      onClick={onClick}
      className="p-4 rounded-lg border group flex items-center justify-between cursor-pointer hover:border-opacity-80 transition-all"
      style={{ backgroundColor: 'var(--mood-contrast)', borderColor: 'var(--mood-secondary)' }}
    >
      <div className="flex items-center space-x-4">
        {children}
        <div>
          <h3 className="font-medium">Letter to {letter.type === 'future' ? 'Future' : 'Past'} Self</h3>
          <p className="text-sm" style={{ color: 'var(--mood-secondary)' }}>
            {letter.type === 'future' ? `Written on ${formatDate(letter.createdAt)}` : `About ${formatDate(letter.targetDate)}`}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm hidden sm:block" style={{ color: 'var(--mood-secondary)' }}>{letter.wordCount} words</span>
        <button onClick={(e) => { e.stopPropagation(); onDeleteLetter(letter._id); }} className="p-2 rounded-md opacity-0 group-hover:opacity-70 hover:!opacity-100 hover:bg-red-500/10 text-red-500 transition-opacity">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6" style={{ backgroundColor: 'var(--mood-bg)', color: 'var(--mood-text)', fontFamily: 'var(--mood-font)' }}>
      {/* Header removed for brevity, assuming it's in parent component */}

      {/* Ready to Open */}
      {readyLetters.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span>Ready to Open</span>
          </h2>
          <div className="space-y-3">
            {readyLetters.map((letter) => (
              <div key={letter._id} onClick={() => onViewLetter(letter)} className="p-4 rounded-lg border-l-4 cursor-pointer hover:opacity-80 transition-all" style={{ backgroundColor: 'var(--mood-contrast)', borderColor: 'var(--mood-primary)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">A letter is waiting for you!</h3>
                    <p className="text-sm" style={{ color: 'var(--mood-secondary)' }}>Written on {formatDate(letter.createdAt)}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm font-medium" style={{ color: 'var(--mood-primary)' }}>
                    <span>Open Now</span>
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Scheduled Letters */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Scheduled</h2>
        {scheduledLetters.length > 0 ? (
          <div className="space-y-3">
            {scheduledLetters.map((letter) => (
              <LetterItem key={letter._id} letter={letter} onClick={() => { /* Can't view scheduled letters */ }}>
                <Clock className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--mood-secondary)' }} />
              </LetterItem>
            ))}
          </div>
        ) : <p className="text-sm p-4 text-center rounded-lg" style={{ color: 'var(--mood-secondary)', backgroundColor: 'var(--mood-contrast)'}}>No scheduled letters.</p> }
      </section>

      {/* Opened Letters */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Collection</h2>
        {openedLetters.length > 0 ? (
          <div className="space-y-3">
            {openedLetters.map((letter) => (
              <LetterItem key={letter._id} letter={letter} onClick={() => onViewLetter(letter)}>
                <Eye className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--mood-secondary)' }} />
              </LetterItem>
            ))}
          </div>
        ) : <p className="text-sm p-4 text-center rounded-lg" style={{ color: 'var(--mood-secondary)', backgroundColor: 'var(--mood-contrast)'}}>Your opened letters will appear here.</p> }
      </section>

      {letters.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--mood-secondary)' }}>
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Your inbox is empty</h3>
          <p>Write a letter to your future or past self to get started.</p>
        </div>
      )}
    </div>
  );
};
