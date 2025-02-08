import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Users, Clock, Hourglass, CheckCircle, XCircle, FileText, Tag, Check } from 'lucide-react';
import { supabaseClient } from '../../../lib/supabase';
import { Search, AlertCircle, ChevronDown } from 'lucide-react';
import { useCompanyStore } from '../../../store/useCompanyStore';
import { useAuth } from '../../../providers/AuthProvider';
import { useUserData } from '../../../hooks/useUserData';
import { useIndicados } from '../../../hooks/useIndicados';
import { Listbox, Transition } from '@headlessui/react';
import { useToast } from "../../../components/ui/use-toast";
import { useCategories } from '../../../hooks/useCategories';

interface AttendanceFormData {
  categoria_uid: string;
  descricao: string;
  status: string;
  indicado: string | undefined;
}

const attendanceSchema = z.object({
  categoria_uid: z.string().min(1, 'Selecione uma categoria'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  status: z.string().min(1, 'Status é obrigatório'),
  indicado: z.string().optional(),
});

// Status options com cores e ícones
const statusOptions = [
  { 
    value: 'Pendente', 
    label: 'Pendente', 
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-900/30 dark:text-yellow-500',
    icon: <Clock className="w-4 h-4" />
  },
  { 
    value: 'Em Andamento', 
    label: 'Em Andamento', 
    color: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-900/30 dark:text-blue-500',
    icon: <Hourglass className="w-4 h-4" />
  },
  { 
    value: 'Concluído', 
    label: 'Concluído', 
    color: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-500',
    icon: <CheckCircle className="w-4 h-4" />
  },
  { 
    value: 'Cancelado', 
    label: 'Cancelado', 
    color: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-500',
    icon: <XCircle className="w-4 h-4" />
  }
];

export function AttendanceFormContent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const company = useCompanyStore((state) => state.company);
  const { userData } = useUserData();
  const { data: indicados } = useIndicados();
  const [selectedVoter, setSelectedVoter] = useState<any>(null);
  const [showVoterSearch, setShowVoterSearch] = useState(true);
  const { data: categories } = useCategories();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      status: 'Pendente',
    },
  });

  const onSubmit = async (data: AttendanceFormData) => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      if (!company) {
        throw new Error('Empresa não selecionada');
      }

      const now = new Date();

      // Buscar o último número de atendimento específico da empresa atual
      const { data: lastAttendances, error: lastNumberError } = await supabaseClient
        .from('gbp_atendimentos')
        .select('numero')
        .eq('empresa_uid', company.uid)
        .not('numero', 'is', null)
        .order('numero', { ascending: false })
        .limit(1);

      if (lastNumberError) {
        console.error('Erro ao buscar último número:', lastNumberError);
        throw lastNumberError;
      }

      // Definir o próximo número para esta empresa específica
      const lastNumber = lastAttendances && lastAttendances.length > 0 ? Number(lastAttendances[0].numero) : 0;
      const nextNumber = lastNumber + 1;
      
      console.log('Empresa atual:', company.uid);
      console.log('Último número encontrado para esta empresa:', lastNumber);
      console.log('Próximo número será:', nextNumber);
      
      // Prepara dados do atendimento
      const newAttendance = {
        eleitor_uid: selectedVoter?.uid,
        usuario_uid: user.uid,
        empresa_uid: company.uid,
        categoria_uid: data.categoria_uid,
        descricao: data.descricao,
        status: data.status,
        indicado: data.indicado,
        data_atendimento: now.toISOString(),
        created_at: now,
        tipo_de_atendimento: 'NORMAL',
        numero: nextNumber
      };

      // Verificar se já não existe um atendimento com este número para esta empresa
      const { data: existingNumber, error: existingError } = await supabaseClient
        .from('gbp_atendimentos')
        .select('numero')
        .eq('empresa_uid', company.uid)
        .eq('numero', nextNumber)
        .single();

      if (existingError && existingError.code !== 'PGRST116') { // PGRST116 é o código para nenhum resultado encontrado
        console.error('Erro ao verificar número existente:', existingError);
        throw existingError;
      }

      if (existingNumber) {
        // Se já existe um número igual, busca o maior número novamente e adiciona 1
        const { data: maxNumber } = await supabaseClient
          .from('gbp_atendimentos')
          .select('numero')
          .eq('empresa_uid', company.uid)
          .not('numero', 'is', null)
          .order('numero', { ascending: false })
          .limit(1)
          .single();

        newAttendance.numero = maxNumber ? Number(maxNumber.numero) + 1 : 1;
      }

      console.log('Dados finais do atendimento:', newAttendance);

      // Insere o atendimento
      const { data: createdAttendance, error } = await supabaseClient
        .from('gbp_atendimentos')
        .insert([newAttendance])
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao criar atendimento:', error);
        throw error;
      }

      console.log('Atendimento criado:', createdAttendance);

      toast({
        title: "✨ Atendimento registrado com sucesso!",
        description: `O atendimento #${createdAttendance.numero} foi criado e o eleitor será notificado.`,
        variant: "success",
        duration: 5000,
      });
      
      navigate('/app/atendimentos');
    } catch (error: any) {
      console.error('Erro ao salvar atendimento:', error);
      toast({
        title: "😕 Ops! Algo deu errado",
        description: error.message || "Não foi possível registrar o atendimento. Por favor, tente novamente em alguns instantes.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar eleitor pelo ID da URL se disponível
  useEffect(() => {
    const eleitorUid = searchParams.get('eleitor');
    
    if (eleitorUid && company?.uid) {
      const fetchEleitor = async () => {
        setIsLoading(true);
        setError(null);
        try {
          console.log('Buscando eleitor:', eleitorUid);
          const { data: eleitor, error } = await supabaseClient
            .from('gbp_eleitores')
            .select(`
              uid,
              nome,
              cpf,
              whatsapp,
              cidade,
              bairro
            `)
            .eq('uid', eleitorUid)
            .eq('empresa_uid', company.uid)
            .single();

          if (error) {
            console.error('Erro detalhado:', error);
            throw error;
          }

          if (eleitor) {
            console.log('Eleitor encontrado:', eleitor);
            setSelectedVoter(eleitor);
            setShowVoterSearch(false);
          } else {
            console.log('Eleitor não encontrado');
            setError('Eleitor não encontrado');
          }
        } catch (error: any) {
          console.error('Erro ao buscar eleitor:', error);
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchEleitor();
    }
  }, [searchParams, company?.uid, setValue]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-lg">
      <div className="p-3 pb-20 sm:pb-4 space-y-4">
        {/* Grupo de campos superior */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {/* Eleitor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Eleitor
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">Selecionado</span>
            </div>
            <div className="flex items-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800">
              <User className="h-5 w-5 text-primary-500 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-sm text-gray-900 dark:text-white font-medium">
                  {selectedVoter ? selectedVoter.nome : 'Nenhum eleitor selecionado'}
                </span>
                {selectedVoter && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <p>CPF: {selectedVoter.cpf}</p>
                    {selectedVoter.whatsapp && <p>WhatsApp: {selectedVoter.whatsapp}</p>}
                    {(selectedVoter.cidade || selectedVoter.bairro) && (
                      <p>
                        {[selectedVoter.cidade, selectedVoter.bairro].filter(Boolean).join(' - ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Grupo Categoria e Indicado - Em linha no desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoria
              </label>
              <div className="relative">
                <select
                  {...register('categoria_uid')}
                  className="block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories?.map((category) => (
                    <option key={category.uid} value={category.uid}>
                      {category.nome}
                    </option>
                  ))}
                </select>
                <Tag className="absolute right-2 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.categoria_uid && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.categoria_uid.message}
                </p>
              )}
            </div>

            {/* Indicado por */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Indicado por
              </label>
              <div className="relative">
                <select
                  {...register('indicado')}
                  className="block w-full h-11 pl-3 pr-10 text-sm border border-gray-300 dark:border-gray-600 focus:ring-0 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-colors"
                >
                  <option value="">Selecione um indicado</option>
                  {(indicados || []).map((indicado) => (
                    <option key={indicado.uid} value={indicado.nome}>
                      {indicado.nome}
                    </option>
                  ))}
                </select>
                <Users className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2">
            {statusOptions.map((option) => {
              const isSelected = watch('status') === option.value;
              return (
                <label
                  key={option.value}
                  className={`
                    relative flex items-center gap-2 p-2.5 sm:p-3 border rounded-lg cursor-pointer transition-all
                    ${option.color}
                    ${isSelected ? 'ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-gray-800' : 'opacity-70 hover:opacity-100'}
                  `}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    value={option.value}
                    {...register('status')}
                  />
                  {option.icon}
                  <span className="text-sm font-medium">{option.label}</span>
                  {isSelected && (
                    <span className="absolute top-1 right-1">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Descrição */}
        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descrição
          </label>
          <div className="relative">
            <textarea
              {...register('descricao')}
              rows={4}
              className="block w-full px-3 py-3 text-sm border border-gray-300 dark:border-gray-600 focus:ring-0 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-colors resize-none"
              placeholder="Descreva os detalhes do atendimento..."
            />
            <FileText className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          {errors.descricao && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {errors.descricao.message}
            </p>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-2 justify-end pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 h-11 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 h-11 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : (
              'Salvar Atendimento'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}