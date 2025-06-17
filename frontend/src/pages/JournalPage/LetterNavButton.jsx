import { Mail } from 'lucide-react';

export const LettersNavButton = ({ letterCount, hasReadyLetters, onClick }) => (
  <button
    onClick={onClick}
    className="relative flex items-center space-x-2 rounded-lg border border-secondary bg-background px-4 py-2 text-text-primary transition-colors hover:border-primary"
  >
    <Mail className="h-5 w-5" />
    <span>Letters</span>
    {letterCount > 0 && (
      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-text-contrast">
        {letterCount}
      </span>
    )}
    {hasReadyLetters && (
      <div className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-red-500" />
    )}
  </button>
);