import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseClient } from '../lib/supabase';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ErrorBoundary } from 'react-error-boundary';
import { Menu, User } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { useState } from 'react';
import { NotificationBell } from './NotificationBell';
import { useNotificationSetup } from '../hooks/useNotificationSetup';
import { Toaster } from "@/components/ui/toaster";
import { UserProfileModal } from './UserProfileModal';
import { useToast } from "@/components/ui/use-toast";
import { TrialWarning } from './TrialWarning';
import { useCompanyStore } from '../store/useCompanyStore';

// Hook personalizado para verificar o status da empresa
const useCheckCompanyStatus = () => {
  const company = useCompanyStore((state) => state.company);
  const { toast } = useToast();

  useEffect(() => {
    if (!company || company.status !== 'trial' || !company.data_expiracao) return;

    const expirationDate = new Date(company.data_expiracao);
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Não exibe mais o toast de aviso, pois agora temos o TrialWarning
    if (daysUntilExpiration <= 0) {
      // Apenas bloqueia o acesso se já expirou
      return;
    }
  }, [company]);
};

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">Algo deu errado</h2>
        <p className="mt-2 text-sm text-gray-500">{error.message}</p>
      </div>
    </div>
  );
}

export function Layout() {
  useCheckCompanyStatus();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [companyPlan, setCompanyPlan] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { user } = useAuth();
  
  // Adiciona setup de notificações
  useNotificationSetup();

  useEffect(() => {
    const fetchUserPhoto = async () => {
      if (user?.uid) {
        const { data, error } = await supabaseClient
          .from('gbp_usuarios')
          .select('foto')
          .eq('uid', user.uid)
          .single();

        if (!error && data) {
          setUserPhoto(data.foto);
          console.log('Foto do usuário encontrada:', data.foto);
        } else {
          console.error('Erro ao buscar foto do usuário:', error);
          setUserPhoto(null);
        }
      }
    };

    const fetchCompanyPlan = async () => {
      if (user?.empresa_uid) {
        const { data, error } = await supabaseClient
          .from('gbp_empresas')
          .select('plano')
          .eq('uid', user.empresa_uid)
          .single();

        if (!error && data) {
          setCompanyPlan(data.plano);
          console.log('Plano da empresa:', data.plano); // Para debug
        } else {
          console.error('Erro ao buscar plano:', error);
          setCompanyPlan(null);
        }
      }
    };

    fetchUserPhoto();
    fetchCompanyPlan();
  }, [user?.uid, user?.empresa_uid]);

  const handleLogout = async () => {
    try {
      // Remove todos os dados de autenticação
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('gbp_user');
      localStorage.removeItem('empresa_uid');
      localStorage.removeItem('user_uid');
      
      // Limpa os estados
      authStore.logout();
      setCompany(null);
      setCompanyUser(null);

      // Redireciona para login
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 md:overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-blue-600 dark:bg-blue-800 shadow-lg">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-blue-500"
            >
              <span className="sr-only">Abrir menu lateral</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="https://8a9fa808ea18d066080b81b1741b3afc.cdn.bubble.io/f1683656885399x827876060621908000/gbp%20politico.png"
                alt="GBP Politico Logo"
                className="h-6 w-auto sm:h-8 object-contain"
              />
              <div className="flex flex-col justify-center">
                <div className="relative">
                  <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">GBP Politico</h1>
                  {companyPlan && (
                    <span className="hidden sm:block absolute left-1/2 -translate-x-1/2 bottom-0 text-[10px] text-white/80 translate-y-[80%]">
                      {companyPlan}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="focus:outline-none focus:ring-2 focus:ring-white/20 rounded-full"
            >
              <div className="relative h-8 w-8">
                {userPhoto ? (
                  <>
                    <img
                      src={userPhoto}
                      alt="Foto do usuário"
                      className="h-full w-full rounded-full border-2 border-white/10 hover:border-white/20 transition-colors object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        setUserPhoto(null); // Limpar a foto em caso de erro
                      }}
                    />
                    {/* Fallback que aparece se a imagem falhar */}
                    <div className="absolute inset-0 rounded-full bg-blue-500 border-2 border-white/10 hover:border-white/20 transition-colors flex items-center justify-center" 
                         style={{ display: 'none' }}>
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="h-full w-full rounded-full bg-blue-500 border-2 border-white/10 hover:border-white/20 transition-colors flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="w-full h-full px-2 py-3 lg:px-4 lg:py-4">
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Outlet />
            </ErrorBoundary>
            <TrialWarning />
          </div>
        </main>
      </div>
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
      <Toaster />
    </div>
  );
}