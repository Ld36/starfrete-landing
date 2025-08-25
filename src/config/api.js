// Configuração da API
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://freight-backend-api.onrender.com' 
  : 'http://localhost:5000'

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
    const token = localStorage.getItem('authToken') || localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de resposta para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Só tenta fazer logout automático em casos específicos
    if (error.response && error.response.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken')
      
      if (refreshToken && !originalRequest._retry) {
        originalRequest._retry = true
        
        try {
          const response = await api.post('/api/v1/auth/refresh', {
            refresh_token: refreshToken
          })
          
          if (response.data.success) {
            const newToken = response.data.access_token
            localStorage.setItem('authToken', newToken)
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api(originalRequest)
          }
        } catch (refreshError) {
          console.error('Erro ao renovar token:', refreshError)
          // Só faz logout se estiver em uma página protegida
          const protectedPaths = ['/admin', '/company', '/driver', '/profile']
          const isProtectedPath = protectedPaths.some(path => window.location.pathname.startsWith(path))
          
          if (isProtectedPath) {
            localStorage.removeItem('authToken')
            localStorage.removeItem('userData')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
          }
          return Promise.reject(refreshError)
        }
      } else if (originalRequest.url.includes('/login') || originalRequest.url.includes('/register')) {
        // Não faz logout automático para rotas de login/registro
        return Promise.reject(error)
      }
    }
    
    return Promise.reject(error)
  }
)

// 🏥 Health Check
export const healthCheck = async () => {
  return api.get('/api/health')
}

// 🔐 Autenticação
export const login = async (email, password) => {
  return api.post('/api/v1/auth/login', { email, password })
}

export const registerCompany = async (companyData) => {
  return api.post('/api/v1/auth/register/company', companyData)
}

export const registerDriver = async (driverData) => {
  return api.post('/api/v1/auth/register/driver', driverData)
}

export const logout = async () => {
  return api.post('/api/v1/auth/logout')
}

export const refreshToken = async (refreshToken) => {
  return api.post('/api/v1/auth/refresh', { refresh_token: refreshToken })
}

// 👤 Usuários
export const getUserProfile = async () => {
  return api.get('/api/v1/users/profile')
}

export const updateUserProfile = async (userData) => {
  return api.put('/api/v1/users/profile', userData)
}

export const getUserVehicles = async () => {
  return api.get('/api/v1/users/vehicles')
}

export const addUserVehicle = async (vehicleData) => {
  return api.post('/api/v1/users/vehicles', vehicleData)
}

export const updateUserVehicle = async (vehicleId, vehicleData) => {
  return api.put(`/api/v1/users/vehicles/${vehicleId}`, vehicleData)
}

export const deleteUserVehicle = async (vehicleId) => {
  return api.delete(`/api/v1/users/vehicles/${vehicleId}`)
}

// 🏢 Empresas
export const getCompanyStats = async () => {
  return api.get('/api/v1/company/stats')
}

export const getCompanyFreights = async () => {
  return api.get('/api/v1/company/freights')
}

export const getCompanyProfile = async () => {
  return api.get('/api/v1/company/profile')
}

export const getFreightInterests = async (freightId) => {
  return api.get(`/api/v1/company/freights/${freightId}/interests`)
}

export const acceptFreightInterest = async (freightId, interestId) => {
  return api.post(`/api/v1/company/freights/${freightId}/interests/${interestId}/accept`)
}

export const rejectFreightInterest = async (freightId, interestId) => {
  return api.post(`/api/v1/company/freights/${freightId}/interests/${interestId}/reject`)
}

// 📦 Fretes
export const listFreights = async (page = 1, per_page = 20) => {
  return api.get(`/api/v1/freights?page=${page}&per_page=${per_page}`)
}

export const createFreight = async (freightData) => {
  return api.post('/api/v1/freights', freightData)
}

export const getFreight = async (freightId) => {
  return api.get(`/api/v1/freights/${freightId}`)
}

export const updateFreight = async (freightId, freightData) => {
  return api.put(`/api/v1/freights/${freightId}`, freightData)
}

export const deleteFreight = async (freightId) => {
  return api.delete(`/api/v1/freights/${freightId}`)
}

export const showInterestInFreight = async (freightId, data = {}) => {
  return api.post(`/api/v1/freights/${freightId}/interest`, data)
}

export const getMyFreights = async () => {
  return api.get('/api/v1/freights/my-freights')
}

export const getMyInterests = async () => {
  return api.get('/api/v1/freights/my-interests')
}

// 📊 Admin
export const getAdminStats = async () => {
  return api.get('/api/v1/admin/stats')
}

export const getAdminUsers = async (page = 1, per_page = 20) => {
  return api.get(`/api/v1/admin/users?page=${page}&per_page=${per_page}`)
}

export const approveUser = async (userId) => {
  return api.post(`/api/v1/admin/users/${userId}/approve`)
}

export const suspendUser = async (userId) => {
  return api.post(`/api/v1/admin/users/${userId}/suspend`)
}

export const activateUser = async (userId) => {
  return api.post(`/api/v1/admin/users/${userId}/activate`)
}

// 📧 Chat
export const getChatRooms = async () => {
  return api.get('/api/v1/chat/rooms')
}

export const getChatMessages = async (roomId) => {
  return api.get(`/api/v1/chat/rooms/${roomId}/messages`)
}

export const markChatAsRead = async (roomId) => {
  return api.post(`/api/v1/chat/rooms/${roomId}/mark-read`)
}

export default api

