import axios from 'axios';

const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('postpulse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const accountsAPI = {
  list: () => api.get('/accounts'),
  connect: (data) => api.post('/accounts/connect', data),
  disconnect: (id) => api.delete(`/accounts/${id}`),
};

export const postsAPI = {
  getPosts: (status) => api.get('/posts', { params: { status } }),
  createPost: (data, publishNow = false) => api.post(`/posts?publish_now=${publishNow}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
};

export const aiAPI = {
  generate: (data) => api.post('/ai/generate', data),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
};

export default api;
