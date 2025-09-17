import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, MapPin, Calendar, DollarSign, Eye, Trash2, Users, MessageSquare } from 'lucide-react';
import { getCompanyFreights, deleteFreight, getFreightInterests } from '../config/api';

export default function MyFreightsPage() {
  const [freights, setFreights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFreight, setSelectedFreight] = useState(null);
  const [interests, setInterests] = useState([]);
  const [loadingInterests, setLoadingInterests] = useState(false);

  useEffect(() => {
    loadFreights();
  }, []);

  const loadFreights = async () => {
    try {
      const response = await getCompanyFreights();
      const data = response.data;
      
      // Garantir que data é um array
      const freights = Array.isArray(data) ? data : (data?.data || data?.freights || []);
      setFreights(freights);
    } catch (error) {
      console.error('Erro ao carregar fretes:', error);
      toast.error(error.response?.data?.message || 'Erro ao carregar fretes');
      setFreights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFreight = async (freightId) => {
    if (!confirm('Tem certeza que deseja excluir este frete?')) {
      return;
    }

    try {
      await deleteFreight(freightId);
      toast.success('Frete excluído com sucesso!');
      await loadFreights();
    } catch (error) {
      console.error('Erro ao excluir frete:', error);
      toast.error(error.response?.data?.message || 'Erro ao excluir frete');
    }
  };

  const loadFreightInterests = async (freightId) => {
    try {
      setLoadingInterests(true);
      const response = await getFreightInterests(freightId);
      setInterests(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar interesses:', error);
      toast.error('Erro ao carregar interesses');
      setInterests([]);
    } finally {
      setLoadingInterests(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: 'Ativo', variant: 'default' },
      in_progress: { label: 'Em Andamento', variant: 'secondary' },
      completed: { label: 'Concluído', variant: 'success' },
      cancelled: { label: 'Cancelado', variant: 'destructive' }
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'default' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatRoute = (freight) => {
    const origin = `${freight.origin_city || 'N/A'}/${freight.origin_state || 'N/A'}`;
    const destination = `${freight.destination_city || 'N/A'}/${freight.destination_state || 'N/A'}`;
    return `${origin} → ${destination}`;
  };

  const getFreightPrice = (freight) => {
    const price = freight.suggested_price || freight.accepted_price || 0;
    return price > 0 ? formatCurrency(price) : 'Preço a negociar';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Meus Fretes</h1>
        </div>
        <div className="text-sm text-gray-500">
          {freights.length} frete{freights.length !== 1 ? 's' : ''} encontrado{freights.length !== 1 ? 's' : ''}
        </div>
      </div>

      {freights.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum frete encontrado</h3>
            <p className="text-gray-500 mb-4">Você ainda não publicou nenhum frete.</p>
            <Button onClick={() => window.location.href = '/publish'}>
              Publicar Primeiro Frete
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {freights.map((freight) => (
            <Card key={freight.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {formatRoute(freight)}
                      </CardTitle>
                      <p className="text-sm text-gray-500">ID: {freight.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(freight.status)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {formatRoute(freight)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Coleta: {formatDate(freight.pickup_date)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {getFreightPrice(freight)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Peso:</span>
                    <span className="ml-2 font-medium">
                      {freight.cargo_weight ? `${freight.cargo_weight}kg` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Volume:</span>
                    <span className="ml-2 font-medium">
                      {freight.cargo_volume ? `${freight.cargo_volume}m³` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Veículo:</span>
                    <span className="ml-2 font-medium">
                      {freight.required_vehicle_type || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Carroceria:</span>
                    <span className="ml-2 font-medium">
                      {freight.required_body_type || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Criado em {formatDate(freight.created_at)}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFreight(freight);
                            loadFreightInterests(freight.id);
                          }}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Interesses
                          {freight.interests_count > 0 && (
                            <Badge variant="secondary" className="ml-1">
                              {freight.interests_count}
                            </Badge>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Interesses no Frete</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {loadingInterests ? (
                            <div className="flex justify-center py-8">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                          ) : interests.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">
                              Nenhum interesse ainda.
                            </p>
                          ) : (
                            interests.map((interest) => (
                              <div key={interest.id} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-semibold">{interest.driver_name}</h4>
                                    <p className="text-sm text-gray-600">{interest.driver_email}</p>
                                    {interest.message && (
                                      <p className="text-sm mt-2">{interest.message}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">{formatCurrency(interest.offered_price)}</p>
                                    <p className="text-xs text-gray-500">{formatDate(interest.created_at)}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteFreight(freight.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
