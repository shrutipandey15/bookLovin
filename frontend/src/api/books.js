import axiosInstance from './axiosInstance';

export const searchBooks = async (query, limit = 10) => {
  const response = await axiosInstance.get('/books/search', {
    params: { q: query, limit },
  });
  return response.data;
};

export const getShelf = async () => {
  const response = await axiosInstance.get('/books/shelf');
  return response.data;
};

export const addToShelf = async (shelfItemData) => {
  const response = await axiosInstance.post('/books/shelf', shelfItemData);
  return response.data;
};

export const removeFromShelf = async (olKey) => {
  const response = await axiosInstance.delete(
    `/books/shelf/${encodeURIComponent(olKey)}`
  );
  return response.data;
};