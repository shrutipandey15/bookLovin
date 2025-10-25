import axiosInstance from './axiosInstance';
    
export const getUserProfile = async (name) => {
  const response = await axiosInstance.get(`/profile/${name}`);
  return response.data;
};