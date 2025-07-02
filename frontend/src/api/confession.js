import { mockConfessionsData } from '@utils/confessionMock';

export const mockConfessionApi = {
  fetchConfessions: () => {
    console.log("MOCK API: Fetching confessions...");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("MOCK API: Responded with confessions.");
        resolve([...mockConfessionsData]);
      }, 500); 
    });
  },

  createConfession: (confessionData) => {
    console.log("MOCK API: Creating confession...", confessionData);
    return new Promise((resolve) => {
      setTimeout(() => {
        const newConfession = {
          _id: `conf${Date.now()}`,
          ...confessionData,
          soulName: 'A New Voice',
          reactions: { hug: 0, star: 0, flower: 0 },
          createdAt: new Date().toISOString(),
        };
        mockConfessionsData.unshift(newConfession);
        console.log("MOCK API: Confession created.", newConfession);
        resolve(newConfession);
      }, 500);
    });
  },
  fetchSingleConfession: (confessionId) => {
    console.log(`MOCK API: Fetching confession with ID: ${confessionId}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const confession = mockConfessionsData.find(c => c._id === confessionId);
        if (confession) {
          console.log("MOCK API: Found confession.", confession);
          resolve(confession);
        } else {
          reject(new Error("Confession not found"));
        }
      }, 300);
    });
  }
};