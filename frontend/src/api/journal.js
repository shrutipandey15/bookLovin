import axiosInstance from './axiosInstance';

const journalService = {
  fetchEntries: async (params) => {
    const response = await axiosInstance.get('/journal', { params });
    return response.data;
  },

  createEntry: async (entryData) => {
    const response = await axiosInstance.post('/journal/', entryData);
    return response.data;
  },

  updateEntry: async (entryId, entryData) => {
    const response = await axiosInstance.put(`/journal/${entryId}`, entryData);
    return response.data; 
  },

  deleteEntry: async (entryId) => {
    await axiosInstance.delete(`/journal/${entryId}`);
    return entryId;
  },

  toggleFavorite: async (entry) => {
    const payload = { ...entry, favorite: !entry.favorite };
    const response = await axiosInstance.put(`/journal/${entry.uid}`, payload);
    return response.data; 
  },
};

export default journalService;