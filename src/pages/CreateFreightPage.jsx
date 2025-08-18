import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createFreight } from '../config/api'

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const freightData = {
        title: formData.title,
        description: formData.description,
        origin: formData.origin,
        destination: formData.destination,
        weight: parseFloat(formData.weight),
        price: parseFloat(formData.price),
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
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

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
                Título do frete
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Entrega de Eletrônicos"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descrição detalhada
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descreva detalhadamente o que será transportado"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700">
                Local de origem
              </label>
              <input
                id="origin"
                name="origin"
                type="text"
                required
                value={formData.origin}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: São Paulo, SP"
              />
            </div>

            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
                Local de destino
              </label>
              <input
                id="destination"
                name="destination"
                type="text"
                required
                value={formData.destination}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Rio de Janeiro, RJ"
              />
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                Peso (kg)
              </label>
              <input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                required
                value={formData.weight}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 150.5"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Preço (R$)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 1200.00"
              />
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                Prazo de entrega
              </label>
              <input
                id="deadline"
                name="deadline"
                type="datetime-local"
                required
                value={formData.deadline}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
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
