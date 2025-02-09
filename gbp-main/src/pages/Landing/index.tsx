import { Button } from "@/components/ui/button";
import { Building2, FileText, Mail, MessageCircle, Phone, PieChart, Users, LogIn, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WhatsappLogo } from 'phosphor-react';
import { User } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function LandingPage() {
  const features = [
    {
      title: "Cadastro de Eleitores",
      description: "Registre e gerencie eleitores de forma detalhada.",
      icon: Users
    },
    {
      title: "Relatórios Estratégicos",
      description: "Gere relatórios por cidade, bairro, indicação, zona e seção.",
      icon: PieChart
    },
    {
      title: "Gestão de Documentos",
      description: "Criação e acompanhamento de ofícios, projetos de lei e requerimentos.",
      icon: FileText
    },
    {
      title: "Disparo Automático de Aniversariantes",
      description: "Envio de mensagens via WhatsApp do Gabinete.",
      icon: MessageCircle
    },
    {
      title: "Disparo em Massa de Mensagens",
      description: "Comunicação segmentada por bairro, cidade, categoria e gênero.",
      icon: MessageCircle
    },
    {
      title: "Estratégias Políticas",
      description: "Ferramentas para otimizar a gestão e o relacionamento com a base eleitoral.",
      icon: Building2
    }
  ];

  const screenshots = [
    {
      url: "https://studio.gbppolitico.com/storage/v1/object/public/gbp_vendas/localhost_3000_app_eleitores(Nexus%205X).png",
      alt: "Tela de Eleitores"
    },
    {
      url: "https://studio.gbppolitico.com/storage/v1/object/public/gbp_vendas/localhost_3000_app_eleitores(Nexus%205X)%20(1).png",
      alt: "Dashboard"
    },
    {
      url: "https://studio.gbppolitico.com/storage/v1/object/public/gbp_vendas/localhost_3000_app_eleitores%20(3).png",
      alt: "Relatórios"
    },
    {
      url: "https://studio.gbppolitico.com/storage/v1/object/public/gbp_vendas/localhost_3000_app_eleitores%20(1).png",
      alt: "Gestão de Documentos"
    },
    {
      url: "https://studio.gbppolitico.com/storage/v1/object/public/gbp_vendas/localhost_3000_app_eleitores%20(2).png",
      alt: "Comunicação"
    }
  ];

  const clients = [
    {
      name: "Vereador João Silva",
      city: "Recife",
      state: "PE",
      photo: "https://randomuser.me/api/portraits/men/1.jpg",
      role: "Vereador"
    },
    {
      name: "Deputada Maria Santos",
      city: "São Paulo",
      state: "SP",
      photo: "https://randomuser.me/api/portraits/women/2.jpg",
      role: "Deputada Estadual"
    },
    {
      name: "Vereador Pedro Lima",
      city: "Rio de Janeiro",
      state: "RJ",
      photo: "https://randomuser.me/api/portraits/men/3.jpg",
      role: "Vereador"
    },
    {
      name: "Deputado Carlos Oliveira",
      city: "Salvador",
      state: "BA",
      photo: "https://randomuser.me/api/portraits/men/4.jpg",
      role: "Deputado Federal"
    },
    {
      name: "Vereadora Ana Costa",
      city: "Fortaleza",
      state: "CE",
      photo: "https://randomuser.me/api/portraits/women/5.jpg",
      role: "Vereadora"
    }
  ];

  const [activeState, setActiveState] = useState<string | null>(null);
  const states = Array.from(new Set(clients.map(client => client.state))).sort();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveState(current => {
        const currentIndex = states.indexOf(current || states[0]);
        return states[(currentIndex + 1) % states.length];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [states]);

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatWhatsApp = (value: string) => {
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara
    let formatted = numbers;
    if (numbers.length <= 2) {
      formatted = `(${numbers}`;
    } else if (numbers.length <= 7) {
      formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
    
    return formatted;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    setWhatsAppNumber(formatted);
  };

  const handleWhatsAppSubmit = async () => {
    // Remove todos os caracteres não numéricos para enviar
    const cleanNumber = whatsAppNumber.replace(/\D/g, '');
    
    try {
      setIsSubmitting(true);
      // Envia o número para o webhook de teste
      await fetch('https://edtn8n.guardia.work/webhook-test/gbp_cliente-site', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          whatsapp: cleanNumber,
          name: name
        })
      });

      toast.success('Recebemos sua solicitação! Em breve nossa equipe entrará em contato.');
      setIsWhatsAppModalOpen(false);
      setWhatsAppNumber("");
      setName("");
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      toast.error('Ops! Algo deu errado. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoRequest = () => {
    setIsWhatsAppModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Mais compacto em mobile */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <img 
                src="https://studio.gbppolitico.com/storage/v1/object/public/gbp_vendas/gbp%20politico.png" 
                alt="GBP Político" 
                className="h-8 md:h-10 w-auto"
              />
              <span className="text-white font-semibold text-lg md:text-xl">
                GBP Político
              </span>
            </div>
            <Link to="/login">
              <Button 
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white border border-white rounded-full px-4 md:px-8 py-2 md:py-3 text-sm md:text-base font-medium flex items-center gap-2 backdrop-blur-sm transition-all"
              >
                <LogIn className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Acessar Sistema</span>
                <span className="sm:hidden">Acessar</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative pt-24 md:pt-32">
        {/* Hero Section */}
        <section className="relative min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="pt-12 pb-16 sm:pt-16 lg:pt-20 lg:pb-24">
              <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                {/* Text Content */}
                <div className="sm:text-center lg:text-left lg:col-span-6">
                  <h1 className="text-4xl tracking-tight font-bold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">Sistema de</span>
                    <span className="block">Gerenciamento</span>
                    <span className="block">para Gabinete</span>
                    <span className="block">Político</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto lg:mx-0">
                    Otimize a gestão do seu gabinete político com nossa solução completa de CRM. Gerencie eleitores, documentos e comunicações de forma eficiente.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <a
                        href="#"
                        onClick={handleDemoRequest}
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                      >
                        Agende uma Demonstração
                      </a>
                    </div>
                  </div>
                </div>

                {/* Device Mockups */}
                <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                  {/* Modern MacBook Pro Mockup */}
                  <div className="relative z-20 transform perspective-1200 rotateX-3 hover:-rotate-x-1 transition-all duration-700">
                    {/* Screen Part */}
                    <div className="bg-gradient-to-br from-[#363638] via-[#2a2a2c] to-[#1d1d1f] rounded-2xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
                      {/* Screen Frame */}
                      <div className="p-[0.15rem] bg-gradient-to-b from-[#2a2a2c] to-[#1d1d1f]">
                        {/* Inner Frame */}
                        <div className="bg-[#1d1d1f] rounded-[1.3rem] p-3 relative">
                          {/* Notch */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[180px] h-[20px] bg-[#1d1d1f] rounded-b-xl z-10 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[#1a1a1a] ring-1 ring-black/50">
                              <div className="absolute inset-[3px] rounded-full bg-[#0f0f0f]" />
                            </div>
                          </div>

                          {/* Screen Content */}
                          <div className="relative bg-[#121214] rounded-xl overflow-hidden">
                            {/* Menu Bar */}
                            <div className="absolute top-0 left-0 right-0 h-7 bg-[#1f1f1f]/90 backdrop-blur-xl flex items-center px-3 z-10">
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-inner ring-1 ring-[#ec4c41]/50 hover:bg-[#ff4b47] transition-colors" />
                                <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-inner ring-1 ring-[#d69e24]/50 hover:bg-[#fead1d] transition-colors" />
                                <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-inner ring-1 ring-[#1ea133]/50 hover:bg-[#24b63c] transition-colors" />
                              </div>
                              <div className="flex-1 flex justify-center">
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4 rounded-full bg-[#2a2a2c]" />
                                  <div className="w-24 h-3.5 bg-[#2a2a2c] rounded-full" />
                                </div>
                              </div>
                            </div>

                            {/* Screen Content */}
                            <div className="aspect-w-16 aspect-h-10">
                              <img
                                src="https://studio.gbppolitico.com/storage/v1/object/public/gbp_vendas/localhost_3000_app_eleitores.png"
                                alt="Dashboard Preview"
                                className="w-full h-full object-cover"
                              />
                              {/* Modern Screen Effects */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-white/5 to-black/5 pointer-events-none" />
                              <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.05)_40%,rgba(255,255,255,0.05)_60%,transparent_70%)]" />
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_40%)]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Base Part */}
                    <div className="relative mt-[0.15rem]">
                      {/* Top Connection */}
                      <div className="h-[0.15rem] bg-gradient-to-b from-[#2a2a2c] to-[#1d1d1f] mx-6" />
                      
                      {/* Base */}
                      <div className="h-[0.4rem] bg-gradient-to-b from-[#2a2a2c] to-[#1d1d1f] rounded-b-xl relative mx-6">
                        {/* Cutout */}
                        <div className="absolute -bottom-[0.05rem] left-1/2 -translate-x-1/2 w-24 h-[0.15rem] bg-[#1a1a1a] rounded-t" />
                        
                        {/* Premium Finish Effects */}
                        <div className="absolute inset-x-0 bottom-0 h-[0.15rem] bg-gradient-to-b from-[#363638] to-[#1d1d1f]" />
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_40%,rgba(255,255,255,0.05)_45%,rgba(255,255,255,0.05)_55%,transparent_60%)]" />
                      </div>

                      {/* Modern Shadows */}
                      <div className="absolute inset-x-12 bottom-0 h-12 bg-gradient-to-t from-black/30 to-transparent blur-2xl -z-10" />
                      <div className="absolute inset-x-0 -bottom-4 h-4 bg-gradient-to-b from-[#1d1d1f] to-transparent blur-sm" />
                    </div>

                    {/* Ambient Light Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-tr from-gray-50/0 via-gray-50/5 to-gray-50/5 blur-2xl -z-10" />
                  </div>

                  {/* iPhone 14 Pro Mockup */}
                  <div className="absolute -right-12 -bottom-6 z-30 w-[40%] lg:w-1/3 transform hover:translate-y-2 transition-all duration-500">
                    <div className="bg-gradient-to-b from-[#2a2a2c] to-[#1d1d1f] rounded-[1.5rem] p-2 shadow-[0_10px_50px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
                      <div className="relative">
                        {/* Dynamic Island */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90px] h-[23px] bg-black rounded-full mt-1 flex items-center justify-center z-10">
                          {/* Front Camera */}
                          <div className="absolute right-4 w-2.5 h-2.5 rounded-full bg-[#1a1a1a] ring-1 ring-black/50">
                            <div className="absolute inset-0.5 rounded-full bg-[#0f0f0f]">
                              <div className="absolute inset-[3px] rounded-full bg-[#252525]" />
                            </div>
                          </div>
                          {/* Face ID Sensors */}
                          <div className="absolute left-4 w-8 h-2 rounded-full bg-[#1a1a1a]">
                            <div className="absolute inset-0.5 rounded-full bg-[#0f0f0f]">
                              <div className="absolute inset-[2px] rounded-full bg-[#252525]" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Screen */}
                        <div className="aspect-w-9 aspect-h-19 rounded-[1.25rem] overflow-hidden bg-black relative">
                          {/* Screen Glare */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                          <img
                            src="https://studio.gbppolitico.com/storage/v1/object/public/gbp_vendas/localhost_3000_app.png"
                            alt="Mobile Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Side Buttons */}
                        <div className="absolute -left-2 top-24 w-0.5 h-12 bg-gradient-to-b from-[#2a2a2c] to-[#1d1d1f] shadow-[-1px_0_2px_rgba(0,0,0,0.3)]" />
                        <div className="absolute -right-2 top-16 w-0.5 h-8 bg-gradient-to-b from-[#2a2a2c] to-[#1d1d1f] shadow-[1px_0_2px_rgba(0,0,0,0.3)]" />
                        <div className="absolute -right-2 top-28 w-0.5 h-12 bg-gradient-to-b from-[#2a2a2c] to-[#1d1d1f] shadow-[1px_0_2px_rgba(0,0,0,0.3)]" />
                      </div>
                    </div>

                    {/* iPhone Shadow/Reflection */}
                    <div className="absolute inset-x-8 bottom-0 h-12 bg-gradient-to-t from-black/30 to-transparent blur-xl -z-10" />
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-gray-50/20 to-gray-50/20 rounded-lg opacity-20 blur-3xl animate-pulse" />
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#1d1d1f]/40 to-gray-50/30 rounded-lg opacity-20 blur-2xl animate-float" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#1d1d1f]/40 to-gray-50/30 rounded-lg opacity-20 blur-2xl animate-float-delayed" />
                </div>

                <style jsx>{`
                  @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(-10px, -10px); }
                  }
                  @keyframes float-delayed {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(10px, -10px); }
                  }
                  .animate-float {
                    animation: float 6s ease-in-out infinite;
                  }
                  .animate-float-delayed {
                    animation: float-delayed 8s ease-in-out infinite;
                  }
                `}</style>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-24 bg-white mt-16 sm:mt-24 rounded-t-[2.5rem] sm:rounded-t-[3rem]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Funcionalidades Completas
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Tudo que você precisa para uma gestão política eficiente
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-base sm:text-lg text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Clients Section */}
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Nossos Clientes
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Parlamentares que confiam no GBP Político
              </p>
            </div>

            {/* Estados - Scrollável em mobile */}
            <div className="flex justify-start sm:justify-center gap-3 mb-8 sm:mb-12 overflow-x-auto pb-4 px-4 -mx-4 sm:mx-0 scrollbar-hide">
              {states.map((state) => (
                <button
                  key={state}
                  onClick={() => setActiveState(state)}
                  className={`
                    px-4 py-2.5 rounded-full flex items-center gap-2 transition-all whitespace-nowrap
                    ${activeState === state 
                      ? 'bg-blue-600 text-white shadow-lg scale-105' 
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }
                  `}
                >
                  <MapPin className="w-4 h-4" />
                  {state}
                </button>
              ))}
            </div>

            {/* Grid de Clientes */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {clients
                .filter(client => !activeState || client.state === activeState)
                .map((client, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={client.photo}
                        alt={client.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                        {client.name}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm sm:text-base truncate">{client.city} - {client.state}</span>
                      </div>
                      <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {client.role}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Entre em Contato
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Estamos prontos para ajudar você
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-center mb-3">WhatsApp</h3>
                <a 
                  href="https://wa.me/5581979146126" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-700 text-center block"
                >
                  (81) 9 7914-6126
                </a>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-center mb-3">E-mail</h3>
                <a 
                  href="mailto:jmapps.tec@gmail.com" 
                  className="text-blue-600 hover:text-blue-700 text-center block break-all"
                >
                  jmapps.tec@gmail.com
                </a>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-center mb-3">CNPJ</h3>
                <p className="text-gray-600 text-center">49.941.949/0001-85</p>
              </div>
            </div>

            <div className="mt-12 sm:mt-16 text-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-full px-8 sm:px-10 py-6 sm:py-7 text-lg sm:text-xl font-semibold transform hover:scale-105 transition-all w-full sm:w-auto"
              >
                Solicitar Orçamento
              </Button>
            </div>
          </div>
        </section>

        {/* Screenshots Section */}
        <section className="py-24 bg-gray-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Interface Moderna e Intuitiva
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Conheça nossa plataforma desenvolvida para facilitar seu trabalho
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {screenshots.map((screenshot, index) => (
                <div 
                  key={index} 
                  className="relative h-[300px] sm:h-[400px] rounded-xl overflow-hidden shadow-2xl group"
                >
                  <img
                    src={screenshot.url}
                    alt={screenshot.alt}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold">{screenshot.alt}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">GBP Político</h3>
                <p className="text-gray-400 text-sm sm:text-base">
                  Sistema completo para gerenciamento de gabinete político
                </p>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">Contato</h3>
                <p className="text-gray-400 text-sm sm:text-base">
                  WhatsApp: (81) 9 7914-6126<br />
                  Email: jmapps.tec@gmail.com
                </p>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">Links Rápidos</h3>
                <div className="space-y-2">
                  <p><Link to="/login" className="text-gray-400 hover:text-white text-sm sm:text-base">Acessar Sistema</Link></p>
                  <p><a href="#" className="text-gray-400 hover:text-white text-sm sm:text-base">Solicitar Demonstração</a></p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center">
              <p className="text-gray-400 text-sm sm:text-base">
                {new Date().getFullYear()} GBP Político. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.1),transparent_50%)]"></div>
      </div>

      <Dialog open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-xl shadow-xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-center text-gray-900">
              Agende uma Demonstração
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Digite seus dados para entrarmos em contato e apresentar todas as funcionalidades do sistema.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <Input
                id="name"
                type="text"
                placeholder="Digite seu nome"
                className="pl-10 w-full h-12 text-lg border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <WhatsappLogo className="h-5 w-5 text-green-500" weight="fill" />
              </div>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="(11) 99999-9999"
                className="pl-10 w-full h-12 text-lg border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={whatsAppNumber}
                onChange={handleWhatsAppChange}
                maxLength={15}
              />
            </div>
            
            <div className="mt-6">
              <Button 
                onClick={handleWhatsAppSubmit}
                className="w-full h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                disabled={whatsAppNumber.replace(/\D/g, '').length < 11 || !name.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <WhatsappLogo className="h-5 w-5" weight="fill" />
                )}
                {isSubmitting ? 'Enviando...' : 'Solicitar Demonstração'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
