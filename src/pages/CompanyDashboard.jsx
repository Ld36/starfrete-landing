import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import api from '../config/api'

const CompanyDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [freights, setFreights] = useState([])
  const [stats, setStats] = useState({
    total_freights: 0,
    active_freights: 0,
    inactive_freights: 0,
    completed_freights: 0
  })
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingFreight, setEditingFreight] = useState(null)
  const [subscription, setSubscription] = useState(null)

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
    required_vehicle_type: '',
    required_body_type: '',
    pickup_date: '',
    delivery_deadline: '',
    suggested_price: ''
  })

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Carregar fretes
      const freightsResponse = await api.get('/api/v1/freights')
      if (freightsResponse.data.success) {
        // Filtrar apenas os fretes criados por esta empresa
        const allFreights = freightsResponse.data.data
        
        const companyFreights = allFreights.filter(freight => {
          // Verificar tanto pelo ID do usuário quanto pelo ID da empresa
          const matchCompanyId = freight.company_id === user.company?.id || freight.company_id === user.id
          const matchCreatedBy = freight.created_by === user.id
          
          return matchCompanyId || matchCreatedBy
        })
        
        setFreights(companyFreights)
        
        setStats({
          total_freights: companyFreights.length,
          active_freights: companyFreights.filter(f => f.status === 'active').length,
          inactive_freights: companyFreights.filter(f => f.status === 'inactive').length,
          completed_freights: companyFreights.filter(f => f.status === 'completed').length
        })
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  // Função para incrementar visualizações (apenas para motoristas)
  const incrementFreightViews = async (freightId) => {
    try {
      // Esta função seria chamada apenas quando um motorista visualizar o frete
      // No dashboard da empresa, não chamamos esta função
      const response = await api.post(`/api/v1/freights/${freightId}/view`)
      if (response.data.success) {
        // Recarregar dados após incrementar visualização
        loadDashboardData()
      }
    } catch (error) {
      console.error('Erro ao incrementar visualizações:', error)
    }
  }

  // Função para tornar frete inativo
  const handleDeactivateFreight = async () => {
    if (!editingFreight) return
    
    try {
      // Usar apenas o status, sem alterar outros campos que podem ter problemas de timezone
      const response = await api.put(`/api/v1/freights/${editingFreight.id}`, {
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
        await loadDashboardData()
        alert('Frete desativado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao desativar frete:', error)
      alert(`Erro ao desativar frete: ${error.response?.data?.message || error.message}`)
    }
  }

  // Função para excluir frete (apenas se ativo e sem motoristas)
  const handleDeleteFreight = async (freight) => {
    // Verificar se o frete pode ser excluído
    if (freight.status !== 'active') {
      alert('Apenas fretes ativos podem ser excluídos.')
      return
    }

    // Verificar se não há motoristas interessados (assumindo que existe um campo para isso)
    // Por enquanto, vamos assumir que fretes ativos sem propostas podem ser excluídos
    if (freight.proposals && freight.proposals.length > 0) {
      alert('Não é possível excluir fretes que já possuem propostas de motoristas.')
      return
    }

    if (!confirm('Tem certeza que deseja excluir este frete? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const response = await api.delete(`/api/v1/freights/${freight.id}`)
      
      if (response.data.success) {
        await loadDashboardData()
        alert('Frete excluído com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao excluir frete:', error)
      alert(`Erro ao excluir frete: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleCreateFreight = async (e) => {
    e.preventDefault()
    
    try {
      // Adicionar o ID da empresa ao frete e ajustar tipos de dados
      const freightWithCompany = {
        title: newFreight.title,
        description: newFreight.description,
        origin_address: newFreight.origin_address || `${newFreight.origin_city}, ${newFreight.origin_state}`,
        origin_city: newFreight.origin_city,
        origin_state: newFreight.origin_state,
        origin_zipcode: newFreight.origin_zipcode,
        destination_address: newFreight.destination_address || `${newFreight.destination_city}, ${newFreight.destination_state}`,
        destination_city: newFreight.destination_city,
        destination_state: newFreight.destination_state,
        destination_zipcode: newFreight.destination_zipcode,
        cargo_type: newFreight.cargo_type,
        cargo_weight: parseFloat(newFreight.cargo_weight),
        required_vehicle_type: newFreight.required_vehicle_type || null,
        required_body_type: newFreight.required_body_type || null,
        pickup_date: newFreight.pickup_date ? `${newFreight.pickup_date}T00:00:00-03:00` : null,
        delivery_deadline: newFreight.delivery_deadline ? `${newFreight.delivery_deadline}T23:59:59-03:00` : null,
        suggested_price: newFreight.suggested_price ? parseFloat(newFreight.suggested_price) : null,
        company_id: user.company?.id || user.id, // Usar o ID da empresa se disponível
        created_by: user.id
      }
      
      const response = await api.post('/api/v1/freights', freightWithCompany)
      
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
          required_vehicle_type: '',
          required_body_type: '',
          pickup_date: '',
          delivery_deadline: '',
          suggested_price: ''
        })
        await loadDashboardData()
        alert('Frete criado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao criar frete:', error)
      console.error('Response data:', error.response?.data)
      console.error('Response status:', error.response?.status)
      console.error('Response headers:', error.response?.headers)
      alert(`Erro ao criar frete: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleEditFreight = (freight) => {
    setEditingFreight(freight)
    setNewFreight({
      title: freight.title || '',
      description: freight.description || '',
      origin_address: freight.origin_address || '',
      origin_city: freight.origin_city || '',
      origin_state: freight.origin_state || '',
      origin_zipcode: freight.origin_zipcode || '',
      destination_address: freight.destination_address || '',
      destination_city: freight.destination_city || '',
      destination_state: freight.destination_state || '',
      destination_zipcode: freight.destination_zipcode || '',
      cargo_type: freight.cargo_type || '',
      cargo_weight: freight.cargo_weight?.toString() || '',
      required_vehicle_type: freight.required_vehicle_type || '',
      required_body_type: freight.required_body_type || '',
      pickup_date: freight.pickup_date ? freight.pickup_date.split('T')[0] : '',
      delivery_deadline: freight.delivery_deadline ? freight.delivery_deadline.split('T')[0] : '',
      suggested_price: freight.suggested_price?.toString() || ''
    })
    setShowEditModal(true)
  }

  const handleUpdateFreight = async (e) => {
    e.preventDefault()
    
    try {
      const freightWithCompany = {
        title: newFreight.title,
        description: newFreight.description,
        origin_address: newFreight.origin_address || `${newFreight.origin_city}, ${newFreight.origin_state}`,
        origin_city: newFreight.origin_city,
        origin_state: newFreight.origin_state,
        origin_zipcode: newFreight.origin_zipcode,
        destination_address: newFreight.destination_address || `${newFreight.destination_city}, ${newFreight.destination_state}`,
        destination_city: newFreight.destination_city,
        destination_state: newFreight.destination_state,
        destination_zipcode: newFreight.destination_zipcode,
        cargo_type: newFreight.cargo_type,
        cargo_weight: parseFloat(newFreight.cargo_weight),
        required_vehicle_type: newFreight.required_vehicle_type || null,
        required_body_type: newFreight.required_body_type || null,
        pickup_date: newFreight.pickup_date ? `${newFreight.pickup_date}T00:00:00-03:00` : null,
        delivery_deadline: newFreight.delivery_deadline ? `${newFreight.delivery_deadline}T23:59:59-03:00` : null,
        suggested_price: newFreight.suggested_price ? parseFloat(newFreight.suggested_price) : null,
      }
      
      const response = await api.put(`/api/v1/freights/${editingFreight.id}`, freightWithCompany)
      
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
        await loadDashboardData()
        alert('Frete atualizado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao atualizar frete:', error)
      alert(`Erro ao atualizar frete: ${error.response?.data?.message || error.message}`)
    }
  }

  if (loading) {
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
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                            ? 'bg-green-100 text-green-800' 
                            : freight.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
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
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.required_vehicle_type}
                      onChange={(e) => setNewFreight({...newFreight, required_vehicle_type: e.target.value})}
                      placeholder="Ex: Caminhão, Van, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Carroceria</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.required_body_type}
                      onChange={(e) => setNewFreight({...newFreight, required_body_type: e.target.value})}
                      placeholder="Ex: Fechada, Sider, etc."
                    />
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
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.required_vehicle_type}
                      onChange={(e) => setNewFreight({...newFreight, required_vehicle_type: e.target.value})}
                      placeholder="Ex: Caminhão, Van, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Carroceria</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={newFreight.required_body_type}
                      onChange={(e) => setNewFreight({...newFreight, required_body_type: e.target.value})}
                      placeholder="Ex: Fechada, Sider, etc."
                    />
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
                        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
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

