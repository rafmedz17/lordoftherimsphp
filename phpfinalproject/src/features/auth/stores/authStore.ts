import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: 'customer' | 'admin') => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, password: string, role: 'customer' | 'admin' = 'customer') => {
    // TODO: Replace with actual API call when Lovable Cloud is connected
    // For now, using mock authentication
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      role,
    };
    set({ user: mockUser, isAuthenticated: true });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
