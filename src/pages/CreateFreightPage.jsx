import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createFreight } from '../config/api'
import {
  validateRequired,
  validateCEP,
  handleCEPInput,
  handleCurrencyInput,
  handleNumbersOnlyInput,
  errorMessages,
  cleanFormat
} from '../utils/validation.js'

export default function CreateFreightPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    origin: '',
    destination: '',
    weight: '',
    price: '',
    deadline: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {};

    if (!validateRequired(formData.title)) {
      newErrors.title = errorMessages.required;
    }

    if (!validateRequired(formData.description)) {
      newErrors.description = errorMessages.required;
    }

    if (!validateRequired(formData.origin)) {
      newErrors.origin = errorMessages.required;
    } else if (!validateCEP(formData.origin)) {
      newErrors.origin = errorMessages.cep;
    }

    if (!validateRequired(formData.destination)) {
      newErrors.destination = errorMessages.required;
    } else if (!validateCEP(formData.destination)) {
      newErrors.destination = errorMessages.cep;
    }

    if (!validateRequired(formData.weight)) {
      newErrors.weight = errorMessages.required;
    } else if (isNaN(parseFloat(formData.weight)) || parseFloat(formData.weight) <= 0) {
      newErrors.weight = 'Peso deve ser um número válido maior que zero';
    }

    if (!validateRequired(formData.price)) {
      newErrors.price = errorMessages.required;
    } else if (isNaN(parseFloat(cleanFormat(formData.price))) || parseFloat(cleanFormat(formData.price)) <= 0) {
      newErrors.price = 'Preço deve ser um valor válido maior que zero';
    }

    if (!validateRequired(formData.deadline)) {
      newErrors.deadline = errorMessages.required;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const freightData = {
        title: formData.title,
        description: formData.description,
        origin: formData.origin,
        destination: formData.destination,
        weight: parseFloat(formData.weight),
        price: parseFloat(cleanFormat(formData.price)),
        deadline: formData.deadline
      }

      const response = await createFreight(freightData)
      
      if (response.data.success) {
        setMessage('Frete criado com sucesso!')
        // Reset form
        setFormData({
          title: '',
          description: '',
          origin: '',
          destination: '',
          weight: '',
          price: '',
          deadline: ''
        })
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erro ao criar frete')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    let formattedValue = value;
    
    // Aplicar máscaras específicas
    if (name === 'origin' || name === 'destination') {
      // Máscara para CEP
      formattedValue = value.replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2');
      if (formattedValue.length > 9) formattedValue = formattedValue.substring(0, 9);
    } else if (name === 'weight') {
      // Apenas números e vírgula/ponto para peso
      formattedValue = value.replace(/[^\d.,]/g, '');
    } else if (name === 'price') {
      // Formatação de moeda
      const cleaned = value.replace(/\D/g, '');
      if (cleaned) {
        const number = parseFloat(cleaned) / 100;
        formattedValue = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(number);
      } else {
        formattedValue = '';
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Criar Frete</h2>
          <p className="mt-2 text-sm text-gray-600">
            Preencha os dados do frete que deseja publicar
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Título do frete *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Ex: Entrega de Eletrônicos"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descrição detalhada *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Descreva detalhadamente o que será transportado"
                rows={3}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700">
                CEP de Origem *
              </label>
              <input
                id="origin"
                name="origin"
                type="text"
                required
                value={formData.origin}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.origin ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="00000-000"
                maxLength={9}
              />
              {errors.origin && <p className="mt-1 text-sm text-red-600">{errors.origin}</p>}
            </div>

            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
                CEP de Destino *
              </label>
              <input
                id="destination"
                name="destination"
                type="text"
                required
                value={formData.destination}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.destination ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="00000-000"
                maxLength={9}
              />
              {errors.destination && <p className="mt-1 text-sm text-red-600">{errors.destination}</p>}
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                Peso (kg) *
              </label>
              <input
                id="weight"
                name="weight"
                type="text"
                required
                value={formData.weight}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.weight ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Ex: 150.5"
              />
              {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Preço *
              </label>
              <input
                id="price"
                name="price"
                type="text"
                required
                value={formData.price}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="R$ 0,00"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                Prazo de entrega *
              </label>
              <input
                id="deadline"
                name="deadline"
                type="datetime-local"
                required
                value={formData.deadline}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.deadline ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                min={new Date().toISOString().slice(0, 16)}
              />
              {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-md ${
              message.includes('sucesso') 
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
            {loading ? 'Criando...' : 'Criar Frete'}
          </button>

          <div className="text-center">
            <Link to="/company/dashboard" className="text-sm text-blue-600 hover:text-blue-500">
              Voltar ao dashboard
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
