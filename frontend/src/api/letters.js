import axiosInstance from "./axiosInstance";

const lettersService = {
  fetchLetters: async () => {
    const response = await axiosInstance.get("/letters");
    return response.data;
  },
  saveLetter: async (letterData, letterId) => {
    if (letterId) {
      throw new Error("Updating letters not yet supported by the API.");
    }
    const response = await axiosInstance.post("/letters", letterData);
    return response.data;
  },
  markLetterAsOpened: async (letterId) => {
    const response = await axiosInstance.put(`/letters/${letterId}/open`);
    return response.data;
  },
  deleteLetter: async (letterId) => {
    await axiosInstance.delete(`/letters/${letterId}`);
    return letterId;
  },
};

export default lettersService;
