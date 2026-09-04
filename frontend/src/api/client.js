import axios from 'axios';

// Base URL comes from VITE_API_URL (Render URL in production,
// http://localhost:5000/api locally). Falls back to localhost.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach JWT on every request when logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
