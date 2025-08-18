import { Link } from 'react-router-dom'
import logoStarfrete from '../assets/logo_star.svg'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/90 shadow-lg fixed w-full top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
    <img 
      src={logoStarfrete} 
      alt="StarFrete" 
      className="h-16 w-auto"
    />
</div>
            <nav className="hidden md:flex space-x-8">
              <a href="#como-funciona" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Como Funciona
              </a>
              <a href="#recursos" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Recursos
              </a>
              <a href="#precos" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Preços
              </a>
              <a href="#contato" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Contato
              </a>
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Entrar
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-md"
              >
                Cadastrar Grátis
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent transform -skew-y-1"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                O futuro do
                <span className="text-yellow-400 block">transporte de cargas</span>
                está aqui
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl leading-relaxed">
                A StarFrete conecta empresas e motoristas autônomos através de uma plataforma 
                moderna, segura e eficiente. Revolucione seus fretes hoje mesmo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  to="/register" 
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-bold shadow-xl transform hover:scale-105 transition-all flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Começar Gratuitamente
                </Link>
                <Link 
                  to="/login" 
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Já tenho conta
                </Link>
              </div>
              <div className="flex items-center space-x-8 text-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  7 dias grátis
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Sem taxa de cadastro
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Suporte 24/7
                </div>
              </div>
            </div>
            <div className="lg:text-right">
              <div className="inline-block bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
                <img 
                  src={logoStarfrete} 
                  alt="StarFrete" 
                  className="w-64 h-64 object-contain mx-auto filter drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Por que escolher a StarFrete?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa plataforma oferece tudo que você precisa para gerenciar seus fretes com eficiência e segurança
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">Conexão Inteligente</h3>
              <p className="text-gray-600 text-center">
                Algoritmos avançados conectam empresas com motoristas ideais baseado em localização, 
                tipo de carga e histórico de performance.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">Máxima Segurança</h3>
              <p className="text-gray-600 text-center">
                Verificação rigorosa de documentos, rastreamento em tempo real e sistema de 
                avaliações para garantir total confiabilidade.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">Economia Real</h3>
              <p className="text-gray-600 text-center">
                Reduza custos operacionais em até 40% eliminando intermediários e 
                negociando diretamente com motoristas qualificados.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">Gestão Completa de Fretes</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold mb-2">Dashboard Intuitivo</h4>
                    <p className="text-gray-600">Gerencie todos os seus fretes em um painel moderno e fácil de usar</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold mb-2">Rastreamento em Tempo Real</h4>
                    <p className="text-gray-600">Acompanhe suas cargas do início ao fim da jornada</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold mb-2">Relatórios Detalhados</h4>
                    <p className="text-gray-600">Análise completa de custos, prazos e performance</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-12 text-white">
                <svg className="w-24 h-24 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h4 className="text-2xl font-bold mb-4">Controle Total</h4>
                <p className="text-blue-100">Tenha visibilidade completa de todos os seus processos logísticos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Como funciona a StarFrete</h2>
            <p className="text-xl text-gray-600">Simples, rápido e eficiente em apenas 4 passos</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Linha conectora */}
            <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200"></div>
            
            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg relative z-10">
                1
              </div>
              <h3 className="text-xl font-bold mb-4">Cadastre-se Grátis</h3>
              <p className="text-gray-600">Crie sua conta como empresa ou motorista em menos de 5 minutos</p>
            </div>
            
            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg relative z-10">
                2
              </div>
              <h3 className="text-xl font-bold mb-4">Publique ou Busque</h3>
              <p className="text-gray-600">Empresas publicam fretes detalhados, motoristas encontram oportunidades</p>
            </div>
            
            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg relative z-10">
                3
              </div>
              <h3 className="text-xl font-bold mb-4">Negocie Diretamente</h3>
              <p className="text-gray-600">Chat integrado para negociar preços e condições em tempo real</p>
            </div>
            
            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg relative z-10">
                4
              </div>
              <h3 className="text-xl font-bold mb-4">Transporte Seguro</h3>
              <p className="text-gray-600">Rastreamento em tempo real e suporte completo durante o transporte</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Planos que cabem no seu bolso</h2>
            <p className="text-xl text-gray-600">Escolha o plano ideal para o seu negócio</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plano Motorista */}
            <div className="bg-white rounded-2xl shadow-xl p-8 relative">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Para Motoristas</h3>
                <p className="text-gray-600 mb-8">Ideal para motoristas autônomos</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-green-600">GRÁTIS</span>
                  <span className="text-gray-600 ml-2">sempre</span>
                </div>
                <ul className="text-left space-y-4 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Busca ilimitada de fretes
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Chat direto com empresas
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Histórico de fretes
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Suporte por email
                  </li>
                </ul>
                <Link 
                  to="/register" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-8 rounded-lg font-semibold transition-all transform hover:scale-105 inline-block text-center"
                >
                  Cadastrar como Motorista
                </Link>
              </div>
            </div>

            {/* Plano Empresa */}
            <div className="bg-white rounded-2xl shadow-xl p-8 relative border-4 border-blue-500">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-bold">MAIS POPULAR</span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Para Empresas</h3>
                <p className="text-gray-600 mb-8">Perfeito para empresas que enviam cargas</p>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-blue-600">R$ 120</span>
                  <span className="text-gray-600 ml-2">/mês</span>
                </div>
                <p className="text-green-600 font-semibold mb-8">7 dias grátis para testar!</p>
                <ul className="text-left space-y-4 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Fretes ilimitados
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Dashboard completo
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Rastreamento em tempo real
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Relatórios avançados
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Suporte prioritário 24/7
                  </li>
                </ul>
                <Link 
                  to="/register" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-lg font-semibold transition-all transform hover:scale-105 inline-block text-center"
                >
                  Começar Teste Grátis
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para revolucionar seus fretes?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Junte-se a milhares de empresas e motoristas que já transformaram 
            suas operações logísticas com a StarFrete
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              to="/register" 
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-bold shadow-xl transform hover:scale-105 transition-all flex items-center justify-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Começar Agora - É Grátis!
            </Link>
            <Link 
              to="/login" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all flex items-center justify-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Já tenho conta
            </Link>
          </div>
          <div className="text-center">
            <p className="text-blue-200 text-sm">
              ✅ Sem compromisso • ✅ Cancelamento gratuito • ✅ Suporte dedicado
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-6">
                <img 
                  src={logoStarfrete} 
                  alt="StarFrete" 
                  className="h-10 w-auto mr-3"
                />
                <h3 className="text-xl font-bold">StarFrete</h3>
              </div>
              <p className="text-gray-400 mb-4">
                A plataforma mais completa para conectar empresas e motoristas autônomos no Brasil.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#recursos" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#precos" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Cadastrar-se</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre nós</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 StarFrete. Todos os direitos reservados.
              </p>
              <p className="text-gray-400 text-sm mt-4 md:mt-0">
                Feito com ❤️ para revolucionar a logística brasileira
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
