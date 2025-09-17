import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../hooks/use-auth.jsx';
import { API_BASE_URL, getChatRooms } from '../config/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Send, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Chat = ({ isOpen, onClose, freightId, companyId, driverId }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRoomId, setChatRoomId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [joinAttempts, setJoinAttempts] = useState(0);
  const [chatUnavailable, setChatUnavailable] = useState(false);
  const messagesEndRef = useRef(null);
  const attemptCountRef = useRef(0);

  useEffect(() => {
    if (isOpen && user) {
      setJoinAttempts(0); // Reset tentativas
      attemptCountRef.current = 0; // Reset ref counter
      setChatUnavailable(false); // Reset status
      initializeChat();
    }

    return () => {
      if (socket) {
        console.log('🔌 Desconectando WebSocket...');
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [isOpen, user, freightId, companyId, driverId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      console.log('🚀 Iniciando chat:', { freightId, driverId, companyId });
      
      // Criar room ID baseado na documentação
      const roomId = `freight_${freightId}_company_${companyId}_driver_${driverId}`;
      setChatRoomId(roomId);
      
      // Primeiro verificar se o chat room existe na API REST
      try {
        console.log('🔍 Verificando chat rooms existentes...');
        const chatRoomsResponse = await getChatRooms();
        console.log('📡 Chat rooms response:', chatRoomsResponse.data);
        
        const existingRoom = chatRoomsResponse.data.chat_rooms?.find(room => 
          room.id === roomId || room.freight_id === freightId
        );
        
        console.log('🏠 Room existente encontrado:', existingRoom);
        
        if (existingRoom) {
          console.log('✅ Chat room existe, conectando WebSocket...');
          connectWebSocket(existingRoom.id);
        } else {
          console.log('❌ Chat room não existe ainda');
          // Tentar conectar mesmo assim - o backend pode criar automaticamente
          connectWebSocket(roomId);
        }
        
      } catch (apiError) {
        console.error('❌ Erro ao verificar chat rooms:', apiError);
        // Tentar conectar mesmo assim
        connectWebSocket(roomId);
      }
      
    } catch (error) {
      console.error('❌ Erro ao inicializar chat:', error);
      toast.error('Erro ao conectar chat');
      setIsLoading(false);
    }
  };

  const connectWebSocket = (roomId) => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error('❌ Token não encontrado');
      toast.error('Token de autenticação não encontrado');
      setIsLoading(false);
      return;
    }
    
    console.log('🔌 Conectando WebSocket...', { 
      roomId, 
      baseURL: API_BASE_URL,
      hasToken: !!token
    });
    
    try {
      // Configuração baseada na documentação
      const newSocket = io(API_BASE_URL, {
        auth: {
          token: `Bearer ${token}` // ⚠️ OBRIGATÓRIO o prefixo "Bearer "
        },
        transports: ['websocket', 'polling'], // ⚠️ Transports obrigatório para web
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        forceNew: true,
        autoConnect: true
      });

      // Eventos de conexão
      newSocket.on('connect', () => {
        console.log('✅ Conectado ao WebSocket');
        setIsConnected(true);
        setIsLoading(false);
        
        // Entrar na sala específica
        console.log('🏠 Entrando no chat:', roomId);
        newSocket.emit('join_chat', {
          chat_room_id: roomId,
          freight_id: freightId,
          company_id: companyId,
          driver_id: driverId
        });
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Erro de conexão WebSocket:', error);
        toast.error(`Erro de conexão: ${error.message}`);
        setIsConnected(false);
        setIsLoading(false);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Desconectado do WebSocket');
        setIsConnected(false);
      });

      // Eventos específicos do chat baseados na documentação
      newSocket.on('joined_chat', (data) => {
        console.log('🏠 Entrou no chat com sucesso:', data);
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
          setTimeout(scrollToBottom, 100);
        }
      });

      newSocket.on('new_message', (message) => {
        console.log('📨 Nova mensagem recebida:', message);
        setMessages(prev => [...prev, message]);
        setTimeout(scrollToBottom, 100);
      });

      newSocket.on('message_sent', (data) => {
        console.log('✅ Mensagem enviada:', data.message_id);
      });

      newSocket.on('messages_read', (data) => {
        console.log('📖 Mensagens lidas por:', data.reader_id);
      });

      newSocket.on('error', (error) => {
        console.error('❌ Erro no chat:', error);
        
        if (error.message === 'Chat não encontrado') {
          attemptCountRef.current += 1;
          console.log(`🔄 Tentativa atual: ${attemptCountRef.current}/2`);
          
          if (attemptCountRef.current <= 2) {
            console.log(`🛠️ Tentando criar chat room automaticamente... (tentativa ${attemptCountRef.current}/2)`);
            setJoinAttempts(attemptCountRef.current);
            
            // Tentar criar o chat room enviando dados adicionais - APENAS UMA VEZ
            setTimeout(() => {
              if (newSocket.connected && attemptCountRef.current <= 2) {
                console.log('📤 Enviando join_chat com create_if_not_exists...');
                newSocket.emit('join_chat', {
                  chat_room_id: roomId,
                  freight_id: freightId,
                  company_id: companyId,
                  driver_id: driverId,
                  create_if_not_exists: true
                });
              }
            }, 1500); // Delay maior
          } else {
            console.error('❌ Falha ao criar chat após 2 tentativas');
            setChatUnavailable(true);
            setIsLoading(false);
            toast.error('Chat não disponível. O backend precisa criar o chat room para este frete.');
          }
        } else {
          toast.error(`Erro no chat: ${error.message}`);
        }
      });

      setSocket(newSocket);

      // Debug: Log de todos os eventos
      newSocket.onAny((eventName, ...args) => {
        console.log(`🔄 Evento WebSocket: ${eventName}`, args);
      });

    } catch (error) {
      console.error('❌ Erro ao criar socket:', error);
      toast.error('Erro ao criar conexão WebSocket');
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    if (socket && isConnected) {
      console.log('📤 Enviando mensagem:', newMessage);
      
      // Baseado na documentação
      socket.emit('send_message', {
        chat_room_id: chatRoomId,
        content: newMessage.trim(),
        message_type: 'text'
      });
      
      setNewMessage('');
    } else {
      toast.error('Chat desconectado. Tente novamente.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat - Frete #{freightId?.substring(0, 8)}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          {/* Status de conexão */}
          <div className="mb-3">
            <div className={`text-xs px-3 py-1 rounded-full text-center ${
              isConnected 
                ? 'bg-green-100 text-green-700' 
                : isLoading 
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {isLoading ? 'Conectando ao servidor...' : isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
            </div>
          </div>

          {/* Loading, Chat não disponível ou Conteúdo do chat */}
          {chatUnavailable ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Chat Indisponível</h3>
                <p className="text-gray-600 mb-4">
                  Este chat não está disponível no momento. O sistema tentou criar automaticamente mas não foi possível.
                </p>
                <p className="text-sm text-gray-500">
                  Entre em contato através dos dados do frete ou tente novamente mais tarde.
                </p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                {joinAttempts === 0 ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Conectando ao chat...</p>
                    <p className="text-xs text-gray-500 mt-1">Aguarde a conexão WebSocket...</p>
                  </>
                ) : (
                  <>
                    <div className="animate-pulse rounded-full h-8 w-8 bg-yellow-200 mx-auto flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-yellow-600" />
                    </div>
                    <p className="mt-2 text-gray-600">Criando sala de chat...</p>
                    <p className="text-xs text-gray-500 mt-1">Tentativa {joinAttempts}/2</p>
                  </>
                )}
              </div>
            </div>
          ) : null}

          {/* Área de mensagens */}
          {!isLoading && !chatUnavailable && (
            <>
              <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-3 border rounded-lg bg-gray-50">
                {!isConnected ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium text-red-600">Chat desconectado</p>
                    <p className="text-sm mt-2">Problema de conexão com o servidor.</p>
                    <p className="text-xs mt-1 text-gray-400">Tente reabrir o chat.</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Chat liberado!</p>
                    <p className="text-sm">O interesse foi aceito. Digite uma mensagem para iniciar a conversa.</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMyMessage = message.sender_id === user.id || 
                                        (user.user_type === 'company' && message.sender_type === 'company') ||
                                        (user.user_type === 'driver' && message.sender_type === 'driver');
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg shadow-sm ${
                            isMyMessage
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-800 border'
                          }`}
                        >
                          <div className={`text-xs mb-1 ${isMyMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                            {message.sender_name || (message.sender_type === 'company' ? 'Empresa' : 'Motorista')}
                          </div>
                          <div className="break-words">{message.content}</div>
                          <div className={`text-xs mt-1 ${isMyMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                            {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de mensagem */}
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    !isConnected && joinAttempts >= 2 
                      ? "Chat indisponível..." 
                      : isConnected 
                      ? "Digite sua mensagem..." 
                      : "Aguarde conexão..."
                  }
                  disabled={!isConnected || joinAttempts >= 2}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !isConnected}
                  size="sm"
                  className="px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Chat;
