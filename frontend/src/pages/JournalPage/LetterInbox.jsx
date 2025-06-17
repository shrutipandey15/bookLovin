import { Mail, Clock, Eye, Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { deleteLetter } from '@redux/letterSlice';

export const LettersInbox = ({ letters, onViewLetter, onCompose }) => {
  const dispatch = useDispatch();
  const scheduledLetters = letters.filter(l => l.status === 'scheduled' && new Date(l.targetDate) > new Date());
  const readyLetters = letters.filter(l => l.status === 'scheduled' && new Date(l.targetDate) <= new Date());
  const openedLetters = letters.filter(l => l.status === 'opened' || l.type === 'past');
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const handleDelete = (e, letterId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this letter?")) {
      dispatch(deleteLetter(letterId));
    }
  };

  const LetterItem = ({ letter, icon, onClick }) => (
    <div onClick={onClick} className="group flex cursor-pointer items-center justify-between rounded-lg border border-secondary bg-background p-4 transition-all hover:border-primary hover:shadow-md">
      <div className="flex items-center space-x-4">
        <div className="text-secondary">{icon}</div>
        <div>
          <h3 className="font-medium text-text-primary">Letter to {letter.type === 'future' ? 'Future' : 'Past'} Self</h3>
          <p className="text-sm text-secondary">{letter.type === 'future' ? `Written on ${formatDate(letter.createdAt)}` : `About ${formatDate(letter.targetDate)}`}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className="hidden text-sm text-secondary sm:block">{letter.wordCount} words</span>
        <button onClick={(e) => handleDelete(e, letter._id)} className="rounded-md p-2 text-red-500 opacity-0 transition-opacity group-hover:opacity-70 hover:!opacity-100 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl p-6 bg-background text-text-primary font-body">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Letters</h1>
        <button onClick={onCompose} className="rounded-lg bg-primary px-5 py-2 font-medium text-text-contrast transition-transform hover:scale-105">Write New Letter</button>
      </header>

      {letters.length === 0 && (
        <div className="py-16 text-center text-secondary"><Mail className="mx-auto mb-4 h-12 w-12 opacity-50" /><h3 className="text-lg font-medium">Your inbox is empty</h3><p>Write a letter to get started.</p></div>
      )}

      {readyLetters.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 flex items-center space-x-2 text-lg font-semibold text-text-primary"><div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div><span>Ready to Open</span></h2>
          <div className="space-y-3">{readyLetters.map((letter) => (
              <div key={letter._id} onClick={() => onViewLetter(letter)} className="cursor-pointer rounded-lg border-l-4 border-primary bg-background p-4 shadow-lg transition-transform hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div><h3 className="font-medium text-text-primary">A letter is waiting for you!</h3><p className="text-sm text-secondary">Written on {formatDate(letter.createdAt)}</p></div>
                  <div className="flex items-center space-x-2 text-sm font-medium text-primary"><span>Open Now</span><Mail className="h-4 w-4" /></div>
                </div>
              </div>
          ))}</div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-text-primary">Scheduled</h2>
        {scheduledLetters.length > 0 ? <div className="space-y-3">{scheduledLetters.map((letter) => <LetterItem key={letter._id} letter={letter} icon={<Clock className="h-5 w-5" />} />)}</div> : <p className="rounded-lg bg-background/50 p-4 text-center text-sm text-secondary">No scheduled letters.</p>}
      </section>
      
      <section>
        <h2 className="text-lg font-semibold mb-4 text-text-primary">Collection</h2>
        {openedLetters.length > 0 ? <div className="space-y-3">{openedLetters.map((letter) => <LetterItem key={letter._id} letter={letter} icon={<Eye className="h-5 w-5" />} onClick={() => onViewLetter(letter)} />)}</div> : <p className="rounded-lg bg-background/50 p-4 text-center text-sm text-secondary">Your opened letters will appear here.</p>}
      </section>
    </div>
  );
};