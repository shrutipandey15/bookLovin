import React from 'react';
import { useMood, MOOD_CONFIG } from './MoodContext';

const MoodSelector = () => {
  const { mood, setMood } = useMood();

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-6">
      {Object.entries(MOOD_CONFIG).map(([key, config]) => (
        <button
          key={key}
          onClick={() => setMood(key)}
          className={`px-5 py-2 rounded-full border transition-all duration-200 font-semibold ${
            mood === key ? 'bg-[var(--mood-primary)] text-white shadow' : 'bg-transparent text-[var(--mood-primary)]'
          }`}
          style={{ borderColor: 'var(--mood-primary)', fontFamily: 'var(--mood-font)' }}
          aria-pressed={mood === key}
        >
          <span className="mr-2">{config.emoji}</span>
          {config.label}
        </button>
      ))}
    </div>
  );
};

export default MoodSelector;
