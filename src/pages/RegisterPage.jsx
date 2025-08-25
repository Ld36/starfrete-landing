import { useState } from 'react'
import { Link } from 'react-router-dom' 
import axios from 'axios'
import { API_BASE_URL } from '../config/api';


export default function RegisterPage() {
  const [userType, setUserType] = useState('company')
  
  // Estados separados para empresa e motorista
  const [companyData, setCompanyData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    type: 'company',
    company: {
      cnpj: '',
      phone: '',
      address: '',
      contact_person: ''
    }
  })
  
  const [driverData, setDriverData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    type: 'driver',
    driver: {
      cpf: '',
      phone: '',
      cnh: '',
      cnh_category: '',
      cnh_expiry: '',
      address: ''
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isTrialMode, setIsTrialMode] = useState(false)

  // Função para obter os dados ativos baseado no tipo de usuário
  const getActiveFormData = () => {
    return userType === 'company' ? companyData : driverData
  }

  // Função para atualizar os dados baseado no tipo de usuário
  const setActiveFormData = (updateFn) => {
    if (userType === 'company') {
      setCompanyData(updateFn)
    } else {
      setDriverData(updateFn)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = getActiveFormData()

    if (formData.password !== formData.confirmPassword) {
      setMessage('As senhas não coincidem')
      setLoading(false)
      return
    }

    try {
      let endpoint, payload;

      if (userType === 'driver') {
        endpoint = '/api/v1/auth/register/driver';
        payload = {
          email: formData.email,
          password: formData.password,
          phone: formData.driver.phone,
          full_name: formData.name,
          cpf: formData.driver.cpf,
          cnh_number: formData.driver.cnh,
          cnh_category: formData.driver.cnh_category,
          cnh_expiry: formData.driver.cnh_expiry
        };
      } else if (userType === 'company') {
        endpoint = '/api/v1/auth/register/company';
        payload = {
          email: formData.email,
          password: formData.password,
          phone: formData.company.phone,
          company_name: formData.name,
          cnpj: formData.company.cnpj
        };
      }

      const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload)
      
      if (response.data.success) {
        setMessage(response.data.message || 'Cadastro realizado com sucesso! Aguarde aprovação da equipe.')
        
        // Limpar todos os campos após registro bem-sucedido
        setCompanyData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          type: 'company',
          company: {
            cnpj: '',
            phone: '',
            address: '',
            contact_person: ''
          }
        })
        setDriverData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          type: 'driver',
          driver: {
            cpf: '',
            phone: '',
            cnh: '',
            cnh_category: '',
            cnh_expiry: '',
            address: ''
          }
        })
      }
    } catch (error) {
      console.error('Erro no registro:', error)
      setMessage(error.response?.data?.message || 'Erro ao realizar cadastro')
    } finally {
      setLoading(false)
    }
  }

  // Função de input atualizada para tratar limites e campos numéricos
  const handleInputChange = (e) => {
    const { name, value } = e.target
    let processedValue = value;

    // Lista de campos que devem conter apenas números
    const numericFields = [
      'company.cnpj',
      'driver.cpf',
      'company.phone',
      'driver.phone',
      'driver.cnh'
    ];

    // Se o campo for numérico, remove todos os caracteres não-dígitos
    if (numericFields.includes(name)) {
      processedValue = value.replace(/\D/g, '');
    }
    
    // Atualiza o estado correspondente
    if (name.includes('.')) {
      const [section, field] = name.split('.')
      setActiveFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: processedValue
        }
      }))
    } else {
      setActiveFormData(prev => ({
        ...prev,
        [name]: processedValue
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/logo-starfrete-transport-2.png" 
              alt="StarFrete" 
              className="h-10 w-auto mr-3"
            />
            <h1 className="text-2xl font-bold text-blue-600">StarFrete</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Criar conta</h2>
          <p className="mt-2 text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Faça login
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Seleção de tipo de usuário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de conta
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('company')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  userType === 'company'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-semibold">Empresa</div>
                <div className="text-xs text-gray-500">Publico fretes</div>
              </button>
              <button
                type="button"
                onClick={() => setUserType('driver')}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  userType === 'driver'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-semibold">Motorista</div>
                <div className="text-xs text-gray-500">Busco fretes</div>
              </button>
            </div>
          </div>

          {/* Informações de teste grátis para empresas */}
          {userType === 'company' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-green-800">
                    🎉 Período de teste de 7 dias grátis
                  </p>
                  <p className="text-xs text-green-600">
                    Após o período, assinatura de R$ 120,00/mês
                  </p>
                </div>
              </div>
              
              <div className="mt-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isTrialMode}
                    onChange={(e) => setIsTrialMode(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-green-700">
                    Quero iniciar com o teste grátis de 7 dias
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Dados básicos */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                maxLength="100"
                value={getActiveFormData().name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                maxLength="150"
                value={getActiveFormData().email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                maxLength="50"
                value={getActiveFormData().password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Sua senha"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                maxLength="50"
                value={getActiveFormData().confirmPassword}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirme sua senha"
              />
            </div>
          </div>

          {/* Dados específicos da empresa */}
          {userType === 'company' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Dados da empresa</h3>
              
              <div>
                <label htmlFor="company.cnpj" className="block text-sm font-medium text-gray-700">
                  CNPJ
                </label>
                <input
                  id="company.cnpj"
                  name="company.cnpj"
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength="14"
                  value={getActiveFormData().company.cnpj}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Apenas números"
                />
              </div>

              <div>
                <label htmlFor="company.phone" className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <input
                  id="company.phone"
                  name="company.phone"
                  type="tel"
                  inputMode="numeric"
                  required
                  maxLength="11"
                  value={getActiveFormData().company.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Apenas números (DDD + número)"
                />
              </div>

              <div>
                <label htmlFor="company.address" className="block text-sm font-medium text-gray-700">
                  Endereço completo
                </label>
                <textarea
                  id="company.address"
                  name="company.address"
                  required
                  maxLength="255"
                  value={getActiveFormData().company.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Rua, número, bairro, cidade, estado"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="company.contact_person" className="block text-sm font-medium text-gray-700">
                  Pessoa de contato
                </label>
                <input
                  id="company.contact_person"
                  name="company.contact_person"
                  type="text"
                  required
                  maxLength="100"
                  value={getActiveFormData().company.contact_person}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nome do responsável"
                />
              </div>
            </div>
          )}

          {/* Dados específicos do motorista */}
          {userType === 'driver' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Dados do motorista</h3>
              
              <div>
                <label htmlFor="driver.cpf" className="block text-sm font-medium text-gray-700">
                  CPF
                </label>
                <input
                  id="driver.cpf"
                  name="driver.cpf"
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength="11"
                  value={getActiveFormData().driver.cpf}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Apenas números"
                />
              </div>

              <div>
                <label htmlFor="driver.phone" className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <input
                  id="driver.phone"
                  name="driver.phone"
                  type="tel"
                  inputMode="numeric"
                  required
                  maxLength="11"
                  value={getActiveFormData().driver.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Apenas números (DDD + número)"
                />
              </div>

              <div>
                <label htmlFor="driver.cnh" className="block text-sm font-medium text-gray-700">
                  CNH
                </label>
                <input
                  id="driver.cnh"
                  name="driver.cnh"
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength="11"
                  value={getActiveFormData().driver.cnh}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Apenas números"
                />
              </div>

              <div>
                <label htmlFor="driver.cnh_category" className="block text-sm font-medium text-gray-700">
                  Categoria da CNH
                </label>
                <select
                  id="driver.cnh_category"
                  name="driver.cnh_category"
                  required
                  value={getActiveFormData().driver.cnh_category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione a categoria</option>
                  <option value="A">A - Motocicleta</option>
                  <option value="B">B - Automóvel</option>
                  <option value="C">C - Caminhão</option>
                  <option value="D">D - Ônibus</option>
                  <option value="E">E - Articulado</option>
                </select>
              </div>

              <div>
                <label htmlFor="driver.cnh_expiry" className="block text-sm font-medium text-gray-700">
                  Data de vencimento da CNH
                </label>
                <input
                  id="driver.cnh_expiry"
                  name="driver.cnh_expiry"
                  type="date"
                  required
                  value={getActiveFormData().driver.cnh_expiry}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="driver.address" className="block text-sm font-medium text-gray-700">
                  Endereço completo
                </label>
                <textarea
                  id="driver.address"
                  name="driver.address"
                  required
                  maxLength="255"
                  value={getActiveFormData().driver.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Rua, número, bairro, cidade, estado"
                  rows={3}
                />
              </div>
            </div>
          )}

          {message && (
            <div className={`p-3 rounded-md ${
              message.includes('sucesso') || message.includes('Redirecionando') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Cadastrando...' : (
              isTrialMode && userType === 'company' 
                ? 'Iniciar teste grátis de 7 dias' 
                : 'Criar conta'
            )}
          </button>

          {!isTrialMode && userType === 'company' && (
            <p className="text-xs text-gray-500 text-center">
              Seu cadastro ficará pendente até aprovação da equipe StarFrete.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
