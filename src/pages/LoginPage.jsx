import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth.jsx'
import { login } from '../config/api'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await login(formData.email, formData.password)
      
      if (response.data.success) {
        setMessage('Login realizado com sucesso!')
        
        const userData = response.data.data.user
        const token = response.data.data.access_token
        
        // Usar o AuthContext para fazer login
        authLogin(userData, token)
        
        // Salvar também o refresh_token
        localStorage.setItem('access_token', token)
        localStorage.setItem('refresh_token', response.data.data.refresh_token)
        
        // Redirecionar baseado no tipo de usuário
        const userType = userData?.user_type || userData?.type
        
        if (userType) {
          switch (userType) {
            case 'company':
              navigate('/company/dashboard')
              break
            case 'driver':
              navigate('/driver/dashboard')
              break
            case 'admin':
              navigate('/admin/dashboard')
              break
            default:
              navigate('/')
          }
        } else {
          navigate('/')
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao realizar login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">StarFrete</h1>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Entre na sua conta
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Ou{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                crie uma nova conta
              </Link>
            </p>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
              {message}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Esqueceu sua senha?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Cadastre-se aqui
              </Link>
            </p>
          </div>

          {/* Contas de demonstração */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Contas de demonstração:</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="bg-gray-50 p-2 rounded">
                <strong>Empresa:</strong> empresa@demo.com / demo123
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <strong>Motorista:</strong> motorista@demo.com / demo123
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <strong>Admin:</strong> admin@starfrete.com / admin123
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage

