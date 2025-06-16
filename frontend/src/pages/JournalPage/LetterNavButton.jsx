import { Mail } from 'lucide-react';

export const LettersNavButton = ({ letterCount, hasReadyLetters, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:opacity-80 transition-all relative"
    style={{
      backgroundColor: 'var(--mood-contrast)',
      color: 'var(--mood-text)',
      border: `1px solid var(--mood-secondary)`
    }}
  >
    <Mail className="w-5 h-5" />
    <span>Letters</span>
    {letterCount > 0 && (
      <span
        className="px-2 py-1 text-xs rounded-full"
        style={{
          backgroundColor: 'var(--mood-primary)',
          color: 'var(--mood-contrast)'
        }}
      >
        {letterCount}
      </span>
    )}
    {hasReadyLetters && (
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
    )}
  </button>
);
