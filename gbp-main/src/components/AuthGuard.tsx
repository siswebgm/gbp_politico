import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCompanyStore } from '../store/useCompanyStore';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "./ui/alert-dialog";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth: boolean;
}

export function AuthGuard({ children, requireAuth }: AuthGuardProps) {
  const { isAuthenticated } = useAuthStore();
  const company = useCompanyStore((state) => state.company);
  const location = useLocation();
  const navigate = useNavigate();
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated && requireAuth) {
      navigate('/login', { replace: true });
    }

    // Verifica status da empresa
    if (requireAuth && company?.statusCheck?.isBlocked) {
      setBlockMessage(company.statusCheck.message || 'Acesso bloqueado');
      setShowBlockedModal(true);
    }
  }, [isAuthenticated, requireAuth, navigate, company]);

  // If auth is required and user is not logged in, redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If auth is not required and user is logged in, redirect to app
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  // Se a empresa estiver bloqueada, mostra o modal e redireciona para o login
  if (requireAuth && company?.statusCheck?.isBlocked) {
    return (
      <>
        <AlertDialog open={showBlockedModal} onOpenChange={setShowBlockedModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Acesso Bloqueado</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>{blockMessage}</p>
                <p>Entre em contato pelo WhatsApp: <a 
                  href={`https://wa.me/5581979146126`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  (81) 97914-6126
                </a></p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => {
                setShowBlockedModal(false);
                navigate('/login', { replace: true });
              }}>
                Entendi
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Navigate to="/login" state={{ from: location }} replace />
      </>
    );
  }

  return <>{children}</>;
}