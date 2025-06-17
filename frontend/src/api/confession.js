import { mockConfessionsData } from '@utils/confessionMock';

// This object simulates our backend API endpoints
export const mockConfessionApi = {
  /**
   * Fetches a list of confessions.
   * @returns {Promise<Array>} A promise that resolves with the mock data.
   */
  fetchConfessions: () => {
    console.log("MOCK API: Fetching confessions...");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("MOCK API: Responded with confessions.");
        resolve(mockConfessionsData);
      }, 500); // Simulate 500ms network delay
    });
  },

  /**
   * Creates a new confession.
   * @param {object} confessionData - The data for the new confession.
   * @returns {Promise<object>} A promise that resolves with the newly created confession.
   */
  createConfession: (confessionData) => {
    console.log("MOCK API: Creating confession...", confessionData);
    return new Promise((resolve) => {
      setTimeout(() => {
        const newConfession = {
          _id: `conf${Date.now()}`,
          ...confessionData,
          soulName: 'A New Voice', // Simulate backend generating a name
          reactions: { hug: 0, star: 0, flower: 0 },
          createdAt: new Date().toISOString(),
        };
        // Add the new confession to our mock database
        mockConfessionsData.unshift(newConfession);
        console.log("MOCK API: Confession created.", newConfession);
        resolve(newConfession);
      }, 500);
    });
  },

  // We can add mock functions for reactions later
  // sendReaction: (confessionId, reactionType) => { ... }
};