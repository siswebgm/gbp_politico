import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, AuthData } from '../services/auth';
import { useCompanyStore } from '../store/useCompanyStore';
import { useAuthStore } from '../store/useAuthStore';
import { supabaseClient } from '../lib/supabase';
import { toast } from '../components/ui/use-toast';
import { useCompanyStatusCheck } from '../hooks/useCompanyStatusCheck';

interface Company {
  uid: string;
  nome: string;
  token?: string | null;
  instancia?: string | null;
  porta?: string | null;
  status?: string | null;
  data_expiracao?: string | null;
}

export interface User extends AuthData {}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const setCompany = useCompanyStore((state) => state.setCompany);
  const setCompanyUser = useCompanyStore((state) => state.setUser);
  const authStore = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Função para carregar dados da empresa
  const loadCompanyData = async (empresaUid: string) => {
    try {
      const { data: companyData, error: companyError } = await supabaseClient
        .from('gbp_empresas')
        .select('*')
        .eq('uid', empresaUid)
        .single();

      if (!companyError && companyData) {
        // Não exibimos mais o toast aqui, pois agora temos o TrialWarning
        setCompany(companyData);
        return companyData;
      }
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
    }
    return null;
  };

  // Função para verificar status da empresa
  const checkCompanyStatus = (company: Company | null) => {
    if (!company) return { isBlocked: true, message: 'Empresa não encontrada' };
    
    const now = new Date();
    
    switch (company.status) {
      case 'trial':
        if (company.data_expiracao && new Date(company.data_expiracao) < now) {
          return { 
            isBlocked: true, 
            message: 'Período de teste expirado. Entre em contato com o suporte para ativar sua conta.' 
          };
        }
        // Verifica se está próximo da expiração (7 dias)
        if (company.data_expiracao) {
          const expirationDate = new Date(company.data_expiracao);
          const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilExpiration <= 7 && daysUntilExpiration > 0) {
            return { 
              isBlocked: false, 
              message: `Seu período de teste expira em ${daysUntilExpiration} dias. Entre em contato para ativar sua conta.`,
              isWarning: true 
            };
          }
        }
        return { isBlocked: false };
        
      case 'active':
        return { isBlocked: false };
        
      case 'cancelled':
        return { 
          isBlocked: true, 
          message: 'Empresa bloqueada. Entre em contato com o suporte para reativar sua conta.' 
        };
        
      default:
        return { isBlocked: false };
    }
  };

  // Função para carregar dados atualizados do usuário
  const loadUserData = async (uid: string) => {
    try {
      const { data: userData, error } = await supabaseClient
        .from('gbp_usuarios')
        .select(`
          id,
          uid,
          nome,
          email,
          cargo,
          nivel_acesso,
          permissoes,
          empresa_uid,
          contato,
          status,
          ultimo_acesso,
          created_at,
          foto,
          notification_token,
          notification_status,
          notification_updated_at
        `)
        .eq('uid', uid)
        .single();

      if (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        return false;
      }

      if (userData) {
        // Atualiza o AuthStore com os dados mais recentes
        authStore.setUser(userData);
        localStorage.setItem('gbp_user', JSON.stringify(userData));

        // Se houver empresa_uid, carrega os dados da empresa
        if (userData.empresa_uid) {
          const companyData = await loadCompanyData(userData.empresa_uid);
          if (companyData) {
            setCompanyUser({
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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (user) {
          const { data: companyData } = await supabaseClient
            .from('gbp_empresas')
            .select('status, data_expiracao')
            .eq('uid', localStorage.getItem('empresa_uid'))
            .single();

          if (companyData) {
            // Verifica status da empresa
            if (companyData.status === 'cancelled') {
              authStore.logout();
              navigate('/login');
              return;
            }

            // Verifica trial expirado
            if (companyData.status === 'trial' && companyData.data_expiracao) {
              const now = new Date();
              const expirationDate = new Date(companyData.data_expiracao);
              if (expirationDate < now) {
                authStore.logout();
                navigate('/login');
                return;
              }
            }
          }

          const success = await loadUserData(user.id);
          if (!success) {
            authStore.logout();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authStore.logout();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const user = await authService.login(email, password);
      
      if (user) {
        // Verifica dados da empresa após login bem-sucedido
        if (user.empresa_uid) {
          const { data: companyData, error: companyError } = await supabaseClient
            .from('gbp_empresas')
            .select('*')
            .eq('uid', user.empresa_uid)
            .single();

          if (companyError) {
            authStore.logout();
            throw new Error('Erro ao carregar dados da empresa');
          }

          if (!companyData) {
            authStore.logout();
            throw new Error('Empresa não encontrada');
          }

          // Verifica status da empresa
          if (companyData.status === 'cancelled') {
            authStore.logout();
            throw new Error('Empresa bloqueada. Entre em contato pelo WhatsApp para reativar sua conta.');
          }

          // Verifica trial expirado
          if (companyData.status === 'trial' && companyData.data_expiracao) {
            const now = new Date();
            const expirationDate = new Date(companyData.data_expiracao);
            
            if (expirationDate < now) {
              authStore.logout();
              throw new Error('Período de teste expirado. Entre em contato pelo WhatsApp para ativar sua conta.');
            }
          }

          setCompany(companyData);
        }

        const success = await loadUserData(user.uid);
        if (success) {
          navigate('/app');
        } else {
          throw new Error('Erro ao carregar dados do usuário');
        }
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: error.message || 'Ocorreu um erro ao tentar fazer login',
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = () => {
    authStore.logout();
    setCompany(null);
    setCompanyUser(null);
    localStorage.removeItem('gbp_user');
    localStorage.removeItem('empresa_uid');
    localStorage.removeItem('user_uid');
    localStorage.removeItem('supabase.auth.token');
    navigate('/login');
  };

  useCompanyStatusCheck();

  if (isInitializing) {
    return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authStore.isAuthenticated,
        isLoading: false,
        user: authStore.user,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
