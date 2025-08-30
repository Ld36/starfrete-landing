import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth.jsx';
import DriverLayout from '../components/layout/DriverLayout.jsx';
import { MessageSquare, Send, Search, User, Clock, CheckCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export default function DriverMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Dados mock para demonstração (substitua por chamadas reais à API)
  useEffect(() => {
    // Simular carregamento de conversas
    setTimeout(() => {
      setConversations([
        {
          id: 1,
          companyName: 'Transportadora ABC',
          freightId: 101,
          lastMessage: 'Olá, gostaria de saber mais detalhes sobre a entrega.',
          lastMessageTime: '10:30',
          unreadCount: 2,
          status: 'online'
        },
        {
          id: 2,
          companyName: 'Logística XYZ',
          freightId: 102,
          lastMessage: 'Perfeito! Aguardo confirmação da data.',
          lastMessageTime: '09:15',
          unreadCount: 0,
          status: 'offline'
        },
        {
          id: 3,
          companyName: 'Cargas Rápidas',
          freightId: 103,
          lastMessage: 'Documentos enviados por email.',
          lastMessageTime: 'Ontem',
          unreadCount: 1,
          status: 'online'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    
    // Simular carregamento de mensagens
    const mockMessages = [
      {
        id: 1,
        sender: 'company',
        senderName: conversation.companyName,
        message: 'Olá! Vi seu interesse no frete #' + conversation.freightId,
        timestamp: '2024-01-15 09:00',
        read: true
      },
      {
        id: 2,
        sender: 'driver',
        senderName: user?.fullName || user?.email,
        message: 'Sim, tenho interesse! Poderia me passar mais detalhes?',
        timestamp: '2024-01-15 09:05',
        read: true
      },
      {
        id: 3,
        sender: 'company',
        senderName: conversation.companyName,
        message: 'Claro! A carga é de São Paulo para Rio de Janeiro, 5 toneladas.',
        timestamp: '2024-01-15 09:10',
        read: true
      },
      {
        id: 4,
        sender: 'driver',
        senderName: user?.fullName || user?.email,
        message: 'Perfeito! Tenho disponibilidade para essa rota.',
        timestamp: '2024-01-15 09:15',
        read: true
      }
    ];
    
    setMessages(mockMessages);
    
    // Marcar conversa como lida
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id ? {...conv, unreadCount: 0} : conv
    ));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const newMsg = {
      id: messages.length + 1,
      sender: 'driver',
      senderName: user?.fullName || user?.email,
      message: newMessage,
      timestamp: new Date().toLocaleString(),
      read: false
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');

    // Atualizar última mensagem na conversa
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? {...conv, lastMessage: newMessage, lastMessageTime: 'Agora'}
        : conv
    ));
  };

  const filteredConversations = conversations.filter(conv =>
    conv.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.freightId.toString().includes(searchTerm)
  );

  const formatTime = (time) => {
    if (time === 'Agora' || time === 'Ontem') return time;
    return time;
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

  return (
    <DriverLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mensagens</h1>
          <p className="text-gray-600">Converse com as empresas sobre seus fretes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
          {/* Lista de Conversas */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <CardTitle>Conversas</CardTitle>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar conversas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto max-h-[550px]">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Nenhuma conversa encontrada</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => handleSelectConversation(conversation)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConversation?.id === conversation.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900 truncate">
                                    {conversation.companyName}
                                  </h4>
                                  <div className={`w-2 h-2 rounded-full ${
                                    conversation.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                                  }`}></div>
                                </div>
                                <p className="text-xs text-gray-500">
                                  Frete #{conversation.freightId}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 truncate mb-1">
                              {conversation.lastMessage}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                {formatTime(conversation.lastMessageTime)}
                              </span>
                              {conversation.unreadCount > 0 && (
                                <Badge variant="default" className="text-xs">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Área de Chat */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              {!selectedConversation ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Selecione uma conversa
                    </h3>
                    <p className="text-gray-500">
                      Escolha uma conversa da lista para começar a chat.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header do Chat */}
                  <CardHeader className="border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedConversation.companyName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            selectedConversation.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          <p className="text-sm text-gray-500">
                            {selectedConversation.status === 'online' ? 'Online' : 'Offline'} • 
                            Frete #{selectedConversation.freightId}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Mensagens */}
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[450px]">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === 'driver' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender === 'driver'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <div className={`flex items-center gap-1 mt-1 text-xs ${
                            message.sender === 'driver' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <Clock className="h-3 w-3" />
                            <span>{new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                            {message.sender === 'driver' && (
                              <CheckCheck className={`h-3 w-3 ${
                                message.read ? 'text-blue-200' : 'text-blue-300'
                              }`} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>

                  {/* Input de Nova Mensagem */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 p-2 border rounded-lg"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Enviar
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Conversas</p>
                  <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Não Lidas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {conversations.reduce((total, conv) => total + conv.unreadCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Empresas Ativas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {conversations.filter(conv => conv.status === 'online').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                  <p className="text-2xl font-bold text-gray-900">5min</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DriverLayout>
  );
}
