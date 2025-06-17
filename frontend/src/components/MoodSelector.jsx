// src/components/MoodSelector.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useMood } from './MoodContext';
import { ChevronDown } from 'lucide-react';

const MoodSelector = () => {
  // Context provides everything we need
  const { mood, setMood, theme, moodConfig, moodIcons } = useMood();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const isDark = theme === 'dragon';

  // This click-outside logic is good, no changes needed.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectMood = (key) => {
    setMood(key);
    setIsOpen(false);
  };

  const currentMoodConfig = moodConfig[mood];
  const CurrentIcon = moodIcons[mood];

  return (
    <div className="mb-8 text-center">
      <div className="mb-4">
        {/* Using Tailwind classes now */}
        <h2 className="text-2xl font-bold mb-2 text-primary">
          How are you feeling?
        </h2>
        <p className="text-sm opacity-75 text-text-primary">
          {currentMoodConfig?.description}
        </p>
      </div>

      <div className="relative inline-block text-left max-w-xs w-full" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          // Styling is now much cleaner
          className="flex items-center justify-between w-full rounded-lg border-2 shadow-sm px-4 py-3 transition-all duration-300 hover:shadow-md border-primary text-text-primary"
          style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }} // A little inline style for transparency is okay
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-3">
            {CurrentIcon && <CurrentIcon size={24} className="text-primary" />}
            <span className="text-xl">{currentMoodConfig.emoji}</span>
            <span className="font-medium font-body">{currentMoodConfig.label}</span>
          </div>
          <ChevronDown
            size={20}
            className={`transition-transform duration-300 text-primary ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div
            className="absolute right-0 mt-2 w-full origin-top-right rounded-md shadow-lg z-30 overflow-y-auto max-h-60 bg-background border border-primary"
            role="menu"
          >
            <div className="p-1" role="none">
              {Object.entries(moodConfig).map(([key, config]) => {
                const IconComponent = moodIcons[key];
                const isSelected = mood === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectMood(key)}
                    className={`
                      w-full text-left p-3 rounded-md transition-all duration-200 
                      flex items-center gap-3 font-body
                      ${isSelected ? 'bg-primary text-text-contrast' : 'text-text-primary hover:bg-primary/10'}`
                    }
                    role="menuitem"
                  >
                    {IconComponent && <IconComponent size={20} />}
                    <span className="text-lg">{config.emoji}</span>
                    <span className="text-sm font-medium">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodSelector;