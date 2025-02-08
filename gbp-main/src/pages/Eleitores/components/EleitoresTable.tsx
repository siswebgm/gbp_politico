import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface Eleitor {
  id: number;
  nome: string;
  cpf: string;
  whatsapp: string;
  bairro: string;
  cidade: string;
}

interface EleitoresTableProps {
  eleitores: Eleitor[];
  isLoading: boolean;
  selectedEleitores: string[];
  selectAll: boolean;
  onSelectAll: () => void;
  onSelectAllPages: () => void;
  onSelectEleitor: (id: string) => void;
  onRowClick: (eleitor: Eleitor) => void;
  totalEleitores: number;
  setSelectedEleitores: (eleitores: string[]) => void;
}

export function EleitoresTable({
  eleitores,
  isLoading,
  selectedEleitores,
  selectAll,
  onSelectAll,
  onSelectAllPages,
  onSelectEleitor,
  onRowClick,
  totalEleitores,
  setSelectedEleitores
}: EleitoresTableProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (isMobile) {
    return (
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : eleitores.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Nenhum eleitor encontrado
          </div>
        ) : (
          eleitores.map((eleitor) => (
            <div
              key={eleitor.id}
              onClick={() => onRowClick(eleitor)}
              className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:bg-gray-50 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    className="h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500 hidden sm:block"
                    checked={selectedEleitores.includes(eleitor.id?.toString() || '')}
                    onChange={() => onSelectEleitor(eleitor.id?.toString() || '')}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {eleitor.nome}
                    </h3>
                    {eleitor.cpf && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        CPF: {eleitor.cpf}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-gray-400 shrink-0" />
                </div>
              </div>
              
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">WhatsApp</span>
                    {eleitor.whatsapp && (
                      <a 
                        href={`https://wa.me/${eleitor.whatsapp.replace(/\D/g, '')}`}
                        className="text-primary-600 hover:text-primary-700"
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                  <span className="text-sm text-gray-900 mt-1">
                    {eleitor.whatsapp || '-'}
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Localização</span>
                  </div>
                  <span className="text-sm text-gray-900 mt-1">
                    {eleitor.bairro}
                    {eleitor.cidade && `, ${eleitor.cidade}`}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="w-10">
                <div className="px-3 relative">
                  <div className="flex items-center">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={selectAll}
                        onChange={onSelectAll}
                      />
                      <button
                        ref={buttonRef}
                        onClick={(e) => {
                          e.preventDefault();
                          setIsMenuOpen(!isMenuOpen);
                        }}
                        className="absolute inset-0 w-8 h-8 -m-2"
                        aria-label="Menu de seleção"
                      />
                    </div>
                    <button
                      ref={buttonRef}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMenuOpen(!isMenuOpen);
                      }}
                      className="ml-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                  
                  <div 
                    ref={menuRef}
                    className={`${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'} absolute left-0 mt-2 w-72 rounded-xl shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black/5 z-10 border border-gray-200 dark:border-gray-700 transform transition-all duration-200 ease-out`}
                  >
                    <div className="p-1.5" role="menu" aria-orientation="vertical">
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Opções de Seleção
                      </div>
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex items-center justify-between group"
                        onClick={() => {
                          onSelectAll();
                          setIsMenuOpen(false);
                        }}
                        role="menuitem"
                      >
                        <div className="flex items-center">
                          <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
                            <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-medium">Selecionar página atual</span>
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              ({eleitores.length})
                            </span>
                          </div>
                        </div>
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex items-center justify-between group"
                        onClick={() => {
                          onSelectAllPages();
                          setIsMenuOpen(false);
                        }}
                        role="menuitem"
                      >
                        <div className="flex items-center">
                          <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
                            <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-medium">Selecionar todos</span>
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              ({totalEleitores})
                            </span>
                          </div>
                        </div>
                      </button>
                      {selectedEleitores.length > 0 && (
                        <>
                          <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>
                          <button
                            className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-between group"
                            onClick={() => {
                              setSelectedEleitores([]);
                              setIsMenuOpen(false);
                            }}
                            role="menuitem"
                          >
                            <div className="flex items-center">
                              <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3">
                                <svg className="h-4 w-4 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </div>
                              <div>
                                <span className="font-medium">Desmarcar todos</span>
                                <span className="ml-2 text-xs text-red-500/70 dark:text-red-400/70">
                                  ({selectedEleitores.length})
                                </span>
                              </div>
                            </div>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </th>
              <th scope="col" className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <div className="px-4">Nome</div>
              </th>
              <th scope="col" className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <div className="px-4">CPF</div>
              </th>
              <th scope="col" className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <div className="px-4">WhatsApp</div>
              </th>
              <th scope="col" className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <div className="px-4">Bairro</div>
              </th>
              <th scope="col" className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <div className="px-4">Cidade</div>
              </th>
              <th scope="col" className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <div className="px-4">Ações</div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  </div>
                </td>
              </tr>
            ) : eleitores.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  Nenhum eleitor encontrado
                </td>
              </tr>
            ) : (
              eleitores.map((eleitor) => (
                <tr 
                  key={eleitor.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => onRowClick(eleitor)}
                >
                  <td className="w-10" onClick={(e) => e.stopPropagation()}>
                    <div className="px-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedEleitores.includes(eleitor.id?.toString() || '')}
                        onChange={() => onSelectEleitor(eleitor.id?.toString() || '')}
                      />
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white px-4">{eleitor.nome}</div>
                  </td>
                  <td className="py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-300 px-4">{eleitor.cpf}</div>
                  </td>
                  <td className="py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-300 px-4">{eleitor.whatsapp}</div>
                  </td>
                  <td className="py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-300 px-4">{eleitor.bairro}</div>
                  </td>
                  <td className="py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-300 px-4">{eleitor.cidade || '-'}</div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-end space-x-2 px-4">
                      <Eye className="h-5 w-5 text-gray-400 shrink-0" />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
