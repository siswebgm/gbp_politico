import { useState } from 'react';
import { useAuth } from '../../../providers/AuthProvider';
import { useQueryClient } from '@tanstack/react-query';
import { toTitleCase } from '../../../utils/formatText';
import { useCompanyStore } from '../../../store/useCompanyStore';
import { categoryService } from '../../../services/categories';
import { categoryTypesService } from '../../../services/categoryTypes';
import { useToast } from "../../../components/ui/use-toast";
import { useCategoryTypes } from '../../../hooks/useCategoryTypes';
import { Plus } from 'lucide-react';

interface NovaCategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NovaCategoriaModal({ isOpen, onClose }: NovaCategoriaModalProps) {
  const { user } = useAuth();
  const company = useCompanyStore((state) => state.company);
  const [nomes, setNomes] = useState<string[]>([]);
  const [novoNome, setNovoNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState('');
  const [novoTipo, setNovoTipo] = useState('');
  const [showNovoTipo, setShowNovoTipo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: tipos, isLoading: isLoadingTipos } = useCategoryTypes();

  const handleAddNome = () => {
    if (!novoNome.trim()) return;
    
    const nomeFormatado = novoNome
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    if (!nomes.includes(nomeFormatado)) {
      setNomes([...nomes, nomeFormatado]);
      setNovoNome('');
    }
  };

  const handleRemoveNome = (index: number) => {
    setNomes(nomes.filter((_, i) => i !== index));
  };

  const handleNovoNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    setNovoNome(formattedValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNome();
    }
  };

  const handleAddNovoTipo = async () => {
    if (!novoTipo.trim()) {
      toast({
        title: "⚠️ Campo obrigatório",
        description: "O nome do tipo é obrigatório",
        className: "bg-yellow-50 border-yellow-200 text-yellow-800",
        duration: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);
      const novoTipoData = await categoryTypesService.create(
        toTitleCase(novoTipo),
        company?.uid || ''
      );
      
      // Atualiza a lista de tipos
      queryClient.invalidateQueries(['categoria-tipos']);
      
      // Seleciona o novo tipo
      setTipo(novoTipoData.uid);
      
      // Limpa o campo e fecha o formulário de novo tipo
      setNovoTipo('');
      setShowNovoTipo(false);
      
      toast({
        title: "✨ Sucesso!",
        description: "Novo tipo de categoria criado!",
        className: "bg-green-50 border-green-200 text-green-800",
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: error.message || "Erro ao criar novo tipo",
        className: "bg-red-50 border-red-200 text-red-800",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (nomes.length === 0) {
      toast({
        title: "⚠️ Campo obrigatório",
        description: "Adicione pelo menos um nome de categoria",
        className: "bg-yellow-50 border-yellow-200 text-yellow-800",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      let tipoUid = tipo;

      // Se for um novo tipo, cria primeiro
      if (showNovoTipo && novoTipo.trim()) {
        const novoTipoFormatado = novoTipo.trim().toUpperCase();
        const createdTipo = await categoryTypesService.create({
          nome: novoTipoFormatado,
          empresa_uid: company?.uid || ''
        });
        tipoUid = createdTipo.uid;
      }

      // Cria todas as categorias com o mesmo tipo
      await Promise.all(
        nomes.map(nome => 
          categoryService.create({
            nome: nome,
            tipo_uid: tipoUid,
            empresa_uid: company?.uid || ''
          })
        )
      );

      toast({
        title: "✨ Sucesso!",
        description: `${nomes.length} ${nomes.length === 1 ? 'categoria criada' : 'categorias criadas'} com sucesso!`,
        className: "bg-green-50 border-green-200 text-green-800",
        duration: 3000,
      });

      setNomes([]);
      setNovoNome('');
      setDescricao('');
      setTipo('');
      onClose();
    } catch (error) {
      console.error('Erro ao criar categorias:', error);
      setError(error instanceof Error ? error.message : 'Erro ao criar categorias');
      toast({
        title: "❌ Erro",
        description: error instanceof Error ? error.message : "Erro ao criar categorias",
        className: "bg-red-50 border-red-200 text-red-800",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Nova Categoria
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Tipo */}
              <div>
                <label className="block text-base font-medium text-gray-900 dark:text-white mb-2">
                  1. Qual o tipo da categoria? <span className="text-red-500">*</span>
                </label>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  {!showNovoTipo ? (
                    <div className="space-y-3">
                      <div className="flex flex-col space-y-2">
                        <select
                          value={tipo}
                          onChange={(e) => setTipo(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500"
                          disabled={isLoading || isLoadingTipos}
                        >
                          <option value="">Selecione um tipo existente...</option>
                          {tipos?.map((t) => (
                            <option key={t.uid} value={t.uid}>
                              {t.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm">
                        <div className="h-px bg-gray-200 dark:bg-gray-700 w-full"></div>
                        <span className="text-gray-500 whitespace-nowrap px-2">ou</span>
                        <div className="h-px bg-gray-200 dark:bg-gray-700 w-full"></div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNovoTipo(true)}
                        className="w-full py-3 text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        Criar um novo tipo de categoria
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={novoTipo}
                        onChange={(e) => setNovoTipo(e.target.value.toUpperCase())}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500"
                        placeholder="Ex: DOCUMENTOS, PROFISSÃO, ESCOLARIDADE"
                        disabled={isLoading}
                      />
                      <p className="text-sm text-gray-500 italic">
                        💡 O tipo será criado em maiúsculas para manter o padrão do sistema
                      </p>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowNovoTipo(false);
                            setNovoTipo('');
                          }}
                          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50"
                          disabled={isLoading}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleAddNovoTipo}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center space-x-2"
                          disabled={isLoading || !novoTipo.trim()}
                        >
                          <Plus className="h-4 w-4" />
                          <span>Adicionar Tipo</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Nomes */}
              <div>
                <label className="block text-base font-medium text-gray-900 dark:text-white mb-2">
                  2. Quais categorias você quer adicionar? <span className="text-red-500">*</span>
                </label>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="space-y-3">
                    <div className="relative">
                      <div 
                        className="min-h-[100px] w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:focus-within:ring-blue-500"
                        onClick={() => {
                          const input = document.getElementById('categoria-input');
                          if (input) input.focus();
                        }}
                      >
                        <div className="flex flex-wrap gap-2 mb-2">
                          {nomes.map((nome, index) => (
                            <div
                              key={index}
                              className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full text-sm font-medium group transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50"
                            >
                              <span>{nome}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveNome(index);
                                }}
                                className="hover:text-blue-900 dark:hover:text-blue-100 opacity-60 group-hover:opacity-100 transition-opacity"
                                title="Remover categoria"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <input
                            id="categoria-input"
                            type="text"
                            value={novoNome}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Não permite mais de uma vírgula consecutiva
                              if (value.includes(',,')) return;
                              
                              if (value.endsWith(',')) {
                                // Adiciona a categoria quando digita vírgula
                                const newCategory = value.slice(0, -1).trim();
                                if (newCategory) {
                                  handleAddNome();
                                }
                              } else {
                                handleNovoNomeChange(e);
                              }
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (novoNome.trim()) {
                                  handleAddNome();
                                }
                              }
                            }}
                            onPaste={(e) => {
                              e.preventDefault();
                              const text = e.clipboardData.getData('text');
                              // Divide o texto colado por vírgulas e adiciona cada item
                              const items = text.split(',').map(item => item.trim()).filter(Boolean);
                              items.forEach(item => {
                                setNovoNome(item);
                                handleAddNome();
                              });
                            }}
                            className="flex-1 min-w-[200px] bg-transparent border-none outline-none p-1 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder={nomes.length === 0 ? "Digite as categorias separadas por vírgula ou Enter" : "Digite para adicionar mais..."}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="inline-block w-3 h-3 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800"></span>
                          Categorias adicionadas
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>Use vírgula ou Enter para adicionar</span>
                        <span className="text-gray-400">•</span>
                        <span>Cole múltiplas categorias separadas por vírgula</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">Salvando...</span>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-opacity-20 border-t-white"></div>
                  </>
                ) : (
                  'Salvar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
