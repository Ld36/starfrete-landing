import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Package, MapPin, Truck, DollarSign, PlusSquare } from 'lucide-react';
import { VEHICLE_TYPES, BODY_TYPES } from '../constants/vehicleTypes';
import { createFreight } from '../config/api';

export default function PublishFreightPage() {
  const [formData, setFormData] = useState({
    pickup_city: '',
    pickup_state: '',
    pickup_cep: '',
    delivery_city: '',
    delivery_state: '',
    delivery_cep: '',
    cargo_description: '',
    cargo_weight: '',
    cargo_volume: '',
    required_vehicle_type: '',
    required_body_type: '',
    pickup_date: '',
    delivery_date: '',
    price: '',
    payment_method: '',
    additional_requirements: ''
  });

  const [loading, setLoading] = useState(false);

  const formatCEP = (value) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 5) {
      return numericValue;
    }
    return numericValue.slice(0, 5) + '-' + numericValue.slice(5, 8);
  };

  const formatState = (value) => {
    return value.toUpperCase().slice(0, 2);
  };

  const handleInputChange = (field, value) => {
    let processedValue = value;
    
    if (field === 'pickup_cep' || field === 'delivery_cep') {
      processedValue = formatCEP(value);
    } else if (field === 'pickup_state' || field === 'delivery_state') {
      processedValue = formatState(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const freightData = {
        ...formData,
        cargo_weight: parseFloat(formData.cargo_weight),
        cargo_volume: parseFloat(formData.cargo_volume),
        price: parseFloat(formData.price),
        required_body_type: formData.required_body_type || 'bau'
      };

      await createFreight(freightData);
      toast.success('Frete criado com sucesso!');
      
      // Reset form
      setFormData({
        pickup_city: '',
        pickup_state: '',
        pickup_cep: '',
        delivery_city: '',
        delivery_state: '',
        delivery_cep: '',
        cargo_description: '',
        cargo_weight: '',
        cargo_volume: '',
        required_vehicle_type: '',
        required_body_type: '',
        pickup_date: '',
        delivery_date: '',
        price: '',
        payment_method: '',
        additional_requirements: ''
      });
    } catch (error) {
      console.error('Erro ao criar frete:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar frete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <PlusSquare className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Publicar Novo Frete</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações de Origem e Destino */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Origem</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pickup_city">Cidade</Label>
                <Input
                  id="pickup_city"
                  value={formData.pickup_city}
                  onChange={(e) => handleInputChange('pickup_city', e.target.value)}
                  placeholder="São Paulo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="pickup_state">Estado</Label>
                <Input
                  id="pickup_state"
                  value={formData.pickup_state}
                  onChange={(e) => handleInputChange('pickup_state', e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pickup_cep">CEP</Label>
                <Input
                  id="pickup_cep"
                  value={formData.pickup_cep}
                  onChange={(e) => handleInputChange('pickup_cep', e.target.value)}
                  placeholder="01000-000"
                  maxLength={9}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pickup_date">Data de Coleta</Label>
                <Input
                  id="pickup_date"
                  type="date"
                  value={formData.pickup_date}
                  onChange={(e) => handleInputChange('pickup_date', e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Destino</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="delivery_city">Cidade</Label>
                <Input
                  id="delivery_city"
                  value={formData.delivery_city}
                  onChange={(e) => handleInputChange('delivery_city', e.target.value)}
                  placeholder="Rio de Janeiro"
                  required
                />
              </div>
              <div>
                <Label htmlFor="delivery_state">Estado</Label>
                <Input
                  id="delivery_state"
                  value={formData.delivery_state}
                  onChange={(e) => handleInputChange('delivery_state', e.target.value)}
                  placeholder="RJ"
                  maxLength={2}
                  required
                />
              </div>
              <div>
                <Label htmlFor="delivery_cep">CEP</Label>
                <Input
                  id="delivery_cep"
                  value={formData.delivery_cep}
                  onChange={(e) => handleInputChange('delivery_cep', e.target.value)}
                  placeholder="20000-000"
                  maxLength={9}
                  required
                />
              </div>
              <div>
                <Label htmlFor="delivery_date">Data de Entrega</Label>
                <Input
                  id="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações da Carga */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Informações da Carga</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cargo_description">Descrição da Carga</Label>
              <Textarea
                id="cargo_description"
                value={formData.cargo_description}
                onChange={(e) => handleInputChange('cargo_description', e.target.value)}
                placeholder="Descreva o tipo de carga..."
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cargo_weight">Peso (kg)</Label>
                <Input
                  id="cargo_weight"
                  type="number"
                  step="0.01"
                  value={formData.cargo_weight}
                  onChange={(e) => handleInputChange('cargo_weight', e.target.value)}
                  placeholder="1000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cargo_volume">Volume (m³)</Label>
                <Input
                  id="cargo_volume"
                  type="number"
                  step="0.01"
                  value={formData.cargo_volume}
                  onChange={(e) => handleInputChange('cargo_volume', e.target.value)}
                  placeholder="10"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requisitos do Veículo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="h-5 w-5" />
              <span>Requisitos do Veículo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="required_vehicle_type">Tipo de Veículo</Label>
                <Select onValueChange={(value) => handleInputChange('required_vehicle_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="required_body_type">Tipo de Carroceria</Label>
                <Select onValueChange={(value) => handleInputChange('required_body_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {BODY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="additional_requirements">Requisitos Adicionais</Label>
              <Textarea
                id="additional_requirements"
                value={formData.additional_requirements}
                onChange={(e) => handleInputChange('additional_requirements', e.target.value)}
                placeholder="Requisitos especiais, observações..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações Financeiras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Informações Financeiras</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Valor do Frete (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="5000.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="payment_method">Forma de Pagamento</Label>
                <Select onValueChange={(value) => handleInputChange('payment_method', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? 'Publicando...' : 'Publicar Frete'}
          </Button>
        </div>
      </form>
    </div>
  );
}
