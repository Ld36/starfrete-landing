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

  // Não precisamos mais do useEffect manual e loadData complexa
  // O hook otimizado já cuida de tudo isso
  
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

  // Função para verificar se já manifestou interesse
  const hasInterestInFreight = (freightId) => {
    return myInterests.some(interest => interest.freight_id === freightId)
  }

  const handleOpenChat = (freight) => {
    setSelectedFreightForChat(freight)
    setShowChat(true)
  }

  const handleCloseChat = () => {
    setShowChat(false)
    setSelectedFreightForChat(null)
  }

  const handleShowInterest = async (freightId) => {
    try {
      console.log('Manifestando interesse no frete:', freightId)
      console.log('Dados do usuário:', user)
      console.log('Veículos disponíveis:', vehicles)
      
      // Verificar se o motorista tem veículos cadastrados
      if (!vehicles || vehicles.length === 0) {
        window.showToast?.('Você precisa cadastrar pelo menos um veículo para manifestar interesse em fretes!', 'error')
        setTimeout(() => {
          navigate('/profile')
        }, 3000)
        return
      }
      
      // Buscar o frete para verificar requisitos
      const freight = freights.find(f => f.id === freightId)
      if (!freight) {
        window.showToast?.('Frete não encontrado', 'error')
        return
      }
      
      // Verificar se há um veículo compatível
      let compatibleVehicle = null
      
      // Se o frete especifica um tipo de veículo obrigatório
      if (freight.required_vehicle_type) {
        // Mapear os tipos de veículo do frete para os tipos cadastrados
        const vehicleTypeMapping = {
          'caminhao_toco': ['Caminhão Toco'],
          'caminhao_truck': ['Caminhão Truck'], 
          'carreta_simples': ['Carreta Simples'],
          'carreta_dupla': ['Carreta Dupla'],
          'carreta_bi_trem': ['Bitrem'],
          'carreta_rodotrem': ['Rodotrem'],
          'van': ['Van'],
          'pickup': ['Pickup'],
          'utilitario': ['HR', 'VUC', '3/4']
        }
        
        const acceptedTypes = vehicleTypeMapping[freight.required_vehicle_type] || [freight.required_vehicle_type]
        compatibleVehicle = vehicles.find(vehicle => 
          acceptedTypes.some(type => 
            vehicle.vehicle_type?.toLowerCase().includes(type.toLowerCase()) ||
            type.toLowerCase().includes(vehicle.vehicle_type?.toLowerCase())
          )
        )
      } else {
        // Se não há restrição, usar o primeiro veículo
        compatibleVehicle = vehicles[0]
      }
      
      if (!compatibleVehicle) {
        window.showToast?.(`Nenhum dos seus veículos é compatível com este frete. Tipo necessário: ${freight.required_vehicle_type || 'Não especificado'}`, 'error')
        return
      }
      
      // Preparar dados para enviar (incluir vehicle_id obrigatório)
      const interestData = {
        vehicle_id: compatibleVehicle.id,
        vehicle_type: compatibleVehicle.vehicle_type
      }
      
      const response = await showInterestInFreight(freightId, interestData)
      
      if (response.data.success) {
        window.showToast?.('Interesse manifestado com sucesso! A empresa será notificada.', 'success')
        // Recarregar dados para atualizar a lista de interesses
        refresh()
      }
    } catch (error) {
      console.error('Erro ao manifestar interesse:', error)
      console.error('Response data:', error.response?.data)
      console.error('Response status:', error.response?.status)
      console.error('Response headers:', error.response?.headers)
      if (error.response?.status === 409) {
        window.showToast?.('Você já manifestou interesse neste frete!', 'warning')
      } else if (error.response?.status === 400 && error.response?.data?.message?.includes('veículo')) {
        window.showToast?.('Erro: Tipo de veículo incompatível com este frete!', 'error')
      } else {
        window.showToast?.('Erro ao manifestar interesse. Tente novamente.', 'error')
      }
    }
  }

  const handleAddVehicle = async (e) => {
    e.preventDefault()
    
    // Validação dos campos obrigatórios
    if (!vehicleData.plate || !vehicleData.vehicle_type || !vehicleData.body_type || 
        !vehicleData.brand || !vehicleData.model || !vehicleData.year || 
        !vehicleData.capacity || !vehicleData.cargo_volume_m3) {
      window.showToast?.('Por favor, preencha todos os campos obrigatórios', 'error')
      return
    }
    
    try {
      // Preparar dados para envio (garantir tipos corretos e nomes de campos da API)
      const dataToSend = {
        license_plate: vehicleData.plate,  // API espera license_plate, não plate
        vehicle_type: vehicleData.vehicle_type,
        body_type: vehicleData.body_type,
        brand: vehicleData.brand,          // Campo marca obrigatório
        model: vehicleData.model,
        year: parseInt(vehicleData.year),
        capacity_weight: parseFloat(vehicleData.capacity),  // API espera capacity_weight, não capacity
        cargo_volume_m3: parseFloat(vehicleData.cargo_volume_m3)
      }
      
      console.log('Dados do veículo a serem enviados:', dataToSend)
      
      const response = await addUserVehicle(dataToSend)
      
      if (response.data.success) {
        // Recarregar veículos
        const vehiclesResponse = await getUserVehicles()
        if (vehiclesResponse.data.success) {
          setVehicles(vehiclesResponse.data.data || [])
        }
        
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
        
        window.showToast?.('Veículo adicionado com sucesso!', 'success')
      }
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error)
      console.log('Response data:', error.response?.data)
      console.log('Response status:', error.response?.status)
      
      const message = error.response?.data?.message || 'Erro ao adicionar veículo. Tente novamente.'
      window.showToast?.(message, 'error')
    }
  }

  const handleRemoveVehicle = async (vehicleId) => {
    if (window.confirm('Tem certeza que deseja remover este veículo?')) {
      try {
        const response = await deleteUserVehicle(vehicleId)
        
        if (response.data.success) {
          // Recarregar veículos
          const vehiclesResponse = await getUserVehicles()
          if (vehiclesResponse.data.success) {
            setVehicles(vehiclesResponse.data.data || [])
          }
          window.showToast?.('Veículo removido com sucesso!', 'success')
        }
      } catch (error) {
        console.error('Erro ao remover veículo:', error)
        window.showToast?.('Erro ao remover veículo. Tente novamente.', 'error')
      }
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (isLoading) {
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0M9 17h6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Meus Veículos</p>
                <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

        {/* Alerta para motoristas sem veículos */}
        {(!vehicles || vehicles.length === 0) && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">
                  Cadastre um veículo para manifestar interesse em fretes
                </h3>
                <div className="mt-2 text-sm text-orange-700">
                  <p>
                    Você precisa ter pelo menos um veículo cadastrado para poder manifestar interesse nos fretes disponíveis.
                  </p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <button
                      onClick={() => navigate('/profile')}
                      className="bg-orange-50 px-2 py-1.5 rounded-md text-sm font-medium text-orange-800 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-orange-50 focus:ring-orange-600"
                    >
                      Ir para Perfil e Cadastrar Veículo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seção de Veículos */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Meus Veículos ({vehicles.length})</h3>
            <button
              onClick={() => setShowVehicleModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Veículo
            </button>
          </div>

          {vehicles.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0M9 17h6" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum veículo cadastrado</h3>
              <p className="mt-1 text-sm text-gray-500">Adicione um veículo para começar a aceitar fretes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0M9 17h6" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{vehicle.plate}</h4>
                        <p className="text-sm text-gray-500">{vehicle.model}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveVehicle(vehicle.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remover veículo"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Tipo:</span> {vehicle.vehicle_type}</p>
                    <p><span className="font-medium">Carroceria:</span> {vehicle.body_type}</p>
                    <p><span className="font-medium">Ano:</span> {vehicle.year}</p>
                    <p><span className="font-medium">Capacidade:</span> {vehicle.capacity}kg</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Fretes Disponíveis ({filteredFreights.length})
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => loadData(true)}
                disabled={dataLoading}
                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {dataLoading ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>
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
                        <span className="text-2xl font-bold text-blue-600">
                          R$ {freight.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">
                          {freight.origin} → {freight.destination}
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0M9 17h6" />
                          </svg>
                          {freight.vehicle_type}
                        </div>
                      </div>

                      {freight.cargo_description && (
                        <p className="mt-2 text-sm text-gray-600">{freight.cargo_description}</p>
                      )}

                      <div className="mt-3 flex items-center text-xs text-gray-500">
                        <span>Publicado por: {freight.company?.company_name || 'Empresa'}</span>
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      {hasInterestInFreight(freight.id) ? (
                        <>
                          <button
                            disabled
                            className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed text-sm"
                          >
                            Interesse Enviado
                          </button>
                          <button
                            onClick={() => handleOpenChat(freight)}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                          >
                            💬 Chat
                          </button>
                        </>
                      ) : (
                        <>
                          {(!vehicles || vehicles.length === 0) ? (
                            <div className="space-y-2">
                              <button
                                disabled
                                className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed text-sm w-full"
                                title="Você precisa cadastrar um veículo primeiro"
                              >
                                Cadastre um Veículo
                              </button>
                              <button
                                onClick={() => navigate('/profile')}
                                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 text-xs w-full"
                              >
                                ➕ Ir para Perfil
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleInterest(freight.id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                            >
                              Tenho Interesse
                            </button>
                          )}
                        </>
                      )}
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: ABC-1234"
                  value={vehicleData.plate}
                  onChange={(e) => setVehicleData({...vehicleData, plate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Veículo *</label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={vehicleData.vehicle_type}
                  onChange={(e) => setVehicleData({...vehicleData, vehicle_type: e.target.value})}
                >
                  <option value="">Selecione o tipo</option>
                  {VEHICLE_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Carroceria *</label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={vehicleData.body_type}
                  onChange={(e) => setVehicleData({...vehicleData, body_type: e.target.value})}
                >
                  <option value="">Selecione a carroceria</option>
                  {BODY_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Volvo, Mercedes, Scania"
                  value={vehicleData.brand}
                  onChange={(e) => setVehicleData({...vehicleData, brand: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: VM 270, Actros 2651"
                  value={vehicleData.model}
                  onChange={(e) => setVehicleData({...vehicleData, model: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano *</label>
                <input
                  type="number"
                  required
                  min="1900"
                  max="2030"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 2020"
                  value={vehicleData.year}
                  onChange={(e) => setVehicleData({...vehicleData, year: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade de Carga (kg) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 15000"
                  value={vehicleData.capacity}
                  onChange={(e) => setVehicleData({...vehicleData, capacity: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volume em Metros Cúbicos (m³) *</label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="0.1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 45.5"
                  value={vehicleData.cargo_volume_m3}
                  onChange={(e) => setVehicleData({...vehicleData, cargo_volume_m3: e.target.value})}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
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

