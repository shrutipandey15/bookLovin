import { Star, Trash2 } from 'lucide-react';
import { MOOD_CONFIG, MOOD_ICONS } from '@config/moods';
import EntryStats from './EntryStats';

const EntryCard = ({ entry, onEdit, onDelete, onToggleFavorite }) => {
  const { moodKey = 'healing' } = entry;
  const MoodIcon = MOOD_ICONS[moodKey];

  return (
    <div
      onClick={() => onEdit(entry)}
      className="group relative flex flex-col cursor-pointer rounded-xl border border-secondary bg-card-background p-6 shadow-sm transition-all hover:border-primary hover:shadow-md font-body"
    >
      <div className="flex-grow">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex min-w-0 items-center space-x-2 pr-2">
            {MoodIcon && <MoodIcon className="h-5 w-5 flex-shrink-0 text-primary" />}
            <h3 className="flex-grow truncate text-lg font-semibold text-primary">{entry.title || 'Untitled Entry'}</h3>
          </div>
          <div className="flex items-center space-x-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(entry); }}
              className={`rounded-md p-1 transition-colors ${entry.favorite ? 'text-primary bg-primary/10 hover:bg-primary/20' : 'text-secondary hover:bg-secondary/10'}`}
            >
              <Star className={`h-5 w-5 ${entry.favorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(entry._id); }}
              className="rounded-md p-1 text-secondary transition-colors hover:bg-secondary/10"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        <p className="mb-4 text-sm leading-relaxed line-clamp-3 text-text-primary">{entry.content}</p>
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
