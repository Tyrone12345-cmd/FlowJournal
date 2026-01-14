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

  deleteAccount: async (): Promise<{ message: string }> => {
    const { data } = await api.delete('/auth/delete-account');
    return data;
  },
};

// Demo Data
const demoTrades: Trade[] = [
  {
    id: '1',
    userId: 'demo-user-id',
    symbol: 'AAPL',
    type: 'stock' as any,
    direction: 'long' as any,
    entryPrice: 180.50,
    exitPrice: 195.20,
    quantity: 100,
    entryDate: '2026-01-10T09:30:00Z',
    exitDate: '2026-01-11T15:45:00Z',
    stopLoss: 175.00,
    takeProfit: 195.00,
    fees: 2.50,
    profitLoss: 1467.50,
    profitLossPercent: 8.14,
    status: 'closed' as any,
    notes: 'Starker Breakout nach Earnings. Setup war perfekt mit Volumen.',
    emotions: 'Diszipliniert,Ruhig',
    tags: ['breakout', 'earnings', 'technisch'],
    screenshots: [],
    createdAt: '2026-01-10T09:30:00Z',
    updatedAt: '2026-01-11T15:45:00Z',
  },
  {
    id: '2',
    userId: 'demo-user-id',
    symbol: 'TSLA',
    type: 'stock' as any,
    direction: 'short' as any,
    entryPrice: 245.80,
    exitPrice: 238.50,
    quantity: 50,
    entryDate: '2026-01-09T10:15:00Z',
    exitDate: '2026-01-10T14:20:00Z',
    stopLoss: 250.00,
    takeProfit: 235.00,
    fees: 1.80,
    profitLoss: 363.20,
    profitLossPercent: 2.97,
    status: 'closed' as any,
    emotions: 'Diszipliniert',
    notes: 'Überkaufter Markt, RSI divergence',
    tags: ['short', 'technisch'],
    screenshots: [],
    createdAt: '2026-01-09T10:15:00Z',
    updatedAt: '2026-01-10T14:20:00Z',
  },
  {
    id: '3',
    userId: 'demo-user-id',
    symbol: 'BTC/USD',
    type: 'crypto' as any,
    direction: 'long' as any,
    entryPrice: 45200.00,
    quantity: 0.5,
    entryDate: '2026-01-12T08:00:00Z',
    fees: 5.00,
    status: 'open' as any,
    stopLoss: 44000.00,
    takeProfit: 48000.00,
    notes: 'Swing Trade - Support bei 45k. Warte auf Breakout.',
    emotions: 'Ruhig',
    tags: ['crypto', 'swing'],
    screenshots: [],
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T08:00:00Z',
  },
];

const demoStats: TradeStats = {
  totalTrades: 3,
  closedTrades: 2,
  openTrades: 1,
  winningTrades: 2,
  losingTrades: 0,
  winRate: 100,
  totalProfitLoss: 1830.70,
  avgWin: 915.35,
  avgLoss: 0,
  bestTrade: 1467.50,
  worstTrade: 0,
};

// Trades API
export const tradesAPI = {
  getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
    const token = localStorage.getItem('token');
    if (token === 'demo-token') {
      await new Promise(resolve => setTimeout(resolve, 300));
      let filtered = demoTrades;
      if (params?.status && params.status !== 'all') {
        filtered = demoTrades.filter(t => t.status === params.status);
      }
      return { trades: filtered, page: 1, limit: 50 };
    }
    const { data } = await api.get('/trades', { params });
    return data;
  },

  getById: async (id: string): Promise<Trade> => {
    const token = localStorage.getItem('token');
    if (token === 'demo-token') {
      await new Promise(resolve => setTimeout(resolve, 200));
      const trade = demoTrades.find(t => t.id === id);
      if (!trade) throw new Error('Trade not found');
      return trade;
    }
    const { data } = await api.get(`/trades/${id}`);
    return data;
  },

  create: async (trade: Partial<Trade>): Promise<Trade> => {
    const token = localStorage.getItem('token');
    if (token === 'demo-token') {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newTrade: Trade = {
        id: Date.now().toString(),
        userId: 'demo-user-id',
        ...trade,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Trade;
      demoTrades.push(newTrade);
      return newTrade;
    }
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
    const token = localStorage.getItem('token');
    if (token === 'demo-token') {
      await new Promise(resolve => setTimeout(resolve, 300));
      return demoStats;
    }
    const { data } = await api.get('/trades/stats');
    return data;
  },
};

// Upload API
export const uploadAPI = {
  uploadScreenshot: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('screenshot', file);
    const { data } = await api.post('/upload/screenshot', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  uploadScreenshots: async (files: File[]): Promise<{ files: Array<{ url: string; filename: string }> }> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('screenshots', file);
    });
    const { data } = await api.post('/upload/screenshots', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};

export default api;
