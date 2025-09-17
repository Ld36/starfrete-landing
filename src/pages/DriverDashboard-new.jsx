import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth.jsx'
import { useDriverDashboard } from '../hooks/use-data-hooks.js'
import DriverLayout from '../components/layout/DriverLayout.jsx'
import Chat from '../components/Chat'
import { 
  listFreights, 
  showInterestInFreight, 
  getUserVehicles, 
  addUserVehicle, 
  deleteUserVehicle,
  getMyInterests
} from '../config/api'

// Constantes para tipos de veículos
const VEHICLE_TYPES = [
  'Caminhão Toco',
  'Caminhão Truck',
  'Carreta Simples',
  'Carreta Dupla',
  'Bitrem',
  'Rodotrem',
  'Van',
  'HR',
  'Pickup',
  'VUC',
  '3/4',
  'Moto'
]

const BODY_TYPES = [
  'Baú Fechado',
  'Graneleiro',
  'Frigorífica',
  'Tanque',
  'Prancha/Plataforma',
  'Caçamba',
  'Canavieiro',
  'Gaiola',
  'Sider',
  'Basculante',
  'Bitrem Graneleiro',
  'Container'
]

const DriverDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  // Usar hook otimizado específico para dashboard do motorista
  const { freights, vehicles, interests: myInterests, loading: dataLoading, refresh } = useDriverDashboard()
  
  // Estados locais para UI e filtros
  const [filteredFreights, setFilteredFreights] = useState([])
  const [loading, setLoading] = useState(false)
  const [showVehicleModal, setShowVehicleModal] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [selectedFreightForChat, setSelectedFreightForChat] = useState(null)
  
  const [vehicleData, setVehicleData] = useState({
    plate: '',
    vehicle_type: '',
    body_type: '',
    brand: '',
    model: '',
    year: '',
    capacity: '',
    cargo_volume_m3: ''
  })
  const [filters, setFilters] = useState({
    origin_state: '',
    destination_state: '',
    cargo_type: '',
    vehicle_type: ''
  })

  // Função simplificada para refresh manual
  const loadData = useCallback((forceRefresh = false) => {
    return refresh()
  }, [refresh])

  // useEffect para aplicar filtros com debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [freights, filters])

  const applyFilters = () => {
    let filtered = freights

    if (filters.origin_state) {
      filtered = filtered.filter(f => 
        f.origin?.toLowerCase().includes(filters.origin_state.toLowerCase())
      )
    }
    if (filters.destination_state) {
      filtered = filtered.filter(f => 
        f.destination?.toLowerCase().includes(filters.destination_state.toLowerCase())
      )
    }
    if (filters.cargo_type) {
      filtered = filtered.filter(f => 
        f.cargo_type?.toLowerCase().includes(filters.cargo_type.toLowerCase())
      )
    }
    if (filters.vehicle_type) {
      filtered = filtered.filter(f => 
        f.vehicle_type?.toLowerCase().includes(filters.vehicle_type.toLowerCase())
      )
    }

    setFilteredFreights(filtered)
  }

  const handleShowInterest = async (freightId) => {
    if (myInterests.includes(freightId)) {
      alert('Você já demonstrou interesse neste frete!')
      return
    }

    try {
      setLoading(true)
      await showInterestInFreight(freightId)
      alert('Interesse demonstrado com sucesso!')
      loadData(true)
    } catch (error) {
      console.error('Erro ao demonstrar interesse:', error)
      alert('Erro ao demonstrar interesse. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChatOpen = (freight) => {
    setSelectedFreightForChat(freight)
    setShowChat(true)
  }

  const handleCloseChat = () => {
    setShowChat(false)
    setSelectedFreightForChat(null)
  }

  const handleAddVehicle = async (e) => {
    e.preventDefault()
    
    if (!vehicleData.plate || !vehicleData.vehicle_type || !vehicleData.capacity) {
      alert('Por favor, preencha todos os campos obrigatórios (*)')
      return
    }

    try {
      setLoading(true)
      
      const vehicleToSubmit = {
        ...vehicleData,
        capacity: parseFloat(vehicleData.capacity) || 0,
        cargo_volume_m3: parseFloat(vehicleData.cargo_volume_m3) || null,
        year: vehicleData.year ? parseInt(vehicleData.year) : null
      }

      await addUserVehicle(vehicleToSubmit)
      
      // Limpar formulário e fechar modal
      setVehicleData({
        plate: '',
        vehicle_type: '',
        body_type: '',
        brand: '',
        model: '',
        year: '',
        capacity: '',
        cargo_volume_m3: ''
      })
      setShowVehicleModal(false)
      
      // Recarregar dados
      loadData(true)
      
      alert('Veículo adicionado com sucesso!')
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error)
      alert('Erro ao adicionar veículo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteVehicle = async (vehicleId) => {
    if (!confirm('Tem certeza que deseja remover este veículo?')) {
      return
    }

    try {
      setLoading(true)
      await deleteUserVehicle(vehicleId)
      loadData(true)
      alert('Veículo removido com sucesso!')
    } catch (error) {
      console.error('Erro ao remover veículo:', error)
      alert('Erro ao remover veículo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isLoading = dataLoading || loading

  if (isLoading && freights.length === 0) {
    return (
      <DriverLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DriverLayout>
    )
  }

  return (
    <DriverLayout>
      {/* Estatísticas do motorista */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Fretes Disponíveis</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredFreights.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Interesses Demonstrados</p>
              <p className="text-2xl font-semibold text-gray-900">{myInterests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Meus Veículos</p>
              <p className="text-2xl font-semibold text-gray-900">{vehicles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ganhos do Mês</p>
              <p className="text-2xl font-semibold text-gray-900">R$ 0,00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado Origem</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: SP"
              value={filters.origin_state}
              onChange={(e) => setFilters({...filters, origin_state: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado Destino</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: RJ"
              value={filters.destination_state}
              onChange={(e) => setFilters({...filters, destination_state: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Carga</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Eletrônicos"
              value={filters.cargo_type}
              onChange={(e) => setFilters({...filters, cargo_type: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Veículo</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Caminhão"
              value={filters.vehicle_type}
              onChange={(e) => setFilters({...filters, vehicle_type: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Gestão de Veículos */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Meus Veículos</h3>
          <button
            onClick={() => setShowVehicleModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Adicionar Veículo
          </button>
        </div>
        
        {vehicles.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhum veículo cadastrado. Adicione seu primeiro veículo para começar.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{vehicle.plate}</h4>
                  <button
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Tipo:</strong> {vehicle.vehicle_type}
                </p>
                {vehicle.body_type && (
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Carroceria:</strong> {vehicle.body_type}
                  </p>
                )}
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Capacidade:</strong> {vehicle.capacity} ton
                </p>
                {vehicle.brand && (
                  <p className="text-sm text-gray-600">
                    <strong>Marca/Modelo:</strong> {vehicle.brand} {vehicle.model}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista de Fretes */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Fretes Disponíveis</h3>
            <button
              onClick={() => loadData(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isLoading}
            >
              {isLoading ? 'Carregando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        <div className="p-6">
          {filteredFreights.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {freights.length === 0 ? 'Nenhum frete disponível no momento.' : 'Nenhum frete encontrado com os filtros aplicados.'}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredFreights.map(freight => (
                <div key={freight.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {freight.origin} → {freight.destination}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Tipo de Carga:</span>
                          <p>{freight.cargo_type}</p>
                        </div>
                        <div>
                          <span className="font-medium">Peso:</span>
                          <p>{freight.weight} ton</p>
                        </div>
                        <div>
                          <span className="font-medium">Veículo:</span>
                          <p>{freight.vehicle_type}</p>
                        </div>
                        <div>
                          <span className="font-medium">Data Coleta:</span>
                          <p>{new Date(freight.pickup_date).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-6">
                      <p className="text-2xl font-bold text-green-600">
                        R$ {parseFloat(freight.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {freight.company?.name || freight.company_name}
                      </p>
                    </div>
                  </div>

                  {freight.description && (
                    <div className="mb-4">
                      <span className="font-medium text-gray-700">Descrição:</span>
                      <p className="text-gray-600 mt-1">{freight.description}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleShowInterest(freight.id)}
                        disabled={myInterests.includes(freight.id) || isLoading}
                        className={`px-4 py-2 rounded-md font-medium ${
                          myInterests.includes(freight.id)
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        }`}
                      >
                        {myInterests.includes(freight.id) ? 'Interesse Demonstrado' : 'Tenho Interesse'}
                      </button>
                      
                      <button
                        onClick={() => handleChatOpen(freight)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        Chat
                      </button>
                    </div>
                    
                    <Link
                      to={`/freight/${freight.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Ver Detalhes →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Adicionar Veículo */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Adicionar Novo Veículo</h3>
              <button
                onClick={() => setShowVehicleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ABC-1234"
                  value={vehicleData.plate}
                  onChange={(e) => setVehicleData({...vehicleData, plate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Veículo *</label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={vehicleData.vehicle_type}
                  onChange={(e) => setVehicleData({...vehicleData, vehicle_type: e.target.value})}
                >
                  <option value="">Selecione</option>
                  {VEHICLE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Carroceria</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={vehicleData.body_type}
                  onChange={(e) => setVehicleData({...vehicleData, body_type: e.target.value})}
                >
                  <option value="">Selecione</option>
                  {BODY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Mercedes"
                    value={vehicleData.brand}
                    onChange={(e) => setVehicleData({...vehicleData, brand: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Atego"
                    value={vehicleData.model}
                    onChange={(e) => setVehicleData({...vehicleData, model: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2020"
                    min="1950"
                    max="2024"
                    value={vehicleData.year}
                    onChange={(e) => setVehicleData({...vehicleData, year: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade (ton) *</label>
                  <input
                    type="number"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10.5"
                    step="0.1"
                    min="0"
                    value={vehicleData.capacity}
                    onChange={(e) => setVehicleData({...vehicleData, capacity: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volume (m³)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="25.0"
                  step="0.1"
                  min="0"
                  value={vehicleData.cargo_volume_m3}
                  onChange={(e) => setVehicleData({...vehicleData, cargo_volume_m3: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Adicionar Veículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Component */}
      {selectedFreightForChat && (
        <Chat
          isOpen={showChat}
          onClose={handleCloseChat}
          freightId={selectedFreightForChat.id}
          companyId={selectedFreightForChat.company?.id || selectedFreightForChat.company_id}
          driverId={user.driver?.id || user.id}
        />
      )}
    </DriverLayout>
  )
}

export default DriverDashboard
