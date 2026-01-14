import { Star, Trash2, Book } from 'lucide-react';
import EntryStats from './EntryStats';
import { getMood } from '@config/journal';

const EntryCard = ({ entry, onEdit, onDelete, onToggleFavorite }) => {
  const mood = entry.mood ? getMood(entry.mood) : null;
  const linkedBooks = entry.linked_books || [];

  // Strip HTML tags for preview
  const getPlainText = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  return (
    <div
      onClick={() => onEdit(entry)}
      className="group relative flex flex-col cursor-pointer rounded-xl border border-secondary bg-card-background p-6 shadow-sm transition-all hover:border-primary hover:shadow-md font-body"
    >
      <div className="flex-grow">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex min-w-0 items-center gap-2 pr-2">
            {/* Mood indicator - abstract symbol */}
            {mood && (
              <span
                className="flex-shrink-0 text-base opacity-70"
                style={{ color: mood.color }}
                title={mood.id || 'mood'}
              >
                {mood.emoji}
              </span>
            )}
            <h3 className="flex-grow truncate text-lg font-semibold text-primary">
              {entry.title || 'Untitled Entry'}
            </h3>
          </div>
          <div className="flex items-center space-x-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(entry); }}
              className={`rounded-md p-1 transition-colors ${entry.favorite ? 'text-primary bg-primary/10 hover:bg-primary/20' : 'text-secondary hover:bg-secondary/10'}`}
            >
              <Star className={`h-5 w-5 ${entry.favorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(entry.uid); }}
              className="rounded-md p-1 text-secondary transition-colors hover:bg-secondary/10"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Linked Books */}
        {linkedBooks.length > 0 && (
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            <Book className="w-4 h-4 text-text-secondary flex-shrink-0" />
            {linkedBooks.slice(0, 2).map((book) => (
              <span
                key={book.book_id}
                className="flex items-center gap-1 px-2 py-0.5 bg-secondary/20 rounded-full text-xs text-text-secondary"
              >
                {book.cover_url && (
                  <img
                    src={book.cover_url}
                    alt=""
                    className="w-3 h-4 object-cover rounded-sm"
                  />
                )}
                <span className="max-w-[100px] truncate">{book.title}</span>
              </span>
            ))}
            {linkedBooks.length > 2 && (
              <span className="text-xs text-text-secondary">
                +{linkedBooks.length - 2} more
              </span>
            )}
          </div>
        )}

        <p className="mb-4 text-sm leading-relaxed line-clamp-3 text-text-primary">
          {getPlainText(entry.content)}
        </p>

        {entry.tags?.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {entry.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="rounded-full bg-secondary/80 px-2 py-1 text-xs text-text-contrast">#{tag}</span>
            ))}
            {entry.tags.length > 3 && (
              <span className="rounded-full bg-secondary/60 px-2 py-1 text-xs text-text-contrast">+{entry.tags.length - 3} more</span>
            )}
          </div>
        )}
      </div>
      <div className="mt-auto">
        <EntryStats entry={entry} />
      </div>
    </div>
  );
};

export default EntryCard;
