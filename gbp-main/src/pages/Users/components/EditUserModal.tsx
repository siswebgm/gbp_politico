import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { userService } from '../../../services/users';
import { toast } from '../../../components/ui/use-toast';
import { UserCircle2, Mail, Phone, ShieldCheck, Activity } from 'lucide-react';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: {
    uid: string;
    nome: string | null;
    email: string | null;
    contato: string | null;
    nivel_acesso: string | null;
    status: string | null;
  };
}

export function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    contato: '',
    nivel_acesso: '',
    status: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        contato: user.contato || '',
        nivel_acesso: user.nivel_acesso || '',
        status: user.status || ''
      });
    }
  }, [user]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.status) {
        toast({
          variant: "destructive",
          title: "Campo obrigatório",
          description: "O campo Status é obrigatório"
        });
        return;
      }

      if (!formData.nivel_acesso) {
        toast({
          variant: "destructive",
          title: "Campo obrigatório",
          description: "O campo Nível de Acesso é obrigatório"
        });
        return;
      }

      const updatedData = {
        nome: formData.nome,
        email: formData.email,
        contato: formData.contato,
        nivel_acesso: formData.nivel_acesso,
        status: formData.status
      };

      await userService.update(user.uid, updatedData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar usuário"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'blocked':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getNivelAcessoColor = (nivel: string) => {
    switch (nivel) {
      case 'admin':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'comum':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserCircle2 className="h-6 w-6" />
            Editar Usuário
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          <div className="space-y-2">
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
              Nome
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCircle2 className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="nome"
                value={formData.nome}
                onChange={handleChange('nome')}
                className="w-full h-10 pl-10 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                placeholder="Nome completo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange('email')}
                className="w-full h-10 pl-10 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                placeholder="Email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="contato" className="block text-sm font-medium text-gray-700">
              Contato
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="contato"
                value={formData.contato}
                onChange={handleChange('contato')}
                className="w-full h-10 pl-10 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                placeholder="Telefone/Whatsapp"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="nivel_acesso" className="block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-gray-400" />
                Nível de Acesso
                <span className="text-red-500">*</span>
              </div>
            </label>
            <select
              id="nivel_acesso"
              value={formData.nivel_acesso}
              onChange={handleChange('nivel_acesso')}
              required
              className={`w-full h-10 pl-3 pr-10 py-2 text-base border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${getNivelAcessoColor(formData.nivel_acesso)}`}
            >
              <option value="">Selecione um nível</option>
              <option value="admin" className="bg-blue-50 text-blue-700">Administrador</option>
              <option value="comum" className="bg-green-50 text-green-700">Comum</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-400" />
                Status
                <span className="text-red-500">*</span>
              </div>
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={handleChange('status')}
              required
              className={`w-full h-10 pl-3 pr-10 py-2 text-base border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${getStatusColor(formData.status)}`}
            >
              <option value="">Selecione um status</option>
              <option value="active" className="bg-green-50 text-green-700">Ativo</option>
              <option value="pending" className="bg-yellow-50 text-yellow-700">Pendente</option>
              <option value="blocked" className="bg-red-50 text-red-700">Bloqueado</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-4"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
