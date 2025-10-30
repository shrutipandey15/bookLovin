import React from 'react';

const ReadingBadge = ({ readingShelf }) => {
  const currentBook = readingShelf && readingShelf.length > 0 ? readingShelf[0] : null;

  if (!currentBook) {
    return null;
  }

  const coverUrl = currentBook.cover_id
    ? `https://covers.openlibrary.org/b/id/${currentBook.cover_id}-S.jpg`
    : `https://via.placeholder.com/32x48?text=No+Cover`;

  return (
    <div className="mt-4 flex justify-center items-center gap-2 p-2 bg-secondary/10 rounded-lg max-w-xs mx-auto">
      <img src={coverUrl} alt={currentBook.title} className="w-8 h-12 rounded-sm" />
      <div className="text-left">
        <p className="text-xs text-secondary italic">Currently lost in...</p>
        <p className="text-sm font-semibold text-text-primary truncate" title={currentBook.title}>
          {currentBook.title}
        </p>
      </div>
    </div>
  );
};

export default ReadingBadge;