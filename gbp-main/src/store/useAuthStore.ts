import { create } from 'zustand';
import { AuthData } from '../services/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: AuthData | null;
  login: (user: AuthData) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (user: AuthData) => set({ isAuthenticated: true, user }),
  logout: () => {
    // Limpa todos os dados de autenticação do localStorage
    localStorage.removeItem('gbp_user');
    localStorage.removeItem('empresa_uid');
    localStorage.removeItem('user_uid');
    localStorage.removeItem('supabase.auth.token');
    
    set({ isAuthenticated: false, user: null });
  },
}));