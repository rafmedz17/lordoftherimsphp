import { create } from 'zustand';
import { api } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** False until the initial session check with the server has finished. */
  isReady: boolean;
  checkSession: () => Promise<void>;
  login: (email: string, password: string, options?: { admin?: boolean }) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

type UserResponse = { user: User | null };

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isReady: false,

  checkSession: async () => {
    try {
      const { user } = await api.get<UserResponse>('/auth/me');
      set({ user, isAuthenticated: user !== null, isReady: true });
    } catch {
      set({ user: null, isAuthenticated: false, isReady: true });
    }
  },

  login: async (email, password, options) => {
    const { user } = await api.post<UserResponse>('/auth/login', { email, password, admin: options?.admin ?? false });
    set({ user, isAuthenticated: true });
    return user!;
  },

  register: async (name, email, password) => {
    const { user } = await api.post<UserResponse>('/auth/register', { name, email, password });
    set({ user, isAuthenticated: true });
    return user!;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      set({ user: null, isAuthenticated: false });
      // Drop cached bookings and admin data that belonged to this session.
      queryClient.clear();
    }
  },
}));
