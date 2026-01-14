import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  showWelcomeScreen: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  setShowWelcomeScreen: (show: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      showWelcomeScreen: false,

      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, showWelcomeScreen: true });
      },

      clearAuth: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
        set({ user: null, token: null, showWelcomeScreen: false });
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
        set({ user: null, token: null, showWelcomeScreen: false });
      },

      isAuthenticated: () => {
        const state = get();
        return !!state.token && !!state.user;
      },

      setShowWelcomeScreen: (show: boolean) => {
        set({ showWelcomeScreen: show });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
