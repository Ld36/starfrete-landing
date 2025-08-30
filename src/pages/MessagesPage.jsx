import { MessageSquare, Send, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  // Mock data para demonstração
  const conversations = [
    {
      id: 1,
      participant: 'João Silva',
      lastMessage: 'Confirmando a coleta para amanhã às 8h',
      timestamp: '10:30',
      unread: 2,
      freight: 'FR001'
    },
    {
      id: 2,
      participant: 'Maria Santos',
      lastMessage: 'Qual é o endereço exato de entrega?',
      timestamp: '09:15',
      unread: 0,
      freight: 'FR002'
    },
    {
      id: 3,
      participant: 'Carlos Lima',
      lastMessage: 'Carga entregue com sucesso!',
      timestamp: 'Ontem',
      unread: 1,
      freight: 'FR003'
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'João Silva',
      message: 'Boa tarde! Vi seu frete para Rio de Janeiro',
      timestamp: '14:30',
      isOwn: false
    },
    {
      id: 2,
      sender: 'Você',
      message: 'Boa tarde! Sim, preciso entregar até quinta-feira',
      timestamp: '14:32',
      isOwn: true
    },
    {
      id: 3,
      sender: 'João Silva',
      message: 'Perfeito, posso fazer a coleta amanhã às 8h',
      timestamp: '14:35',
      isOwn: false
    }
  ];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Aqui você adicionaria a lógica para enviar a mensagem
    setNewMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Mensagens</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Lista de conversas */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">Conversas</CardTitle>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar conversas..."
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedChat(conv)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedChat?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{conv.participant}</h4>
                        <span className="text-xs text-gray-500">{conv.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 truncate">{conv.lastMessage}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {conv.freight}
                        </Badge>
                        {conv.unread > 0 && (
                          <Badge className="bg-blue-600 text-white text-xs">
                            {conv.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Área de conversa */}
        <Card className="lg:col-span-2">
          {selectedChat ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedChat.participant}</CardTitle>
                    <p className="text-sm text-gray-500">Frete: {selectedChat.freight}</p>
                  </div>
                  <Badge variant="outline">Online</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-0">
                {/* Mensagens */}
                <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.isOwn ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input de mensagem */}
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 resize-none"
                      rows={2}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecione uma conversa</h3>
                <p className="text-gray-500">Escolha uma conversa da lista ao lado para começar a conversar.</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
