import { useState, useEffect } from 'react';
import axiosInstance from '@api/axiosInstance';

export function useDashboardData() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ streak: 0 });
  const [lastEntry, setLastEntry] = useState(null);
  const [nextLetter, setNextLetter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data points in parallel for efficiency
        const [profileRes, journalRes, lettersRes] = await Promise.all([
          axiosInstance.get('/auth/me'),
          axiosInstance.get('/journal', { params: { limit: 1, sort: 'desc' } }), // Assuming backend supports limit/sort
          axiosInstance.get('/letters') // Assuming a route for letters exists
        ]);

        // Set user profile and stats
        if (profileRes.data) {
          setUser(profileRes.data);
          setStats({ streak: profileRes.data.currentStreak || 0 });
        }

        // Set the last journal entry
        if (journalRes.data && journalRes.data.length > 0) {
          setLastEntry(journalRes.data[0]);
        }
        
        // Find the next letter that is ready to be opened
        if (lettersRes.data && lettersRes.data.length > 0) {
            const readyLetters = lettersRes.data.filter(l => l.status === 'scheduled' && new Date(l.target_date) <= new Date());
            if(readyLetters.length > 0) {
                setNextLetter(readyLetters[0]);
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