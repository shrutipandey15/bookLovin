// MoodSelectDropdown.jsx
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { MOOD_CONFIG, MOOD_ENUM_TO_KEY, MOOD_KEY_TO_ENUM, MOOD_ICONS } from '@components/MoodContext';

const MoodSelectDropdown = ({ selectedMood, onMoodChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentMoodKey = MOOD_ENUM_TO_KEY[selectedMood] || 'healing';
  const currentMood = MOOD_CONFIG[currentMoodKey];
  const CurrentIcon = MOOD_ICONS[currentMoodKey];

  const handleMoodSelect = (moodKey) => {
    onMoodChange(MOOD_KEY_TO_ENUM[moodKey]);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:opacity-80 transition-all"
        style={{
          backgroundColor: 'var(--mood-contrast)',
          borderColor: 'var(--mood-primary)',
          color: 'var(--mood-primary)',
          fontFamily: 'var(--mood-font)'
        }}
      >
        {CurrentIcon && <CurrentIcon className="w-5 h-5" />}
        <span className="font-medium">
          {currentMood?.label || currentMoodKey}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute top-full left-0 mt-2 w-48 border rounded-lg shadow-lg z-20"
            style={{
              backgroundColor: 'var(--mood-contrast)',
              borderColor: 'var(--mood-secondary)'
            }}
          >
            {Object.entries(MOOD_CONFIG).map(([key, moodConfig]) => {
              const Icon = MOOD_ICONS[key];
              const isSelected = currentMoodKey === key;

              return (
                <button
                  key={key}
                  onClick={() => handleMoodSelect(key)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 hover:opacity-80 transition-colors text-left ${
                    isSelected ? 'opacity-100' : 'opacity-70'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--mood-bg)' : 'transparent',
                    color: 'var(--mood-text)',
                    fontFamily: 'var(--mood-font)'
                  }}
                >
                  <span className="text-lg">{moodConfig.emoji}</span>
                  <div>
                    <div
                      className="font-medium"
                      style={{ color: 'var(--mood-primary)' }}
                    >
                      {moodConfig.label}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: 'var(--mood-secondary)' }}
                    >
                      {moodConfig.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default MoodSelectDropdown;
