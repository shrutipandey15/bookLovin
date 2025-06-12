// EntryCard.jsx
import { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { MOOD_CONFIG, MOOD_ENUM_TO_KEY, MOOD_ICONS } from '@components/MoodContext';
import EntryStats from './EntryStats';

const EntryCard = ({ entry, onEdit, onDelete, onToggleFavorite }) => {
  const [isHovered, setIsHovered] = useState(false);

  const moodKey = MOOD_ENUM_TO_KEY[entry.mood] || 'healing';
  const MoodIcon = MOOD_ICONS[moodKey];

  const handleCardClick = () => {
    onEdit(entry);
  };

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
      className="rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group relative p-6"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'var(--mood-contrast)',
        color: 'var(--mood-text)',
        fontFamily: 'var(--mood-font)',
        border: `1px solid var(--mood-secondary)`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {MoodIcon && (
            <MoodIcon
              className="w-5 h-5"
              style={{ color: 'var(--mood-primary)' }}
            />
          )}
          <span
            className="text-sm font-medium"
            style={{
              color: 'var(--mood-primary)',
              fontFamily: 'var(--mood-font)'
            }}
          >
            {MOOD_CONFIG[moodKey]?.label || moodKey}
          </span>
        </div>

        <div className={`flex items-center space-x-2 transition-opacity ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={handleFavoriteClick}
            className="p-1 rounded-full hover:bg-opacity-10 transition-colors"
            style={{
              color: entry.is_favorite ? '#fbbf24' : 'var(--mood-secondary)',
              backgroundColor: isHovered ? 'var(--mood-secondary)' : 'transparent'
            }}
            title={entry.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className="w-4 h-4" fill={entry.is_favorite ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-1 rounded-full hover:bg-opacity-10 transition-colors"
            style={{
              color: 'var(--mood-secondary)',
              backgroundColor: isHovered ? 'var(--mood-secondary)' : 'transparent'
            }}
            title="Delete entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {entry.title && (
        <h3
          className="font-semibold mb-2 line-clamp-2"
          style={{
            color: 'var(--mood-text)',
            fontFamily: 'var(--mood-font)'
          }}
        >
          {entry.title}
        </h3>
      )}

      <p
        className="text-sm mb-4 line-clamp-3 leading-relaxed"
        style={{ color: 'var(--mood-text)' }}
      >
        {entry.content}
      </p>

      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {entry.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs rounded-full"
              style={{
                backgroundColor: 'var(--mood-secondary)',
                color: 'var(--mood-contrast)',
                opacity: 0.8
              }}
            >
              #{tag}
            </span>
          ))}
          {entry.tags.length > 3 && (
            <span
              className="px-2 py-1 text-xs rounded-full"
              style={{
                backgroundColor: 'var(--mood-secondary)',
                color: 'var(--mood-contrast)',
                opacity: 0.6
              }}
            >
              +{entry.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      <EntryStats entry={entry} />

      <div
        className={`absolute inset-0 border-2 rounded-xl transition-all pointer-events-none ${
          isHovered ? 'border-opacity-50' : 'border-transparent'
        }`}
        style={{
          borderColor: isHovered ? 'var(--mood-primary)' : 'transparent'
        }}
      />
    </div>
  );
};

export default EntryCard;
