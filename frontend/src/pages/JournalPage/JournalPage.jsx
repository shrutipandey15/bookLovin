import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  BookOpen,
  Clock,
  Star,
  TrendingUp,
  Award,
  Flame
} from 'lucide-react';
import { MOOD_CONFIG, MOOD_KEY_TO_ENUM } from '@components/MoodContext';
import { calculateStats, getWordCount } from '@utils/journalUtils';
import JournalEditor from './JournalEditor';
import EntryCard from './EntryCard';
import axiosInstance from '@api/axiosInstance';
import ConfirmModal from '@components/ConfirmModal';

const JournalPage = () => {
  const [entries, setEntries] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [isWriting, setIsWriting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [moodFilter, setMoodFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editorError, setEditorError] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [entryToDeleteId, setEntryToDeleteId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (moodFilter !== 'all') {
        const backendMoodValue = MOOD_KEY_TO_ENUM[moodFilter];
        if (backendMoodValue !== undefined) {
          params.mood = backendMoodValue;
        }
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await axiosInstance.get('/journal', { params });

      const data = response.data;

      const formattedEntries = data.map(entry => ({
        ...entry,
        _id: entry.uid,
        writing_time: entry.writingTime,
        favorite: entry.favorite,
        word_count: getWordCount(entry.description),
        created_at: entry.created_at,
        updated_at: entry.updated_at,
      }));
      setEntries(formattedEntries);
    } catch (err) {
      console.error("Failed to fetch entries:", err);
      setError(err.response?.data?.detail || "Failed to load journal entries. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [moodFilter, searchTerm]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      setUserProfile(response.data.data);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
    fetchUserProfile();
  }, [fetchEntries, fetchUserProfile]);

  const stats = calculateStats(entries);
  const getStreakMessage = (currentStreak) => {
    if (currentStreak === 0) return "Start a streak today!";
    if (currentStreak === 1) return "Keep it up!";
    if (currentStreak >= 7) return "You're on fire!";
    if (currentStreak > 1) return `Keep the momentum going!`;
    return "";
  };

  const displayEntries = entries;


  const handleNewEntry = useCallback(() => {
    setActiveEntry(null);
    setIsWriting(true);
  }, []);

  const handleEditEntry = useCallback((entry) => {
    setActiveEntry(entry);
    setIsWriting(true);
  }, []);

  const handleSaveEntry = useCallback(async (entryData) => {
    setEditorError(null);
    try {
      const payload = {
        title: entryData.title,
        content: entryData.content,
        mood: entryData.mood,
        writingTime: entryData.writing_time,
        tags: entryData.tags,
        favorite: entryData.favorite,
        wordCount: entryData.word_count
      };

      if (activeEntry) {
        await axiosInstance.put(`/journal/${activeEntry._id}`, payload);
      } else {
        await axiosInstance.post('/journal/', payload);
      }

      await fetchEntries();
      await fetchUserProfile();

      setIsWriting(false);
      setActiveEntry(null);
    } catch (err) {
      console.error("Error saving entry:", err);
      setEditorError(err.response?.data?.detail || "Failed to save entry. Please try again.");
    }
  }, [activeEntry, fetchEntries, fetchUserProfile]);

  const handleDeleteEntry = useCallback(async (entryId) => {
    setShowConfirmModal(false);
    setEntryToDeleteId(null);
    setError(null);
    try {
      await axiosInstance.delete(`/journal/${entryId}`);
      setEntries(prev => prev.filter(entry => entry._id !== entryId));
      await fetchUserProfile();
    } catch (err) {
      console.error("Error deleting entry:", err);
      setError(err.response?.data?.detail || "Failed to delete entry. Please try again.");
    }
  }, [fetchUserProfile]);

  const handleToggleFavorite = useCallback(async (entryId) => {
    setError(null);
    try {
      const entryToToggle = entries.find(entry => entry._id === entryId);
      if (!entryToToggle) return;

      const updatedFavoriteStatus = !entryToToggle.favorite;
      const payload = {
        favorite: updatedFavoriteStatus
      };

      await axiosInstance.put(`/journal/${entryId}`, payload);

      setEntries(prev => prev.map(entry =>
        entry._id === entryId
          ? { ...entry, favorite: updatedFavoriteStatus }
          : entry
      ));
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setError(err.response?.data?.detail || "Failed to toggle favorite status. Please try again.");
    }
  }, [entries]);

  const handleCancelEdit = useCallback(() => {
    setIsWriting(false);
    setActiveEntry(null);
    setEditorError(null);
  }, []);

  const confirmDelete = useCallback((entryId) => {
    setEntryToDeleteId(entryId);
    setShowConfirmModal(true);
  }, []);

  if (isWriting) {
    return (
      <JournalEditor
        entry={activeEntry}
        onSave={handleSaveEntry}
        onCancel={handleCancelEdit}
        error={editorError}
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
                  {Object.keys(MOOD_CONFIG).map(moodKey => (
                    <option key={moodKey} value={moodKey}>
                      {MOOD_CONFIG[moodKey].label}
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

        {isLoading && <div className="text-center py-8" style={{ color: 'var(--mood-secondary)' }}>Loading entries...</div>}
        {error && <div className="text-center py-8 text-red-500">{error}</div>}

        {!isLoading && !error && (
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

            {userProfile && (
              <div
                className="p-6 rounded-xl shadow-sm border"
                style={{
                  backgroundColor: 'var(--mood-contrast)',
                  borderColor: 'var(--mood-secondary)'
                }}
              >
                <div className="flex items-center space-x-3">
                  {userProfile.current_streak > 0 ? (
                    <Flame
                      className="w-8 h-8 animate-pulse"
                      style={{ color: 'var(--mood-primary)' }}
                    />
                  ) : (
                    <Clock // Use clock when no streak
                      className="w-8 h-8"
                      style={{ color: 'var(--mood-secondary)' }}
                    />
                  )}
                  <div>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: 'var(--mood-text)' }}
                    >
                      {userProfile.current_streak}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--mood-secondary)' }}
                    >
                      Day Streak
                    </p>
                  </div>
                </div>
                {/* Motivational Message */}
                <p
                  className="text-xs mt-3 text-center"
                  style={{ color: 'var(--mood-primary)' }}
                >
                  {getStreakMessage(userProfile.current_streak)}
                </p>
              </div>
            )}

            {userProfile && ( // Only render if userProfile is loaded
              <div
                className="p-6 rounded-xl shadow-sm border"
                style={{
                  backgroundColor: 'var(--mood-contrast)',
                  borderColor: 'var(--mood-secondary)'
                }}
              >
                <div className="flex items-center space-x-3">
                  <Award
                    className="w-8 h-8"
                    style={{ color: 'var(--mood-primary)' }}
                  />
                  <div>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: 'var(--mood-text)' }}
                    >
                      {userProfile.longest_streak}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--mood-secondary)' }}
                    >
                      Longest Streak
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                    {stats.favoriteEntries}
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
                    {stats.totalEntries > 0 ? Math.round(stats.totalWords / stats.totalEntries) : 0}
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
        )}

        {!isLoading && !error && (
          <div className="space-y-6">
            {displayEntries.length === 0 ? (
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
                {displayEntries.map(entry => (
                  <EntryCard
                    key={entry._id}
                    entry={entry}
                    onEdit={handleEditEntry}
                    onDelete={confirmDelete}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        message="Are you sure you want to delete this entry? This action cannot be undone."
        onConfirm={() => handleDeleteEntry(entryToDeleteId)}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default JournalPage;
