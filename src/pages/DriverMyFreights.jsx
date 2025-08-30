import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth.jsx';
import DriverLayout from '../components/layout/DriverLayout.jsx';
import { getMyInterests, listFreights } from '../config/api';
import { MapPin, Calendar, Weight, Truck, Eye, MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function DriverMyFreights() {
  const { user } = useAuth();
  const [myFreights, setMyFreights] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyFreights();
  }, []);

  const fetchMyFreights = async () => {
    try {
      setLoading(true);
      
      // Buscar interesses demonstrados
      const interestsResponse = await getMyInterests();
      const myInterests = interestsResponse.data?.data || [];
      setInterests(myInterests);

      // Buscar todos os fretes e filtrar os que são do motorista
      const freightsResponse = await listFreights();
      const allFreights = freightsResponse.data?.data || [];
      
      // Filtrar fretes onde o motorista demonstrou interesse ou foi aceito
      const driverFreights = allFreights.filter(freight => {
        return myInterests.some(interest => interest.freight_id === freight.id) ||
               freight.driver_id === user?.driver?.id || 
               freight.driver_id === user?.id;
      });

      setMyFreights(driverFreights);
    } catch (error) {
      console.error('Erro ao buscar minhas entregas:', error);
      setError('Erro ao carregar suas entregas');
    } finally {
      setLoading(false);
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
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'Disponível';
      case 'pending':
        return 'Aguardando';
      case 'accepted':
        return 'Aceito';
      case 'in_transit':
        return 'Em Trânsito';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status || 'N/A';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_transit':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFreightsByStatus = (status) => {
    return myFreights.filter(freight => {
      const freightStatus = freight.status?.toLowerCase();
      if (status === 'active') {
        return freightStatus === 'accepted' || freightStatus === 'in_transit';
      }
      if (status === 'pending') {
        return freightStatus === 'pending' || freightStatus === 'available';
      }
      if (status === 'completed') {
        return freightStatus === 'completed';
      }
      return false;
    });
  };

  const FreightCard = ({ freight }) => {
    const interest = interests.find(i => i.freight_id === freight.id);
    
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(freight.status)}
                <h3 className="text-xl font-semibold text-gray-900">
                  Frete #{freight.id}
                </h3>
                <Badge className={getStatusColor(freight.status)}>
                  {getStatusText(freight.status)}
                </Badge>
              </div>
              <p className="text-gray-600 mb-2">{freight.description || 'Sem descrição'}</p>
              {interest && (
                <p className="text-sm text-blue-600">
                  Interesse demonstrado em {formatDate(interest.created_at)}
                </p>
              )}
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
    );
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
            onClick={fetchMyFreights} 
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
            <h1 className="text-3xl font-bold text-gray-900">Minhas Entregas</h1>
            <p className="text-gray-600">Acompanhe o status dos seus fretes</p>
          </div>
          <Button onClick={fetchMyFreights} variant="outline">
            Atualizar
          </Button>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Ativos ({getFreightsByStatus('active').length})</TabsTrigger>
            <TabsTrigger value="pending">Aguardando ({getFreightsByStatus('pending').length})</TabsTrigger>
            <TabsTrigger value="completed">Concluídos ({getFreightsByStatus('completed').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {getFreightsByStatus('active').length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum frete ativo</h3>
                  <p className="text-gray-500">Você não possui fretes ativos no momento.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {getFreightsByStatus('active').map((freight) => (
                  <FreightCard key={freight.id} freight={freight} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {getFreightsByStatus('pending').length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum frete pendente</h3>
                  <p className="text-gray-500">Você não possui fretes aguardando aprovação.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {getFreightsByStatus('pending').map((freight) => (
                  <FreightCard key={freight.id} freight={freight} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {getFreightsByStatus('completed').length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum frete concluído</h3>
                  <p className="text-gray-500">Você ainda não concluiu nenhum frete.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {getFreightsByStatus('completed').map((freight) => (
                  <FreightCard key={freight.id} freight={freight} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DriverLayout>
  );
}
