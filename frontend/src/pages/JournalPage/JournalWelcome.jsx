import { Feather } from 'lucide-react';

const JournalWelcome = ({ onNewEntry }) => (
  <div className="flex h-full flex-col items-center justify-center text-center px-8">
    <div className="mb-8 opacity-30">
      <Feather className="h-16 w-16 text-slate-400" strokeWidth={1} />
    </div>
    <p className="text-slate-500 text-lg font-light max-w-md leading-relaxed">
      Select an entry to read, or start writing something new.
    </p>
    <button
      onClick={onNewEntry}
      className="mt-10 text-sm text-slate-400 hover:text-slate-600 transition-colors"
    >
      Begin writing
    </button>
  </div>
);

export default JournalWelcome;
