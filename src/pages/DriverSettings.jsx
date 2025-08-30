import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth.jsx';
import DriverLayout from '../components/layout/DriverLayout.jsx';
import { getUserProfile } from '../config/api';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  MapPin, 
  Truck, 
  Save,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Calendar,
  CreditCard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function DriverSettings() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    cpf: '',
    birth_date: '',
    address: '',
    city: '',
    state: '',
    cep: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    freight_alerts: true,
    payment_alerts: true,
    system_updates: false
  });
  const [preferences, setPreferences] = useState({
    preferred_routes: [],
    max_distance: 500,
    min_freight_value: 1000,
    preferred_cargo_types: [],
    work_schedule: {
      monday: { start: '08:00', end: '18:00', active: true },
      tuesday: { start: '08:00', end: '18:00', active: true },
      wednesday: { start: '08:00', end: '18:00', active: true },
      thursday: { start: '08:00', end: '18:00', active: true },
      friday: { start: '08:00', end: '18:00', active: true },
      saturday: { start: '08:00', end: '14:00', active: false },
      sunday: { start: '08:00', end: '14:00', active: false }
    }
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.driver?.full_name || user.fullName || '',
        email: user.email || '',
        phone: user.driver?.phone || '',
        cpf: user.driver?.cpf || '',
        birth_date: user.driver?.birth_date || '',
        address: user.driver?.address || '',
        city: user.driver?.city || '',
        state: user.driver?.state || '',
        cep: user.driver?.cep || ''
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implementar atualização do perfil quando a API estiver disponível
      console.log('Dados do perfil:', profileForm);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('As senhas não coincidem!');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres!');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implementar mudança de senha quando a API estiver disponível
      console.log('Alteração de senha:', passwordForm);
      alert('Senha alterada com sucesso!');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      alert('Erro ao alterar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleScheduleChange = (day, field, value) => {
    setPreferences(prev => ({
      ...prev,
      work_schedule: {
        ...prev.work_schedule,
        [day]: {
          ...prev.work_schedule[day],
          [field]: value
        }
      }
    }));
  };

  const getDayName = (day) => {
    const days = {
      monday: 'Segunda-feira',
      tuesday: 'Terça-feira', 
      wednesday: 'Quarta-feira',
      thursday: 'Quinta-feira',
      friday: 'Sexta-feira',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };
    return days[day];
  };

  return (
    <DriverLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie suas informações e preferências</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome Completo</label>
                      <input
                        type="text"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Telefone</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">CPF</label>
                      <input
                        type="text"
                        value={profileForm.cpf}
                        onChange={(e) => setProfileForm({...profileForm, cpf: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                        placeholder="000.000.000-00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Data de Nascimento</label>
                      <input
                        type="date"
                        value={profileForm.birth_date}
                        onChange={(e) => setProfileForm({...profileForm, birth_date: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">CEP</label>
                      <input
                        type="text"
                        value={profileForm.cep}
                        onChange={(e) => setProfileForm({...profileForm, cep: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                        placeholder="00000-000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Endereço</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Rua, número, complemento"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Cidade</label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Estado</label>
                      <select
                        value={profileForm.state}
                        onChange={(e) => setProfileForm({...profileForm, state: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="">Selecione o estado</option>
                        <option value="SP">São Paulo</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="RS">Rio Grande do Sul</option>
                        {/* Adicionar outros estados conforme necessário */}
                      </select>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Configurações de Notificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificações por Email</h4>
                    <p className="text-sm text-gray-500">Receber atualizações por email</p>
                  </div>
                  <Switch
                    checked={notifications.email_notifications}
                    onCheckedChange={(checked) => handleNotificationChange('email_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificações SMS</h4>
                    <p className="text-sm text-gray-500">Receber atualizações por SMS</p>
                  </div>
                  <Switch
                    checked={notifications.sms_notifications}
                    onCheckedChange={(checked) => handleNotificationChange('sms_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificações Push</h4>
                    <p className="text-sm text-gray-500">Receber notificações no navegador</p>
                  </div>
                  <Switch
                    checked={notifications.push_notifications}
                    onCheckedChange={(checked) => handleNotificationChange('push_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Alertas de Frete</h4>
                    <p className="text-sm text-gray-500">Notificar sobre novos fretes disponíveis</p>
                  </div>
                  <Switch
                    checked={notifications.freight_alerts}
                    onCheckedChange={(checked) => handleNotificationChange('freight_alerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Alertas de Pagamento</h4>
                    <p className="text-sm text-gray-500">Notificar sobre pagamentos recebidos</p>
                  </div>
                  <Switch
                    checked={notifications.payment_alerts}
                    onCheckedChange={(checked) => handleNotificationChange('payment_alerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Atualizações do Sistema</h4>
                    <p className="text-sm text-gray-500">Receber informações sobre atualizações</p>
                  </div>
                  <Switch
                    checked={notifications.system_updates}
                    onCheckedChange={(checked) => handleNotificationChange('system_updates', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Preferências de Trabalho
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Distância Máxima (km)</label>
                      <input
                        type="number"
                        value={preferences.max_distance}
                        onChange={(e) => handlePreferenceChange('max_distance', e.target.value)}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Valor Mínimo do Frete (R$)</label>
                      <input
                        type="number"
                        value={preferences.min_freight_value}
                        onChange={(e) => handlePreferenceChange('min_freight_value', e.target.value)}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Horário de Trabalho</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(preferences.work_schedule).map(([day, schedule]) => (
                      <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Switch
                            checked={schedule.active}
                            onCheckedChange={(checked) => handleScheduleChange(day, 'active', checked)}
                          />
                          <span className="font-medium">{getDayName(day)}</span>
                        </div>
                        {schedule.active && (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={schedule.start}
                              onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                              className="p-1 border rounded"
                            />
                            <span>às</span>
                            <input
                              type="time"
                              value={schedule.end}
                              onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                              className="p-1 border rounded"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Senha Atual</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                        className="w-full p-2 border rounded-lg pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2 text-gray-500"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Nova Senha</label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Confirmar Nova Senha</label>
                    <input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {loading ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DriverLayout>
  );
}
