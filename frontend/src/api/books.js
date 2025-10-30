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

export const updateBookFavorite = async (olKey, is_favorite) => {
  if (olKey.startsWith('/')) {
    olKey = olKey.substring(1);
  }
  const response = await axiosInstance.put(`/books/shelf/${olKey}/favorite`, {
    is_favorite,
  });
  return response.data;
};

export const updateBookProgress = async (olKey, progress) => {
  if (olKey.startsWith('/')) {
    olKey = olKey.substring(1);
  }
  const response = await axiosInstance.put(`/books/shelf/${olKey}/progress`, {
    progress,
  });
  return response.data;
};

export const updateShelfOrder = async (ordered_keys) => {
  const response = await axiosInstance.put('/books/shelf/order', {
    ordered_keys,
  });
  return response.data;
};