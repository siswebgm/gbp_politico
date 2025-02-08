import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseClient } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '@/components/ui/use-toast';

export const useCompanyStatusCheck = () => {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const { toast } = useToast();

  const forceLogout = (message: string) => {
    // Limpa todos os dados do localStorage
    localStorage.removeItem('gbp_user');
    localStorage.removeItem('empresa_uid');
    localStorage.removeItem('user_uid');
    localStorage.removeItem('supabase.auth.token');
    
    // Faz logout no Supabase
    supabaseClient.auth.signOut();
    
    // Limpa o estado da aplicação
    authStore.logout();
    
    // Mostra mensagem
    toast({
      title: "Acesso Bloqueado",
      description: message,
      variant: "destructive",
    });
    
    // Redireciona para login
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const checkCompanyStatus = async () => {
      try {
        // Verifica se há um usuário logado
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;

        // Busca os dados do usuário para obter o empresa_uid
        const { data: userData, error: userError } = await supabaseClient
          .from('gbp_usuarios')
          .select('empresa_uid')
          .eq('uid', user.id)
          .single();

        if (userError || !userData?.empresa_uid) return;

        // Verifica o status da empresa
        const { data: companyData, error: companyError } = await supabaseClient
          .from('gbp_empresas')
          .select('status, data_expiracao')
          .eq('uid', userData.empresa_uid)
          .single();

        if (companyError || !companyData) return;

        const now = new Date();

        // Verifica se a empresa está cancelada
        if (companyData.status === 'cancelled') {
          forceLogout('Empresa bloqueada. Entre em contato pelo WhatsApp para reativar sua conta.');
          return;
        }

        // Verifica se o trial expirou
        if (companyData.status === 'trial' && companyData.data_expiracao) {
          const expirationDate = new Date(companyData.data_expiracao);
          if (expirationDate < now) {
            forceLogout('Período de teste expirado. Entre em contato pelo WhatsApp para ativar sua conta.');
            return;
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status da empresa:', error);
      }
    };

    // Verifica o status imediatamente e a cada minuto
    checkCompanyStatus();
    const interval = setInterval(checkCompanyStatus, 60 * 1000);

    return () => clearInterval(interval);
  }, [navigate, authStore, toast]);
};
