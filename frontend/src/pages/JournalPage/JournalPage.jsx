import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Download, Plus, BookOpen, Clock, Star, TrendingUp, Award, Flame } from 'lucide-react';
import { MOOD_CONFIG, MOOD_KEY_TO_ENUM, MOOD_ENUM_TO_KEY } from '@components/MoodContext';
import { calculateStats } from '@utils/journalUtils';
import JournalEditor from './JournalEditor';
import EntryCard from './EntryCard';
import axiosInstance from '@api/axiosInstance';
import ConfirmModal from '@components/ConfirmModal';
import LetterComposer from './LetterComposer';
import { LettersInbox } from './LetterInbox';
import { LetterViewer } from './LetterViewer';
import { LettersNavButton } from './LetterNavButton';
import { mockLetterApi } from '@utils/mockLetter';

const JournalPage = () => {
  const [entries, setEntries] = useState([]);
  const [letters, setLetters] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [activeLetter, setActiveLetter] = useState(null);
  const [isWriting, setIsWriting] = useState(false);
  const [currentView, setCurrentView] = useState('journal');
  const [searchTerm, setSearchTerm] = useState('');
  const [moodFilter, setMoodFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editorError, setEditorError] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [entryToDeleteId, setEntryToDeleteId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // --- Data Fetching and Formatting ---

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (moodFilter !== 'all') {
        const backendMoodValue = MOOD_KEY_TO_ENUM[moodFilter];
        if (backendMoodValue !== undefined) params.mood = backendMoodValue;
      }
      if (searchTerm) params.search = searchTerm;

      const response = await axiosInstance.get('/journal', { params });

      // Standardize data model to camelCase + add moodKey
      const formattedEntries = response.data.map(entry => ({
        ...entry,
        _id: entry.uid,
        writingTime: entry.writingTime,
        wordCount: entry.wordCount,
        createdAt: entry.creationTime,
        updatedAt: entry.updatedAt,
        moodKey: MOOD_ENUM_TO_KEY[entry.mood] || 'healing',
      }));
      setEntries(formattedEntries);
    } catch (err) {
      console.error("Failed to fetch entries:", err);
      setError(err.response?.data?.detail || "Failed to load journal entries.");
    } finally {
      setIsLoading(false);
    }
  }, [moodFilter, searchTerm]);

  const fetchLetters = useCallback(async () => {
    try {
      const data = await mockLetterApi.fetchLetters();
      // Standardize snake_case from mock to camelCase + add moodKey
      const formattedLetters = data.map(letter => ({
        ...letter,
        targetDate: letter.target_date,
        writingTime: letter.writing_time,
        wordCount: letter.word_count,
        createdAt: letter.created_at,
        openedAt: letter.opened_at,
        moodKey: MOOD_ENUM_TO_KEY[letter.mood] || 'healing',
      }));
      setLetters(formattedLetters);
    } catch (err) {
      console.error("Failed to fetch letters:", err);
      setError(err.message || "Failed to load letters.");
    }
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      setUserProfile(response.data);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
    fetchLetters();
    fetchUserProfile();
  }, [fetchEntries, fetchLetters, fetchUserProfile]);

  const stats = calculateStats(entries);
  const getStreakMessage = (currentStreak) => {
    if (currentStreak === 0) return "Start a streak today!";
    if (currentStreak === 1) return "Keep it up!";
    if (currentStreak >= 7) return "You're on fire!";
    return `Keep the momentum going!`;
  };

  // --- Handlers ---

  const handleNewEntry = useCallback(() => {
    setActiveEntry(null);
    setIsWriting(true);
    setCurrentView('journal');
  }, []);

  const handleEditEntry = useCallback((entry) => {
    setActiveEntry(entry);
    setIsWriting(true);
    setCurrentView('journal');
  }, []);

  const handleSaveEntry = useCallback(async (entryData) => {
    setEditorError(null);
    try {
      // Payload uses camelCase, matching the real API
      const payload = {
        title: entryData.title,
        content: entryData.content,
        mood: entryData.mood,
        writingTime: entryData.writingTime,
        tags: entryData.tags,
        favorite: entryData.favorite,
        wordCount: entryData.wordCount,
      };

      if (activeEntry) {
        await axiosInstance.put(`/journal/${activeEntry._id}`, payload);
      } else {
        await axiosInstance.post('/journal/', payload);
      }

      await Promise.all([fetchEntries(), fetchUserProfile()]);

      setIsWriting(false);
      setActiveEntry(null);
    } catch (err) {
      console.error("Error saving entry:", err);
      setEditorError(err.response?.data?.detail || "Failed to save entry.");
    }
  }, [activeEntry, fetchEntries, fetchUserProfile]);

  const handleDeleteEntry = useCallback(async (entryId) => {
    setShowConfirmModal(false);
    setEntryToDeleteId(null);
    setError(null);
    try {
      await axiosInstance.delete(`/journal/${entryId}`);
      await Promise.all([fetchEntries(), fetchUserProfile()]);
    } catch (err) {
      console.error("Error deleting entry:", err);
      setError(err.response?.data?.detail || "Failed to delete entry.");
    }
  }, [fetchEntries, fetchUserProfile]);

  const handleToggleFavorite = useCallback(async (entryId) => {
    const entryToToggle = entries.find(entry => entry._id === entryId);
    if (!entryToToggle) return;

    // Optimistically update UI
    setEntries(prev => prev.map(e => e._id === entryId ? { ...e, favorite: !e.favorite } : e));

    try {
      const updatedFavoriteStatus = !entryToToggle.favorite;
      // Payload now includes wordCount for consistency with save
      const payload = {
        title: entryToToggle.title,
        content: entryToToggle.content,
        mood: entryToToggle.mood,
        tags: entryToToggle.tags,
        favorite: updatedFavoriteStatus,
        writingTime: entryToToggle.writingTime,
        wordCount: entryToToggle.wordCount,
      };
      await axiosInstance.put(`/journal/${entryId}`, payload);
      await fetchUserProfile(); // Update stats like favorite count
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setError(err.response?.data?.detail || "Failed to update favorite status.");
      // Revert UI on failure
      setEntries(prev => prev.map(e => e._id === entryId ? { ...e, favorite: !e.favorite } : e));
    }
  }, [entries, fetchUserProfile]);

  const handleCancelEdit = useCallback(() => {
    setIsWriting(false);
    setActiveEntry(null);
    setEditorError(null);
  }, []);

  const confirmDelete = useCallback((entryId) => {
    setEntryToDeleteId(entryId);
    setShowConfirmModal(true);
  }, []);

  const handleComposeLetter = useCallback(() => {
    setActiveLetter(null);
    setCurrentView('composeLetter');
  }, []);

  const handleSaveLetter = useCallback(async (letterData) => {
    setError(null);
    try {
      // The mock API now expects camelCase, same as our internal model
      await mockLetterApi.saveLetter({ ...letterData, _id: activeLetter?._id });
      await fetchLetters();
      setCurrentView('lettersInbox');
      setActiveLetter(null);
    } catch (err) {
      console.error("Error saving letter:", err);
      setError(err.message || "Failed to save letter.");
    }
  }, [activeLetter, fetchLetters]);

  const handleViewLetter = useCallback((letter) => {
    setActiveLetter(letter);
    setCurrentView('viewLetter');
  }, []);

  const handleMarkLetterAsOpened = useCallback(async (letterId) => {
    try {
      await mockLetterApi.markLetterAsOpened(letterId);
      await fetchLetters();
    } catch (err) {
      console.error("Error marking letter as opened:", err);
      setError(err.message || "Failed to mark letter as opened.");
    }
  }, [fetchLetters]);

  const handleDeleteLetter = useCallback(async (letterId) => {
    try {
      await mockLetterApi.deleteLetter(letterId);
      await fetchLetters();
    } catch (err) {
      console.error("Error deleting letter:", err);
      setError(err.message || "Failed to delete letter.");
    }
  }, [fetchLetters]);

  const handleCancelLetterCompose = useCallback(() => {
    setCurrentView('lettersInbox');
    setActiveLetter(null);
  }, []);

  const hasReadyLetters = letters.some(l => l.status === 'scheduled' && new Date(l.targetDate) <= new Date());

  // --- Render Logic ---

  if (isWriting) {
    return <JournalEditor entry={activeEntry} onSave={handleSaveEntry} onCancel={handleCancelEdit} error={editorError} />;
  }
  if (currentView === 'composeLetter') {
    return <LetterComposer letter={activeLetter} onSave={handleSaveLetter} onCancel={handleCancelLetterCompose} error={error} />;
  }
  if (currentView === 'viewLetter') {
    return <LetterViewer letter={activeLetter} onClose={() => setCurrentView('lettersInbox')} onMarkAsOpened={handleMarkLetterAsOpened} />;
  }
  if (currentView === 'lettersInbox') {
    return <LettersInbox letters={letters} onViewLetter={handleViewLetter} onDeleteLetter={handleDeleteLetter} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mood-bg)', color: 'var(--mood-text)', fontFamily: 'var(--mood-font)' }}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--mood-text)', fontFamily: 'var(--mood-font)' }}>My Journal</h1>
            <p style={{ color: 'var(--mood-secondary)' }}>Your private space for thoughts, feelings, and reflections</p>
          </div>
          <div className="flex items-center space-x-4">
             <LettersNavButton letterCount={letters.length} hasReadyLetters={hasReadyLetters} onClick={() => setCurrentView('lettersInbox')} />
            <button onClick={handleNewEntry} className="px-6 py-3 rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center space-x-2" style={{ backgroundColor: 'var(--mood-primary)', color: 'var(--mood-contrast)', fontFamily: 'var(--mood-font)' }}>
              <Plus className="w-5 h-5" />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        {/* Filter/Search Bar */}
        <div className="rounded-xl shadow-sm border p-6 mb-8" style={{ backgroundColor: 'var(--mood-contrast)', borderColor: 'var(--mood-secondary)' }}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5" style={{ color: 'var(--mood-secondary)' }} />
              <input type="text" placeholder="Search your entries..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-transparent" style={{ borderColor: 'var(--mood-secondary)', color: 'var(--mood-text)', fontFamily: 'var(--mood-font)' }} />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5" style={{ color: 'var(--mood-secondary)' }} />
                <select value={moodFilter} onChange={(e) => setMoodFilter(e.target.value)} className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-transparent" style={{ borderColor: 'var(--mood-secondary)', color: 'var(--mood-text)', fontFamily: 'var(--mood-font)' }}>
                  <option value="all">All Moods</option>
                  {Object.keys(MOOD_CONFIG).map(moodKey => (<option key={moodKey} value={moodKey}>{MOOD_CONFIG[moodKey].label}</option>))}
                </select>
              </div>
              <button className="px-4 py-3 border rounded-lg hover:opacity-80 transition-opacity flex items-center space-x-2" style={{ borderColor: 'var(--mood-secondary)', color: 'var(--mood-secondary)' }}>
                <Download className="w-5 h-5" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading && <div className="text-center py-8" style={{ color: 'var(--mood-secondary)' }}>Loading entries...</div>}
        {error && <div className="text-center py-8 text-red-500">{error}</div>}

        {!isLoading && !error && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                <div className="p-6 rounded-xl shadow-sm border flex items-center space-x-3" style={{ backgroundColor: 'var(--mood-contrast)', borderColor: 'var(--mood-secondary)' }}>
                    <BookOpen className="w-8 h-8 flex-shrink-0" style={{ color: 'var(--mood-primary)' }} />
                    <div>
                        <p className="text-2xl font-bold" style={{ color: 'var(--mood-text)' }}>{stats.totalEntries}</p>
                        <p className="text-sm" style={{ color: 'var(--mood-secondary)' }}>Total Entries</p>
                    </div>
                </div>
                {userProfile && (
                  <>
                    <div className="p-6 rounded-xl shadow-sm border" style={{ backgroundColor: 'var(--mood-contrast)', borderColor: 'var(--mood-secondary)' }}>
                        <div className="flex items-center space-x-3">
                        {userProfile.currentStreak > 0 ? <Flame className="w-8 h-8 animate-pulse" style={{ color: 'var(--mood-primary)' }} /> : <Clock className="w-8 h-8" style={{ color: 'var(--mood-secondary)' }} />}
                        <div>
                            <p className="text-2xl font-bold" style={{ color: 'var(--mood-text)' }}>{userProfile.currentStreak}</p>
                            <p className="text-sm" style={{ color: 'var(--mood-secondary)' }}>Day Streak</p>
                        </div>
                        </div>
                        <p className="text-xs mt-3 text-center" style={{ color: 'var(--mood-primary)' }}>{getStreakMessage(userProfile.currentStreak)}</p>
                    </div>
                    <div className="p-6 rounded-xl shadow-sm border flex items-center space-x-3" style={{ backgroundColor: 'var(--mood-contrast)', borderColor: 'var(--mood-secondary)' }}>
                        <Award className="w-8 h-8 flex-shrink-0" style={{ color: 'var(--mood-primary)' }} />
                        <div>
                            <p className="text-2xl font-bold" style={{ color: 'var(--mood-text)' }}>{userProfile.longestStreak}</p>
                            <p className="text-sm" style={{ color: 'var(--mood-secondary)' }}>Longest Streak</p>
                        </div>
                    </div>
                  </>
                )}
                <div className="p-6 rounded-xl shadow-sm border flex items-center space-x-3" style={{ backgroundColor: 'var(--mood-contrast)', borderColor: 'var(--mood-secondary)' }}>
                    <Star className="w-8 h-8 flex-shrink-0" style={{ color: 'var(--mood-primary)' }} />
                    <div>
                        <p className="text-2xl font-bold" style={{ color: 'var(--mood-text)' }}>{stats.favoriteEntries}</p>
                        <p className="text-sm" style={{ color: 'var(--mood-secondary)' }}>Favorites</p>
                    </div>
                </div>
                <div className="p-6 rounded-xl shadow-sm border flex items-center space-x-3" style={{ backgroundColor: 'var(--mood-contrast)', borderColor: 'var(--mood-secondary)' }}>
                    <TrendingUp className="w-8 h-8 flex-shrink-0" style={{ color: 'var(--mood-primary)' }} />
                    <div>
                        <p className="text-2xl font-bold" style={{ color: 'var(--mood-text)' }}>{stats.totalEntries > 0 ? Math.round(stats.totalWords / stats.totalEntries) : 0}</p>
                        <p className="text-sm" style={{ color: 'var(--mood-secondary)' }}>Avg Words</p>
                    </div>
                </div>
            </div>

            {/* Entry List */}
            <div className="space-y-6">
              {entries.length === 0 ? (
                <div className="text-center py-12 rounded-xl border" style={{ backgroundColor: 'var(--mood-contrast)', borderColor: 'var(--mood-secondary)' }}>
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--mood-secondary)' }} />
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--mood-text)' }}>{searchTerm || moodFilter !== 'all' ? 'No entries found' : 'Your journal is empty'}</h3>
                  <p style={{ color: 'var(--mood-secondary)' }}>{searchTerm || moodFilter !== 'all' ? 'Try adjusting your search or filter criteria.' : 'Why not write your first entry now?'}</p>
                  {!searchTerm && moodFilter === 'all' && (
                    <button onClick={handleNewEntry} className="mt-4 px-6 py-3 rounded-xl hover:opacity-90 transition-all" style={{ backgroundColor: 'var(--mood-primary)', color: 'var(--mood-contrast)' }}>Create First Entry</button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {entries.map(entry => (
                    <EntryCard key={entry._id} entry={entry} onEdit={handleEditEntry} onDelete={confirmDelete} onToggleFavorite={handleToggleFavorite} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ConfirmModal isOpen={showConfirmModal} message="Are you sure you want to delete this entry? This action cannot be undone." onConfirm={() => handleDeleteEntry(entryToDeleteId)} onCancel={() => setShowConfirmModal(false)} />
    </div>
  );
};

export default JournalPage;
