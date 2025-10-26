import axiosInstance from './axiosInstance';
    
export const getUserProfile = async (name) => {
  const response = await axiosInstance.get(`/profile/${name}`);
  return response.data;
};

export const updateUserQuote = async (quote) => {
  const response = await axiosInstance.put('/profile/me/quote', { quote });
  return response.data;
};