import axiosInstance from '@api/axiosInstance';

export const login = async (email, password) => {
  const response = await axiosInstance.post('/auth/login', {
    username: email,
    password: password,
  }, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  
  const { access_token, user } = response.data;
  if (access_token) {
    localStorage.setItem('token', access_token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
  }
  return user;
};

export const register = async (username, email, password) => {
  const response = await axiosInstance.post('/auth/register', {
    username,
    email,
    password,
  });

  const { access_token, user } = response.data;
  if (access_token) {
    localStorage.setItem('token', access_token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
  }
  return user;
};

export const fetchCurrentUser = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  delete axiosInstance.defaults.headers.common['Authorization'];
};