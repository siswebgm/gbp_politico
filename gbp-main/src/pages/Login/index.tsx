import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { CreateCompanyModal } from './components/CreateCompanyModal';
import { ErrorModal } from './components/ErrorModal';
import { TestExpiredModal } from './components/TestExpiredModal';
import { toast } from '../../components/ui/use-toast';

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isTestExpiredModalOpen, setIsTestExpiredModalOpen] = useState(false);

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      setIsLoading(true);

      if (!data.email || !data.password) {
        toast({
          variant: "destructive",
          title: "Campos obrigatórios",
          description: "Por favor, preencha o email e a senha"
        });
        return;
      }

      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        toast({
          variant: "destructive",
          title: "Email inválido",
          description: "Por favor, insira um email válido"
        });
        return;
      }

      try {
        await signIn(data.email, data.password);
        navigate('/app', { replace: true });
        // Força um refresh da página após o redirecionamento
        window.location.reload();
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('bloqueada')) {
            setIsErrorModalOpen(true);
          } else if (error.message.includes('expirado')) {
            setIsTestExpiredModalOpen(true);
          } else {
            toast({
              variant: "destructive",
              title: "Email ou senha incorretos",
              description: "Verifique suas credenciais e tente novamente"
            });
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyCreated = (createdEmail: string) => {
    setEmail(createdEmail);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden">
      {/* Divisor curvo para desktop */}
      <div className="hidden md:block absolute top-0 bottom-0 left-[40%] right-0 z-0">
        <div className="absolute inset-0">
          <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 100V0C30 0 70 100 100 100H0Z"
              className="fill-white"
              filter="url(#shadow)"
            />
            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                <feOffset dx="-2" dy="0"/>
                <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1"/>
                <feColorMatrix values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.15 0"/>
              </filter>
            </defs>
          </svg>
        </div>
      </div>

      {/* Header para mobile com curva */}
      <div className="md:hidden relative">
        <div className="w-full bg-gradient-to-r from-blue-600 to-blue-800 pt-8 pb-24 flex flex-col items-center justify-center">
          <img 
            src="https://8a9fa808ea18d066080b81b1741b3afc.cdn.bubble.io/f1682561704007x424862565662542000/gbp%20politico.png"
            alt="GBP Político"
            className="h-16 w-16 mb-4 filter drop-shadow-lg"
          />
          <h1 className="text-2xl font-bold text-white/95 text-center">GBP Político</h1>
        </div>
        <div className="absolute -bottom-px left-0 right-0">
          <svg
            className="w-full h-24 fill-white"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M0,60 C30,-10 70,110 100,60 L100,100 L0,100 Z" 
              className="drop-shadow-[-2px_0px_3px_rgba(0,0,0,0.05)]"
            />
          </svg>
        </div>
      </div>

      {/* Lado esquerdo - Fundo azul com logo e descrição (apenas desktop) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex-col items-center justify-center text-white p-12 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[url('https://8a9fa808ea18d066080b81b1741b3afc.cdn.bubble.io/f1682561704007x424862565662542000/gbp%20politico.png')] opacity-5 bg-center bg-no-repeat bg-contain"></div>
        <div className="relative z-10 max-w-md w-full">
          <div className="flex justify-center mb-8">
            <img 
              src="https://8a9fa808ea18d066080b81b1741b3afc.cdn.bubble.io/f1682561704007x424862565662542000/gbp%20politico.png"
              alt="GBP Político"
              className="h-20 w-20 filter drop-shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-center mb-6 text-white/95">GBP Político</h1>
          <p className="text-center text-white/80 text-lg mb-12 leading-relaxed">
            Gerencie seus processos políticos de forma eficiente e organizada
          </p>
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 pl-12 relative transform transition-all duration-300 hover:scale-105 hover:bg-white/15">
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
              <p className="text-white/90 font-medium">Cadastro inteligente de eleitores ✅</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 pl-12 relative transform transition-all duration-300 hover:scale-105 hover:bg-white/15">
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
              <p className="text-white/90 font-medium">Disparo em massa fácil e rápido! 🚀</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 pl-12 relative transform transition-all duration-300 hover:scale-105 hover:bg-white/15">
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
              <p className="text-white/90 font-medium">Envio automático de aniversários! 🎉</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-blue-800/50 to-transparent"></div>
      </div>

      {/* Lado direito - Formulário de login */}
      <div className="relative w-full md:w-1/2 flex flex-col justify-start md:justify-center items-center p-8 pt-0 md:pt-8 bg-white z-10">
        <div className="max-w-md w-full mt-[-2rem] md:mt-[-4rem]">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Bem-vindo!
              </h2>
              <p className="text-gray-600 mt-2">
                Faça login para continuar
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); onSubmit({ email, password }); }} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <div className="group relative transition-all duration-300">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="block w-full pl-12 pr-4 py-3.5 text-gray-700 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition duration-200"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Senha
                  </label>
                  <div className="group relative transition-all duration-300">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="block w-full pl-12 pr-4 py-3.5 text-gray-700 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition duration-200"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-2xl text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="absolute left-4 animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span className="ml-3">Entrando...</span>
                  </>
                ) : (
                  <>
                    <svg className="absolute left-4 w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 4L18 4C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H14M3 12L15 12M3 12L7 8M3 12L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="ml-3">Entrar</span>
                  </>
                )}
              </button>
              <div className="w-full flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-blue-600 text-sm hover:text-blue-800 transition-colors font-medium"
                >
                  Cadastrar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <CreateCompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCompanyCreated}
      />
      <ErrorModal isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)} />
      <TestExpiredModal isOpen={isTestExpiredModalOpen} onClose={() => setIsTestExpiredModalOpen(false)} />
    </div>
  );
}