import React from 'react';
import { BookOpen, Plus } from 'lucide-react';

const JournalWelcome = ({ onNewEntry }) => (
  <div className="flex h-full flex-col items-center justify-center text-center">
    <div className="animate-float">
      <BookOpen className="h-24 w-24 text-primary opacity-50" strokeWidth={1.5} />
    </div>
    <h2 className="mt-8 text-2xl font-bold text-text-primary">Your Journal is a Blank Page</h2>
    <p className="mt-2 text-secondary">Ready to write your first entry?</p>
    <button
      onClick={onNewEntry}
      className="mt-8 flex items-center space-x-2 whitespace-nowrap rounded-lg bg-primary px-6 py-3 text-text-contrast shadow-lg transition-transform hover:scale-105"
    >
      <Plus className="h-5 w-5" />
      <span>Start Journaling</span>
    </button>
  </div>
);

export default JournalWelcome;