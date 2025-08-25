import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import { useAuth } from '../hooks/use-auth.jsx'
import { getChatRooms, getChatMessages, markChatAsRead } from '../config/api'
import { API_BASE_URL } from '../config/api'

const Chat = ({ isOpen, onClose, freightId, companyId, driverId }) => {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [roomId, setRoomId] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isOpen && user) {
      // Inicializar conexão WebSocket
      const token = localStorage.getItem('access_token')
      const newSocket = io(API_BASE_URL, {
        auth: {
          token: token
        }
      })

      newSocket.on('connect', () => {
        console.log('Conectado ao chat')
        setIsConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('Desconectado do chat')
        setIsConnected(false)
      })

      newSocket.on('receive_message', (message) => {
        setMessages(prev => [...prev, message])
        scrollToBottom()
      })

      setSocket(newSocket)

      // Criar/entrar na sala de chat
      if (freightId) {
        const room = `freight_${freightId}_${companyId}_${driverId}`
        setRoomId(room)
        newSocket.emit('join_room', { room })
        loadChatMessages(room)
      }

      return () => {
        newSocket.close()
      }
    }
  }, [isOpen, user, freightId, companyId, driverId])

  const loadChatMessages = async (room) => {
    try {
      // Por enquanto, usar mensagens mockadas até a API estar pronta
      const mockMessages = [
        {
          id: 1,
          message: 'Olá! Tenho interesse neste frete.',
          user_id: driverId,
          user_name: 'Motorista',
          timestamp: new Date().toISOString(),
          is_mine: user.id === driverId
        },
        {
          id: 2,
          message: 'Olá! Vamos conversar sobre os detalhes.',
          user_id: companyId,
          user_name: 'Empresa',
          timestamp: new Date().toISOString(),
          is_mine: user.id === companyId
        }
      ]
      setMessages(mockMessages)
      scrollToBottom()
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !roomId) return

    const messageData = {
      room: roomId,
      message: newMessage,
      freight_id: freightId,
      timestamp: new Date().toISOString()
    }

    socket.emit('send_message', messageData)
    
    // Adicionar mensagem localmente (será substituída pela do servidor)
    const tempMessage = {
      id: Date.now(),
      message: newMessage,
      user_id: user.id,
      user_name: user.company?.company_name || user.driver?.full_name || 'Você',
      timestamp: new Date().toISOString(),
      is_mine: true
    }
    
    setMessages(prev => [...prev, tempMessage])
    setNewMessage('')
    scrollToBottom()
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
            <h3 className="text-lg font-medium text-gray-900">Chat do Frete</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 text-sm">
              Nenhuma mensagem ainda. Inicie a conversa!
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.is_mine
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">
                    {message.user_name}
                  </div>
                  <div className="text-sm">{message.message}</div>
                  <div className="text-xs mt-1 opacity-75">
                    {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={!isConnected}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !isConnected}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div className="mt-2 flex items-center text-xs text-gray-500">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {isConnected ? 'Conectado' : 'Conectando...'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat
