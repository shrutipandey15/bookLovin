import { useState, useCallback, useEffect } from 'react';
import { mockLetterApi } from '@utils/mockLetter';
import { MOOD_ENUM_TO_KEY } from '@config/moods';

export function useLetters() {
  const [letters, setLetters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLetters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await mockLetterApi.fetchLetters();
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
      setError(err.message || "Failed to load letters.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLetters();
  }, [fetchLetters]);
  
  const saveLetter = useCallback(async (letterData, letterId) => {
    await mockLetterApi.saveLetter({ ...letterData, _id: letterId });
    await fetchLetters();
  }, [fetchLetters]);

  const deleteLetter = useCallback(async (letterId) => {
    await mockLetterApi.deleteLetter(letterId);
    await fetchLetters();
  }, [fetchLetters]);

  const markLetterAsOpened = useCallback(async (letterId) => {
    await mockLetterApi.markLetterAsOpened(letterId);
    await fetchLetters();
  }, [fetchLetters]);

  const hasReadyLetters = letters.some(l => l.status === 'scheduled' && new Date(l.targetDate) <= new Date());

  return { letters, isLoading, error, saveLetter, deleteLetter, markLetterAsOpened, hasReadyLetters };
}