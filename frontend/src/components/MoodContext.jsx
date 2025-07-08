import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { MOOD_CONFIG } from '@config/moods'; 

const MoodContext = createContext();

export function MoodProvider({ children }) {
  const [mood, setMood] = useState("healing");

  useEffect(() => {
    document.documentElement.setAttribute('data-mood', mood);
  }, [mood]);

  const setMoodCallback = useCallback((newMood) => {
    if (MOOD_CONFIG[newMood]) {
      setMood(newMood);
    }
  }, []);

  const value = useMemo(
    () => ({
      mood,
      setMood: setMoodCallback,
      moodConfig: MOOD_CONFIG,
    }),
    [mood, setMoodCallback]
  );

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
}

export function useMood() {
  const context = useContext(MoodContext);
  if (!context) throw new Error("useMood must be used within a MoodProvider");
  return context;
}