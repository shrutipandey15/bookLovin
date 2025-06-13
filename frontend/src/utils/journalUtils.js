// journalUtils.js
import { MOOD_ENUM_TO_KEY } from '@components/MoodContext';

export const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
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
    streak: calculateWritingStreak(mappedEntries.map(entry => entry.created_at))
  };
};

const calculateWritingStreak = (entryDates) => {
  if (!entryDates || entryDates.length === 0) return 0;

  const uniqueDates = [...new Set(entryDates.map(dateStr => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }))].sort((a, b) => a - b);

  if (uniqueDates.length === 0) return 0;

  let streak = 0;
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  let yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const todayTimestamp = today.getTime();
  const yesterdayTimestamp = yesterday.getTime();

  const lastEntryDateTimestamp = uniqueDates[uniqueDates.length - 1];

  if (lastEntryDateTimestamp === todayTimestamp) {
    streak = 1;
  }
  else if (lastEntryDateTimestamp === yesterdayTimestamp) {
    streak = 1;
  }
  else {
    return 0;
  }

  for (let i = uniqueDates.length - 2; i >= 0; i--) {
    const currentDate = new Date(uniqueDates[i]);
    const nextExpectedDate = new Date(uniqueDates[i + 1]);
    nextExpectedDate.setDate(nextExpectedDate.getDate() - 1);

    if (currentDate.getTime() === nextExpectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};
