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
      const data = await getCompanyFreights();
      // Garantir que data é um array
      const freights = Array.isArray(data) ? data : (data?.freights || []);
      setFreights(freights);
    } catch (error) {
      console.error('Erro ao carregar fretes:', error);
      toast.error('Erro ao carregar fretes');
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

  const loadInterests = async (freightId) => {
    setLoadingInterests(true);
    try {
      const data = await getFreightInterests(freightId);
      setInterests(data);
    } catch (error) {
      console.error('Erro ao carregar interesses:', error);
      toast.error('Erro ao carregar interesses');
    } finally {
      setLoadingInterests(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Ativo' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Concluído' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelado' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'Em Andamento' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
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
                        {freight.pickup_city}/{freight.pickup_state} → {freight.delivery_city}/{freight.delivery_state}
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
                      {freight.pickup_city} → {freight.delivery_city}
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
                    <span className="font-semibold text-green-600">
                      {formatCurrency(freight.price)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500 mb-3">
                    <div>
                      <span className="font-medium">Peso:</span> {freight.cargo_weight}kg
                    </div>
                    <div>
                      <span className="font-medium">Volume:</span> {freight.cargo_volume}m³
                    </div>
                    <div>
                      <span className="font-medium">Veículo:</span> {freight.required_vehicle_type || 'Qualquer'}
                    </div>
                    <div>
                      <span className="font-medium">Carroceria:</span> {freight.required_body_type || 'Qualquer'}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{freight.cargo_description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
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
                              loadInterests(freight.id);
                            }}
                          >
                            <Users className="h-4 w-4 mr-1" />
                            Interesses
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Interesses no Frete</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {loadingInterests ? (
                              <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                              </div>
                            ) : interests.length === 0 ? (
                              <div className="text-center py-8">
                                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500">Nenhum motorista demonstrou interesse ainda.</p>
                              </div>
                            ) : (
                              interests.map((interest) => (
                                <Card key={interest.id} className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-semibold">{interest.driver_name}</h4>
                                      <p className="text-sm text-gray-500">
                                        Interesse demonstrado em {formatDate(interest.created_at)}
                                      </p>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button size="sm" variant="outline">
                                        <MessageSquare className="h-4 w-4 mr-1" />
                                        Conversar
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              ))
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Frete</DialogTitle>
                          </DialogHeader>
                          {selectedFreight && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Origem</h4>
                                  <p className="text-sm">{selectedFreight.pickup_city}/{selectedFreight.pickup_state}</p>
                                  <p className="text-sm">{selectedFreight.pickup_cep}</p>
                                  <p className="text-sm">Data: {formatDate(selectedFreight.pickup_date)}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Destino</h4>
                                  <p className="text-sm">{selectedFreight.delivery_city}/{selectedFreight.delivery_state}</p>
                                  <p className="text-sm">{selectedFreight.delivery_cep}</p>
                                  <p className="text-sm">Data: {formatDate(selectedFreight.delivery_date)}</p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">Carga</h4>
                                <p className="text-sm">{selectedFreight.cargo_description}</p>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                  <p className="text-sm">Peso: {selectedFreight.cargo_weight}kg</p>
                                  <p className="text-sm">Volume: {selectedFreight.cargo_volume}m³</p>
                                </div>
                              </div>
                              
                              {selectedFreight.additional_requirements && (
                                <div>
                                  <h4 className="font-semibold mb-2">Requisitos Adicionais</h4>
                                  <p className="text-sm">{selectedFreight.additional_requirements}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {freight.status === 'active' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteFreight(freight.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                      )}
                    </div>
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
