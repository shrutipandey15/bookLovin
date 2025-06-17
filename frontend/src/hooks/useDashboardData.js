import { useState, useEffect } from 'react';
import axiosInstance from '@api/axiosInstance';
import { MOOD_ENUM_TO_KEY } from '@config/moods';

export function useDashboardData() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ streak: 0 });
  const [lastEntry, setLastEntry] = useState(null);
  const [nextLetter, setNextLetter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, journalRes, lettersRes] = await Promise.all([
          axiosInstance.get('/auth/me'),
          // Assuming your backend supports limit=1 and sort=desc to get the latest
          axiosInstance.get('/journal', { params: { limit: 1, sort: 'desc' } }), 
          axiosInstance.get('/letters') // Assuming you have a letters endpoint
        ]);

        // Set user profile and stats
        if (profileRes.data) {
          setUser(profileRes.data);
          setStats({ streak: profileRes.data.currentStreak || 0 });
        }

        // Set the last journal entry, adding the moodKey
        if (journalRes.data && journalRes.data.length > 0) {
          const entry = journalRes.data[0];
          entry.moodKey = MOOD_ENUM_TO_KEY[entry.mood] || 'healing';
          setLastEntry(entry);
        }
        
        // Find the next letter that is ready to be opened
        if (lettersRes.data && lettersRes.data.length > 0) {
          const readyLetters = lettersRes.data.filter(l => 
            l.type === 'future' && 
            l.status === 'scheduled' && 
            new Date(l.target_date) <= new Date()
          );
          if (readyLetters.length > 0) {
            setNextLetter(readyLetters[0]); // Get the soonest one
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { user, stats, lastEntry, nextLetter, isLoading };
}