import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import api from '../config/api'

const DriverDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [freights, setFreights] = useState([])
  const [filteredFreights, setFilteredFreights] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    origin_state: '',
    destination_state: '',
    cargo_type: '',
    vehicle_type: ''
  })

  useEffect(() => {
    loadFreights()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [freights, filters])

  const loadFreights = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/freights')
      
      if (response.data.success) {
        setFreights(response.data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar fretes:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = freights

    if (filters.origin_state) {
      filtered = filtered.filter(f => 
        f.origin_state?.toLowerCase().includes(filters.origin_state.toLowerCase())
      )
    }

    if (filters.destination_state) {
      filtered = filtered.filter(f => 
        f.destination_state?.toLowerCase().includes(filters.destination_state.toLowerCase())
      )
    }

    if (filters.cargo_type) {
      filtered = filtered.filter(f => 
        f.cargo_type?.toLowerCase().includes(filters.cargo_type.toLowerCase())
      )
    }

    setFilteredFreights(filtered)
  }

  const handleInterest = async (freightId) => {
    try {
      // Simular manifestação de interesse
      alert('Interesse manifestado com sucesso! A empresa será notificada.')
    } catch (error) {
      console.error('Erro ao manifestar interesse:', error)
      alert('Erro ao manifestar interesse. Tente novamente.')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
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
              <span className="ml-4 text-gray-500">Dashboard Motorista</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Olá, {user?.driver?.full_name || 'Motorista'}
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
        {/* Estatísticas do motorista */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m-5 4l4-4-4-4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fretes Disponíveis</p>
                <p className="text-2xl font-bold text-gray-900">{filteredFreights.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Fretes Realizados</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avaliação</p>
                <p className="text-2xl font-bold text-gray-900">5.0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ganhos Totais</p>
                <p className="text-2xl font-bold text-gray-900">R$ 0,00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filtrar Fretes</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado de Origem</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: SP"
                value={filters.origin_state}
                onChange={(e) => setFilters({...filters, origin_state: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado de Destino</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: RJ"
                value={filters.destination_state}
                onChange={(e) => setFilters({...filters, destination_state: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Carga</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Eletrônicos"
                value={filters.cargo_type}
                onChange={(e) => setFilters({...filters, cargo_type: e.target.value})}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({origin_state: '', destination_state: '', cargo_type: '', vehicle_type: ''})}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de fretes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Fretes Disponíveis ({filteredFreights.length})
            </h3>
          </div>

          {filteredFreights.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m-5 4l4-4-4-4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum frete encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {freights.length === 0 
                  ? 'Não há fretes disponíveis no momento.' 
                  : 'Tente ajustar os filtros para encontrar fretes.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredFreights.map((freight) => (
                <div key={freight.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900">{freight.title}</h4>
                        <span className="text-2xl font-bold text-green-600">
                          R$ {freight.suggested_price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">
                          {freight.origin_city}/{freight.origin_state} → {freight.destination_city}/{freight.destination_state}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                          </svg>
                          {freight.cargo_type}
                        </div>
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1" />
                          </svg>
                          {freight.cargo_weight}kg
                        </div>
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {freight.views_count || 0} visualizações
                        </div>
                      </div>

                      {freight.description && (
                        <p className="mt-2 text-sm text-gray-600">{freight.description}</p>
                      )}

                      <div className="mt-3 flex items-center text-xs text-gray-500">
                        <span>Publicado por: {freight.company?.company_name || 'Empresa'}</span>
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      <button
                        onClick={() => handleInterest(freight.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                      >
                        Tenho Interesse
                      </button>
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 text-sm">
                        Ver Detalhes
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
  )
}

export default DriverDashboard

