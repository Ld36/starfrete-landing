import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth.jsx';
import DriverLayout from '../components/layout/DriverLayout.jsx';
import { listFreights, showInterestInFreight, getUserVehicles } from '../config/api';
import { MapPin, Calendar, Weight, Truck, Eye, Heart, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export default function DriverAvailableFreights() {
  const { user } = useAuth();
  const [freights, setFreights] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    origin: '',
    destination: '',
    vehicleType: '',
    minWeight: '',
    maxWeight: ''
  });

  useEffect(() => {
    fetchAvailableFreights();
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await getUserVehicles();
      setVehicles(response.data.data || []);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
    }
  };

  const fetchAvailableFreights = async () => {
    try {
      setLoading(true);
      const response = await listFreights();
      // Filtrar apenas fretes disponíveis (status 'available')
      const availableFreights = response.data?.data?.filter(freight => 
        freight.status === 'available' || freight.status === 'pending'
      ) || [];
      setFreights(availableFreights);
    } catch (error) {
      console.error('Erro ao buscar fretes disponíveis:', error);
      setError('Erro ao carregar fretes disponíveis');
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar compatibilidade de veículo
  const isVehicleCompatible = (vehicle, freight) => {
    if (!vehicle || !freight) return false

    // Verificar capacidade de peso
    if (freight.weight && vehicle.capacity && freight.weight > vehicle.capacity) {
      return false
    }

    // Mapeamento de tipos de veículos compatíveis
    const vehicleCompatibility = {
      'Caminhão Toco': ['caminhao_toco', 'caminhao', 'truck'],
      'Caminhão Truck': ['caminhao_truck', 'caminhao', 'truck'],
      'Carreta Simples': ['carreta_simples', 'carreta', 'semi_trailer'],
      'Carreta Dupla': ['carreta_dupla', 'carreta', 'double_trailer'],
      'Bitrem': ['bitrem', 'carreta'],
      'Rodotrem': ['rodotrem', 'carreta'],
      'Van': ['van', 'furgao'],
      'HR': ['hr', 'van', 'furgao'],
      'Pickup': ['pickup', 'caminhonete'],
      'VUC': ['vuc', 'caminhao'],
      '3/4': ['3/4', 'caminhao'],
      'Moto': ['moto', 'motocicleta']
    }

    // Se o frete não especifica tipo de veículo, qualquer veículo serve
    if (!freight.vehicle_type) return true

    // Obter tipos compatíveis para o veículo do motorista
    const compatibleTypes = vehicleCompatibility[vehicle.vehicle_type] || [vehicle.vehicle_type.toLowerCase()]
    
    // Verificar se o tipo do frete é compatível
    return compatibleTypes.some(type => 
      freight.vehicle_type.toLowerCase().includes(type) ||
      type.includes(freight.vehicle_type.toLowerCase())
    )
  }

  // Função para encontrar veículo compatível
  const findCompatibleVehicle = (freight) => {
    if (!vehicles || vehicles.length === 0) return null
    
    return vehicles.find(vehicle => isVehicleCompatible(vehicle, freight))
  }

  const handleShowInterest = async (freightId) => {
    // Verificar se há veículos cadastrados
    if (!vehicles || vehicles.length === 0) {
      alert('Você precisa cadastrar pelo menos um veículo antes de demonstrar interesse em fretes.');
      return;
    }

    // Encontrar o frete para verificar compatibilidade
    const freight = freights.find(f => f.id === freightId);
    if (!freight) {
      alert('Frete não encontrado.');
      return;
    }

    // Encontrar veículo compatível
    const compatibleVehicle = findCompatibleVehicle(freight);
    if (!compatibleVehicle) {
      alert(`Nenhum dos seus veículos é compatível com este frete.\n\nFrete requer: ${freight.vehicle_type || 'Não especificado'}\nPeso: ${freight.weight || 'N/A'} kg\n\nSeus veículos: ${vehicles.map(v => `${v.vehicle_type} (${v.capacity}kg)`).join(', ')}`);
      return;
    }

    try {
      await showInterestInFreight(freightId, {
        vehicle_id: compatibleVehicle.id,
        message: `Tenho interesse neste frete. Veículo: ${compatibleVehicle.vehicle_type} - ${compatibleVehicle.plate}`
      });
      // Atualizar a lista após demonstrar interesse
      fetchAvailableFreights();
      alert('Interesse demonstrado com sucesso!');
    } catch (error) {
      console.error('Erro ao demonstrar interesse:', error);
      if (error.response && error.response.data) {
        alert(error.response.data.message || 'Erro ao demonstrar interesse. Tente novamente.');
      } else {
        alert('Erro ao demonstrar interesse. Tente novamente.');
      }
    }
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'Disponível';
      case 'pending':
        return 'Pendente';
      case 'in_transit':
        return 'Em Trânsito';
      case 'completed':
        return 'Concluído';
      default:
        return status || 'N/A';
    }
  };

  if (loading) {
    return (
      <DriverLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DriverLayout>
    );
  }

  if (error) {
    return (
      <DriverLayout>
        <div className="text-center py-12">
          <div className="text-red-500 text-lg">{error}</div>
          <Button 
            onClick={fetchAvailableFreights} 
            className="mt-4"
            variant="outline"
          >
            Tentar Novamente
          </Button>
        </div>
      </DriverLayout>
    );
  }

  return (
    <DriverLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Entregas Disponíveis</h1>
            <p className="text-gray-600">Encontre as melhores oportunidades de frete</p>
          </div>
          <Button onClick={fetchAvailableFreights} variant="outline">
            Atualizar
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Origem</label>
                <input
                  type="text"
                  placeholder="Cidade de origem"
                  value={filter.origin}
                  onChange={(e) => setFilter({...filter, origin: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Destino</label>
                <input
                  type="text"
                  placeholder="Cidade de destino"
                  value={filter.destination}
                  onChange={(e) => setFilter({...filter, destination: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Veículo</label>
                <select
                  value={filter.vehicleType}
                  onChange={(e) => setFilter({...filter, vehicleType: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Todos</option>
                  <option value="caminhao_toco">Caminhão Toco</option>
                  <option value="caminhao_truck">Caminhão Truck</option>
                  <option value="carreta">Carreta</option>
                  <option value="van">Van</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Peso Min (kg)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filter.minWeight}
                  onChange={(e) => setFilter({...filter, minWeight: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Peso Max (kg)</label>
                <input
                  type="number"
                  placeholder="50000"
                  value={filter.maxWeight}
                  onChange={(e) => setFilter({...filter, maxWeight: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Fretes */}
        <div className="grid gap-6">
          {freights.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum frete disponível</h3>
                <p className="text-gray-500">No momento não há fretes disponíveis que correspondam aos seus critérios.</p>
              </CardContent>
            </Card>
          ) : (
            freights.map((freight) => (
              <Card key={freight.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          Frete #{freight.id}
                        </h3>
                        <Badge className={getStatusColor(freight.status)}>
                          {getStatusText(freight.status)}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{freight.description || 'Sem descrição'}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {formatCurrency(freight.price)}
                      </div>
                      <div className="text-sm text-gray-500">Valor do frete</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">Origem</div>
                        <div className="text-sm text-gray-600">
                          {freight.origin_city}, {freight.origin_state}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-red-500" />
                      <div>
                        <div className="font-medium">Destino</div>
                        <div className="text-sm text-gray-600">
                          {freight.destination_city}, {freight.destination_state}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">Data de Entrega</div>
                        <div className="text-sm text-gray-600">
                          {formatDate(freight.delivery_date)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Weight className="h-5 w-5 text-purple-500" />
                      <div>
                        <div className="font-medium">Peso</div>
                        <div className="text-sm text-gray-600">
                          {freight.weight ? `${freight.weight} kg` : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-orange-500" />
                      <div>
                        <div className="font-medium">Tipo de Veículo</div>
                        <div className="text-sm text-gray-600">
                          {freight.vehicle_type || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-indigo-500" />
                      <div>
                        <div className="font-medium">Empresa</div>
                        <div className="text-sm text-gray-600">
                          {freight.company?.name || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => handleShowInterest(freight.id)}
                      className="flex items-center gap-2"
                    >
                      <Heart className="h-4 w-4" />
                      Demonstrar Interesse
                    </Button>
                    
                    <Button variant="outline" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Conversar
                    </Button>
                    
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DriverLayout>
  );
}
