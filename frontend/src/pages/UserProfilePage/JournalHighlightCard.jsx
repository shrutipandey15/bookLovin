import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star } from 'lucide-react';

const JournalHighlightCard = ({ entry }) => {
  const entryDate = new Date(entry.creationTime * 1000).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  return (
    <Link 
      to={`/journal/edit/${entry.uid}`}
      className="block bg-card-background border border-border-color rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-secondary">{entryDate}</span>
        <div className="flex items-center gap-2 text-secondary">
          {entry.is_favorite && <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />}
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-text-primary truncate mb-2" title={entry.title}>
        {entry.title || "Untitled Entry"}
      </h3>
      
      <p className="text-sm text-secondary line-clamp-3 mb-4">
        {entry.content}
      </p>
      
      {entry.book_title && (
        <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 p-2 rounded-md">
          <BookOpen className="h-4 w-4" />
          <span className="truncate">About: {entry.book_title}</span>
        </div>
      )}
    </Link>
  );
};

export default JournalHighlightCard;