import axiosInstance from './axiosInstance';
    
export const getUserProfile = async (name) => {
  const response = await axiosInstance.get(`/profile/${name}`);
  return response.data;
};

export const updateUserQuote = async (quote) => {
  const response = await axiosInstance.put('/profile/me/quote', { quote });
  return response.data;
};

export const updateUserGenres = async (genres) => {
  const response = await axiosInstance.put('/profile/me/genres', { genres });
  return response.data;
};

export const updateUserGoal = async (year, count) => {
  const response = await axiosInstance.put('/profile/me/goal', { year, count });
  return response.data;
};