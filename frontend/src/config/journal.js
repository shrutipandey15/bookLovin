export const FONTS = [
  { id: 'serif', label: 'Bookish', fontFamily: 'Georgia, serif', description: 'Default' },
  { id: 'handwritten', label: 'Soft', fontFamily: "'Caveat', cursive", description: 'Gentle' },
  { id: 'mono', label: 'Raw', fontFamily: "'JetBrains Mono', monospace", description: 'Unfiltered' },
  { id: 'sans', label: 'Plain', fontFamily: 'system-ui, sans-serif', description: 'Minimal' },
];

export const PAPERS = [
  { id: 'warm', label: 'Warm', bg: 'bg-amber-50/40', border: 'border-amber-200/30' },
  { id: 'soft', label: 'Soft', bg: 'bg-gradient-to-br from-rose-50/30 to-violet-50/30', border: 'border-rose-200/20' },
  { id: 'ruled', label: 'Lined', bg: 'bg-slate-50/30', border: 'border-slate-200/40', lined: true },
  { id: 'dark', label: 'Night', bg: 'bg-slate-900/95', border: 'border-slate-700/50', dark: true },
];

export const STRUCTURES = [
  { id: 'free', label: 'Free', placeholder: '' },
  { id: 'fragments', label: 'Fragments', placeholder: '', separator: '· · ·' },
  { id: 'echo', label: 'Reading echo', placeholder: '', bookFocused: true },
  { id: 'timed', label: 'Timed', placeholder: '', showTimestamp: true },
];

export const MOODS = [
  { id: null, emoji: '·', color: 'transparent' },
  { id: 'light', emoji: '○', color: '#fef3c7' },
  { id: 'heavy', emoji: '●', color: '#6366f1' },
  { id: 'tangled', emoji: '∿', color: '#a855f7' },
  { id: 'sharp', emoji: '△', color: '#ef4444' },
  { id: 'soft', emoji: '◠', color: '#10b981' },
  { id: 'still', emoji: '—', color: '#94a3b8' },
];

export const getFont = (id) => FONTS.find(f => f.id === id) || FONTS[0];
export const getPaper = (id) => PAPERS.find(p => p.id === id) || PAPERS[0];
export const getStructure = (id) => STRUCTURES.find(s => s.id === id) || STRUCTURES[0];
export const getMood = (id) => MOODS.find(m => m.id === id) || MOODS[0];

export const JOURNAL_PREFS_KEY = 'booklovin_journal_prefs';

export const getJournalPrefs = () => {
  try {
    const stored = localStorage.getItem(JOURNAL_PREFS_KEY);
    return stored ? JSON.parse(stored) : { font: 'serif', paper: 'warm', structure: 'free' };
  } catch {
    return { font: 'serif', paper: 'warm', structure: 'free' };
  }
};

export const saveJournalPrefs = (prefs) => {
  try {
    localStorage.setItem(JOURNAL_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Silent fail - preferences are nice-to-have
  }
};
