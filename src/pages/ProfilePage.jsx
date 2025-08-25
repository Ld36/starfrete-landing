import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  User,
  Building2,
  Truck,
  Edit,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../hooks/use-auth.jsx'
import { getUserProfile, getUserVehicles, updateUserProfile, addUserVehicle, deleteUserVehicle } from '../config/api'
import { toast } from 'react-hot-toast'
import { useAuth } from '../hooks/use-auth.jsx'

const ProfilePage = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState({})
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      
      // Carregar perfil usando a função da API
      try {
        const profileResponse = await getUserProfile()
        if (profileResponse?.data?.success) {
          setProfile(profileResponse.data.data)
        }
      } catch (profileError) {
        console.error('Erro ao carregar perfil:', profileError)
        toast.error('Erro ao carregar perfil do usuário')
      }

      // Carregar veículos se for motorista
      if (user?.user_type === 'driver') {
        try {
          const vehiclesResponse = await getUserVehicles()
          if (vehiclesResponse?.data?.success) {
            setVehicles(vehiclesResponse.data.data || [])
          }
        } catch (vehiclesError) {
          console.error('Erro ao carregar veículos:', vehiclesError)
          // Não mostrar toast para veículos pois pode ser que não tenha nenhum
        }
      }
      
    } catch (error) {
      console.error('Erro geral ao carregar perfil:', error)
      toast.error('Erro ao carregar dados do perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('/api/v1/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      })

      if (response.ok) {
        setEditing(false)
        alert('Perfil atualizado com sucesso!')
      } else {
        alert('Erro ao atualizar perfil')
      }
    } catch (error) {
      alert('Erro de conexão')
    }
    
    setSaving(false)
  }

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleCompanyChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      company: { ...prev.company, [field]: value }
    }))
  }

  const handleDriverChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      driver: { ...prev.driver, [field]: value }
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </Link>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Meu Perfil</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!editing ? (
                <Button onClick={() => setEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="account">Conta</TabsTrigger>
            {user?.user_type === 'driver' && (
              <TabsTrigger value="vehicles">Veículos</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Status da Conta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Status da Conta</span>
                  <Badge variant={profile.status === 'active' ? 'default' : 'outline'}>
                    {profile.status === 'active' ? 'Ativa' : 
                     profile.status === 'pending' ? 'Pendente' : profile.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  {profile.email_verified ? (
                    <div className="flex items-center text-blue-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Email verificado
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Email não verificado
                    </div>
                  )}
                  
                  {user?.user_type === 'company' && profile.company?.verified && (
                    <div className="flex items-center text-blue-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Empresa verificada
                    </div>
                  )}
                  
                  {user?.user_type === 'driver' && profile.driver?.verified && (
                    <div className="flex items-center text-blue-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Motorista verificado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile.email || ''}
                      disabled
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={profile.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações Específicas */}
            {user?.user_type === 'company' && profile.company && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Informações da Empresa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company_name">Razão Social</Label>
                      <Input
                        id="company_name"
                        value={profile.company.company_name || ''}
                        onChange={(e) => handleCompanyChange('company_name', e.target.value)}
                        disabled={!editing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="trade_name">Nome Fantasia</Label>
                      <Input
                        id="trade_name"
                        value={profile.company.trade_name || ''}
                        onChange={(e) => handleCompanyChange('trade_name', e.target.value)}
                        disabled={!editing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        value={profile.company.cnpj || ''}
                        disabled
                      />
                    </div>

                    <div>
                      <Label htmlFor="business_sector">Setor</Label>
                      <Input
                        id="business_sector"
                        value={profile.company.business_sector || ''}
                        onChange={(e) => handleCompanyChange('business_sector', e.target.value)}
                        disabled={!editing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact_person">Pessoa de Contato</Label>
                      <Input
                        id="contact_person"
                        value={profile.company.contact_person || ''}
                        onChange={(e) => handleCompanyChange('contact_person', e.target.value)}
                        disabled={!editing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact_position">Cargo</Label>
                      <Input
                        id="contact_position"
                        value={profile.company.contact_position || ''}
                        onChange={(e) => handleCompanyChange('contact_position', e.target.value)}
                        disabled={!editing}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição da Empresa</Label>
                    <Textarea
                      id="description"
                      value={profile.company.description || ''}
                      onChange={(e) => handleCompanyChange('description', e.target.value)}
                      disabled={!editing}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {user?.user_type === 'driver' && profile.driver && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Informações do Motorista
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Nome Completo</Label>
                      <Input
                        id="full_name"
                        value={profile.driver.full_name || ''}
                        onChange={(e) => handleDriverChange('full_name', e.target.value)}
                        disabled={!editing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={profile.driver.cpf || ''}
                        disabled
                      />
                    </div>

                    <div>
                      <Label htmlFor="birth_date">Data de Nascimento</Label>
                      <Input
                        id="birth_date"
                        type="date"
                        value={profile.driver.birth_date || ''}
                        onChange={(e) => handleDriverChange('birth_date', e.target.value)}
                        disabled={!editing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="experience_years">Anos de Experiência</Label>
                      <Input
                        id="experience_years"
                        type="number"
                        value={profile.driver.experience_years || ''}
                        onChange={(e) => handleDriverChange('experience_years', e.target.value)}
                        disabled={!editing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cnh_number">Número da CNH</Label>
                      <Input
                        id="cnh_number"
                        value={profile.driver.cnh_number || ''}
                        disabled
                      />
                    </div>

                    <div>
                      <Label htmlFor="cnh_category">Categoria CNH</Label>
                      <Input
                        id="cnh_category"
                        value={profile.driver.cnh_category || ''}
                        disabled
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea
                      id="bio"
                      value={profile.driver.bio || ''}
                      onChange={(e) => handleDriverChange('bio', e.target.value)}
                      disabled={!editing}
                      rows={3}
                      placeholder="Conte um pouco sobre sua experiência como motorista..."
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Conta</CardTitle>
                <CardDescription>
                  Gerencie suas configurações de segurança e privacidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="current_password">Senha Atual</Label>
                  <Input
                    id="current_password"
                    type="password"
                    placeholder="Digite sua senha atual"
                  />
                </div>

                <div>
                  <Label htmlFor="new_password">Nova Senha</Label>
                  <Input
                    id="new_password"
                    type="password"
                    placeholder="Digite sua nova senha"
                  />
                </div>

                <div>
                  <Label htmlFor="confirm_password">Confirmar Nova Senha</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="Confirme sua nova senha"
                  />
                </div>

                <Button>
                  Alterar Senha
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {user?.user_type === 'driver' && (
            <TabsContent value="vehicles" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Meus Veículos</span>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Veículo
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vehicles.length === 0 ? (
                    <div className="text-center py-8">
                      <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum veículo cadastrado</h3>
                      <p className="text-gray-600 mb-4">Adicione seus veículos para manifestar interesse em fretes</p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Primeiro Veículo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {vehicles.map((vehicle) => (
                        <div key={vehicle.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">
                              {vehicle.brand} {vehicle.model} ({vehicle.year})
                            </h3>
                            <div className="flex items-center space-x-2">
                              {vehicle.is_primary && (
                                <Badge variant="default">Principal</Badge>
                              )}
                              <Badge variant={vehicle.status === 'active' ? 'default' : 'secondary'}>
                                {vehicle.status === 'active' ? 'Ativo' : vehicle.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Placa:</span> {vehicle.license_plate}
                            </div>
                            <div>
                              <span className="font-medium">Tipo:</span> {vehicle.vehicle_type}
                            </div>
                            <div>
                              <span className="font-medium">Carroceria:</span> {vehicle.body_type}
                            </div>
                            <div>
                              <span className="font-medium">Capacidade:</span> {vehicle.capacity_weight}kg
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2 mt-4">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

export default ProfilePage

