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
  ArrowRight,
  MapPin,
  Users,
  Zap,
  Target,
  ShieldCheck,
  BarChart3,
} from "lucide-react";

export default function AboutPage() {
  const features = [
    {
      icon: <Users className="h-12 w-12 text-blue-600" />,
      title: "Conexão direta",
      description:
        "Eliminamos intermediários e conectamos empresas diretamente aos motoristas.",
    },
    {
      icon: <Shield className="h-12 w-12 text-blue-600" />,
      title: "Segurança verificada",
      description:
        "Verificamos rigorosamente todos os cadastros para garantir operações seguras.",
    },
    {
      icon: <Zap className="h-12 w-12 text-blue-600" />,
      title: "Logística otimizada",
      description:
        "Nossa IA calcula rotas e capacidades para maximizar a eficiência.",
    },
    {
      icon: <Target className="h-12 w-12 text-blue-600" />,
      title: "Acompanhamento completo",
      description:
        "Oferecemos rastreamento em tempo real e gestão de documentos digitalizada.",
    },
  ];

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
            <Link to="/about" className="text-blue-600 font-medium">
              Sobre
            </Link>
            <Link to="/benefits" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
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
            Sobre o StarFrete
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
            Somos uma plataforma inovadora que conecta empresas, motoristas de caminhão e motoboys, 
            simplificando o transporte de cargas e entregas rápidas no Brasil através de tecnologia e segurança.
          </p>
        </div>
      </section>

      {/* Nossa Missão */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 mb-16">
            <div>
              <h3 className="text-2xl font-bold mb-6">Nossa missão</h3>
              <p className="text-gray-600 mb-6">
                O StarFrete nasceu com o propósito de resolver os problemas enfrentados pelo setor de transporte rodoviário de cargas e entregas urbanas no Brasil. Nossa plataforma promove conexões diretas entre empresas, motoristas de caminhão e motoboys, eliminando intermediários e otimizando a logística do país.
              </p>
              <p className="text-gray-600">
                Utilizamos tecnologia avançada para fornecer rastreamento em tempo real, verificação segura de documentos, gestão inteligente de capacidade de carga e uma interface intuitiva que facilita o gerenciamento de todo o processo logístico. Tanto para grandes fretes quanto para entregas rápidas dentro das cidades.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="bg-blue-600 text-white p-3 rounded-full w-fit mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Conexão direta</h4>
                <p className="text-gray-600">Eliminamos intermediários e conectamos empresas diretamente aos motoristas.</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="bg-blue-600 text-white p-3 rounded-full w-fit mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Segurança verificada</h4>
                <p className="text-gray-600">Verificamos rigorosamente todos os cadastros para garantir operações seguras.</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="bg-blue-600 text-white p-3 rounded-full w-fit mb-4">
                  <Truck className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Logística otimizada</h4>
                <p className="text-gray-600">Nossa IA calcula rotas e capacidades para maximizar a eficiência.</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="bg-blue-600 text-white p-3 rounded-full w-fit mb-4">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Acompanhamento completo</h4>
                <p className="text-gray-600">Oferecemos rastreamento em tempo real e gestão de documentos digitalizada.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8 text-gray-800">Nossa história</h2>
            <div className="text-lg text-gray-600 leading-relaxed space-y-6">
              <p>
                A história do StarFrete começou quando identificamos os principais desafios 
                enfrentados por transportadores, motoboys and empresas no mercado de fretes: 
                intermediários que encarecem o processo, falta de segurança, dificuldade na 
                verificação de documentos e problemas de comunicação.
              </p>
              <p>
                Desenvolvemos uma plataforma que utiliza tecnologia de ponta para resolver esses 
                problemas, oferecendo uma solução completa que aborda desde o cadastro rigoroso 
                até o acompanhamento em tempo real das cargas, passando pela negociação direta 
                de valores e gestão inteligente de espaço.
              </p>
              <p className="text-xl font-semibold text-blue-600">
                Hoje, o StarFrete está transformando a maneira como o transporte de cargas e 
                entregas é realizado no Brasil, trazendo mais eficiência para as empresas, 
                mais oportunidades para os motoristas e motoboys, sempre com foco na segurança 
                e na otimização de recursos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Pronto para começar?</h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto">
            Junte-se a milhares de motoristas, motoboys e empresas que já estão utilizando 
            o StarFrete para otimizar suas operações.
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
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors">Cadastrar</Link></li>
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