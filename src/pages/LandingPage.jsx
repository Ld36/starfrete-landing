import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Building2,
  Bike,
  CheckCircle,
  Globe,
  Shield,
  Clock,
  CreditCard,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import logoStarfrete from '../assets/logo_starfrete.png'; // Logo StarFrete

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Globe className="h-10 w-10 text-blue-600" />,
      title: "Cobertura Nacional",
      description:
        "Conectando empresas e transportadores em todo o país para entregas eficientes e diretas.",
    },
    {
      icon: <Shield className="h-10 w-10 text-blue-600" />,
      title: "Verificação Avançada",
      description:
        "Todos os motoristas e empresas passam por verificação de documentos e aprovação administrativa.",
    },
    {
      icon: <Clock className="h-10 w-10 text-blue-600" />,
      title: "Tempo Real",
      description:
        "Acompanhe suas entregas em tempo real e receba notificações importantes sobre o status.",
    },
    {
      icon: <CreditCard className="h-10 w-10 text-blue-600" />,
      title: "Pagamento Seguro",
      description:
        "Plataforma com sistema de pagamentos integrado para maior segurança nas transações.",
    },
    {
      icon: <MapPin className="h-10 w-10 text-blue-600" />,
      title: "Otimização de Rotas",
      description: "Algoritmos inteligentes para otimizar rotas e reduzir custos de combustível.",
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-blue-600" />,
      title: "Documentação Digital",
      description:
        "Gerencie todos os documentos de transporte, incluindo DACTE e MDF-e, diretamente na plataforma.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="/logo-starfrete-1.png"
              alt="StarFrete Logo"
              className="h-16 w-auto"
            />
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link to="/about" className="text-gray-600 hover:text-blue-600 font-medium">
              Sobre
            </Link>
            <Link to="/benefits" className="text-gray-600 hover:text-blue-600 font-medium">
              Benefícios
            </Link>
            <Link to="/courier-services" className="text-gray-600 hover:text-blue-600 font-medium">
              Serviços de Entrega
            </Link>
            <Link to="/route-optimization" className="text-gray-600 hover:text-blue-600 font-medium">
              Otimização de Rotas
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">Entrar</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Conectando Empresas e Transportadores de Forma Direta
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Plataforma completa para gestão de fretes, com rastreamento em tempo real,
              otimização de rotas e gestão de documentos eletrônicos.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register?userType=company">
                <Button className="text-blue-600 bg-white hover:bg-gray-100" size="lg">
                  Para Empresas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/register?userType=driver">
                <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white text-white" size="lg">
                  Para Motoristas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-end">
            <img
              src="/images/logistics-illustration.svg"
              alt="Logistics Illustration"
              className="max-w-full h-auto"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Principais Recursos</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A StarFrete oferece uma plataforma completa para todas as suas necessidades de transporte e logística.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 border rounded-xl hover:shadow-lg transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Para Quem é a StarFrete?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma atende às necessidades específicas de diferentes participantes da cadeia logística.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 bg-blue-50 rounded-full inline-block mb-4">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Para Empresas</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Publique fretes rapidamente</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Encontre motoristas confiáveis</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Acompanhe entregas em tempo real</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Emissão e gestão de documentos</span>
                </li>
              </ul>
              <Link to="/register?userType=company">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Cadastrar Empresa
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 bg-blue-50 rounded-full inline-block mb-4">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Para Motoristas</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Encontre fretes na sua região</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Negocie valores diretamente</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Receba pagamentos com segurança</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Gestão de documentos de transporte</span>
                </li>
              </ul>
              <Link to="/register?userType=driver">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Cadastrar como Motorista
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 bg-blue-50 rounded-full inline-block mb-4">
                <Bike className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Para Entregadores</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Entregas rápidas na cidade</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Gerencie múltiplas entregas</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Roteirização inteligente</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Comprovante de entrega digital</span>
                </li>
              </ul>
              <Link to="/register?userType=courier">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Cadastrar como Entregador
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Comece a usar a StarFrete hoje mesmo</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Entre para a plataforma que está revolucionando o transporte de cargas no Brasil.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button className="bg-white text-blue-600 hover:bg-gray-100" size="lg">
                Cadastre-se Grátis
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="border-white bg-transparent text-white hover:bg-white/10" size="lg">
                Fazer Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img
                src="/logo-starfrete-1.png"
                alt="StarFrete Logo"
                className="h-16 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-gray-400 mb-4">
                Conectando empresas e transportadores de forma direta e eficiente.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white">
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link to="/benefits" className="text-gray-400 hover:text-white">
                    Benefícios
                  </Link>
                </li>
                <li>
                  <Link to="/courier-services" className="text-gray-400 hover:text-white">
                    Serviços de Entrega
                  </Link>
                </li>
                <li>
                  <Link to="/route-optimization" className="text-gray-400 hover:text-white">
                    Otimização de Rotas
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">Blog</a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">Perguntas Frequentes</a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">Suporte</a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">Documentação API</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">contato@starfrete.com.br</li>
                <li className="text-gray-400">(11) 3456-7890</li>
                <li className="text-gray-400">São Paulo, SP</li>
                <li className="flex space-x-4 mt-4">
                  <a href="#" className="text-gray-400 hover:text-white">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.772-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">© 2025 StarFrete. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}