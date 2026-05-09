import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('playtap_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const createNotice = async (body) => {
  const response = await api.post('/admin/notices', body);
  return response.data;
};

export const updateNotice = async (id, body) => {
  const response = await api.put(`/admin/notices/${id}`, body);
  return response.data;
};

export const deleteNotice = async (id) => {
  const response = await api.delete(`/admin/notices/${id}`);
  return response.data;
};
