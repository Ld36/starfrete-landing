import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Map, Search, MapPin, Calendar, Truck, Package } from 'lucide-react';

export default function TrackingPage() {
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock data para demonstração
  const mockTrackingData = {
    id: 'FR001',
    status: 'in_progress',
    pickup_city: 'São Paulo',
    pickup_state: 'SP',
    delivery_city: 'Rio de Janeiro',
    delivery_state: 'RJ',
    driver_name: 'João Silva',
    vehicle: 'Caminhão Baú - ABC-1234',
    cargo_description: 'Equipamentos eletrônicos',
    events: [
      {
        date: '2024-01-15 08:00',
        location: 'São Paulo, SP',
        description: 'Carga coletada',
        status: 'completed'
      },
      {
        date: '2024-01-15 14:30',
        location: 'Rodovia Presidente Dutra, KM 180',
        description: 'Em trânsito',
        status: 'completed'
      },
      {
        date: '2024-01-16 09:15',
        location: 'Rio de Janeiro, RJ',
        description: 'Chegada prevista',
        status: 'pending'
      }
    ]
  };

  const handleTrack = async () => {
    if (!trackingCode.trim()) {
      return;
    }

    setLoading(true);
    
    // Simular busca
    setTimeout(() => {
      if (trackingCode.toUpperCase() === 'FR001') {
        setTrackingResult(mockTrackingData);
      } else {
        setTrackingResult(null);
      }
      setLoading(false);
    }, 1000);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-blue-100 text-blue-800', label: 'Aguardando Coleta' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'Em Trânsito' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Entregue' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelado' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const getEventStatusIcon = (status) => {
    return status === 'completed' ? (
      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
    ) : (
      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Map className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Rastreamento</h1>
      </div>

      {/* Formulário de busca */}
      <Card>
        <CardHeader>
          <CardTitle>Rastrear Frete</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Digite o código do frete (ex: FR001)"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
              />
            </div>
            <Button onClick={handleTrack} disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Rastrear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultado do rastreamento */}
      {trackingResult ? (
        <div className="space-y-6">
          {/* Informações gerais */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Frete #{trackingResult.id}</CardTitle>
                {getStatusBadge(trackingResult.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Origem</div>
                    <div className="font-medium">{trackingResult.pickup_city}/{trackingResult.pickup_state}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Destino</div>
                    <div className="font-medium">{trackingResult.delivery_city}/{trackingResult.delivery_state}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Motorista</div>
                    <div className="font-medium">{trackingResult.driver_name}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Carga</div>
                    <div className="font-medium">{trackingResult.cargo_description}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline de eventos */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trackingResult.events.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex flex-col items-center">
                      {getEventStatusIcon(event.status)}
                      {index < trackingResult.events.length - 1 && (
                        <div className="w-px h-8 bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{event.description}</h4>
                        <span className="text-sm text-gray-500">{event.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : trackingCode && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Frete não encontrado</h3>
            <p className="text-gray-500">
              Verifique se o código do frete está correto e tente novamente.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      {!trackingResult && !trackingCode && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Map className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Como rastrear seu frete</h3>
              <div className="max-w-md mx-auto text-sm text-gray-600 space-y-2">
                <p>1. Digite o código do frete no campo acima</p>
                <p>2. Clique em "Rastrear" para buscar informações</p>
                <p>3. Acompanhe o status e localização em tempo real</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
