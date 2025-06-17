// This component is now styled entirely with Tailwind classes.
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { MOOD_CONFIG, MOOD_ENUM_TO_KEY, MOOD_KEY_TO_ENUM, MOOD_ICONS } from '@config/moods';

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
        className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:opacity-80 transition-all bg-background border-primary text-primary font-body"
      >
        {CurrentIcon && <CurrentIcon className="w-5 h-5" />}
        <span className="font-medium">{currentMood?.label || currentMoodKey}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-56 border rounded-lg shadow-lg z-20 bg-background border-secondary">
            {Object.entries(MOOD_CONFIG).map(([key, moodConfig]) => {
              const Icon = MOOD_ICONS[key];
              return (
                <button
                  key={key}
                  onClick={() => handleMoodSelect(key)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-primary/10 transition-colors text-left text-text-primary font-body ${currentMoodKey === key ? 'bg-primary/20' : ''}`}
                >
                  <span className="text-lg">{moodConfig.emoji}</span>
                  <div>
                    <div className="font-medium text-primary">{moodConfig.label}</div>
                    <div className="text-xs text-secondary">{moodConfig.description}</div>
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