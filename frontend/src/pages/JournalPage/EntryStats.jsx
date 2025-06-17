import { Clock, Hash, Calendar, Star } from 'lucide-react';
import { formatDate, formatTime } from '@utils/journalUtils';

// This component is now styled entirely with Tailwind classes.
const EntryStats = ({ entry, showDetailed = false }) => {
  if (showDetailed) {
    return (
      <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-background border border-secondary">
        <div className="flex items-center space-x-2 text-sm text-text-primary">
          <Hash className="w-4 h-4 text-secondary" />
          <span>{entry.wordCount || 0} words</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-text-primary">
          <Clock className="w-4 h-4 text-secondary" />
          <span>{formatTime(entry.writingTime || 0)}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-text-primary">
          <Calendar className="w-4 h-4 text-secondary" />
          <span>Created {formatDate(entry.createdAt)}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-text-primary">
          <Star className={`w-4 h-4 ${entry.favorite ? 'text-yellow-400' : 'text-secondary'}`} fill={entry.favorite ? 'currentColor' : 'none'} />
          <span>{entry.favorite ? 'Favorited' : 'Not favorited'}</span>
        </div>
        {entry.tags?.length > 0 && (
          <div className="col-span-2 flex flex-wrap gap-1">
            {entry.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 text-xs rounded-full bg-primary text-text-contrast opacity-90">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between text-xs text-secondary">
      <div className="flex items-center space-x-3">
        <span>{entry.wordCount || 0} words</span>
        <span>{formatTime(entry.writingTime || 0)}</span>
      </div>
      <span>{formatDate(entry.createdAt)}</span>
    </div>
  );
};

export default EntryStats;