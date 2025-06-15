import { MOOD_ENUM_TO_KEY } from '@components/MoodContext';

export const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date * 1000));
};

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

export const formatDateLong = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};

export const getWordCount = (text) => {
  if (!text || typeof text !== 'string' || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const calculateStats = (entries) => {
  const mappedEntries = entries.map(entry => ({
    ...entry,
    moodKey: MOOD_ENUM_TO_KEY[entry.mood] || 'healing'
  }));

  return {
    totalEntries: mappedEntries.length,
    totalWords: mappedEntries.reduce((sum, entry) => sum + (entry.word_count || 0), 0),
    totalWritingTime: mappedEntries.reduce((sum, entry) => sum + (entry.writing_time || 0), 0),
    favoriteEntries: mappedEntries.filter(entry => entry.favorite).length,
    entriesByMood: {
      heartbroken: mappedEntries.filter(entry => entry.moodKey === 'heartbroken').length,
      healing: mappedEntries.filter(entry => entry.moodKey === 'healing').length,
      empowered: mappedEntries.filter(entry => entry.moodKey === 'empowered').length
    },
  };
};
