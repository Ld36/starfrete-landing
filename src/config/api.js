// Configuração da API
export const API_BASE_URL = 'http://localhost:5000'

// Configuração do axios
import axios from 'axios'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado, remover e redirecionar para login
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Funções para consumir os endpoints da API

// 🏥 Health Check
export const healthCheck = async () => {
  return api.get('/api/health');
};

// 🔐 Autenticação
export const login = async (email, password) => {
  return api.post('/api/v1/auth/login', { email, password });
};

export const register = async (userData) => {
  return api.post('/auth/register', userData);
};

// 🚛 Gestão de Fretes
export const listFreights = async (page = 1, per_page = 20) => {
  return api.get(`/api/v1/freights?page=${page}&per_page=${per_page}`);
};

export const createFreight = async (freightData) => {
  return api.post('/freight/create', freightData);
};

export const updateFreight = async (freight_id, status) => {
  return api.put('/freight/update', { freight_id, status });
};

// 👥 Gestão de Usuários (Admin)
export const approveUser = async (user_id, status) => {
  return api.put('/admin/approve', { user_id, status });
};

// � Sistema de Assinaturas
export const createSubscription = async (company_id, plan) => {
  return api.post('/subscription/create', { company_id, plan });
};

export default api

