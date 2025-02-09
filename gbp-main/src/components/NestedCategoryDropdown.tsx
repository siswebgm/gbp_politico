import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Category } from '../types/category';

interface NestedCategoryDropdownProps {
  value: string;
  onChange: (value: string) => void;
  categories: Category[];
  isLoading?: boolean;
  className?: string;
  placeholder?: string;
  error?: string;
}

export const NestedCategoryDropdown: React.FC<NestedCategoryDropdownProps> = ({
  value,
  onChange,
  categories = [],
  isLoading = false,
  className = '',
  placeholder = 'Selecione uma categoria',
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Controla o scroll da página
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - html.clientWidth;
      html.style.overflow = 'hidden';
      html.style.paddingRight = `${scrollbarWidth}px`;
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${window.scrollY}px`;
      body.style.width = '100%';
    } else {
      const scrollY = body.style.top;
      html.style.overflow = '';
      html.style.paddingRight = '';
      body.style.overflow = '';
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      html.style.overflow = '';
      html.style.paddingRight = '';
      body.style.overflow = '';
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
    };
  }, [isOpen]);

  // Organizando as categorias por tipo
  const categorizedData = categories.reduce((acc, category) => {
    const tipo = category.tipo?.nome || 'Outros';
    if (!acc[tipo]) {
      acc[tipo] = [];
    }
    acc[tipo].push(category);
    return acc;
  }, {} as Record<string, Category[]>);

  // Encontra o nome da categoria selecionada
  const selectedCategory = categories.find(cat => cat.uid === value);

  // Fecha o dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelect = (category: Category) => {
    onChange(category.uid);
    setIsOpen(false);
  };

  const renderDropdown = () => {
    if (!isOpen) return null;

    return (
      <>
        {/* Backdrop para evitar interações com elementos abaixo */}
        <div 
          className="fixed inset-0 bg-transparent"
          style={{ zIndex: 40 }}
          onClick={() => setIsOpen(false)}
        />
        
        {/* Dropdown */}
        <div
          className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-y-auto"
          style={{
            position: 'fixed',
            top: dropdownRef.current?.getBoundingClientRect().bottom ?? 0,
            left: dropdownRef.current?.getBoundingClientRect().left ?? 0,
            width: dropdownRef.current?.offsetWidth ?? 'auto',
            maxHeight: '400px',
            marginTop: '4px',
            zIndex: 50
          }}
        >
          {Object.entries(categorizedData).map(([tipo, categorias]) => (
            <div key={tipo} className="border-b border-gray-200 dark:border-gray-600 last:border-0">
              <div
                className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 bg-gray-50/80 dark:bg-gray-700/80"
                onClick={() => toggleCategory(tipo)}
              >
                <div className="flex items-center space-x-2">
                  {openCategories.includes(tipo) ? (
                    <ChevronDown className="h-4 w-4 text-blue-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{tipo}</span>
                </div>
              </div>

              {openCategories.includes(tipo) && (
                <div className="bg-white dark:bg-gray-800">
                  {categorias.map((category) => (
                    <div
                      key={category.uid}
                      className={`px-4 py-2 cursor-pointer ${
                        value === category.uid 
                          ? 'bg-blue-50 dark:bg-blue-900/20' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                      onClick={() => handleSelect(category)}
                    >
                      <div className="flex items-center space-x-2 pl-6">
                        <span className={`text-sm ${
                          value === category.uid 
                            ? 'text-blue-600 dark:text-blue-400 font-medium' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {category.nome}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-left text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500 ${className}`}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
            <span>Carregando...</span>
          </div>
        ) : (
          <span className={selectedCategory ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}>
            {selectedCategory ? selectedCategory.nome : placeholder}
          </span>
        )}
      </button>

      {error && <span className="text-red-500 text-sm">{error}</span>}

      {renderDropdown()}
    </div>
  );
};
