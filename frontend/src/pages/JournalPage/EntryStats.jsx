import { Clock, Hash, Calendar, Star } from 'lucide-react';
import { formatDate, formatTime } from '@utils/journalUtils';

const EntryStats = ({ entry, showDetailed = false }) => {
  if (showDetailed) {
    return (
      <div
        className="grid grid-cols-2 gap-4 p-4 rounded-lg"
        style={{
          backgroundColor: 'var(--mood-bg)',
          border: `1px solid var(--mood-secondary)`
        }}
      >
        <div className="flex items-center space-x-2 text-sm">
          <Hash
            className="w-4 h-4"
            style={{ color: 'var(--mood-secondary)' }}
          />
          <span style={{ color: 'var(--mood-text)' }}>
            {entry.word_count || 0} words
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Clock
            className="w-4 h-4"
            style={{ color: 'var(--mood-secondary)' }}
          />
          <span style={{ color: 'var(--mood-text)' }}>
            {formatTime(entry.writing_time || 0)}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Calendar
            className="w-4 h-4"
            style={{ color: 'var(--mood-secondary)' }}
          />
          <span style={{ color: 'var(--mood-text)' }}>
            Created {formatDate(entry.created_at)}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Star
            className="w-4 h-4"
            style={{ color: entry.favorite ? '#fbbf24' : 'var(--mood-secondary)' }}
            fill={entry.favorite ? 'currentColor' : 'none'}
          />
          <span style={{ color: 'var(--mood-text)' }}>
            {entry.favorite ? 'Favorited' : 'Not favorited'}
          </span>
        </div>
        {entry.tags && entry.tags.length > 0 && (
          <div className="col-span-2 flex flex-wrap gap-1">
            {entry.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full"
                style={{
                  backgroundColor: 'var(--mood-primary)',
                  color: 'var(--mood-contrast)',
                  opacity: 0.9
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-between text-xs"
      style={{ color: 'var(--mood-secondary)' }}
    >
      <div className="flex items-center space-x-3">
        <span>{entry.word_count || 0} words</span>
        <span>{formatTime(entry.writing_time || 0)}</span>
      </div>
      <span>{formatDate(entry.created_at)}</span>
    </div>
  );
};

export default EntryStats;
