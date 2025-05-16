import axiosInstance from './axiosInstance';

const postsService = {
  getAllPosts: async () => {
    try {
      const response = await axiosInstance.get('/posts');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch posts');
    }
  },

  createPost: async (postData) => {
    try {
      const response = await axiosInstance.post('/posts', postData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create post');
    }
  },

  getRecentPosts: async () => {
    try {
      const response = await axiosInstance.get('/posts/recent');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recent posts');
    }
  },

  getPopularPosts: async () => {
    try {
      const response = await axiosInstance.get('/posts/popular');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch popular posts');
    }
  },

  getPostById: async (postId) => {
    try {
      const response = await axiosInstance.get(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch post');
    }
  },

  updatePost: async (postId, updatedData) => {
    try {
      const response = await axiosInstance.put(`/posts/${postId}`, updatedData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update post');
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await axiosInstance.delete(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete post');
    }
  },

  likePost: async (postId) => {
    try {
      const response = await axiosInstance.put(`/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to like post');
    }
  },
};

export default postsService;
