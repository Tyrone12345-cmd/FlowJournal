import axios from 'axios';
import type { LoginCredentials, RegisterData, AuthResponse, User, Trade, TradeStats } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

// Trades API
export const tradesAPI = {
  getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
    const { data } = await api.get('/trades', { params });
    return data;
  },

  getById: async (id: string): Promise<Trade> => {
    const { data } = await api.get(`/trades/${id}`);
    return data;
  },

  create: async (trade: Partial<Trade>): Promise<Trade> => {
    const { data } = await api.post('/trades', trade);
    return data;
  },

  update: async (id: string, trade: Partial<Trade>): Promise<Trade> => {
    const { data } = await api.put(`/trades/${id}`, trade);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/trades/${id}`);
  },

  getStats: async (): Promise<TradeStats> => {
    const { data } = await api.get('/trades/stats');
    return data;
  },
};

export default api;
