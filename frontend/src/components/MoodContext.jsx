// src/components/MoodContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
// Import our new single source of truth
import { MOOD_CONFIG, THEME_CONFIG, MOOD_ICONS } from '@config/moods';

const MoodContext = createContext();

// Helper functions are now cleaner
const isValidMood = (mood) => mood in MOOD_CONFIG;
const isValidTheme = (theme) => theme in THEME_CONFIG;

export function MoodProvider({ children }) {
  const [mood, setMoodState] = useState("heartbroken"); // Default mood
  const [theme, setThemeState] = useState("coffee"); // Default theme

  // This effect is now the ONLY place we interact with the DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Set data-attributes for our CSS to pick up
    root.setAttribute('data-mood', mood);
    root.setAttribute('data-theme', theme);
    
    // Also manage the 'dark' class for Tailwind's darkMode: 'class'
    if (theme === 'dragon') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mood, theme]);

  const setMood = useCallback((newMood) => {
    if (isValidMood(newMood)) setMoodState(newMood);
  }, []);

  const setTheme = useCallback((newTheme) => {
    if (isValidTheme(newTheme)) setThemeState(newTheme);
  }, []);

  // The context value is simplified
  const value = useMemo(
    () => ({
      mood,
      theme,
      setMood,
      setTheme,
      moodConfig: MOOD_CONFIG, // Provide the whole config
      themeConfig: THEME_CONFIG,
      moodIcons: MOOD_ICONS
    }),
    [mood, theme, setMood, setTheme]
  );

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
}

export function useMood() {
  const context = useContext(MoodContext);
  if (!context) throw new Error("useMood must be used within a MoodProvider");
  return context;
}