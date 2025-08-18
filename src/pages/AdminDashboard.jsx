import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffForm, setStaffForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    department: '',
    position: '',
    is_super_admin: false,
    permissions: {}
  });

  useEffect(() => {
    loadDashboardData();
    loadDepartments();
    loadPermissions();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Carregar estatísticas
      try {
        const statsResponse = await fetch(`${API_BASE_URL}/api/v1/admin/stats`, { headers });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data);
        }
      } catch (error) {
        console.log('Endpoint de stats não encontrado:', error);
      }

      // Carregar usuários pendentes
      try {
        const usersResponse = await fetch(`${API_BASE_URL}/api/v1/admin/users`, { headers });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          console.log('Usuários carregados:', usersData);
          setUsers(usersData.data || usersData);
        } else {
          console.log('Erro ao carregar usuários:', usersResponse.status);
        }
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      }

      // Carregar assinaturas
      try {
        const subsResponse = await fetch(`${API_BASE_URL}/api/v1/admin/subscriptions`, { headers });
        if (subsResponse.ok) {
          const subsData = await subsResponse.json();
          setSubscriptions(subsData.data || subsData);
        }
      } catch (error) {
        console.log('Endpoint de assinaturas não encontrado:', error);
      }

      // Carregar fretes (se disponível)
      try {
        const freightsResponse = await fetch(`${API_BASE_URL}/api/v1/freights`, { headers });
        if (freightsResponse.ok) {
          const freightsData = await freightsResponse.json();
          console.log('Fretes carregados:', freightsData);
        }
      } catch (error) {
        console.log('Endpoint de fretes não encontrado:', error);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/staff/departments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
    }
  };

  const loadPermissions = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/staff/permissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPermissions(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
    }
  };

  const approveUser = async (userId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Usuário aprovado com sucesso!');
        loadDashboardData(); // Recarregar dados
      } else {
        const errorData = await response.json();
        alert('Erro ao aprovar usuário: ' + (errorData.message || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao aprovar usuário: ' + error.message);
    }
  };

  const suspendUser = async (userId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Usuário suspenso com sucesso!');
        loadDashboardData();
      } else {
        alert('Erro ao suspender usuário');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao suspender usuário');
    }
  };

  const renewSubscription = async (subscriptionId, days = 30) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/admin/subscriptions/${subscriptionId}/renew`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ days })
      });

      if (response.ok) {
        alert(`Assinatura renovada por ${days} dias!`);
        loadDashboardData();
      } else {
        alert('Erro ao renovar assinatura');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao renovar assinatura');
    }
  };

  const loadTicketDetails = async (ticketId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/admin/support/tickets/${ticketId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const ticketData = await response.json();
        setSelectedTicket(ticketData.data);
        setTicketMessages(ticketData.data.messages || []);
      }
    } catch (error) {
      console.error('Erro ao carregar ticket:', error);
    }
  };

  const replyToTicket = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/admin/support/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: replyMessage })
      });

      if (response.ok) {
        setReplyMessage('');
        loadTicketDetails(selectedTicket.id);
        loadDashboardData();
      } else {
        alert('Erro ao enviar resposta');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao enviar resposta');
    }
  };

  const closeTicket = async (ticketId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/admin/support/tickets/${ticketId}/close`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Ticket fechado com sucesso!');
        setSelectedTicket(null);
        loadDashboardData();
      } else {
        alert('Erro ao fechar ticket');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao fechar ticket');
    }
  };

  const openStaffModal = (staffMember = null) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setStaffForm({
        email: staffMember.email,
        password: '',
        full_name: staffMember.full_name,
        phone: staffMember.phone || '',
        department: staffMember.department,
        position: staffMember.position || '',
        is_super_admin: staffMember.is_super_admin,
        permissions: staffMember.permissions || {}
      });
    } else {
      setEditingStaff(null);
      setStaffForm({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        department: '',
        position: '',
        is_super_admin: false,
        permissions: {}
      });
    }
    setShowStaffModal(true);
  };

  const closeStaffModal = () => {
    setShowStaffModal(false);
    setEditingStaff(null);
  };

  const handleStaffFormChange = (field, value) => {
    setStaffForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionChange = (permissionId, value) => {
    setStaffForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionId]: value
      }
    }));
  };

  const saveStaff = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const url = editingStaff 
        ? `${API_BASE_URL}/staff/${editingStaff.id}`
        : `${API_BASE_URL}/staff/create`;
      
      const method = editingStaff ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(staffForm)
      });

      if (response.ok) {
        alert(editingStaff ? 'Funcionário atualizado!' : 'Funcionário criado!');
        closeStaffModal();
        loadDashboardData();
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao salvar funcionário');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar funcionário');
    }
  };

  const deactivateStaff = async (staffId) => {
    if (!confirm('Tem certeza que deseja desativar este funcionário?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/staff/${staffId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Funcionário desativado com sucesso!');
        loadDashboardData();
      } else {
        alert('Erro ao desativar funcionário');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao desativar funcionário');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
              <p className="text-gray-600">StarFrete - Painel de Controle</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Admin</span>
              <button
                onClick={() => {
                  localStorage.removeItem('access_token');
                  window.location.href = '/';
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Visão Geral' },
              { id: 'users', name: 'Usuários' },
              { id: 'subscriptions', name: 'Assinaturas' },
              { id: 'support', name: 'Suporte' },
              { id: 'staff', name: 'Funcionários' },
              { id: 'payments', name: 'Pagamentos' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">Total de Usuários</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.total_users || 0}</p>
                <p className="text-sm text-gray-500">
                  {stats.pending_users || 0} aguardando aprovação
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">Empresas</h3>
                <p className="text-3xl font-bold text-green-600">{stats.total_companies || 0}</p>
                <p className="text-sm text-gray-500">
                  {stats.active_subscriptions || 0} assinaturas ativas
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">Motoristas</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.total_drivers || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">Funcionários</h3>
                <p className="text-3xl font-bold text-indigo-600">{staff.length || 0}</p>
                <p className="text-sm text-gray-500">
                  {staff.filter(s => s.is_active).length || 0} ativos
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita Mensal</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  R$ {(stats.monthly_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Total: R$ {(stats.total_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tickets de Suporte</h3>
                <p className="text-2xl font-bold text-red-600">{stats.open_tickets || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Tickets abertos</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Usuários Pendentes de Aprovação</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data de Cadastro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">
                            {user.company?.company_name || user.driver?.full_name || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.user_type === 'company' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.user_type === 'company' ? 'Empresa' : 'Motorista'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => approveUser(user.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => suspendUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Rejeitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Gestão de Assinaturas</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dias Restantes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscriptions.map((subscription) => (
                    <tr key={subscription.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.company?.company_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          subscription.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : subscription.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subscription.status === 'active' ? 'Ativa' : 
                           subscription.status === 'pending' ? 'Pendente' : 'Inativa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subscription.days_remaining || 0} dias
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        R$ {subscription.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => renewSubscription(subscription.id, 30)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Renovar 30d
                        </button>
                        <button
                          onClick={() => renewSubscription(subscription.id, 90)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Renovar 90d
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tickets List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Tickets de Suporte</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => loadTicketDetails(ticket.id)}
                    className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                        <p className="text-sm text-gray-500">{ticket.user?.email}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ticket.status === 'open' 
                          ? 'bg-red-100 text-red-800'
                          : ticket.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {ticket.status === 'open' ? 'Aberto' : 
                         ticket.status === 'in_progress' ? 'Em Andamento' : 'Resolvido'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket Details */}
            {selectedTicket && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedTicket.subject}</h3>
                  <button
                    onClick={() => closeTicket(selectedTicket.id)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Fechar Ticket
                  </button>
                </div>
                
                {/* Messages */}
                <div className="max-h-64 overflow-y-auto p-4 space-y-4">
                  {ticketMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.is_admin 
                          ? 'bg-blue-100 ml-8' 
                          : 'bg-gray-100 mr-8'
                      }`}
                    >
                      <div className="text-sm">
                        <span className="font-medium">
                          {message.is_admin ? 'Suporte' : message.user?.email}
                        </span>
                        <span className="text-gray-500 ml-2">
                          {new Date(message.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="mt-1">{message.message}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <div className="p-4 border-t">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Digite sua resposta..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    rows="3"
                  />
                  <button
                    onClick={replyToTicket}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Enviar Resposta
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Gestão de Funcionários</h3>
                <button
                  onClick={() => openStaffModal()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Novo Funcionário
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Funcionário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Departamento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cargo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Último Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {staff.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            member.department === 'admin' ? 'bg-purple-100 text-purple-800' :
                            member.department === 'financial' ? 'bg-green-100 text-green-800' :
                            member.department === 'approval' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {member.department === 'admin' ? 'Administração' :
                             member.department === 'financial' ? 'Financeiro' :
                             member.department === 'approval' ? 'Aprovação' : 'Suporte'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.position || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            member.is_active 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {member.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                          {member.is_super_admin && (
                            <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                              Super Admin
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.last_login ? new Date(member.last_login).toLocaleDateString('pt-BR') : 'Nunca'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => openStaffModal(member)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Editar
                          </button>
                          {!member.is_super_admin && (
                            <button
                              onClick={() => deactivateStaff(member.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Desativar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Controle de Pagamentos</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Sistema de pagamentos manuais implementado. 
                Quando uma empresa é aprovada, a assinatura de 30 dias é ativada automaticamente.
              </p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Fluxo de Pagamento:</h4>
                <ol className="mt-2 text-sm text-blue-800 list-decimal list-inside space-y-1">
                  <li>Empresa se cadastra (status: pendente)</li>
                  <li>Admin aprova o cadastro</li>
                  <li>Assinatura de 30 dias é ativada automaticamente</li>
                  <li>Empresa pode usar a plataforma por 30 dias</li>
                  <li>Admin pode renovar manualmente quando necessário</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingStaff ? 'Editar Funcionário' : 'Novo Funcionário'}
                </h3>
                <button
                  onClick={closeStaffModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={staffForm.email}
                      onChange={(e) => handleStaffFormChange('email', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      disabled={editingStaff}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {editingStaff ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}
                    </label>
                    <input
                      type="password"
                      value={staffForm.password}
                      onChange={(e) => handleStaffFormChange('password', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                    <input
                      type="text"
                      value={staffForm.full_name}
                      onChange={(e) => handleStaffFormChange('full_name', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <input
                      type="tel"
                      value={staffForm.phone}
                      onChange={(e) => handleStaffFormChange('phone', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Departamento</label>
                    <select
                      value={staffForm.department}
                      onChange={(e) => handleStaffFormChange('department', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Selecione um departamento</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cargo</label>
                    <input
                      type="text"
                      value={staffForm.position}
                      onChange={(e) => handleStaffFormChange('position', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={staffForm.is_super_admin}
                      onChange={(e) => handleStaffFormChange('is_super_admin', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Super Administrador</span>
                  </label>
                </div>

                {!staffForm.is_super_admin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Permissões Específicas</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                      {permissions.map((permission) => (
                        <label key={permission.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={staffForm.permissions[permission.id] || false}
                            onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">{permission.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeStaffModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveStaff}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingStaff ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

