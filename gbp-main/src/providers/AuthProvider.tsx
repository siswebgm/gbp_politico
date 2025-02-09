import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, AuthData } from '../services/auth';
import { useCompanyStore } from '../store/useCompanyStore';
import { useAuthStore } from '../store/useAuthStore';
import { supabaseClient } from '../lib/supabase';

interface Company {
  uid: string;
  nome: string;
  token?: string | null;
  instancia?: string | null;
  porta?: string | null;
  status?: string | null;
  data_expiracao?: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthData | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const authStore = useAuthStore();
  const companyStore = useCompanyStore();

  const loadCompanyData = async (companyUid: string): Promise<Company | null> => {
    try {
      const { data: companyData, error } = await supabaseClient
        .from('gbp_empresas')
        .select('*')
        .eq('uid', companyUid)
        .single();

      if (error) {
        console.error('Erro ao carregar dados da empresa:', error);
        return null;
      }

      if (companyData) {
        localStorage.setItem('empresa_uid', companyData.uid);
        companyStore.setCompany(companyData);
        return companyData;
      }

      return null;
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
      return null;
    }
  };

  const loadUserData = async (userUid: string): Promise<boolean> => {
    try {
      const { data: userData, error } = await supabaseClient
        .from('gbp_usuarios')
        .select('*')
        .eq('uid', userUid)
        .single();

      if (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        return false;
      }

      if (userData) {
        authStore.login(userData);
        localStorage.setItem('gbp_user', JSON.stringify(userData));

        if (userData.empresa_uid) {
          const companyData = await loadCompanyData(userData.empresa_uid);
          if (companyData) {
            companyStore.setUser({
              ...userData,
              foto: userData.foto
            });
          }
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userData = await authService.login(email, password);
      
      if (userData) {
        authStore.login(userData);
        localStorage.setItem('gbp_user', JSON.stringify(userData));
        localStorage.setItem('user_uid', userData.uid);

        if (userData.empresa_uid) {
          const companyData = await loadCompanyData(userData.empresa_uid);
          if (companyData) {
            companyStore.setUser({
              ...userData,
              foto: userData.foto
            });
          }
        }

        navigate('/');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    authStore.logout();
    companyStore.clearCompany();
    navigate('/login');
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUserData = localStorage.getItem('gbp_user');
        const userUid = localStorage.getItem('user_uid');
        const empresaUid = localStorage.getItem('empresa_uid');

        if (storedUserData && userUid) {
          const userData = JSON.parse(storedUserData);
          authStore.login(userData);

          if (empresaUid) {
            await loadCompanyData(empresaUid);
          }
          await loadUserData(userUid);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        signOut();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authStore.isAuthenticated,
        isLoading,
        user: authStore.user,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
