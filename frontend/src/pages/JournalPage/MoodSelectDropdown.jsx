import { useState } from 'react';
import { Heart, Sparkles, Zap, ChevronDown } from 'lucide-react';
import { MOOD_CONFIG } from '@components/MoodContext';

const MoodSelectDropdown = ({ selectedMood, onMoodChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const moodIcons = {
    heartbroken: Heart,
    healing: Sparkles,
    empowered: Zap
  };

  // Map between backend enum values and frontend mood keys (consistent with enum_types)
  const moodMapping = {
    1: 'heartbroken', // HEARTBROKEN = 1
    2: 'healing',     // HEALING = 2
    3: 'empowered'    // EMPOWERED = 3 (fixed typo)
  };

  const reverseMoodMapping = {
    heartbroken: 1,
    healing: 2,
    empowered: 3
  };

  const currentMoodKey = moodMapping[selectedMood] || 'healing';
  const currentMood = MOOD_CONFIG[currentMoodKey];
  const CurrentIcon = moodIcons[currentMoodKey];

  const handleMoodSelect = (moodKey) => {
    onMoodChange(reverseMoodMapping[moodKey]);
    setIsOpen(false);
  };

  const moodDescriptions = {
    heartbroken: 'Processing difficult emotions',
    healing: 'Finding strength and growth',
    empowered: 'Feeling confident and strong'
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
        <CurrentIcon className="w-5 h-5" />
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
            {Object.entries(MOOD_CONFIG).map(([key, mood]) => {
              const Icon = moodIcons[key];
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
                  <span className="text-lg">{mood.emoji}</span>
                  <div>
                    <div
                      className="font-medium"
                      style={{ color: 'var(--mood-primary)' }}
                    >
                      {mood.label}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: 'var(--mood-secondary)' }}
                    >
                      {moodDescriptions[key]}
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
