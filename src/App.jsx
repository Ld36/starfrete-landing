import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { API_BASE_URL } from './config/api'
import './App.css'

// Páginas
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CompanyDashboard from './pages/CompanyDashboard'
import DriverDashboard from './pages/DriverDashboard'
import AdminDashboard from './pages/AdminDashboard'
import FreightDetails from './pages/FreightDetails'
import ProfilePage from './pages/ProfilePage'

// Context para autenticação
const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

// Provider de autenticação
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há token salvo
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Componente de rota protegida
const ProtectedRoute = ({ children, requiredUserType = null }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredUserType && user.user_type !== requiredUserType) {
    return <Navigate to="/" replace />
  }

  return children
}

// Header da aplicação
const AppHeader = () => {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center">
            <img 
              src="/logo-starfrete-transport-2.png" 
              alt="StarFrete" 
              className="h-8 w-auto mr-3"
            />
            <h1 className="text-xl font-bold text-blue-600">StarFrete</h1>
          </Link>
          
          <nav className="flex items-center space-x-4">
            <span className="text-gray-600">
              Olá, {user.company?.name || user.driver?.name || user.email}
            </span>
            <Link 
              to="/profile" 
              className="text-blue-600 hover:text-blue-800"
            >
              Perfil
            </Link>
            <button 
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Sair
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppHeader />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Rotas protegidas para empresas */}
            <Route 
              path="/company/dashboard" 
              element={
                <ProtectedRoute requiredUserType="company">
                  <CompanyDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Rotas protegidas para motoristas */}
            <Route 
              path="/driver/dashboard" 
              element={
                <ProtectedRoute requiredUserType="driver">
                  <DriverDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Rotas protegidas para admin */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredUserType="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Outras rotas protegidas */}
            <Route 
              path="/freight/:id" 
              element={
                <ProtectedRoute>
                  <FreightDetails />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Rota padrão */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

