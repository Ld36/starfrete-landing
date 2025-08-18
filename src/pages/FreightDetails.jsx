import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  MapPin, 
  Calendar,
  Package,
  DollarSign,
  Truck,
  Building2,
  Phone,
  Mail,
  Clock,
  Weight,
  Ruler,
  Thermometer,
  Shield,
  Heart
} from 'lucide-react'

const FreightDetails = () => {
  const { id } = useParams()
  const [freight, setFreight] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFreightDetails()
  }, [id])

  const loadFreightDetails = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`/api/v1/freights/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setFreight(data.data)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar frete:', error)
      setLoading(false)
    }
  }

  const handleShowInterest = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`/api/v1/freights/${id}/interest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicle_id: 1, // Assumindo primeiro veículo
          message: 'Tenho interesse neste frete'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('Interesse manifestado com sucesso!')
      } else {
        alert(data.message || 'Erro ao manifestar interesse')
      }
    } catch (error) {
      alert('Erro de conexão')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!freight) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Frete não encontrado</h2>
          <Link to="/dashboard">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-900">{freight.title}</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações Principais */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalhes do Frete */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Detalhes do Frete</span>
                  <Badge variant={freight.status === 'active' ? 'default' : 'secondary'}>
                    {freight.status === 'active' ? 'Ativo' : freight.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Descrição</h3>
                  <p className="text-gray-600">{freight.description || 'Sem descrição adicional'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-green-600" />
                      Origem
                    </h4>
                    <p className="text-gray-600">
                      {freight.origin_address}<br />
                      {freight.origin_city}/{freight.origin_state}<br />
                      CEP: {freight.origin_zipcode}
                    </p>
                    {freight.origin_reference && (
                      <p className="text-sm text-gray-500 mt-1">
                        Ref: {freight.origin_reference}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-red-600" />
                      Destino
                    </h4>
                    <p className="text-gray-600">
                      {freight.destination_address}<br />
                      {freight.destination_city}/{freight.destination_state}<br />
                      CEP: {freight.destination_zipcode}
                    </p>
                    {freight.destination_reference && (
                      <p className="text-sm text-gray-500 mt-1">
                        Ref: {freight.destination_reference}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                      Data de Coleta
                    </h4>
                    <p className="text-gray-600">
                      {new Date(freight.pickup_date).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-orange-600" />
                      Prazo de Entrega
                    </h4>
                    <p className="text-gray-600">
                      {new Date(freight.delivery_deadline).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações da Carga */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Informações da Carga
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Tipo de Carga</h4>
                    <p className="text-gray-600">{freight.cargo_type}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-1 flex items-center">
                      <Weight className="h-4 w-4 mr-1" />
                      Peso
                    </h4>
                    <p className="text-gray-600">{freight.cargo_weight} kg</p>
                  </div>

                  {freight.cargo_volume && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Volume</h4>
                      <p className="text-gray-600">{freight.cargo_volume} m³</p>
                    </div>
                  )}

                  {freight.cargo_value && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Valor da Carga</h4>
                      <p className="text-gray-600">R$ {parseFloat(freight.cargo_value).toFixed(2)}</p>
                    </div>
                  )}

                  {(freight.cargo_length || freight.cargo_width || freight.cargo_height) && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1 flex items-center">
                        <Ruler className="h-4 w-4 mr-1" />
                        Dimensões
                      </h4>
                      <p className="text-gray-600">
                        {freight.cargo_length}m × {freight.cargo_width}m × {freight.cargo_height}m
                      </p>
                    </div>
                  )}
                </div>

                {freight.special_requirements && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-1">Requisitos Especiais</h4>
                    <p className="text-gray-600">{freight.special_requirements}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Requisitos do Veículo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Requisitos do Veículo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Tipo de Veículo</h4>
                    <p className="text-gray-600 capitalize">{freight.required_vehicle_type}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Tipo de Carroceria</h4>
                    <p className="text-gray-600 capitalize">{freight.required_body_type}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {freight.requires_refrigeration && (
                    <Badge variant="outline" className="flex items-center">
                      <Thermometer className="h-3 w-3 mr-1" />
                      Refrigeração
                    </Badge>
                  )}
                  {freight.requires_escort && (
                    <Badge variant="outline" className="flex items-center">
                      <Shield className="h-3 w-3 mr-1" />
                      Escolta
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preço e Ações */}
            <Card>
              <CardContent className="pt-6">
                {freight.suggested_price && (
                  <div className="text-center mb-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Preço Sugerido</h3>
                    <p className="text-3xl font-bold text-green-600 flex items-center justify-center">
                      <DollarSign className="h-6 w-6" />
                      {parseFloat(freight.suggested_price).toFixed(2)}
                    </p>
                  </div>
                )}

                <Button 
                  className="w-full mb-3"
                  onClick={handleShowInterest}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Manifestar Interesse
                </Button>

                <div className="text-center text-sm text-gray-600">
                  <p>{freight.views_count || 0} visualizações</p>
                  <p>{freight.interests_count || 0} interessados</p>
                </div>
              </CardContent>
            </Card>

            {/* Informações da Empresa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">{freight.company?.company_name}</h4>
                  {freight.company?.trade_name && (
                    <p className="text-sm text-gray-600">{freight.company.trade_name}</p>
                  )}
                </div>

                {freight.company?.business_sector && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Setor</h5>
                    <p className="text-sm text-gray-600">{freight.company.business_sector}</p>
                  </div>
                )}

                <div className="space-y-2">
                  {freight.company?.contact_person && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {freight.company.contact_person}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    Contato via plataforma
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <p>Membro desde: {new Date(freight.company?.created_at).toLocaleDateString()}</p>
                  {freight.company?.verified && (
                    <p className="text-green-600 font-medium">✓ Empresa verificada</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Publicado em:</span>
                  <p className="text-gray-600">{new Date(freight.created_at).toLocaleString()}</p>
                </div>

                {freight.distance_km && (
                  <div>
                    <span className="font-medium text-gray-700">Distância estimada:</span>
                    <p className="text-gray-600">{freight.distance_km} km</p>
                  </div>
                )}

                <div>
                  <span className="font-medium text-gray-700">ID do Frete:</span>
                  <p className="text-gray-600 font-mono">{freight.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FreightDetails

