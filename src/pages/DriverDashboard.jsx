import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth.jsx'
import { useDriverDashboard } from '../hooks/use-data-hooks.js'
import DriverLayout from '../components/layout/DriverLayout.jsx'
import Chat from '../components/Chat'
import { VEHICLE_TYPES, BODY_TYPES, getVehicleTypeValue, getBodyTypeValue } from '../constants/vehicleTypes.js'
import { 
  listFreights, 
  showInterestInFreight, 
  getUserVehicles, 
  addUserVehicle, 
  updateUserVehicle,
  deleteUserVehicle,
  getMyInterests
} from '../config/api'

export default function DriverDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { freights, vehicles, interests: myInterests, loading: dataLoading, refresh, error: dataError } = useDriverDashboard()
  
  const [acceptedFreights, setAcceptedFreights] = useState([])
  const [loadingAcceptedFreights, setLoadingAcceptedFreights] = useState(true)
  
  // Estados locais para UI e filtros
  const [filteredFreights, setFilteredFreights] = useState([])
  const [loading, setLoading] = useState(false)
  const [showVehicleModal, setShowVehicleModal] = useState(false)
  const [editingVehicleId, setEditingVehicleId] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [selectedFreightForChat, setSelectedFreightForChat] = useState(null)
  const [apiStatus, setApiStatus] = useState('checking') // 'checking', 'online', 'offline'
  
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

  // Verificar status da API
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        setApiStatus('checking')
        // Verificar se há dados ou erros do hook
        if (dataError && dataError.includes('timeout')) {
          setApiStatus('offline')
        } else if (freights || vehicles || myInterests) {
          setApiStatus('online')
        } else if (!dataLoading) {
          // Se não está carregando e não há dados nem erro, assumir que está offline
          setTimeout(() => {
            if (apiStatus === 'checking') {
              setApiStatus('offline')
            }
          }, 15000) // 15 segundos para considerar offline
        }
      } catch (error) {
        setApiStatus('offline')
      }
    }

    checkApiStatus()
  }, [dataError, freights, vehicles, myInterests, dataLoading, apiStatus])

  // useEffect para carregar fretes aceitos/em andamento
  useEffect(() => {
    loadAcceptedFreights()
  }, [user])

  const loadAcceptedFreights = async () => {
    if (!user) return
    
    try {
      setLoadingAcceptedFreights(true)
      console.log('🚛 Loading accepted freights for driver...')
      
      const response = await getMyInterests()
      console.log('📡 My interests response:', response.data)
      
      if (response.data.success) {
        const interests = response.data.data || []
        console.log('📋 All interests:', interests)
        
        // Filtrar apenas interesses aceitos/em andamento
        const acceptedInterests = interests.filter(interest => 
          ['accepted', 'in_progress', 'completed'].includes(interest.status)
        )
        
        console.log('✅ Accepted interests:', acceptedInterests)
        setAcceptedFreights(acceptedInterests)
      }
    } catch (error) {
      console.error('❌ Error loading accepted freights:', error)
    } finally {
      setLoadingAcceptedFreights(false)
    }
  }

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

  // Função para verificar compatibilidade de veículo
  const isVehicleCompatible = (vehicle, freight) => {
    if (!vehicle || !freight) return false

    // Mapeamento de tipos de veículos
    const vehicleTypeMapping = {
      'Caminhão Truck': 'caminhao_truck',
      'Caminhão Toco': 'caminhao_toco',
      'Carreta Simples': 'carreta_simples',
      'Carreta Dupla': 'carreta_dupla',
      'Bitrem': 'bitrem',
      'Rodotrem': 'rodotrem',
      'Van': 'van',
      'HR': 'hr',
      'Pickup': 'pickup',
      'VUC': 'vuc',
      '3/4': 'tres_quartos',
      'Moto': 'moto'
    }

    // Mapeamento de tipos de carroceria
    const bodyTypeMapping = {
      'Baú Fechado': 'bau_fechado',
      'Graneleiro': 'graneleiro',
      'Frigorífica': 'frigorifico',
      'Frigorífico': 'frigorifico',
      'Tanque': 'tanque',
      'Prancha/Plataforma': 'prancha',
      'Caçamba': 'cacamba',
      'Canavieiro': 'canavieiro',
      'Gaiola': 'gaiola',
      'Sider': 'sider',
      'Basculante': 'basculante',
      'Bitrem Graneleiro': 'bitrem_graneleiro',
      'Container': 'container'
    }

    // Converter valores do veículo para formato da API
    const mappedVehicleType = vehicleTypeMapping[vehicle.vehicle_type] || vehicle.vehicle_type?.toLowerCase().replace(/\s+/g, '_')
    const mappedBodyType = bodyTypeMapping[vehicle.body_type] || vehicle.body_type?.toLowerCase().replace(/\s+/g, '_')

    // Verificar tipo de veículo
    if (freight.required_vehicle_type && mappedVehicleType !== freight.required_vehicle_type) {
      return false
    }

    // Verificar tipo de carroceria
    if (freight.required_body_type && mappedBodyType !== freight.required_body_type) {
      return false
    }

    // Verificar capacidade de peso (converter para toneladas se necessário)
    if (freight.cargo_weight && vehicle.capacity_weight) {
      const vehicleCapacityKg = vehicle.capacity_weight > 1000 ? vehicle.capacity_weight : vehicle.capacity_weight * 1000
      if (freight.cargo_weight > vehicleCapacityKg) {
        return false
      }
    }

    // Verificar capacidade de volume
    if (freight.cargo_volume && vehicle.capacity_volume && freight.cargo_volume > vehicle.capacity_volume) {
      return false
    }

    return true
  }

  // Função para encontrar veículo compatível
  const findCompatibleVehicle = (freight) => {
    if (!vehicles || vehicles.length === 0) return null
    
    return vehicles.find(vehicle => isVehicleCompatible(vehicle, freight))
  }

  const handleShowInterest = async (freightId) => {
    if (myInterests.includes(freightId)) {
      alert('Você já demonstrou interesse neste frete!')
      return
    }

    // Verificar se há veículos cadastrados
    if (!vehicles || vehicles.length === 0) {
      alert('Você precisa cadastrar pelo menos um veículo antes de demonstrar interesse em fretes.')
      setShowVehicleModal(true)
      return
    }

    try {
      setLoading(true)
      
      // Usar o primeiro veículo disponível
      const payload = {
        vehicle_id: vehicles[0].id,
        message: 'Tenho interesse neste frete'
      }
      
      const response = await showInterestInFreight(freightId, payload)
      
      if (response.data.success) {
        alert('Interesse demonstrado com sucesso!')
        if (refresh) {
          refresh()
        }
      } else {
        alert(response.data.message || 'Erro ao demonstrar interesse')
      }
    } catch (error) {
      console.error('Erro ao demonstrar interesse:', error)
      
      if (error.response?.data?.message) {
        if (error.response.data.message.toLowerCase().includes('incompatível')) {
          alert(
            `Veículo incompatível com este frete.\n\n` +
            `Seu veículo: ${vehicles[0].vehicle_type} - ${vehicles[0].body_type}\n\n` +
            `Tente cadastrar um veículo compatível ou procure por outros fretes.`
          )
        } else {
          alert(`Erro: ${error.response.data.message}`)
        }
      } else {
        alert('Erro ao demonstrar interesse. Tente novamente.')
      }
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
    
    if (!vehicleData.plate || !vehicleData.vehicle_type || !vehicleData.body_type || !vehicleData.capacity) {
      alert('Por favor, preencha todos os campos obrigatórios (Placa, Tipo de Veículo, Tipo de Carroceria e Capacidade)')
      return
    }

    try {
      setLoading(true)
      
      const vehicleToSubmit = {
        license_plate: vehicleData.plate, // Usar license_plate em vez de plate
        vehicle_type: vehicleData.vehicle_type,
        body_type: vehicleData.body_type,
        brand: vehicleData.brand,
        model: vehicleData.model,
        capacity_weight: (() => {
          const capacity = parseFloat(vehicleData.capacity) || 0;
          // Se capacidade <= 1000, assume toneladas e converte para kg
          return capacity > 1000 ? capacity : capacity * 1000;
        })(),
        capacity_volume: parseFloat(vehicleData.cargo_volume_m3) || null, // Usar capacity_volume
        year: vehicleData.year ? parseInt(vehicleData.year) : null
      }

      let response;
      if (editingVehicleId) {
        // Editar veículo existente
        response = await updateUserVehicle(editingVehicleId, vehicleToSubmit)
        alert('Veículo atualizado com sucesso!')
      } else {
        // Adicionar novo veículo
        response = await addUserVehicle(vehicleToSubmit)
        alert('Veículo cadastrado com sucesso!')
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
      setEditingVehicleId(null)
      setShowVehicleModal(false)
      
      // Recarregar dados
      loadData(true)
      
      alert('Veículo adicionado com sucesso!')
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error)
      console.error('Dados do erro:', error.response?.data)
      
      if (error.response?.data?.message) {
        alert(`Erro ao adicionar veículo: ${error.response.data.message}`)
      } else if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat()
        alert(`Erro ao adicionar veículo:\n${errors.join('\n')}`)
      } else {
        alert('Erro ao adicionar veículo. Tente novamente.')
      }
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

  const handleEditVehicle = (vehicle) => {
    // Preencher o formulário com os dados do veículo para edição
    setVehicleData({
      plate: vehicle.license_plate || vehicle.plate,
      vehicle_type: vehicle.vehicle_type,
      body_type: vehicle.body_type,
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      capacity: vehicle.capacity_weight > 1000 ? (vehicle.capacity_weight / 1000).toString() : vehicle.capacity_weight.toString(),
      cargo_volume_m3: vehicle.capacity_volume?.toString() || '',
      year: vehicle.year?.toString() || ''
    })
    setEditingVehicleId(vehicle.id)
    setShowVehicleModal(true)
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
              <p className="text-xs text-gray-500">({acceptedFreights.length} aceitos)</p>
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

      {/* Seção de Fretes Aceitos/Em Andamento */}
      {acceptedFreights.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">🚛 Minhas Entregas ({acceptedFreights.length})</h3>
            <button
              onClick={loadAcceptedFreights}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Atualizar
            </button>
          </div>
          
          {loadingAcceptedFreights ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando entregas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {acceptedFreights.map((interest) => {
                const freight = interest.freight
                if (!freight) return null
                
                return (
                  <div key={interest.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{freight.title || 'Frete'}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        interest.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        interest.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        interest.status === 'completed' ? 'bg-gray-100 text-gray-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {interest.status === 'accepted' ? 'Aceito' :
                         interest.status === 'in_progress' ? 'Em Andamento' :
                         interest.status === 'completed' ? 'Concluído' : 
                         interest.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{freight.origin_city || 'Origem'} → {freight.destination_city || 'Destino'}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span>R$ {freight.suggested_price || freight.accepted_price || '0,00'}</span>
                      </div>
                      
                      {freight.company?.company_name && (
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-1 4h1m-1 4h1" />
                          </svg>
                          <span>{freight.company.company_name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => handleChatOpen(freight)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center justify-center"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chat
                      </button>
                      
                      <button
                        onClick={() => navigate(`/freight/${freight.id}`)}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 flex items-center justify-center"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

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
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditVehicle(vehicle)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Editar veículo"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Excluir veículo"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
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

                  {/* Seção de Compatibilidade */}
                  {(() => {
                    const compatibleVehicle = vehicles?.find(vehicle => isVehicleCompatible(vehicle, freight))
                    const isCompatible = !!compatibleVehicle
                    
                    return (
                      <div className={`mb-4 p-3 rounded-lg ${isCompatible ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-center mb-2">
                          <div className={`w-3 h-3 rounded-full mr-2 ${isCompatible ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className={`font-medium ${isCompatible ? 'text-green-800' : 'text-red-800'}`}>
                            {isCompatible ? 'Veículo Compatível' : 'Veículo Incompatível'}
                          </span>
                        </div>
                        
                        {isCompatible ? (
                          <div className="text-sm text-green-700">
                            <p>Veículo adequado: {compatibleVehicle.vehicle_type} - {compatibleVehicle.body_type}</p>
                            <p>Placa: {compatibleVehicle.license_plate}</p>
                          </div>
                        ) : (
                          <div className="text-sm text-red-700">
                            <p>Frete requer: {freight.required_vehicle_type} - {freight.required_body_type}</p>
                            <p>Seus veículos: {vehicles?.map(v => `${v.vehicle_type} - ${v.body_type}`).join(', ')}</p>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="flex space-x-3">
                      {(() => {
                        const compatibleVehicle = vehicles?.find(vehicle => isVehicleCompatible(vehicle, freight))
                        const isCompatible = !!compatibleVehicle
                        const alreadyInterested = myInterests.includes(freight.id)
                        
                        return (
                          <button
                            onClick={() => handleShowInterest(freight.id)}
                            disabled={alreadyInterested || isLoading || !isCompatible}
                            className={`px-4 py-2 rounded-md font-medium ${
                              alreadyInterested
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : !isCompatible
                                ? 'bg-red-300 text-red-700 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                            }`}
                            title={!isCompatible ? 'Veículo incompatível com este frete' : ''}
                          >
                            {alreadyInterested 
                              ? 'Interesse Demonstrado' 
                              : !isCompatible 
                              ? 'Veículo Incompatível'
                              : 'Tenho Interesse'
                            }
                          </button>
                        )
                      })()}
                      
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
              <h3 className="text-lg font-medium text-gray-900">
                {editingVehicleId ? 'Editar Veículo' : 'Adicionar Novo Veículo'}
              </h3>
              <button
                onClick={() => {
                  setShowVehicleModal(false)
                  setEditingVehicleId(null)
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
                }}
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
                    <option key={type.value} value={type.value}>{type.label}</option>
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
                    <option key={type.value} value={type.value}>{type.label}</option>
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
