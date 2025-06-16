import { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { MOOD_CONFIG, MOOD_ICONS } from '@components/MoodContext';
import EntryStats from './EntryStats';

const EntryCard = ({ entry, onEdit, onDelete, onToggleFavorite }) => {
  const [isHovered, setIsHovered] = useState(false);

  // moodKey is now directly on the entry object
  const { moodKey = 'healing' } = entry;
  const MoodIcon = MOOD_ICONS[moodKey];

  const handleCardClick = () => onEdit(entry);
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(entry._id);
  };
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(entry._id);
  };

  return (
    <div
      className="rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group relative p-6 flex flex-col"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ backgroundColor: 'var(--mood-contrast)', color: 'var(--mood-text)', fontFamily: 'var(--mood-font)', border: `1px solid var(--mood-secondary)` }}
    >
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2 min-w-0 pr-2">
            {MoodIcon && <MoodIcon className="w-5 h-5 flex-shrink-0" style={{ color: MOOD_CONFIG[moodKey]?.color || 'var(--mood-primary)' }} />}
            <h3 className="text-lg font-semibold truncate flex-grow" style={{ color: 'var(--mood-primary)' }}>{entry.title || 'Untitled Entry'}</h3>
          </div>

          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button onClick={handleFavoriteClick} className="p-1 rounded-md hover:bg-opacity-20 transition-colors" style={{ color: entry.favorite ? 'var(--mood-primary)' : 'var(--mood-secondary)', backgroundColor: entry.favorite ? 'var(--mood-primary-rgb) / 0.1' : 'transparent' }}>
              <Star className={`w-5 h-5 ${entry.favorite ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleDeleteClick} className="p-1 rounded-md hover:bg-opacity-20 transition-colors" style={{ backgroundColor: 'transparent', color: 'var(--mood-secondary)' }}>
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <p className="text-sm mb-4 line-clamp-3 leading-relaxed" style={{ color: 'var(--mood-text)' }}>{entry.content}</p>

        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {entry.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'var(--mood-secondary)', color: 'var(--mood-contrast)', opacity: 0.8 }}>#{tag}</span>
            ))}
            {entry.tags.length > 3 && (
              <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'var(--mood-secondary)', color: 'var(--mood-contrast)', opacity: 0.6 }}>+{entry.tags.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto">
        <EntryStats entry={entry} />
      </div>

      <div
        className={`absolute inset-0 border-2 rounded-xl transition-all pointer-events-none ${isHovered ? 'border-opacity-50' : 'border-transparent'}`}
        style={{ borderColor: isHovered ? 'var(--mood-primary)' : 'transparent' }}
      ></div>
    </div>
  );
};

export default EntryCard;
