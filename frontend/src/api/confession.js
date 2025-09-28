import axiosInstance from "./axiosInstance";

export const getConfessionsApi = async () => {
  const response = await axiosInstance.get("/confessions/");
  return response.data;
};

export const createConfessionApi = async (confessionData) => {
  const response = await axiosInstance.post("/confessions/", confessionData);
  return response.data;
};

export const getConfessionByIdApi = async (id) => {
  const response = await axiosInstance.get(`/confessions/${id}`);
  return response.data;
};