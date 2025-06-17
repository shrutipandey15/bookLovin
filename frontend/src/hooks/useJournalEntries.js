import { useState, useCallback, useEffect } from 'react';
import axiosInstance from '@api/axiosInstance';
import { MOOD_KEY_TO_ENUM, MOOD_ENUM_TO_KEY } from '@config/moods';

export function useJournalEntries({ searchTerm, moodFilter }) {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEntries = useCallback(async () => {
    // This part remains the same
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (moodFilter && moodFilter !== 'all') params.mood = MOOD_KEY_TO_ENUM[moodFilter];
      if (searchTerm) params.search = searchTerm;
      const response = await axiosInstance.get('/journal', { params });
      const formattedEntries = response.data.map(entry => ({
        ...entry, _id: entry.uid, writingTime: entry.writingTime, wordCount: entry.wordCount,
        createdAt: entry.creationTime, updatedAt: entry.updatedAt,
        moodKey: MOOD_ENUM_TO_KEY[entry.mood] || 'healing',
      }));
      setEntries(formattedEntries);
    } catch (err) {
        console.error("Error fetching journal entries:", err);
      setError("Failed to load journal entries.");
    } finally {
      setIsLoading(false);
    }
  }, [moodFilter, searchTerm]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // FIX: Action functions now ONLY perform the action. They no longer refetch.
  const saveEntry = useCallback(async (entryData, entryId) => {
    const payload = { ...entryData };
    if (entryId) {
      await axiosInstance.put(`/journal/${entryId}`, payload);
    } else {
      await axiosInstance.post('/journal/', payload);
    }
  }, []);

  const deleteEntry = useCallback(async (entryId) => {
    await axiosInstance.delete(`/journal/${entryId}`);
  }, []);

  const toggleFavorite = useCallback(async (entryToToggle) => {
    // The optimistic update remains here, as it's a UI concern of this hook's state.
    setEntries(prev => prev.map(e => e._id === entryToToggle._id ? { ...e, favorite: !e.favorite } : e));
    try {
      const payload = { ...entryToToggle, favorite: !entryToToggle.favorite };
      await axiosInstance.put(`/journal/${entryToToggle._id}`, payload);
    } catch (error) {
      // Revert on failure
      setEntries(prev => prev.map(e => e._id === entryToToggle._id ? { ...e, favorite: entryToToggle.favorite } : e));
      console.error("Failed to toggle favorite", error);
      throw error; // Re-throw error so the component can handle it if needed
    }
  }, []);

  // FIX: We now explicitly export the fetchEntries function as 'refetch'.
  return { entries, isLoading, error, saveEntry, deleteEntry, toggleFavorite, refetchEntries: fetchEntries };
}