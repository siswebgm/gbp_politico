import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Mail, Phone, MapPin, Search, User } from 'lucide-react';
import { supabaseClient } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog';
import { IMaskInput } from 'react-imask';
import { forwardRef } from 'react';

const createCompanySchema = z.object({
  // Dados da Empresa
  nomeEmpresa: z.string().min(1, 'Nome da empresa é obrigatório'),
  telefoneEmpresa: z.string().optional(),
  cep: z.string().min(8, 'CEP inválido'),
  logradouro: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2, 'Use a sigla do estado (2 letras)').optional(),
  numero: z.string().optional(),
  
  // Dados do Administrador
  nomeAdmin: z.string().min(1, 'Nome do administrador é obrigatório'),
  telefoneAdmin: z.string().optional(),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmarSenha: z.string(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "Senhas não conferem",
  path: ["confirmarSenha"],
});

type CreateCompanyFormData = z.infer<typeof createCompanySchema>;

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ViaCepResponse {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

const MaskedInput = forwardRef<HTMLInputElement, any>(({ mask, onChange, ...props }, ref) => {
  return (
    <IMaskInput
      mask={mask}
      unmask={true}
      ref={ref}
      onAccept={(value: any) => onChange && onChange({ target: { value } })}
      {...props}
    />
  );
});

MaskedInput.displayName = 'MaskedInput';

const StyledMaskedInput = forwardRef<HTMLInputElement, any>((props, ref) => {
  return (
    <Input
      {...props}
      ref={ref}
      render={(inputProps) => (
        <MaskedInput {...inputProps} mask={props.mask} />
      )}
    />
  );
});

StyledMaskedInput.displayName = 'StyledMaskedInput';

export function CreateCompanyModal({ isOpen, onClose, onSuccess }: CreateCompanyModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    setError
  } = useForm<CreateCompanyFormData>({
    resolver: zodResolver(createCompanySchema),
  });

  const cep = watch('cep');

  const buscarCep = async (cep: string) => {
    if (cep?.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data: ViaCepResponse = await response.json();
        
        if (!data.erro) {
          setValue('logradouro', data.logradouro);
          setValue('bairro', data.bairro);
          setValue('cidade', data.localidade);
          setValue('estado', data.uf);
        } else {
          toast.error('CEP não encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        toast.error('Erro ao buscar CEP');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const onSubmit = async (data: CreateCompanyFormData) => {
    try {
      setLoading(true);

      // Criar empresa
      const { data: empresaData, error: empresaError } = await supabaseClient
        .from('gbp_empresas')
        .insert([
          {
            nome: data.nomeEmpresa,
            contato: data.telefoneEmpresa,
            cep: data.cep,
            logradouro: data.logradouro,
            bairro: data.bairro,
            cidade: data.cidade,
            estado: data.estado,
            numero: data.numero,
            status: 'trial',
            data_expiracao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
          },
        ])
        .select()
        .single();

      if (empresaError) throw empresaError;

      // Criar usuário
      const { data: userData, error: userError } = await supabaseClient
        .from('gbp_usuarios')
        .insert([
          {
            nome: data.nomeAdmin,
            email: data.email,
            senha: data.senha,
            contato: data.telefoneAdmin,
            empresa_uid: empresaData.uid,
            nivel_acesso: 'admin',
            status: 'active',
          },
        ])
        .select()
        .single();

      if (userError) {
        // Se houver erro ao criar usuário, remover a empresa
        await supabaseClient
          .from('gbp_empresas')
          .delete()
          .eq('uid', empresaData.uid);
        throw userError;
      }

      // Criar configurações padrão
      await supabaseClient.from('gbp_configuracoes').insert([
        {
          empresa_uid: empresaData.uid,
          tipo: 'geral',
          configuracoes: {
            tema: 'light',
            notificacoes: true,
          },
        },
      ]);

      toast.success('Empresa criada com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      toast.error('Erro ao criar empresa. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[1000px] w-[95%] p-0 bg-white rounded-2xl h-auto md:h-auto max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Criar Nova Empresa
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Preencha os dados abaixo para criar sua empresa e conta de administrador
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 space-y-4">
          {/* Dados da Empresa */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-600 font-medium">
              <Building2 className="w-5 h-5" />
              <h3>Dados da Empresa</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <Input
                  icon={<Building2 className="w-4 h-4 text-gray-500" />}
                  placeholder="Nome da empresa"
                  error={errors.nomeEmpresa?.message}
                  {...register('nomeEmpresa')}
                />
              </div>

              <div>
                <StyledMaskedInput
                  icon={<Phone className="w-4 h-4 text-gray-500" />}
                  mask="(00) 00000-0000"
                  placeholder="Telefone da empresa"
                  error={errors.telefoneEmpresa?.message}
                  {...register('telefoneEmpresa')}
                />
              </div>

              <div>
                <div className="relative">
                  <StyledMaskedInput
                    icon={<MapPin className="w-4 h-4 text-gray-500" />}
                    mask="00000-000"
                    placeholder="CEP"
                    error={errors.cep?.message}
                    {...register('cep')}
                    onChange={(e: any) => {
                      register('cep').onChange(e);
                      buscarCep(e.target.value);
                    }}
                  />
                  {loadingCep && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Search className="w-4 h-4 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-3">
                <Input
                  icon={<MapPin className="w-4 h-4 text-gray-500" />}
                  placeholder="Logradouro"
                  error={errors.logradouro?.message}
                  {...register('logradouro')}
                />
              </div>

              <div>
                <Input
                  placeholder="Número"
                  error={errors.numero?.message}
                  {...register('numero')}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  placeholder="Bairro"
                  error={errors.bairro?.message}
                  {...register('bairro')}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  placeholder="Cidade"
                  error={errors.cidade?.message}
                  {...register('cidade')}
                />
              </div>

              <div>
                <Input
                  placeholder="UF"
                  error={errors.estado?.message}
                  maxLength={2}
                  {...register('estado')}
                />
              </div>
            </div>
          </div>

          {/* Dados do Administrador */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-blue-600 font-medium">
              <User className="w-5 h-5" />
              <h3>Dados do Administrador</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  icon={<User className="w-4 h-4 text-gray-500" />}
                  placeholder="Nome do administrador"
                  error={errors.nomeAdmin?.message}
                  {...register('nomeAdmin')}
                />
              </div>

              <div>
                <StyledMaskedInput
                  icon={<Phone className="w-4 h-4 text-gray-500" />}
                  mask="(00) 00000-0000"
                  placeholder="Telefone do administrador"
                  error={errors.telefoneAdmin?.message}
                  {...register('telefoneAdmin')}
                />
              </div>

              <div>
                <Input
                  icon={<Mail className="w-4 h-4 text-gray-500" />}
                  type="email"
                  placeholder="Email"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="Senha"
                  error={errors.senha?.message}
                  {...register('senha')}
                />
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="Confirmar senha"
                  error={errors.confirmarSenha?.message}
                  {...register('confirmarSenha')}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 py-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="px-8"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="px-8 bg-gradient-to-r from-blue-600 to-blue-800"
              loading={loading}
            >
              Criar Empresa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}