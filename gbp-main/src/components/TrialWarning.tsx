import React from 'react';
import { useCompanyStore } from '../store/useCompanyStore';

export function TrialWarning() {
  const company = useCompanyStore((state) => state.company);

  if (!company || company.status !== 'trial' || !company.data_expiracao) {
    return null;
  }

  const expirationDate = new Date(company.data_expiracao);
  const now = new Date();
  const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiration <= 0 || daysUntilExpiration > 7) {
    return null;
  }

  return (
    <a
      href={`https://wa.me/5581979146126`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm opacity-90 hover:opacity-100 transition-all duration-200 no-underline hover:bg-blue-200 flex items-center gap-2 z-50 shadow-sm"
    >
      <span>Teste encerra {daysUntilExpiration} {daysUntilExpiration === 1 ? 'dia' : 'dias'}</span>
    </a>
  );
}
