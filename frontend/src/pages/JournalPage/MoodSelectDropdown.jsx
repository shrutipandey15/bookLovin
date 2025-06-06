import { useState } from 'react';
import { Heart, Sparkles, Zap, ChevronDown } from 'lucide-react';
import { useMood, MOOD_CONFIG } from '@components/MoodContext';

const MoodSelectDropdown = ({ selectedMood, onMoodChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const moodIcons = {
    heartbroken: Heart,
    healing: Sparkles,
    empowered: Zap
  };

  const currentMood = MOOD_CONFIG[selectedMood];
  const CurrentIcon = moodIcons[selectedMood];

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
          {currentMood?.label || selectedMood}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-48 border rounded-lg shadow-lg z-10"
          style={{
            backgroundColor: 'var(--mood-contrast)',
            borderColor: 'var(--mood-secondary)'
          }}
        >
          {Object.entries(MOOD_CONFIG).map(([key, mood]) => {
            const Icon = moodIcons[key];
            return (
              <button
                key={key}
                onClick={() => {
                  onMoodChange(key);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 hover:opacity-80 transition-colors text-left ${
                  selectedMood === key ? 'opacity-100' : 'opacity-70'
                }`}
                style={{
                  backgroundColor: selectedMood === key ? 'var(--mood-bg)' : 'transparent',
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
                    {key === 'heartbroken'}
                    {key === 'healing'}
                    {key === 'empowered'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MoodSelectDropdown;
