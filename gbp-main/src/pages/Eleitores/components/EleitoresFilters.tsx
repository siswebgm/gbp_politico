import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { EleitorFilters } from '../../../types/eleitor';
import { useDebounce } from '../../../hooks/useDebounce';

interface EleitoresFiltersProps {
  filters: EleitorFilters;
  onFilterChange: (filters: EleitorFilters) => void;
}

export function EleitoresFilters({
  filters,
  onFilterChange,
}: EleitoresFiltersProps) {
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 500);

  // Sincroniza o valor local com os filtros externos
  useEffect(() => {
    if (!filters.nome && searchValue) {
      setSearchValue('');
    } else if (filters.nome && filters.nome !== searchValue) {
      setSearchValue(filters.nome);
    }
  }, [filters.nome]);

  // Atualiza os filtros quando o valor do debounce mudar
  useEffect(() => {
    if (debouncedSearch !== filters.nome) {
      onFilterChange({ ...filters, nome: debouncedSearch });
    }
  }, [debouncedSearch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setSearchValue('');
    onFilterChange({ ...filters, nome: '' });
  }, [filters, onFilterChange]);

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou WhatsApp..."
            value={searchValue}
            onChange={handleChange}
            className="w-full h-10 pl-10 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <div className="absolute inset-y-0 left-3 flex items-center">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          {searchValue && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-3 flex items-center hover:text-primary-500"
              title="Limpar busca"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-primary-500" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
