import React, { useState, useEffect } from 'react'
import { MessageSquare, Search, Users, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '../hooks/use-auth.jsx'
import { getCompanyFreights, getFreightInterests } from '../config/api'
import Chat from '../components/Chat'
import { toast } from 'react-hot-toast'

export default function MessagesPage() {
  const { user, isLoading: userLoading } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    console.log('👤 MessagesPage - User changed:', user?.user_type, user?.id)
    if (user) {
      console.log('🔄 User loaded, starting conversation load...')
      loadConversations()
    }
  }, [user])

  const loadConversations = async () => {
    console.log('🔍 LOADING CONVERSATIONS - Starting...');
    
    if (!user) {
      console.warn('Usuário não carregado ainda')
      return
    }

    try {
      setLoading(true)
      console.log('� Getting company freights for user:', user.id);
      
      // Para empresas, precisamos buscar os fretes da empresa primeiro
      const response = await getCompanyFreights()
      console.log('📡 Company freights response:', response.data);
      
      if (!response.data.success) {
        throw new Error('Failed to fetch company freights')
      }

      const freights = response.data.freights || []
      console.log('📦 Company freights found:', freights.length);
      
      const conversations = []

      // Para cada frete, buscar os interesses aceitos OU fretes que já têm motorista atribuído
      for (const freight of freights) {
        try {
          console.log(`🔍 Checking freight ${freight.id}: ${freight.title}`);
          console.log(`📊 Freight status: ${freight.status}, assigned_driver: ${freight.assigned_driver_id}`);
          
          // Se o frete já tem motorista atribuído, criar conversa diretamente
          if (freight.assigned_driver_id && ['in_progress', 'completed'].includes(freight.status)) {
            console.log(`✅ Freight ${freight.id} has assigned driver: ${freight.assigned_driver_id}`);
            
            // Buscar dados do motorista nos interesses para ter o nome
            try {
              const interestsResponse = await getFreightInterests(freight.id)
              let driverName = 'Motorista Atribuído'
              let driverData = null
              
              if (interestsResponse.data.success && Array.isArray(interestsResponse.data.interests)) {
                const assignedDriverInterest = interestsResponse.data.interests.find(interest => 
                  interest.driver_id === freight.assigned_driver_id
                )
                
                if (assignedDriverInterest) {
                  driverName = assignedDriverInterest.driver?.full_name || assignedDriverInterest.driver?.name || driverName
                  driverData = assignedDriverInterest.driver
                }
              }

              const conversation = {
                id: `${freight.id}-${freight.assigned_driver_id}`,
                freightId: freight.id,
                companyId: user.id,
                driverId: freight.assigned_driver_id,
                participant: driverName,
                participantType: 'driver',
                lastMessage: 'Chat liberado - frete aceito',
                timestamp: new Date(freight.updated_at || freight.created_at).toLocaleDateString('pt-BR'),
                unread: 0,
                freight: {
                  id: freight.id,
                  title: freight.title,
                  origin: freight.origin_city,
                  destination: freight.destination_city,
                  price: freight.suggested_price || freight.accepted_price
                },
                status: freight.status,
                driver: driverData
              }
              
              console.log('💬 Created conversation from assigned freight:', conversation);
              conversations.push(conversation)
            } catch (error) {
              console.error(`❌ Error getting driver details for freight ${freight.id}:`, error);
              
              // Criar conversa mesmo sem dados do motorista
              const conversation = {
                id: `${freight.id}-${freight.assigned_driver_id}`,
                freightId: freight.id,
                companyId: user.id,
                driverId: freight.assigned_driver_id,
                participant: 'Motorista Atribuído',
                participantType: 'driver',
                lastMessage: 'Chat liberado - frete aceito',
                timestamp: new Date(freight.updated_at || freight.created_at).toLocaleDateString('pt-BR'),
                unread: 0,
                freight: {
                  id: freight.id,
                  title: freight.title,
                  origin: freight.origin_city,
                  destination: freight.destination_city,
                  price: freight.suggested_price || freight.accepted_price
                },
                status: freight.status
              }
              
              console.log('💬 Created conversation from assigned freight (fallback):', conversation);
              conversations.push(conversation)
            }
            
            continue // Pular para o próximo frete
          }
          
          // Lógica original para interesses aceitos (mas ainda não atribuídos)
          const interestsResponse = await getFreightInterests(freight.id)
          console.log(`📋 Interests response for freight ${freight.id}:`, interestsResponse.data);
          
          if (interestsResponse.data.success && Array.isArray(interestsResponse.data.interests)) {
            const acceptedInterests = interestsResponse.data.interests.filter(interest => 
              ['accepted'].includes(interest.status) // Removido 'in_progress' pois agora é tratado acima
            )

            console.log(`✅ Accepted interests for freight ${freight.id}:`, acceptedInterests.length);

            // Para cada interesse aceito, criar uma conversa
            acceptedInterests.forEach(interest => {
              const conversation = {
                id: `${freight.id}-${interest.id}`, // ID único da conversa
                freightId: freight.id,
                companyId: user.id,
                driverId: interest.driver_id,
                participant: interest.driver?.full_name || interest.driver?.name || 'Motorista',
                participantType: 'driver',
                lastMessage: 'Conversa disponível - clique para iniciar',
                timestamp: new Date(interest.updated_at || interest.created_at).toLocaleDateString('pt-BR'),
                unread: 0,
                freight: {
                  id: freight.id,
                  title: freight.title,
                  origin: freight.origin_city,
                  destination: freight.destination_city,
                  price: freight.suggested_price || freight.price
                },
                status: interest.status,
                driver: interest.driver,
                interest: interest
              }
              
              console.log('💬 Created conversation from interest:', conversation);
              conversations.push(conversation)
            })
          }
        } catch (error) {
          console.error(`❌ Error fetching interests for freight ${freight.id}:`, error);
        }
      }

      console.log('🎯 Final conversations:', conversations.length);
      setConversations(conversations)
      
    } catch (error) {
      console.error('💥 Error loading conversations:', error)
      toast.error(`Erro ao carregar conversas: ${error.message}`)
      setConversations([])
    } finally {
      setLoading(false)
      console.log('🏁 LOADING CONVERSATIONS - Finished');
    }
  }

  const filteredConversations = conversations.filter(conv => 
    conv.participant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.freight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.freight.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.freight.destination.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectChat = (conversation) => {
    setSelectedChat(conversation)
    setIsChatOpen(true)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'accepted': { label: 'Aceito', color: 'bg-green-100 text-green-800' },
      'in_progress': { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
      'completed': { label: 'Concluído', color: 'bg-gray-100 text-gray-800' }
    }
    
    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    
    return (
      <Badge className={`${config.color} text-xs`}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Mensagens</h1>
        </div>
        <Button variant="outline" onClick={loadConversations} disabled={loading}>
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de conversas */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Conversas ({filteredConversations.length})</span>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar conversas..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading || userLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Carregando conversas...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Nenhuma conversa encontrada</p>
                <p className="text-xs text-gray-400 mt-1">
                  As conversas aparecerão quando você aceitar fretes ou seus fretes forem aceitos
                </p>
              </div>
            ) : (
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectChat(conv)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedChat?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm truncate">{conv.participant}</h4>
                        <span className="text-xs text-gray-500">{conv.timestamp}</span>
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        <div className="flex items-center space-x-1 mb-1">
                          <MapPin className="h-3 w-3" />
                          <span>{conv.freight.origin} → {conv.freight.destination}</span>
                        </div>
                        <p className="font-medium">{conv.freight.title}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {getStatusBadge(conv.status)}
                        <span className="text-xs font-medium text-green-600">
                          R$ {conv.freight.price.toLocaleString('pt-BR')}
                        </span>
                        {conv.unread > 0 && (
                          <Badge className="bg-blue-600 text-white text-xs">
                            {conv.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Área de preview */}
        <Card className="lg:col-span-2">
          {selectedChat ? (
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <MessageSquare className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Chat com {selectedChat.participant}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedChat.freight.origin} → {selectedChat.freight.destination}</span>
                    </div>
                    <p className="font-medium">{selectedChat.freight.title}</p>
                    <div className="flex items-center justify-center space-x-4">
                      {getStatusBadge(selectedChat.status)}
                      <span className="font-semibold text-green-600">
                        R$ {selectedChat.freight.price.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setIsChatOpen(true)} 
                  className="w-full"
                  size="lg"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Abrir Chat
                </Button>
              </div>
            </CardContent>
          ) : (
            <CardContent className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecione uma conversa</h3>
                <p className="text-gray-500 max-w-md">
                  Escolha uma conversa da lista ao lado para visualizar os detalhes e iniciar o chat.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Chat Modal */}
      {selectedChat && (
        <Chat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          freightId={selectedChat.freightId}
          companyId={selectedChat.companyId}
          driverId={selectedChat.driverId}
        />
      )}
    </div>
  )
}

