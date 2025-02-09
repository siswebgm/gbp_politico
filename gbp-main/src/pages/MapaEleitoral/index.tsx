import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { Map } from 'lucide-react';
import { supabaseClient } from '../../lib/supabase';
import { useCompanyStore } from '../../store/useCompanyStore';
import { useAuth } from '../../providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

const MapComponent = React.lazy(() => import('../../components/ElectoralMap'));

interface Voter {
  id: string;
  uid: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  whatsapp?: string;
  categoria_uid?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

export function ElectoralMap() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canAccess = user?.nivel_acesso !== 'comum';

  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const company = useCompanyStore(state => state.company);
  const dataLoaded = useRef(false);

  const loadAllVoters = useCallback(async () => {
    if (dataLoaded.current) return; // Se já carregou, não carrega novamente

    if (!company?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: eleitores, error: supabaseError, count } = await supabaseClient
        .from('gbp_eleitores')
        .select(`
          uid,
          id,
          nome,
          logradouro,
          numero,
          bairro,
          cidade,
          uf,
          latitude,
          longitude,
          categoria_uid,
          whatsapp
        `, { count: 'exact' })
        .eq('empresa_uid', company?.uid)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (supabaseError) {
        throw supabaseError;
      }

      if (!eleitores) {
        setVoters([]);
        return;
      }

      const votersWithLocation = eleitores
        .filter((voter: any) => {
          const lat = parseFloat(voter.latitude);
          const lng = parseFloat(voter.longitude);
          return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
        })
        .map((voter: any) => {
          const addressParts = [
            voter.logradouro,
            voter.numero && `nº ${voter.numero}`,
            voter.bairro,
            voter.cidade,
            voter.uf
          ].filter(Boolean);

          return {
            id: voter.id.toString(),
            uid: voter.uid,
            name: voter.nome || '',
            address: addressParts.join(', '),
            lat: parseFloat(voter.latitude),
            lng: parseFloat(voter.longitude),
            whatsapp: voter.whatsapp,
            categoria_uid: voter.categoria_uid,
            bairro: voter.bairro,
            cidade: voter.cidade,
            uf: voter.uf
          };
        });

      setVoters(votersWithLocation);
      dataLoaded.current = true; // Marca que os dados foram carregados
    } catch (err: any) {
      console.error('Erro ao carregar eleitores:', err);
      const errorMessage = err.message || 'Erro ao carregar eleitores';
    } finally {
      setLoading(false);
    }
  }, [company?.uid]);

  useEffect(() => {
    if (canAccess) {
      loadAllVoters();
    }
  }, [canAccess, loadAllVoters]);

  useEffect(() => {
    if (!canAccess) {
      navigate('/app');
    }
  }, [canAccess, navigate]);

  if (!canAccess) return null;

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Mapa Eleitoral
          </h1>
        </div>
        {voters.length > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Total de eleitores: {voters.length}
          </div>
        )}
      </div>

      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Carregando eleitores...</span>
            </div>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }
          >
            <MapComponent 
              voters={voters} 
              loading={loading}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}