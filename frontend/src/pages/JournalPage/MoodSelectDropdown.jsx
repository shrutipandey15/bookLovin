// src/pages/JournalPage/MoodSelectDropdown.jsx

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
// FIX: We no longer need the mappers here, simplifying the component.
import { MOOD_CONFIG, MOOD_ICONS } from '@config/moods';

const MoodSelectDropdown = ({ selectedMood, onMoodChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  // FIX 1: The `selectedMood` prop is now the string key itself (e.g., "healing").
  // We no longer need to convert it from a number. Default to "healing" if it's invalid.
  const currentMoodKey = selectedMood in MOOD_CONFIG ? selectedMood : 'healing';
  
  const currentMood = MOOD_CONFIG[currentMoodKey];
  const CurrentIcon = MOOD_ICONS[currentMoodKey];

  const handleMoodSelect = (moodKey) => {
    // FIX 2: Call onMoodChange directly with the selected string key.
    // The component no longer does any conversion.
    onMoodChange(moodKey);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:opacity-80 transition-all bg-background border-primary text-primary font-body"
      >
        {CurrentIcon && <CurrentIcon className="w-5 h-5" />}
        <span className="font-medium">{currentMood?.label}</span>
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
                  onClick={() => handleMoodSelect(key)} // This now correctly passes the string key
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