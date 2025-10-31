import { useState, useCallback, useEffect } from "react";
import lettersService from "@api/letters";

export function useLetters() {
  const [letters, setLetters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLetters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await lettersService.fetchLetters();

      const formattedLetters = data.map((letter) => ({
        ...letter,
        uid: letter.uid,
        createdAt: new Date(letter.creationTime * 1000).toISOString(),
        targetDate: letter.target_date,
        wordCount: letter.word_count,
        openedAt: letter.opened_at,
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

  const saveLetter = useCallback(
    async (letterData, letterId) => {
      await lettersService.saveLetter(letterData, letterId);
      await fetchLetters();
    },
    [fetchLetters]
  );

  const deleteLetter = useCallback(
    async (letterId) => {
      await lettersService.deleteLetter(letterId);
      setLetters((prev) => prev.filter((l) => l.uid !== letterId));
    },
    []
  );

  const markLetterAsOpened = useCallback(
    async (letterId) => {
      const updatedLetterFromServer = await lettersService.markLetterAsOpened(
        letterId
      );

      const formattedUpdatedLetter = {
        ...updatedLetterFromServer,
        uid: updatedLetterFromServer.uid,
        createdAt: new Date(updatedLetterFromServer.creationTime * 1000).toISOString(),
        targetDate: updatedLetterFromServer.target_date,
        wordCount: updatedLetterFromServer.word_count,
        openedAt: updatedLetterFromServer.opened_at,
      };

      setLetters((prev) =>
        prev.map((l) => (l.uid === letterId ? formattedUpdatedLetter : l))
      );
    },
    []
  );

  const hasReadyLetters = letters.some(
    (l) =>
      l.type === "future" &&
      l.status === "scheduled" &&
      new Date(l.targetDate) <= new Date()
  );

  return {
    letters,
    isLoading,
    error,
    saveLetter,
    deleteLetter,
    markLetterAsOpened,
    hasReadyLetters,
  };
}
