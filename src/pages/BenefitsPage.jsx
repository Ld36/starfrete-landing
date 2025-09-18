import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Building2,
  Bike,
  Brain,
  Route,
  CreditCard,
  FileText,
  Clock,
  Shield,
  Zap,
  CheckSquare,
  Calculator,
  Receipt,
  Coins,
  Award,
} from "lucide-react";

export default function BenefitsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img
              src="/logo3.png"
              alt="StarFrete Logo"
              className="h-20 w-auto drop-shadow-md"
            />
            <span className="text-2xl font-bold text-blue-600">StarFrete</span>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Início
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Sobre
            </Link>
            <Link to="/benefits" className="text-blue-600 font-medium">
              Benefícios
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Benefícios do StarFrete
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
            Nossa plataforma oferece vantagens exclusivas para motoristas, motoboys e empresas, 
            utilizando tecnologia para simplificar operações e maximizar lucros.
          </p>
        </div>
      </section>

      {/* Benefícios em 3 Colunas */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-x-10 gap-y-16">
            {/* Para Motoristas */}
            <div>
              <div className="flex items-center mb-8">
                <div className="bg-blue-600 text-white p-3 rounded-full mr-4">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Para Motoristas</h3>
              </div>
              <ul className="space-y-6">
                <li className="flex">
                  <div className="mr-4 mt-1 text-blue-600 flex-shrink-0">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Gestão Inteligente de Capacidade</h4>
                    <p className="text-gray-600">Nossa IA calcula automaticamente quanto de cubagem resta disponível no caminhão e quanto de peso ainda pode transportar, sem exceder limites permitidos.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="mr-4 mt-1 text-blue-600 flex-shrink-0">
                    <Route className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Rotas Otimizadas</h4>
                    <p className="text-gray-600">O sistema mostra apenas cargas compatíveis com seu tipo de caminhão, capacidade de peso e cubagem, com mínimo desvio para coletas e entregas.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="mr-4 mt-1 text-blue-600 flex-shrink-0">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Negociação Direta</h4>
                    <p className="text-gray-600">Negocie o valor do frete e formas de pagamento diretamente com a empresa proprietária da carga. Sem intermediários.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="mr-4 mt-1 text-blue-600 flex-shrink-0">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Documentação Digital</h4>
                    <p className="text-gray-600">Acesse notas fiscais, emita DACTE e MDF-e, e gerencie todos os documentos de viagem diretamente pelo aplicativo.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Para Motoboys */}
            <div>
              <div className="flex items-center mb-8">
                <div className="bg-blue-600 text-white p-3 rounded-full mr-4">
                  <Bike className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Para Motoboys</h3>
              </div>
              <ul className="space-y-6">
                <li className="flex">
                  <div className="mr-4 mt-1 text-blue-600 flex-shrink-0">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Entregas Locais Otimizadas</h4>
                    <p className="text-gray-600">Encontre entregas compatíveis com sua capacidade e área de cobertura, minimizando deslocamentos e maximizando seus ganhos diários.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="mr-4 mt-1 text-blue-600 flex-shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Gestão Eficiente de Tempo</h4>
                    <p className="text-gray-600">Visualize entregas próximas entre si, otimizando seu tempo e aumentando a quantidade de entregas realizadas por dia.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="mr-4 mt-1 text-blue-600 flex-shrink-0">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Negociação Direta</h4>
                    <p className="text-gray-600">Negocie o valor do frete e formas de pagamento diretamente com a empresa proprietária da carga. Sem intermediários.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="mr-4 mt-1 text-blue-600 flex-shrink-0">
                    <CheckSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Comprovantes Digitais</h4>
                    <p className="text-gray-600">Registre entregas com fotos e assinaturas digitais, eliminando papelada e garantindo segurança para você e seus clientes.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Para Empresas */}
            <div>
              <div className="flex items-center mb-8">
                <div className="bg-blue-600 text-white p-3 rounded-full mr-4">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Para Empresas</h3>
              </div>
              <ul className="space-y-6">
                <li className="flex">
                  <div className="mr-4 mt-1 text-blue-600 flex-shrink-0">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Segurança Reforçada</h4>
                    <p className="text-gray-600">Verificação rigorosa de cadastros reduz em até 90% o risco de roubo de cargas, garantindo operações mais seguras.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="mr-4 mt-1 text-blue-600 flex-shrink-0">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Negociação Direta</h4>
                    <p className="text-gray-600">Elimine intermediários e negocie valores diretamente com motoristas qualificados, reduzindo custos operacionais.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="mr-4 mt-1 text-blue-600 flex-shrink-0">
                    <CheckSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Entregas Digitais</h4>
                    <p className="text-gray-600">Assinatura digital de entregas elimina acúmulo de papelada e agiliza confirmações de recebimento.</p>
                  </div>
                </li>
                <li className="flex">
                  <div className="mr-4 mt-1 text-blue-600 flex-shrink-0">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Rastreamento em Tempo Real</h4>
                    <p className="text-gray-600">Acompanhe suas cargas em tempo real, com atualizações constantes de localização e status da entrega.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Transforme sua operação logística hoje mesmo
          </h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto">
            O StarFrete está revolucionando o mercado de transporte com tecnologia 
            que beneficia motoristas, motoboys e empresas.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register?userType=driver" className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Cadastrar como Motorista
            </Link>
            <Link to="/register?userType=courier" className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Cadastrar como Motoboy
            </Link>
            <Link to="/register?userType=company" className="px-8 py-3 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Cadastrar como Empresa
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="/logo3.png"
                  alt="StarFrete Logo"
                  className="h-16 w-auto brightness-0 invert"
                />
                <span className="text-2xl font-bold">StarFrete</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Conectando empresas, motoristas e motoboys de forma direta e eficiente 
                em todo o Brasil.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Início</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">Sobre</Link></li>
                <li><Link to="/benefits" className="text-gray-400 hover:text-white transition-colors">Benefícios</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Entrar</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Cadastre-se</h3>
              <ul className="space-y-2">
                <li><Link to="/register?userType=company" className="text-gray-400 hover:text-white transition-colors">Para Empresas</Link></li>
                <li><Link to="/register?userType=driver" className="text-gray-400 hover:text-white transition-colors">Para Motoristas</Link></li>
                <li><Link to="/register?userType=courier" className="text-gray-400 hover:text-white transition-colors">Para Motoboys</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 StarFrete. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}