import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth.jsx'
import { useCompanyDashboard } from '../hooks/use-data-hooks.js'
import { toast } from 'react-hot-toast'
import Chat from '../components/Chat'
import { VEHICLE_TYPES, BODY_TYPES } from '../constants/vehicleTypes'
import {
  getCompanyFreights,
  getCompanyStats,
  createFreight,
  updateFreight,
  deleteFreight,
  getFreightInterests,
  acceptFreightInterest,
  rejectFreightInterest,
  getChatMessages,
  markChatAsRead
} from '../config/api'

const CompanyDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  // Usar hook otimizado específico para dashboard da empresa
  const { freights, stats, loading: dataLoading, refresh } = useCompanyDashboard()
  
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showInterestsModal, setShowInterestsModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [selectedFreightForInterests, setSelectedFreightForInterests] = useState(null)
  const [selectedFreightForChat, setSelectedFreightForChat] = useState(null)
  const [editingFreight, setEditingFreight] = useState(null)
  const [subscription, setSubscription] = useState(null)
  
  // Funções de formatação
  const formatCEP = (value) => {
    const numericValue = value.replace(/\D/g, '')
    if (numericValue.length <= 5) {
      return numericValue
    }
    return numericValue.slice(0, 5) + '-' + numericValue.slice(5, 8)
  }

  const formatState = (value) => {
    return value.toUpperCase().slice(0, 2)
  }
  
  // Novos estados para candidaturas e histórico de chat
  const [showCandidatesModal, setShowCandidatesModal] = useState(false)
  const [selectedFreightCandidates, setSelectedFreightCandidates] = useState([])
  const [showChatHistoryModal, setShowChatHistoryModal] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [chatReceiverId, setChatReceiverId] = useState(null)

  // Estados para criar frete
  const [newFreight, setNewFreight] = useState({
    title: '',
    description: '',
    origin_address: '',
    origin_city: '',
    origin_state: '',
    origin_zipcode: '',
    destination_address: '',
    destination_city: '',
    destination_state: '',
    destination_zipcode: '',
    cargo_type: '',
    cargo_weight: '',
    cargo_volume: '',
    required_vehicle_type: VEHICLE_TYPES[0]?.value || '',
    required_vehicle_capacity: '',
    required_body_type: BODY_TYPES[0]?.value || '',
    pickup_date: '',
    delivery_deadline: '',
    suggested_price: ''
  })

  useEffect(() => {
    if (user) {
      refresh()
    }
  }, [user]) // Removendo 'refresh' para evitar loops infinitos

  const loadDashboardData = async () => {
    return refresh()
  }

  // Buscar candidaturas para um frete
  const handleViewInterests = async (freight) => {
    try {
      setSelectedFreightForInterests(freight)
      setLoading(true)
      // O endpoint correto deve ser getFreightInterests
      const response = await getFreightInterests(freight.id)
      setFreights(response.data.data) // Esta linha parece incorreta. setFreights deveria ser setFreightInterests
      // setShowInterestsModal(true)
    } catch (error) {
      console.error('Error fetching freight interests:', error)
      toast.error('Erro ao buscar candidaturas')
    } finally {
      setLoading(false)
    }
  }

  // Função para visualizar candidatos de um frete
  const handleViewCandidates = async (freight) => {
    try {
      setLoading(true)
      const response = await getFreightInterests(freight.id)
      
      if (response.data.success && response.data.interests) {
        setSelectedFreightCandidates(response.data.interests)
        setSelectedFreightForInterests(freight)
        setShowCandidatesModal(true)
      } else {
        toast.info('Nenhuma candidatura encontrada para este frete')
        setSelectedFreightCandidates([])
        setSelectedFreightForInterests(freight)
        setShowCandidatesModal(true)
      }
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error)
      toast.error('Erro ao carregar candidatos')
      setSelectedFreightCandidates([])
    } finally {
      setLoading(false)
    }
  }

  // Função para aceitar candidatura
  const handleAcceptCandidate = async (interestId) => {
    try {
      const response = await acceptFreightInterest(interestId)
      
      if (response.data.success) {
        toast.success('Candidatura aceita com sucesso!')
        
        // Atualizar lista de candidatos
        await handleViewCandidates(selectedFreightForInterests)
        
        // Recarregar dados do dashboard
        await refresh()
      }
    } catch (error) {
      console.error('Erro ao aceitar candidatura:', error)
      toast.error('Erro ao aceitar candidatura')
    }
  }

  // Função para rejeitar candidatura
  const handleRejectCandidate = async (interestId) => {
    if (!window.confirm('Tem certeza que deseja rejeitar esta candidatura?')) {
      return
    }

    try {
      const response = await rejectFreightInterest(interestId)
      
      if (response.data.success) {
        toast.success('Candidatura rejeitada')
        
        // Atualizar lista de candidatos
        await handleViewCandidates(selectedFreightForInterests)
      }
    } catch (error) {
      console.error('Erro ao rejeitar candidatura:', error)
      toast.error('Erro ao rejeitar candidatura')
    }
  }

  // Função para abrir chat com histórico
  const handleOpenChatHistory = async (freight) => {
    try {
      setLoading(true)
      // Usar o ID do frete como roomId para buscar mensagens
      const response = await getChatMessages(freight.id)
      
      if (response.data.success && response.data.messages) {
        setChatHistory(response.data.messages)
      } else {
        setChatHistory([])
      }
      
      setSelectedFreightForChat(freight)
      setShowChatHistoryModal(true)
    } catch (error) {
      console.error('Erro ao buscar histórico de chat:', error)
      toast.error('Erro ao carregar histórico de chat')
      setChatHistory([])
      setSelectedFreightForChat(freight)
      setShowChatHistoryModal(true)
    } finally {
      setLoading(false)
    }
  }

  // Função para iniciar chat com motorista específico
  const handleStartChat = (driverId) => {
    setChatReceiverId(driverId)
    setShowChatModal(true)
  }

  // Função para tornar frete inativo
  const handleDeactivateFreight = async () => {
    if (!editingFreight) return
    
    try {
      // Usar apenas o status, sem alterar outros campos que podem ter problemas de timezone
      const response = await updateFreight(editingFreight.id, {
        status: 'inactive'
      })
      
      if (response.data.success) {
        setShowEditModal(false)
        setEditingFreight(null)
        setNewFreight({
          title: '',
          description: '',
          origin_address: '',
          origin_city: '',
          origin_state: '',
          origin_zipcode: '',
          destination_address: '',
          destination_city: '',
          destination_state: '',
          destination_zipcode: '',
          cargo_type: '',
          cargo_weight: '',
          required_vehicle_type: '',
          required_body_type: '',
          pickup_date: '',
          delivery_deadline: '',
          suggested_price: ''
        })
        // Recarregar dados após desativar
        await refresh()
        toast.success('Frete desativado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao desativar frete:', error)
      toast.error(`Erro ao desativar frete: ${error.response?.data?.message || error.message}`)
    }
  }

  // Função para excluir frete (apenas se ativo e sem motoristas)
  const handleDeleteFreight = async (freight) => {
    // Verificar se o frete pode ser excluído
    if (freight.status && freight.status !== 'active') {
      toast.error('Apenas fretes ativos podem ser excluídos.')
      return
    }

    // Verificar se há propostas de motoristas
    if (freight.proposals && freight.proposals.length > 0) {
      toast.error('Não é possível excluir fretes que já possuem propostas de motoristas.')
      return
    }

    if (!window.confirm('Tem certeza que deseja excluir este frete? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const response = await deleteFreight(freight.id)
      
      if (response.data.success) {
        await refresh()
        toast.success('Frete excluído com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao excluir frete:', error)
      toast.error(`Erro ao excluir frete: ${error.response?.data?.message || error.message}`)
    }
  }
  
  const handleCreateFreight = async (e) => {
    e.preventDefault()
    
    try {
      // Validações de campos
      if (newFreight.title.length > 200) {
        toast.error('Título deve ter no máximo 200 caracteres')
        return
      }
      
      if (newFreight.description.length > 1000) {
        toast.error('Descrição deve ter no máximo 1000 caracteres')
        return
      }
      
      if (newFreight.origin_state.length !== 2) {
        toast.error('Estado de origem deve ter exatamente 2 caracteres (ex: SP)')
        return
      }
      
      if (newFreight.destination_state.length !== 2) {
        toast.error('Estado de destino deve ter exatamente 2 caracteres (ex: RJ)')
        return
      }
      
      if (newFreight.origin_zipcode && !/^\d{5}-?\d{3}$/.test(newFreight.origin_zipcode)) {
        toast.error('CEP de origem deve ter o formato 00000-000')
        return
      }
      
      if (newFreight.destination_zipcode && !/^\d{5}-?\d{3}$/.test(newFreight.destination_zipcode)) {
        toast.error('CEP de destino deve ter o formato 00000-000')
        return
      }
      
      if (newFreight.origin_city.length > 100) {
        toast.error('Cidade de origem deve ter no máximo 100 caracteres')
        return
      }
      
      if (newFreight.destination_city.length > 100) {
        toast.error('Cidade de destino deve ter no máximo 100 caracteres')
        return
      }
      
      if (newFreight.cargo_type.length > 100) {
        toast.error('Tipo de carga deve ter no máximo 100 caracteres')
        return
      }
      
      // Preparar dados do frete conforme API
      const freightData = {
        title: newFreight.title,
        description: newFreight.description,
        origin_address: newFreight.origin_address || `${newFreight.origin_city}, ${newFreight.origin_state}`,
        origin_city: newFreight.origin_city,
        origin_state: newFreight.origin_state.toUpperCase(),
        origin_zipcode: newFreight.origin_zipcode,
        destination_address: newFreight.destination_address || `${newFreight.destination_city}, ${newFreight.destination_state}`,
        destination_city: newFreight.destination_city,
        destination_state: newFreight.destination_state.toUpperCase(),
        destination_zipcode: newFreight.destination_zipcode,
        cargo_type: newFreight.cargo_type,
        cargo_weight: parseFloat(newFreight.cargo_weight) || 0,
        cargo_volume: parseFloat(newFreight.cargo_volume) || 0,
        required_vehicle_type: newFreight.required_vehicle_type || VEHICLE_TYPES[0]?.value || 'caminhao_toco',
        required_vehicle_capacity: parseFloat(newFreight.required_vehicle_capacity) || 0,
        required_body_type: newFreight.required_body_type || BODY_TYPES[0]?.value || 'bau_fechado',
        pickup_date: newFreight.pickup_date ? new Date(newFreight.pickup_date).toISOString() : null,
        delivery_deadline: newFreight.delivery_deadline ? new Date(newFreight.delivery_deadline).toISOString() : null,
        suggested_price: newFreight.suggested_price ? parseFloat(newFreight.suggested_price) : 0
      }
      
      const response = await createFreight(freightData)
      
      if (response.data.success) {
        setShowCreateModal(false)
        setNewFreight({
          title: '',
          description: '',
          origin_address: '',
          origin_city: '',
          origin_state: '',
          origin_zipcode: '',
          destination_address: '',
          destination_city: '',
          destination_state: '',
          destination_zipcode: '',
          cargo_type: '',
          cargo_weight: '',
          cargo_volume: '',
          required_vehicle_type: '',
          required_vehicle_capacity: '',
          required_body_type: '',
          pickup_date: '',
          delivery_deadline: '',
          suggested_price: ''
        })
        toast.success('Frete criado com sucesso!')
        refresh() // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao criar frete:', error)
      console.error('Response data:', error.response?.data)
      console.error('Response status:', error.response?.status)
      console.error('Response headers:', error.response?.headers)
      toast.error(`Erro ao criar frete: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleEditFreight = (freight) => {
    setEditingFreight(freight)
    
    // Extrair cidade e estado do campo origin/destination
    const originParts = freight.origin ? freight.origin.split(', ') : ['', '']
    const destParts = freight.destination ? freight.destination.split(', ') : ['', '']
    
    setNewFreight({
      title: freight.title || '',
      description: freight.cargo_description || '',
      origin_city: originParts[0] || '',
      origin_state: originParts[1] || '',
      destination_city: destParts[0] || '',
      destination_state: destParts[1] || '',
      cargo_type: freight.cargo_type || '',
      cargo_weight: freight.cargo_weight?.toString() || '',
      required_vehicle_type: freight.vehicle_type || '',
      required_body_type: '',
      pickup_date: freight.pickup_date || '',
      delivery_deadline: freight.delivery_date || '',
      suggested_price: freight.price?.toString() || ''
    })
    setShowEditModal(true)
  }

  const handleUpdateFreight = async (e) => {
    e.preventDefault()
    
    try {
      const freightData = {
        title: newFreight.title,
        origin: `${newFreight.origin_city}, ${newFreight.origin_state}`,
        destination: `${newFreight.destination_city}, ${newFreight.destination_state}`,
        cargo_type: newFreight.cargo_type,
        cargo_weight: parseFloat(newFreight.cargo_weight),
        cargo_description: newFreight.description,
        price: newFreight.suggested_price ? parseFloat(newFreight.suggested_price) : null,
        pickup_date: newFreight.pickup_date ? new Date(newFreight.pickup_date).toISOString() : null,
        delivery_date: newFreight.delivery_deadline ? new Date(newFreight.delivery_deadline).toISOString() : null,
        vehicle_type: newFreight.required_vehicle_type || 'truck'
      }
      
      const response = await updateFreight(editingFreight.id, freightData)
      
      if (response.data.success) {
        setShowEditModal(false)
        setEditingFreight(null)
        setNewFreight({
          title: '',
          description: '',
          origin_city: '',
          origin_state: '',
          destination_city: '',
          destination_state: '',
          cargo_type: '',
          cargo_weight: '',
          required_vehicle_type: '',
          required_body_type: '',
          pickup_date: '',
          delivery_deadline: '',
          suggested_price: ''
        })
        await refresh()
        toast.success('Frete atualizado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao atualizar frete:', error)
      toast.error(`Erro ao atualizar frete: ${error.response?.data?.message || error.message}`)
    }
  }

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">StarFrete</h1>
              <span className="ml-4 text-gray-500">Dashboard Empresa</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Olá, {user?.company?.company_name || 'Empresa'}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m-5 4l4-4-4-4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Fretes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_freights}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fretes Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active_freights}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fretes Inativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactive_freights}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fretes Completos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed_freights}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ações principais */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Meus Fretes</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Novo Frete
          </button>
        </div>

        {/* Lista de fretes */}
        <div className="bg-white rounded-lg shadow">
          {freights.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m-5 4l4-4-4-4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum frete encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">Comece criando seu primeiro frete.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Criar Primeiro Frete
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frete
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Origem → Destino
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visualizações
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {freights.map((freight) => (
                    <tr key={freight.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {freight.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {freight.cargo_type} - {freight.cargo_weight}kg
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {freight.origin_city}/{freight.origin_state} → {freight.destination_city}/{freight.destination_state}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          freight.status === 'active' 
                            ? 'bg-blue-100 text-blue-800' 
                            : freight.status === 'completed'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {freight.status === 'active' ? 'Ativo' : 
                            freight.status === 'completed' ? 'Completo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {freight.suggested_price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {freight.views_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleViewCandidates(freight)}
                            className="text-green-600 hover:text-green-900"
                            title="Ver Candidaturas"
                          >
                            Candidatos
                          </button>
                          <button 
                            onClick={() => handleOpenChatHistory(freight)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Histórico de Chat"
                          >
                            Chat
                          </button>
                          <button 
                            onClick={() => handleEditFreight(freight)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Editar
                          </button>
                          {freight.status === 'active' && (!freight.proposals || freight.proposals.length === 0) && (
                            <button 
                              onClick={() => handleDeleteFreight(freight)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Excluir
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Candidaturas */}
      {showCandidatesModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Candidatos - {selectedFreightForInterests?.title}
                </h3>
                <button
                  onClick={() => setShowCandidatesModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {selectedFreightCandidates.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma candidatura encontrada para este frete.</p>
              ) : (
                <div className="space-y-4">
                  {selectedFreightCandidates.map((candidate) => (
                    <div key={candidate.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {candidate.driver_name || candidate.driver?.name || 'Motorista'}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Telefone:</strong> {candidate.driver?.phone || 'Não informado'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Email:</strong> {candidate.driver?.email || 'Não informado'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Veículo:</strong> {candidate.driver?.vehicle_type || 'Não especificado'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Data da Candidatura:</strong> {
                              candidate.created_at ? new Date(candidate.created_at).toLocaleDateString('pt-BR') : 'Não informado'
                            }
                          </p>
                          {candidate.message && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Mensagem:</strong> {candidate.message}
                            </p>
                          )}
                          <div className="mt-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              candidate.status === 'accepted' 
                                ? 'bg-green-100 text-green-800' 
                                : candidate.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {candidate.status === 'accepted' ? 'Aceita' : 
                               candidate.status === 'rejected' ? 'Rejeitada' : 'Pendente'}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {candidate.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAcceptCandidate(candidate.id)}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm"
                              >
                                Aceitar
                              </button>
                              <button
                                onClick={() => handleRejectCandidate(candidate.id)}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                              >
                                Rejeitar
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleStartChat(candidate.driver_id)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                          >
                            Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Chat */}
      {showChatModal && chatReceiverId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white" style={{ maxHeight: '80vh' }}>
            <div className="mt-3 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Chat com Motorista
                </h3>
                <button
                  onClick={() => {
                    setShowChatModal(false)
                    setChatReceiverId(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Componente Chat */}
              <div className="flex-1">
                <Chat 
                  receiverId={chatReceiverId}
                  receiverType="driver"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Histórico de Chat */}
      {showChatHistoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white" style={{ maxHeight: '80vh' }}>
            <div className="mt-3 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Histórico de Chat - {selectedFreightForChat?.title}
                </h3>
                <button
                  onClick={() => setShowChatHistoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Área de mensagens históricas */}
              <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-gray-50" style={{ minHeight: '400px', maxHeight: '500px' }}>
                {chatHistory.length === 0 ? (
                  <p className="text-gray-500 text-center">Nenhum histórico de chat encontrado para este frete.</p>
                ) : (
                  <div className="space-y-3">
                    {chatHistory.map((message, index) => (
                      <div key={index} className={`flex ${message.sender_type === 'company' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_type === 'company' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white border'
                        }`}>
                          <p className="text-sm font-medium mb-1">
                            {message.sender_name || (message.sender_type === 'company' ? user?.company_name || 'Você' : 'Motorista')}
                          </p>
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs mt-1 opacity-75">
                            {message.timestamp ? new Date(message.timestamp).toLocaleString('pt-BR') : 'Data não disponível'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Botão para iniciar novo chat */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowChatHistoryModal(false)
                    setShowChatModal(true)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Iniciar Novo Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de criar frete */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Criar Novo Frete</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleCreateFreight} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Título do Frete</label>
                  <input
                    type="text"
                    required
                    maxLength="200"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newFreight.title}
                    onChange={(e) => setNewFreight({...newFreight, title: e.target.value})}
                    placeholder="Ex: Transporte de eletrônicos SP-RJ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newFreight.description}
                    onChange={(e) => setNewFreight({...newFreight, description: e.target.value})}
                    placeholder="Descreva os detalhes da carga e requisitos especiais"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Endereço de Origem</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newFreight.origin_address}
                    onChange={(e) => setNewFreight({...newFreight, origin_address: e.target.value})}
                    placeholder="Endereço completo de coleta (rua, número, bairro)"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cidade de Origem</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.origin_city}
                      onChange={(e) => setNewFreight({...newFreight, origin_city: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado de Origem</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.origin_state}
                      onChange={(e) => setNewFreight({...newFreight, origin_state: e.target.value})}
                      placeholder="SP"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CEP de Origem</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.origin_zipcode}
                      onChange={(e) => setNewFreight({...newFreight, origin_zipcode: e.target.value})}
                      placeholder="00000-000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Endereço de Destino</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newFreight.destination_address}
                    onChange={(e) => setNewFreight({...newFreight, destination_address: e.target.value})}
                    placeholder="Endereço completo de entrega (rua, número, bairro)"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cidade de Destino</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.destination_city}
                      onChange={(e) => setNewFreight({...newFreight, destination_city: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado de Destino</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.destination_state}
                      onChange={(e) => setNewFreight({...newFreight, destination_state: e.target.value})}
                      placeholder="RJ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CEP de Destino</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.destination_zipcode}
                      onChange={(e) => setNewFreight({...newFreight, destination_zipcode: e.target.value})}
                      placeholder="00000-000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Carga</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.cargo_type}
                      onChange={(e) => setNewFreight({...newFreight, cargo_type: e.target.value})}
                      placeholder="Ex: Eletrônicos, Móveis, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                    <input
                      type="number"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.cargo_weight}
                      onChange={(e) => setNewFreight({...newFreight, cargo_weight: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Veículo</label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.required_vehicle_type}
                      onChange={(e) => setNewFreight({...newFreight, required_vehicle_type: e.target.value})}
                    >
                      {VEHICLE_TYPES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Carroceria</label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.required_body_type}
                      onChange={(e) => setNewFreight({...newFreight, required_body_type: e.target.value})}
                    >
                      {BODY_TYPES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Coleta</label>
                    <input
                      type="date"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.pickup_date}
                      onChange={(e) => setNewFreight({...newFreight, pickup_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prazo de Entrega</label>
                    <input
                      type="date"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.delivery_deadline}
                      onChange={(e) => setNewFreight({...newFreight, delivery_deadline: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Preço Sugerido (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newFreight.suggested_price}
                    onChange={(e) => setNewFreight({...newFreight, suggested_price: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Volume da Carga (m³)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newFreight.cargo_volume}
                    onChange={(e) => setNewFreight({...newFreight, cargo_volume: e.target.value})}
                    placeholder="Ex: 2.50"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Criar Frete
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de editar frete */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Editar Frete</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingFreight(null)
                    setNewFreight({
                      title: '',
                      description: '',
                      origin_address: '',
                      origin_city: '',
                      origin_state: '',
                      origin_zipcode: '',
                      destination_address: '',
                      destination_city: '',
                      destination_state: '',
                      destination_zipcode: '',
                      cargo_type: '',
                      cargo_weight: '',
                      required_vehicle_type: '',
                      required_body_type: '',
                      pickup_date: '',
                      delivery_deadline: '',
                      suggested_price: ''
                    })
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleUpdateFreight} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Título do Frete</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newFreight.title}
                    onChange={(e) => setNewFreight({...newFreight, title: e.target.value})}
                    placeholder="Ex: Transporte de eletrônicos SP-RJ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newFreight.description}
                    onChange={(e) => setNewFreight({...newFreight, description: e.target.value})}
                    placeholder="Descreva os detalhes da carga e requisitos especiais"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Endereço de Origem</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newFreight.origin_address}
                    onChange={(e) => setNewFreight({...newFreight, origin_address: e.target.value})}
                    placeholder="Endereço completo de coleta (rua, número, bairro)"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cidade de Origem</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.origin_city}
                      onChange={(e) => setNewFreight({...newFreight, origin_city: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado de Origem</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.origin_state}
                      onChange={(e) => setNewFreight({...newFreight, origin_state: e.target.value})}
                      placeholder="SP"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CEP de Origem</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.origin_zipcode}
                      onChange={(e) => setNewFreight({...newFreight, origin_zipcode: e.target.value})}
                      placeholder="00000-000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Endereço de Destino</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newFreight.destination_address}
                    onChange={(e) => setNewFreight({...newFreight, destination_address: e.target.value})}
                    placeholder="Endereço completo de entrega (rua, número, bairro)"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cidade de Destino</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.destination_city}
                      onChange={(e) => setNewFreight({...newFreight, destination_city: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado de Destino</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.destination_state}
                      onChange={(e) => setNewFreight({...newFreight, destination_state: e.target.value})}
                      placeholder="RJ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CEP de Destino</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.destination_zipcode}
                      onChange={(e) => setNewFreight({...newFreight, destination_zipcode: e.target.value})}
                      placeholder="00000-000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Carga</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.cargo_type}
                      onChange={(e) => setNewFreight({...newFreight, cargo_type: e.target.value})}
                      placeholder="Ex: Eletrônicos, Móveis, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                    <input
                      type="number"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.cargo_weight}
                      onChange={(e) => setNewFreight({...newFreight, cargo_weight: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Veículo</label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.required_vehicle_type}
                      onChange={(e) => setNewFreight({...newFreight, required_vehicle_type: e.target.value})}
                    >
                      {VEHICLE_TYPES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Carroceria</label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.required_body_type}
                      onChange={(e) => setNewFreight({...newFreight, required_body_type: e.target.value})}
                    >
                      {BODY_TYPES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Coleta</label>
                    <input
                      type="date"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.pickup_date}
                      onChange={(e) => setNewFreight({...newFreight, pickup_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prazo de Entrega</label>
                    <input
                      type="date"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.delivery_deadline}
                      onChange={(e) => setNewFreight({...newFreight, delivery_deadline: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Preço Sugerido (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newFreight.suggested_price}
                    onChange={(e) => setNewFreight({...newFreight, suggested_price: e.target.value})}
                  />
                </div>

                <div className="flex justify-between items-center pt-4">
                  <div className="flex space-x-3">
                    {editingFreight?.status === 'active' && (
                      <button
                        type="button"
                        onClick={handleDeactivateFreight}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Tornar Inativo
                      </button>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false)
                        setEditingFreight(null)
                        setNewFreight({
                          title: '',
                          description: '',
                          origin_address: '',
                          origin_city: '',
                          origin_state: '',
                          origin_zipcode: '',
                          destination_address: '',
                          destination_city: '',
                          destination_state: '',
                          destination_zipcode: '',
                          cargo_type: '',
                          cargo_weight: '',
                          required_vehicle_type: '',
                          required_body_type: '',
                          pickup_date: '',
                          delivery_deadline: '',
                          suggested_price: ''
                        })
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Atualizar Frete
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompanyDashboard