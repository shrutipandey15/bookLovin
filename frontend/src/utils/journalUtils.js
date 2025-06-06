export const formatDate = (date) => {
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
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};

export const getWordCount = (text) => {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const calculateStats = (entries) => {
  return {
    totalEntries: entries.length,
    totalWords: entries.reduce((sum, entry) => sum + entry.word_count, 0),
    totalWritingTime: entries.reduce((sum, entry) => sum + entry.writing_time, 0),
    favoriteEntries: entries.filter(entry => entry.is_favorite).length,
    entriesByMood: {
      heartbroken: entries.filter(entry => entry.mood === 'heartbroken').length,
      healing: entries.filter(entry => entry.mood === 'healing').length,
      empowered: entries.filter(entry => entry.mood === 'empowered').length
    }
  };
};

export const moods = {
  heartbroken: {
    name: 'Heartbroken',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    theme: 'from-rose-100 to-pink-50',
    gradient: 'from-rose-500 to-pink-500'
  },
  healing: {
    name: 'Healing',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    theme: 'from-purple-100 to-violet-50',
    gradient: 'from-purple-500 to-violet-500'
  },
  empowered: {
    name: 'Empowered',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    theme: 'from-amber-100 to-yellow-50',
    gradient: 'from-amber-500 to-yellow-500'
  }
};
