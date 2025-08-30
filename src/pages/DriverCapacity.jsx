import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth.jsx';
import DriverLayout from '../components/layout/DriverLayout.jsx';
import { getUserVehicles, addUserVehicle, deleteUserVehicle } from '../config/api';
import { Truck, Plus, Trash2, Edit3, Weight, Gauge, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

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
];

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
];

export default function DriverCapacity() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({
    plate: '',
    vehicle_type: '',
    body_type: '',
    capacity_weight: '',
    capacity_volume: '',
    year: '',
    brand: '',
    model: '',
    color: '',
    is_available: true
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await getUserVehicles();
      setVehicles(response.data?.data || []);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      setError('Erro ao carregar seus veículos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        // TODO: Implementar edição quando a API estiver disponível
        alert('Funcionalidade de edição ainda não implementada na API');
        return;
      }

      await addUserVehicle(vehicleForm);
      
      // Limpar formulário e fechar modal
      setVehicleForm({
        plate: '',
        vehicle_type: '',
        body_type: '',
        capacity_weight: '',
        capacity_volume: '',
        year: '',
        brand: '',
        model: '',
        color: '',
        is_available: true
      });
      setShowVehicleModal(false);
      setEditingVehicle(null);
      
      // Recarregar lista
      fetchVehicles();
      alert('Veículo adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error);
      alert('Erro ao adicionar veículo. Tente novamente.');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Tem certeza que deseja excluir este veículo?')) {
      return;
    }

    try {
      await deleteUserVehicle(vehicleId);
      fetchVehicles();
      alert('Veículo excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      alert('Erro ao excluir veículo. Tente novamente.');
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      plate: vehicle.plate || '',
      vehicle_type: vehicle.vehicle_type || '',
      body_type: vehicle.body_type || '',
      capacity_weight: vehicle.capacity_weight || '',
      capacity_volume: vehicle.capacity_volume || '',
      year: vehicle.year || '',
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      color: vehicle.color || '',
      is_available: vehicle.is_available !== false
    });
    setShowVehicleModal(true);
  };

  const resetForm = () => {
    setVehicleForm({
      plate: '',
      vehicle_type: '',
      body_type: '',
      capacity_weight: '',
      capacity_volume: '',
      year: '',
      brand: '',
      model: '',
      color: '',
      is_available: true
    });
    setEditingVehicle(null);
  };

  const getTotalCapacity = () => {
    return vehicles.reduce((total, vehicle) => {
      return total + (parseFloat(vehicle.capacity_weight) || 0);
    }, 0);
  };

  const getAvailableVehicles = () => {
    return vehicles.filter(vehicle => vehicle.is_available !== false);
  };

  const VehicleCard = ({ vehicle }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-6 w-6 text-blue-500" />
              <h3 className="text-xl font-semibold text-gray-900">
                {vehicle.plate || 'Sem placa'}
              </h3>
              <Badge variant={vehicle.is_available ? "default" : "secondary"}>
                {vehicle.is_available ? "Disponível" : "Indisponível"}
              </Badge>
            </div>
            <p className="text-gray-600 mb-2">
              {vehicle.brand} {vehicle.model} {vehicle.year}
            </p>
            <p className="text-sm text-gray-500">
              {vehicle.vehicle_type} - {vehicle.body_type}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditVehicle(vehicle)}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteVehicle(vehicle.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Weight className="h-5 w-5 text-purple-500" />
            <div>
              <div className="font-medium">Capacidade</div>
              <div className="text-sm text-gray-600">
                {vehicle.capacity_weight ? `${vehicle.capacity_weight} kg` : 'N/A'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-green-500" />
            <div>
              <div className="font-medium">Volume</div>
              <div className="text-sm text-gray-600">
                {vehicle.capacity_volume ? `${vehicle.capacity_volume} m³` : 'N/A'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`h-5 w-5 rounded-full`} style={{backgroundColor: vehicle.color || '#gray'}}></div>
            <div>
              <div className="font-medium">Cor</div>
              <div className="text-sm text-gray-600">
                {vehicle.color || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <DriverLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DriverLayout>
    );
  }

  if (error) {
    return (
      <DriverLayout>
        <div className="text-center py-12">
          <div className="text-red-500 text-lg">{error}</div>
          <Button 
            onClick={fetchVehicles} 
            className="mt-4"
            variant="outline"
          >
            Tentar Novamente
          </Button>
        </div>
      </DriverLayout>
    );
  }

  return (
    <DriverLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Capacidade</h1>
            <p className="text-gray-600">Configure e monitore seus veículos</p>
          </div>
          <Dialog open={showVehicleModal} onOpenChange={setShowVehicleModal}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Veículo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingVehicle ? 'Editar Veículo' : 'Adicionar Novo Veículo'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Placa *</label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.plate}
                    onChange={(e) => setVehicleForm({...vehicleForm, plate: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    placeholder="ABC-1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Veículo *</label>
                  <select
                    required
                    value={vehicleForm.vehicle_type}
                    onChange={(e) => setVehicleForm({...vehicleForm, vehicle_type: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">Selecione o tipo</option>
                    {VEHICLE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Carroceria *</label>
                  <select
                    required
                    value={vehicleForm.body_type}
                    onChange={(e) => setVehicleForm({...vehicleForm, body_type: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">Selecione a carroceria</option>
                    {BODY_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Capacidade (kg)</label>
                    <input
                      type="number"
                      value={vehicleForm.capacity_weight}
                      onChange={(e) => setVehicleForm({...vehicleForm, capacity_weight: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Volume (m³)</label>
                    <input
                      type="number"
                      value={vehicleForm.capacity_volume}
                      onChange={(e) => setVehicleForm({...vehicleForm, capacity_volume: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                      placeholder="25"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Marca</label>
                    <input
                      type="text"
                      value={vehicleForm.brand}
                      onChange={(e) => setVehicleForm({...vehicleForm, brand: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Mercedes"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Modelo</label>
                    <input
                      type="text"
                      value={vehicleForm.model}
                      onChange={(e) => setVehicleForm({...vehicleForm, model: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Atego"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Ano</label>
                    <input
                      type="number"
                      value={vehicleForm.year}
                      onChange={(e) => setVehicleForm({...vehicleForm, year: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                      placeholder="2020"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cor</label>
                    <input
                      type="text"
                      value={vehicleForm.color}
                      onChange={(e) => setVehicleForm({...vehicleForm, color: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Branco"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={vehicleForm.is_available}
                    onChange={(e) => setVehicleForm({...vehicleForm, is_available: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="is_available" className="text-sm font-medium">
                    Veículo disponível para fretes
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingVehicle ? 'Atualizar' : 'Adicionar'} Veículo
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowVehicleModal(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Veículos</p>
                  <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Gauge className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                  <p className="text-2xl font-bold text-gray-900">{getAvailableVehicles().length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Weight className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Capacidade Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {getTotalCapacity().toLocaleString()} kg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Em Operação</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Veículos */}
        <div className="space-y-4">
          {vehicles.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum veículo cadastrado</h3>
                <p className="text-gray-500 mb-4">Adicione seus veículos para começar a receber propostas de frete.</p>
                <Button onClick={() => setShowVehicleModal(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Primeiro Veículo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DriverLayout>
  );
}
