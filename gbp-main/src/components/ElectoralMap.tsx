import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { User, ChevronRight, ChevronLeft, MapPin, Building2, Building, Maximize2, Minimize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

interface MapComponentProps {
  voters: Voter[];
  loading?: boolean;
}

const MapComponent = ({ voters, loading }: MapComponentProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState({
    totalBairros: 0,
    bairroMaisVotos: '',
    totalVotosBairro: 0,
    totalCidades: 0,
    cidadeMaisVotos: '',
    totalVotosCidade: 0,
  });

  useEffect(() => {
    if (!voters.length) return;

    const bairros = new Map<string, number>();
    const cidades = new Map<string, number>();

    voters.forEach(voter => {
      if (voter.bairro) {
        bairros.set(voter.bairro, (bairros.get(voter.bairro) || 0) + 1);
      }
      if (voter.cidade) {
        cidades.set(voter.cidade, (cidades.get(voter.cidade) || 0) + 1);
      }
    });

    const bairrosArray = Array.from(bairros.entries());
    const cidadesArray = Array.from(cidades.entries());
    
    const bairroMaisVotado = bairrosArray.sort((a, b) => b[1] - a[1])[0];
    const cidadeMaisVotada = cidadesArray.sort((a, b) => b[1] - a[1])[0];

    setStats({
      totalBairros: bairros.size,
      bairroMaisVotos: bairroMaisVotado?.[0] || '',
      totalVotosBairro: bairroMaisVotado?.[1] || 0,
      totalCidades: cidades.size,
      cidadeMaisVotos: cidadeMaisVotada?.[0] || '',
      totalVotosCidade: cidadeMaisVotada?.[1] || 0,
    });
  }, [voters]);

  const customIcon = useMemo(() => new L.DivIcon({
    html: `<div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
           </div>`,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }), []);

  const renderPopup = useCallback((voter: Voter) => (
    <div className="min-w-[200px]">
      <h3 className="font-semibold text-lg mb-2">{voter.name}</h3>
      <p className="text-sm text-gray-600 mb-3">{voter.address}</p>
      <div className="flex flex-col gap-2">
        {voter.whatsapp && (
          <a
            href={`https://wa.me/55${voter.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-green-600 hover:text-green-700"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            </svg>
            Enviar mensagem
          </a>
        )}
        <button
          onClick={() => navigate(`/app/eleitores/${voter.uid}`)}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
        >
          <User className="w-4 h-4 mr-1" />
          Ver detalhes
        </button>
      </div>
    </div>
  ), [navigate]);

  useEffect(() => {
    if (mapRef.current && voters.length > 0) {
      const bounds = L.latLngBounds(voters.map(voter => [voter.lat, voter.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [voters]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full relative">
      {voters.length > 0 && (
        <div className="absolute top-4 right-0 z-[1000] flex items-start">
          <button
            onClick={() => setShowStats(!showStats)}
            className="group flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-l-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title={showStats ? "Ocultar estatísticas" : "Mostrar estatísticas"}
          >
            {showStats ? (
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-200 transition-colors" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-200 transition-colors" />
            )}
          </button>
          
          <div className={`bg-white dark:bg-gray-800 rounded-l-lg shadow-lg overflow-hidden transition-all duration-300 ${
            showStats ? 'w-[300px] opacity-100' : 'w-0 opacity-0'
          }`}>
            <div className="p-4 min-w-[300px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  Estatísticas do Mapa
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {voters.length} eleitores
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Card de Bairros */}
                <div className="relative group">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-lg transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Bairros</h4>
                      </div>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.totalBairros}
                      </span>
                    </div>
                    
                    {stats.bairroMaisVotos && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Mais populoso</span>
                          <span className="font-medium text-gray-900 dark:text-white">{stats.bairroMaisVotos}</span>
                        </div>
                        <div className="relative pt-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">
                              {stats.totalVotosBairro} eleitores
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {Math.round((stats.totalVotosBairro / voters.length) * 100)}% do total
                            </span>
                          </div>
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200 dark:bg-gray-600">
                            <div
                              style={{ width: `${(stats.totalVotosBairro / voters.length) * 100}%` }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card de Cidades */}
                <div className="relative group">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-600 rounded-lg transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <Building className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Cidades</h4>
                      </div>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.totalCidades}
                      </span>
                    </div>
                    
                    {stats.cidadeMaisVotos && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Mais populosa</span>
                          <span className="font-medium text-gray-900 dark:text-white">{stats.cidadeMaisVotos}</span>
                        </div>
                        <div className="relative pt-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-green-600 dark:text-green-400 font-semibold">
                              {stats.totalVotosCidade} eleitores
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {Math.round((stats.totalVotosCidade / voters.length) * 100)}% do total
                            </span>
                          </div>
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-green-200 dark:bg-gray-600">
                            <div
                              style={{ width: `${(stats.totalVotosCidade / voters.length) * 100}%` }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão de Tela Cheia */}
      <div className="absolute top-24 left-4 z-[1000]">
        <button
          onClick={toggleFullscreen}
          className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title={isFullscreen ? "Sair da tela cheia" : "Entrar em tela cheia"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Maximize2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      <MapContainer
        center={[-8.0476, -34.8770]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        zoomControl={false}
      >
        <ZoomControl position="topleft" /> {/* Controle de zoom na posição padrão */}
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup
          chunkedLoading={true}
          chunkInterval={50}
          chunkDelay={10}
          maxClusterRadius={80}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          removeOutsideVisibleBounds={true}
          animate={false}
          disableClusteringAtZoom={18}
          spiderfyDistanceMultiplier={2}
          options={{
            maxZoom: 18,
            minimumClusterSize: 3
          }}
        >
          {useMemo(() => voters.map((voter) => (
            <Marker
              key={voter.uid}
              position={[voter.lat, voter.lng]}
              icon={customIcon}
            >
              <Popup>
                {renderPopup(voter)}
              </Popup>
            </Marker>
          )), [voters, customIcon, renderPopup])}
        </MarkerClusterGroup>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 z-[1000]">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Carregando eleitores...</span>
            </div>
          </div>
        )}
      </MapContainer>

      <style jsx global>{`
        .custom-div-icon {
          background: none;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default MapComponent;
