import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

export const loginEmail = async ({ email, password }) => {
  const response = await api.post('/api/v1/auth/login/email', {
    email,
    password,
    deviceFingerprint: '',
  });
  return response.data;
};
