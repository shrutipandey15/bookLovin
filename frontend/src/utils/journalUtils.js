const toDate = (dateValue) => {
  if (!dateValue) return null;
  if (dateValue instanceof Date) return dateValue;
  if (typeof dateValue === 'number') {
    return new Date(dateValue * 1000);
  }
  return new Date(dateValue);
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(toDate(date));
};

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

export const formatDateLong = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).format(toDate(date));
};

export const getWordCount = (text) => {
  if (!text || typeof text !== 'string' || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const calculateStats = (entries) => {
    const entriesByMood = entries.reduce((acc, entry) => {
    const key = entry.moodKey || 'unknown';
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key]++;
    return acc;
  }, {});

  return {
    totalEntries: entries.length,
    totalWords: entries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0),
    totalWritingTime: entries.reduce((sum, entry) => sum + (entry.writingTime || 0), 0),
    favoriteEntries: entries.filter(entry => entry.favorite).length,
    entriesByMood: entriesByMood,
  };
};