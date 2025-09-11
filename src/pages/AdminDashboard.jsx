import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import AdminLayout from '../components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  Users, 
  Building2, 
  Truck, 
  BarChart3, 
  Settings, 
  AlertTriangle, 
  Activity,
  Database,
  TrendingUp,
  Shield
} from 'lucide-react';
import { useAdminDashboard } from '../hooks/use-data-hooks.js';
import { 
  approveUser,
  suspendUser,
} from '../config/api';

function AdminDashboard() {
  const { user } = useAuth();
  const { stats, users, loading: dataLoading, refresh } = useAdminDashboard();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleApproveUser = async (userId) => {
    try {
      setLoading(true);
      const response = await approveUser(userId);
      
      if (response.data.success) {
        window.showToast?.('Usuário aprovado com sucesso!', 'success');
        refresh();
      }
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      window.showToast?.('Erro ao aprovar usuário: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId) => {
    try {
      setLoading(true);
      const response = await suspendUser(userId);
      
      if (response.data.success) {
        window.showToast?.('Usuário suspenso com sucesso!', 'success');
        refresh();
      }
    } catch (error) {
      console.error('Erro ao suspender usuário:', error);
      window.showToast?.('Erro ao suspender usuário: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando painel administrativo...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Visão geral do sistema StarFrete</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
              <Activity className="h-3 w-3 mr-1" />
              Sistema: Online
            </Badge>
            <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{(stats?.total_users || 0).toLocaleString()}</div>
            <p className="text-xs text-blue-600 mt-1">
              {stats?.pending_users || 0} aguardando aprovação
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.total_companies || 0}</div>
            <p className="text-xs text-green-600 mt-1">
              {stats?.active_subscriptions || 0} assinaturas ativas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Motoristas</CardTitle>
            <Truck className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.total_drivers || 0}</div>
            <p className="text-xs text-green-600 mt-1">
              ↗ Crescimento estável
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <BarChart3 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              R$ {(stats?.monthly_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Gerenciar usuários e sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" size="sm">
              <Users className="mr-2 h-4 w-4" />
              Gerenciar Usuários ({users?.length || 0} pendentes)
            </Button>
            <Button className="w-full justify-start" variant="outline" size="sm">
              <Building2 className="mr-2 h-4 w-4" />
              Visualizar Empresas
            </Button>
            <Button className="w-full justify-start" variant="outline" size="sm">
              <Truck className="mr-2 h-4 w-4" />
              Gerenciar Motoristas
            </Button>
            <Button className="w-full justify-start" variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Configurações do Sistema
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monitoramento</CardTitle>
            <CardDescription>Status do sistema e logs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" size="sm">
              <Activity className="mr-2 h-4 w-4" />
              Logs do Sistema
            </Button>
            <Button className="w-full justify-start" variant="outline" size="sm">
              <Database className="mr-2 h-4 w-4" />
              Banco de Dados
            </Button>
            <Button className="w-full justify-start" variant="outline" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              Relatórios
            </Button>
            <Button className="w-full justify-start" variant="outline" size="sm">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Alertas ({stats?.open_tickets || 0})
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Pending Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Users */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários Pendentes</CardTitle>
            <CardDescription>Aguardando aprovação</CardDescription>
          </CardHeader>
          <CardContent>
            {users && users.length > 0 ? (
              <div className="space-y-3">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        {user.user_type === 'company' ? 
                          <Building2 className="h-4 w-4 text-gray-600" /> : 
                          <Truck className="h-4 w-4 text-gray-600" />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          {user.user_type === 'company' ? 'Empresa' : 'Motorista'} - {
                            new Date(user.created_at).toLocaleDateString('pt-BR')
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="xs" 
                        variant="outline" 
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleApproveUser(user.id)}
                        disabled={loading}
                      >
                        Aprovar
                      </Button>
                      <Button 
                        size="xs" 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleSuspendUser(user.id)}
                        disabled={loading}
                      >
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                ))}
                {users.length > 5 && (
                  <Button variant="outline" className="w-full" size="sm">
                    Ver todos ({users.length - 5} mais)
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhum usuário pendente de aprovação
              </p>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>Informações gerais do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">Online</div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">v1.0.0</div>
                <div className="text-sm text-gray-600">Versão</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Atividade Recente</h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <div className="h-2 w-2 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-gray-600">Usuário aprovado</span>
                  <span className="ml-auto text-xs text-gray-400">2 min</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="h-2 w-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-gray-600">Empresa registrada</span>
                  <span className="ml-auto text-xs text-gray-400">5 min</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="h-2 w-2 bg-orange-400 rounded-full mr-3"></div>
                  <span className="text-gray-600">Sistema atualizado</span>
                  <span className="ml-auto text-xs text-gray-400">1 h</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;