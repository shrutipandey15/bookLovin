import { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  BookOpen,
  Clock,
  Star,
  TrendingUp
} from 'lucide-react';
import { mockJournalEntries } from '@utils/journalMock';
import { calculateStats } from '@utils/journalUtils';
import { MOOD_CONFIG } from '@components/MoodContext';
import JournalEditor from './JournalEditor';
import EntryCard from './EntryCard';

const JournalPage = () => {
  const [entries, setEntries] = useState(mockJournalEntries);
  const [activeEntry, setActiveEntry] = useState(null);
  const [isWriting, setIsWriting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [moodFilter, setMoodFilter] = useState('all');

  const stats = calculateStats(entries);

  // Map mood enum values to keys for filtering
  const moodMapping = {
    1: 'heartbroken',
    2: 'healing',
    3: 'empowered'
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (entry.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMood = moodFilter === 'all' || entry.mood.toString() === moodFilter;
    return matchesSearch && matchesMood;
  });

  const handleNewEntry = () => {
    setActiveEntry(null);
    setIsWriting(true);
  };

  const handleEditEntry = (entry) => {
    setActiveEntry(entry);
    setIsWriting(true);
  };

  const handleSaveEntry = async (entryData) => {
    const now = new Date();

    if (activeEntry) {
      // Update existing entry
      setEntries(prev => prev.map(entry =>
        entry._id === activeEntry._id
          ? {
              ...entry,
              ...entryData,
              updated_at: now
            }
          : entry
      ));
    } else {
      // Create new entry
      const newEntry = {
        _id: Date.now().toString(),
        ...entryData,
        is_favorite: false,
        created_at: now,
        updated_at: now
      };
      setEntries(prev => [newEntry, ...prev]);
    }

    setIsWriting(false);
    setActiveEntry(null);
  };

  const handleDeleteEntry = (entryId) => {
    setEntries(prev => prev.filter(entry => entry._id !== entryId));
  };

  const handleToggleFavorite = (entryId) => {
    setEntries(prev => prev.map(entry =>
      entry._id === entryId
        ? { ...entry, is_favorite: !entry.is_favorite }
        : entry
    ));
  };

  const handleCancelEdit = () => {
    setIsWriting(false);
    setActiveEntry(null);
  };

  if (isWriting) {
    return (
      <JournalEditor
        entry={activeEntry}
        onSave={handleSaveEntry}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--mood-bg)',
        color: 'var(--mood-text)',
        fontFamily: 'var(--mood-font)'
      }}
    >
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                color: 'var(--mood-text)',
                fontFamily: 'var(--mood-font)'
              }}
            >
              My Journal
            </h1>
            <p style={{ color: 'var(--mood-secondary)' }}>
              Your private space for thoughts, feelings, and reflections
            </p>
          </div>

          <button
            onClick={handleNewEntry}
            className="px-6 py-3 rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center space-x-2"
            style={{
              backgroundColor: 'var(--mood-primary)',
              color: 'var(--mood-contrast)',
              fontFamily: 'var(--mood-font)'
            }}
          >
            <Plus className="w-5 h-5" />
            <span>New Entry</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div
          className="rounded-xl shadow-sm border p-6 mb-8"
          style={{
            backgroundColor: 'var(--mood-contrast)',
            borderColor: 'var(--mood-secondary)'
          }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-3 w-5 h-5"
                style={{ color: 'var(--mood-secondary)' }}
              />
              <input
                type="text"
                placeholder="Search your entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-transparent"
                style={{
                  borderColor: 'var(--mood-secondary)',
                  color: 'var(--mood-text)',
                  fontFamily: 'var(--mood-font)'
                }}
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter
                  className="w-5 h-5"
                  style={{ color: 'var(--mood-secondary)' }}
                />
                <select
                  value={moodFilter}
                  onChange={(e) => setMoodFilter(e.target.value)}
                  className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-transparent"
                  style={{
                    borderColor: 'var(--mood-secondary)',
                    color: 'var(--mood-text)',
                    fontFamily: 'var(--mood-font)'
                  }}
                >
                  <option value="all">All Moods</option>
                  {Object.keys(MOOD_CONFIG).map(mood => (
                    <option key={mood} value={mood}>
                      {mood.charAt(0).toUpperCase() + mood.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="px-4 py-3 border rounded-lg hover:opacity-80 transition-opacity flex items-center space-x-2"
                style={{
                  borderColor: 'var(--mood-secondary)',
                  color: 'var(--mood-secondary)'
                }}
              >
                <Download className="w-5 h-5" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div
            className="p-6 rounded-xl shadow-sm border"
            style={{
              backgroundColor: 'var(--mood-contrast)',
              borderColor: 'var(--mood-secondary)'
            }}
          >
            <div className="flex items-center space-x-3">
              <BookOpen
                className="w-8 h-8"
                style={{ color: 'var(--mood-primary)' }}
              />
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: 'var(--mood-text)' }}
                >
                  {stats.totalEntries}
                </p>
                <p
                  className="text-sm"
                  style={{ color: 'var(--mood-secondary)' }}
                >
                  Total Entries
                </p>
              </div>
            </div>
          </div>

          <div
            className="p-6 rounded-xl shadow-sm border"
            style={{
              backgroundColor: 'var(--mood-contrast)',
              borderColor: 'var(--mood-secondary)'
            }}
          >
            <div className="flex items-center space-x-3">
              <Clock
                className="w-8 h-8"
                style={{ color: 'var(--mood-primary)' }}
              />
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: 'var(--mood-text)' }}
                >
                  {stats.streak}
                </p>
                <p
                  className="text-sm"
                  style={{ color: 'var(--mood-secondary)' }}
                >
                  Day Streak
                </p>
              </div>
            </div>
          </div>

          <div
            className="p-6 rounded-xl shadow-sm border"
            style={{
              backgroundColor: 'var(--mood-contrast)',
              borderColor: 'var(--mood-secondary)'
            }}
          >
            <div className="flex items-center space-x-3">
              <Star
                className="w-8 h-8"
                style={{ color: 'var(--mood-primary)' }}
              />
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: 'var(--mood-text)' }}
                >
                  {stats.favorites}
                </p>
                <p
                  className="text-sm"
                  style={{ color: 'var(--mood-secondary)' }}
                >
                  Favorites
                </p>
              </div>
            </div>
          </div>

          <div
            className="p-6 rounded-xl shadow-sm border"
            style={{
              backgroundColor: 'var(--mood-contrast)',
              borderColor: 'var(--mood-secondary)'
            }}
          >
            <div className="flex items-center space-x-3">
              <TrendingUp
                className="w-8 h-8"
                style={{ color: 'var(--mood-primary)' }}
              />
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: 'var(--mood-text)' }}
                >
                  {stats.avgWordsPerEntry}
                </p>
                <p
                  className="text-sm"
                  style={{ color: 'var(--mood-secondary)' }}
                >
                  Avg Words
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Entries Grid */}
        <div className="space-y-6">
          {filteredEntries.length === 0 ? (
            <div
              className="text-center py-12 rounded-xl border"
              style={{
                backgroundColor: 'var(--mood-contrast)',
                borderColor: 'var(--mood-secondary)'
              }}
            >
              <BookOpen
                className="w-16 h-16 mx-auto mb-4 opacity-50"
                style={{ color: 'var(--mood-secondary)' }}
              />
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--mood-text)' }}
              >
                {searchTerm || moodFilter !== 'all' ? 'No entries found' : 'No entries yet'}
              </h3>
              <p style={{ color: 'var(--mood-secondary)' }}>
                {searchTerm || moodFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start your journaling journey by creating your first entry'
                }
              </p>
              {!searchTerm && moodFilter === 'all' && (
                <button
                  onClick={handleNewEntry}
                  className="mt-4 px-6 py-3 rounded-xl hover:opacity-90 transition-all"
                  style={{
                    backgroundColor: 'var(--mood-primary)',
                    color: 'var(--mood-contrast)'
                  }}
                >
                  Create First Entry
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEntries.map(entry => (
                <EntryCard
                  key={entry._id}
                  entry={entry}
                  onEdit={handleEditEntry}
                  onDelete={handleDeleteEntry}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalPage;
