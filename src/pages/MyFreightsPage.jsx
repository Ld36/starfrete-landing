import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Package, MapPin, Calendar, DollarSign, Eye, Trash2, Users, MessageSquare, Check, X } from 'lucide-react';
import { getCompanyFreights, deleteFreight, getFreightInterests, acceptFreightInterest, rejectFreightInterest } from '../config/api';
import Chat from '../components/Chat';

export default function MyFreightsPage() {
  const [freights, setFreights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFreight, setSelectedFreight] = useState(null);
  const [interests, setInterests] = useState([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  
  // Estados do chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatFreightId, setChatFreightId] = useState(null);
  const [chatDriverId, setChatDriverId] = useState(null);
  const [chatCompanyId, setChatCompanyId] = useState(null);

  useEffect(() => {
    loadFreights();
  }, []);

  const loadFreights = async () => {
    try {
      const response = await getCompanyFreights();
      
      // A resposta do axios vem em response.data
      const data = response.data;
      
      // Garantir que data é um array
      const freights = Array.isArray(data) ? data : (data?.freights || data?.data || []);
      
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

  const loadInterests = async (freightId) => {
    setLoadingInterests(true);
    try {
      const response = await getFreightInterests(freightId);
      
      // A resposta do axios vem em response.data
      const apiData = response.data;
      
      // Extrair o array de interesses da estrutura da API
      let interests = [];
      
      if (Array.isArray(apiData)) {
        // Se apiData já é array
        interests = apiData;
      } else if (apiData && apiData.data && Array.isArray(apiData.data.interests)) {
        // Se está em apiData.data.interests (estrutura correta da nossa API)
        interests = apiData.data.interests;
      } else if (apiData && Array.isArray(apiData.data)) {
        // Se está em apiData.data
        interests = apiData.data;
      } else if (apiData && Array.isArray(apiData.interests)) {
        // Se está em apiData.interests
        interests = apiData.interests;
      } else {
        // Fallback para array vazio
        interests = [];
        console.warn('⚠️ Estrutura de interesses não reconhecida:', apiData);
      }
      
      setInterests(interests);
    } catch (error) {
      console.error('Erro ao carregar interesses:', error);
      toast.error('Erro ao carregar interesses');
      setInterests([]); // Garantir que seja um array vazio em caso de erro
    } finally {
      setLoadingInterests(false);
    }
  };

  const handleAcceptInterest = async (freightId, interestId) => {
    try {
      await acceptFreightInterest(freightId, interestId);
      toast.success('Interesse aceito com sucesso!');
      // Recarregar a lista de interesses para atualizar o status
      await loadInterests(freightId);
      // Recarregar a lista de fretes para atualizar o status do frete
      await loadFreights();
    } catch (error) {
      console.error('Erro ao aceitar interesse:', error);
      toast.error(error.response?.data?.message || 'Erro ao aceitar interesse');
    }
  };

  const handleRejectInterest = async (freightId, interestId) => {
    if (!confirm('Tem certeza que deseja rejeitar este interesse?')) {
      return;
    }

    try {
      await rejectFreightInterest(freightId, interestId);
      toast.success('Interesse rejeitado com sucesso!');
      // Recarregar a lista de interesses para atualizar
      await loadInterests(freightId);
    } catch (error) {
      console.error('Erro ao rejeitar interesse:', error);
      toast.error(error.response?.data?.message || 'Erro ao rejeitar interesse');
    }
  };

  const handleStartChat = (freightId, driverId, companyId) => {
    console.log('🚀 Iniciando chat:', { freightId, driverId, companyId });
    console.log('📊 selectedFreight:', selectedFreight);
    
    setChatFreightId(freightId);
    setChatDriverId(driverId);
    setChatCompanyId(companyId);
    setIsChatOpen(true);
    toast.success('Abrindo chat com motorista...');
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setChatFreightId(null);
    setChatDriverId(null);
    setChatCompanyId(null);
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return 'A consultar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatRoute = (freight) => {
    const origin = freight.origin_city && freight.origin_state 
      ? `${freight.origin_city}/${freight.origin_state}` 
      : (freight.pickup_city && freight.pickup_state 
        ? `${freight.pickup_city}/${freight.pickup_state}` 
        : 'Origem não informada');
    const destination = freight.destination_city && freight.destination_state 
      ? `${freight.destination_city}/${freight.destination_state}` 
      : (freight.delivery_city && freight.delivery_state 
        ? `${freight.delivery_city}/${freight.delivery_state}` 
        : 'Destino não informado');
    return `${origin} → ${destination}`;
  };

  const getFreightPrice = (freight) => {
    return freight.suggested_price || freight.price || freight.value || freight.amount || null;
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

      {/* Resumo de Interesses */}
      {freights.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Resumo de Interesses</span>
              </div>
              <div className="flex space-x-6 text-sm">
                <div className="text-center">
                  <div className="font-bold text-blue-900">
                    {freights.reduce((total, freight) => total + (freight.interests_count || 0), 0)}
                  </div>
                  <div className="text-blue-700">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">
                    {freights.filter(f => f.interests_count > 0).length}
                  </div>
                  <div className="text-green-700">Com Interesses</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                    <span className="font-semibold text-green-600">
                      {formatCurrency(getFreightPrice(freight))}
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
                            className="relative"
                          >
                            <Users className="h-4 w-4 mr-1" />
                            Interesses
                            {freight.interests_count > 0 && (
                              <Badge className="ml-1 text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                {freight.interests_count}
                              </Badge>
                            )}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Interesses no Frete</DialogTitle>
                            <DialogDescription>
                              Lista de motoristas que demonstraram interesse neste frete
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {loadingInterests ? (
                              <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                              </div>
                            ) : (!Array.isArray(interests) || interests.length === 0) ? (
                              <div className="text-center py-8">
                                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500">Nenhum motorista demonstrou interesse ainda.</p>
                              </div>
                            ) : (
                              Array.isArray(interests) ? interests.map((interest) => (
                                <Card key={interest.id} className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <h4 className="font-semibold">{interest.driver_name}</h4>
                                        {interest.status && (
                                          <Badge variant={
                                            interest.status === 'accepted' ? 'default' :
                                            interest.status === 'rejected' ? 'destructive' : 'secondary'
                                          }>
                                            {interest.status === 'accepted' ? 'Aceito' :
                                             interest.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-500">
                                        Interesse demonstrado em {formatDate(interest.created_at)}
                                      </p>
                                      {interest.driver_phone && (
                                        <p className="text-sm text-gray-600 mt-1">
                                          📱 {interest.driver_phone}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex space-x-2">
                                      {(!interest.status || interest.status === 'pending') && (
                                        <>
                                          <Button 
                                            size="sm" 
                                            variant="default"
                                            onClick={() => handleAcceptInterest(selectedFreight.id, interest.id)}
                                          >
                                            <Check className="h-4 w-4 mr-1" />
                                            Aceitar
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="destructive"
                                            onClick={() => handleRejectInterest(selectedFreight.id, interest.id)}
                                          >
                                            <X className="h-4 w-4 mr-1" />
                                            Rejeitar
                                          </Button>
                                        </>
                                      )}
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleStartChat(
                                          selectedFreight.id, 
                                          interest.driver_id, 
                                          selectedFreight.company_id
                                        )}
                                      >
                                        <MessageSquare className="h-4 w-4 mr-1" />
                                        Conversar
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              )) : (
                                <div className="text-center py-8">
                                  <div className="text-red-500">Erro ao carregar interesses</div>
                                  <p className="text-gray-500 text-sm mt-2">Tente novamente em alguns instantes</p>
                                </div>
                              )
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedFreight(freight)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Frete</DialogTitle>
                            <DialogDescription>
                              Informações completas sobre este frete
                            </DialogDescription>
                          </DialogHeader>
                          {selectedFreight && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Origem</h4>
                                  <p className="text-sm">{selectedFreight.origin_city}/{selectedFreight.origin_state}</p>
                                  <p className="text-sm">{selectedFreight.origin_zipcode}</p>
                                  <p className="text-sm">{selectedFreight.origin_address}</p>
                                  <p className="text-sm">Data: {formatDate(selectedFreight.pickup_date)}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Destino</h4>
                                  <p className="text-sm">{selectedFreight.destination_city}/{selectedFreight.destination_state}</p>
                                  <p className="text-sm">{selectedFreight.destination_zipcode}</p>
                                  <p className="text-sm">{selectedFreight.destination_address}</p>
                                  <p className="text-sm">Prazo: {formatDate(selectedFreight.delivery_deadline)}</p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">Carga</h4>
                                <p className="text-sm">{selectedFreight.description || selectedFreight.title}</p>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                  <p className="text-sm">Peso: {selectedFreight.cargo_weight}kg</p>
                                  <p className="text-sm">Volume: {selectedFreight.cargo_volume}m³</p>
                                  <p className="text-sm">Tipo: {selectedFreight.cargo_type}</p>
                                  <p className="text-sm">Preço: {getFreightPrice(selectedFreight)}</p>
                                </div>
                              </div>
                              
                              {selectedFreight.special_requirements && (
                                <div>
                                  <h4 className="font-semibold mb-2">Requisitos Especiais</h4>
                                  <p className="text-sm">{selectedFreight.special_requirements}</p>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Veículo</h4>
                                  <p className="text-sm">Tipo: {selectedFreight.required_vehicle_type}</p>
                                  <p className="text-sm">Carroceria: {selectedFreight.required_body_type}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Informações</h4>
                                  <p className="text-sm">Status: {selectedFreight.status}</p>
                                  <p className="text-sm">Visualizações: {selectedFreight.views_count}</p>
                                  <p className="text-sm">Interesses: {selectedFreight.interests_count}</p>
                                </div>
                              </div>
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

    {/* Componente de Chat */}
    {isChatOpen && (
      <Chat
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        freightId={chatFreightId}
        companyId={chatCompanyId}
        driverId={chatDriverId}
      />
    )}
    </div>
  );
}
