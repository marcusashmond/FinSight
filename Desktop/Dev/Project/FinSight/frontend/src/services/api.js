import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/me', data),
  updatePassword: (data) => api.patch('/auth/me/password', data),
};

export const transactionsAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  create: (data) => api.post('/transactions', data),
  delete: (id) => api.delete(`/transactions/${id}`),
};

export const analyticsAPI = {
  summary: () => api.get('/analytics/summary'),
  categories: () => api.get('/analytics/categories'),
  trends: () => api.get('/analytics/trends'),
};

export const budgetsAPI = {
  getAll: () => api.get('/budgets'),
  create: (data) => api.post('/budgets', data),
  delete: (id) => api.delete(`/budgets/${id}`),
};

export const subscriptionsAPI = {
  getAll: () => api.get('/subscriptions'),
  create: (data) => api.post('/subscriptions', data),
  delete: (id) => api.delete(`/subscriptions/${id}`),
};

export const uploadAPI = {
  upload: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export default api;
