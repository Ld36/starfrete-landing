import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Calendar,
  PlusSquare,
  Eye,
  Users
} from 'lucide-react';
import { getCompanyStats, getCompanyFreights } from '../config/api';
import { toast } from 'react-hot-toast';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    total_freights: 0,
    active_freights: 0,
    completed_freights: 0,
    total_revenue: 0
  });
  const [recentFreights, setRecentFreights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, freightsData] = await Promise.all([
        getCompanyStats(),
        getCompanyFreights()
      ]);
      
      setStats(statsData);
      // Garantir que freightsData é um array
      const freights = Array.isArray(freightsData) ? freightsData : (freightsData?.freights || []);
      setRecentFreights(freights.slice(0, 5)); // Últimos 5 fretes
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
      // Definir valores padrão em caso de erro
      setStats({
        total_freights: 0,
        active_freights: 0,
        completed_freights: 0,
        total_revenue: 0
      });
      setRecentFreights([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Ativo' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Concluído' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelado' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'Em Andamento' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <Link href="/publish">
          <Button>
            <PlusSquare className="h-4 w-4 mr-2" />
            Novo Frete
          </Button>
        </Link>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Fretes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_freights}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fretes Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.active_freights}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed_freights}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_revenue)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fretes Recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fretes Recentes</CardTitle>
            <Link href="/freights">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Ver Todos
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentFreights.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhum frete encontrado.</p>
              <Link href="/publish">
                <Button className="mt-4">
                  <PlusSquare className="h-4 w-4 mr-2" />
                  Publicar Primeiro Frete
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentFreights.map((freight) => (
                <div key={freight.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {freight.pickup_city}/{freight.pickup_state} → {freight.delivery_city}/{freight.delivery_state}
                        </h4>
                        <p className="text-sm text-gray-500">ID: {freight.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(freight.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{freight.pickup_city} → {freight.delivery_city}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(freight.pickup_date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Package className="h-3 w-3" />
                      <span>{freight.cargo_weight}kg</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span className="font-semibold text-green-600">{formatCurrency(freight.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/publish">
              <Button 
                variant="outline" 
                className="flex items-center justify-center p-6 h-auto w-full"
              >
                <div className="text-center">
                  <PlusSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">Publicar Frete</h3>
                  <p className="text-sm text-gray-500">Criar um novo frete</p>
                </div>
              </Button>
            </Link>
            
            <Link href="/freights">
              <Button 
                variant="outline" 
                className="flex items-center justify-center p-6 h-auto w-full"
              >
                <div className="text-center">
                  <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">Meus Fretes</h3>
                  <p className="text-sm text-gray-500">Gerenciar fretes existentes</p>
                </div>
              </Button>
            </Link>
            
            <Link href="/messages">
              <Button 
                variant="outline" 
                className="flex items-center justify-center p-6 h-auto w-full"
              >
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">Mensagens</h3>
                  <p className="text-sm text-gray-500">Conversar com motoristas</p>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
