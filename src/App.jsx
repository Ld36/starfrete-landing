import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/use-auth.jsx'
import { Toaster } from 'react-hot-toast'
import './App.css'

// Páginas
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NewLoginPage from './pages/NewLoginPage'
import NewRegisterPage from './pages/NewRegisterPage'
import CompanyDashboard from './pages/CompanyDashboard'
import DriverDashboard from './pages/DriverDashboard'
import AdminDashboard from './pages/AdminDashboard'
import FreightDetails from './pages/FreightDetails'
import ProfilePage from './pages/ProfilePage'

// Componente de rota protegida
const ProtectedRoute = ({ children, requiredUserType = null }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<NewLoginPage />} />
            <Route path="/register" element={<NewRegisterPage />} />
            
            {/* Rotas antigas (manter por compatibilidade) */}
            <Route path="/old-login" element={<LoginPage />} />
            <Route path="/old-register" element={<RegisterPage />} />
            
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
          
          {/* Toast Container */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

