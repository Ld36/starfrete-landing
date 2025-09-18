import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/use-auth.jsx'
import { Toaster } from 'react-hot-toast'
import './App.css'

// Páginas
import LandingPage from './pages/LandingPage'
import AboutPage from './pages/AboutPage'
import BenefitsPage from './pages/BenefitsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NewLoginPage from './pages/NewLoginPage'
import SimpleLoginPage from './pages/SimpleLoginPage'
import AdminLoginPage from './pages/AdminLoginPage'
import NewRegisterPage from './pages/NewRegisterPage'
import CompanyDashboard from './pages/CompanyDashboard'
import NewCompanyDashboard from './pages/NewCompanyDashboard'
import DriverDashboard from './pages/DriverDashboard'
import AdminDashboard from './pages/AdminDashboard'
import FreightDetails from './pages/FreightDetails'
import ProfilePage from './pages/ProfilePage'
import MessagesPage from './pages/MessagesPage'

// Páginas do Driver
import DriverAvailableFreights from './pages/DriverAvailableFreights'
import DriverMyFreights from './pages/DriverMyFreights'
import DriverCapacity from './pages/DriverCapacity'
import DriverMessages from './pages/DriverMessages'
import DriverSettings from './pages/DriverSettings'

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
            <Route path="/about" element={<AboutPage />} />
            <Route path="/benefits" element={<BenefitsPage />} />
            <Route path="/login" element={<SimpleLoginPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
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
            
            {/* Nova interface para empresas */}
            <Route 
              path="/company-dashboard/*" 
              element={
                <ProtectedRoute requiredUserType="company">
                  <NewCompanyDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/publish" 
              element={
                <ProtectedRoute requiredUserType="company">
                  <NewCompanyDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/freights" 
              element={
                <ProtectedRoute requiredUserType="company">
                  <NewCompanyDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tracking" 
              element={
                <ProtectedRoute requiredUserType="company">
                  <NewCompanyDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/documents" 
              element={
                <ProtectedRoute requiredUserType="company">
                  <NewCompanyDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute requiredUserType="company">
                  <NewCompanyDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute requiredUserType="company">
                  <NewCompanyDashboard />
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
            
            <Route 
              path="/driver/available" 
              element={
                <ProtectedRoute requiredUserType="driver">
                  <DriverAvailableFreights />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/driver/freights" 
              element={
                <ProtectedRoute requiredUserType="driver">
                  <DriverMyFreights />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/driver/capacity" 
              element={
                <ProtectedRoute requiredUserType="driver">
                  <DriverCapacity />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/driver/messages" 
              element={
                <ProtectedRoute requiredUserType="driver">
                  <DriverMessages />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/driver/settings" 
              element={
                <ProtectedRoute requiredUserType="driver">
                  <DriverSettings />
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

