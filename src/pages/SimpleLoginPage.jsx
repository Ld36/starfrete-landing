import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/use-auth.jsx";
import { toast } from "react-hot-toast";
import { login as loginAPI } from "../config/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Link } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Check, Truck, Building2 } from "lucide-react";

export default function SimpleLoginPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Login form
  const loginForm = useForm({
    defaultValues: {
      username: "",
      password: "",
      userType: "company",
    },
  });

  // Função de login simplificada
  const onLoginSubmit = async (data) => {
    if (loading) return; // Prevenir duplo clique
    
    setLoading(true);
    
    try {
      const response = await loginAPI(data.username, data.password);
      
      if (response?.data && response.data.success) {
        const userData = response.data.data.user;
        const token = response.data.data.access_token;
        
        if (userData && token) {
          // Salvar dados
          localStorage.setItem('authToken', token);
          localStorage.setItem('userData', JSON.stringify(userData));
          
          // Atualizar estado
          await login(userData, token);
          
          // Redirecionar com window.location (mais estável)
          const userType = userData.user_type;
          
          if (userType === 'company') {
            window.location.href = '/company-dashboard';
          } else if (userType === 'driver') {
            window.location.href = '/driver/dashboard';
          } else if (userType === 'admin') {
            window.location.href = '/admin/dashboard';
          } else {
            toast.error('Tipo de usuário não reconhecido');
            setLoading(false);
          }
          return; // Importante: sair aqui para não executar setLoading(false)
        }
      }
      
      toast.error(response?.data?.message || "Credenciais inválidas");
    } catch (error) {
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img
              src="/logo3.png"
              alt="StarFrete Logo"
              className="h-20 w-auto drop-shadow-md"
            />
            <h1 className="text-2xl font-bold text-blue-600">StarFrete</h1>
          </div>
          <nav className="flex items-center">
            <ul className="flex space-x-4 md:space-x-8 mr-4">
              <li><Link to="/about" className="text-neutral-600 hover:text-blue-600 font-medium">Sobre</Link></li>
              <li><Link to="/benefits" className="text-neutral-600 hover:text-blue-600 font-medium">Benefícios</Link></li>
              <li><a href="#" className="text-neutral-600 hover:text-blue-600 font-medium">Contato</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow flex flex-col md:flex-row">
        {/* Left side - Intro */}
        <div className="md:w-1/2 bg-blue-600 text-white p-8 flex items-center justify-center">
          <div className="max-w-lg">
            <h2 className="text-3xl font-bold mb-6">Conecte sua carga ao motorista ideal</h2>
            <p className="mb-8">Plataforma completa para gestão de fretes, com negociação direta entre empresas e motoristas, rastreamento em tempo real e gestão simplificada.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-start">
                <Check className="text-blue-200 mr-2 h-5 w-5" />
                <span>Publicação direta de fretes</span>
              </div>
              <div className="flex items-start">
                <Check className="text-blue-200 mr-2 h-5 w-5" />
                <span>Negociação em tempo real</span>
              </div>
              <div className="flex items-start">
                <Check className="text-blue-200 mr-2 h-5 w-5" />
                <span>Sistema de avaliações</span>
              </div>
              <div className="flex items-start">
                <Check className="text-blue-200 mr-2 h-5 w-5" />
                <span>Gestão inteligente</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center border border-white rounded-lg px-4 py-2">
                <Building2 className="mr-2 h-5 w-5" />
                <div>
                  <div className="text-sm opacity-80">Para</div>
                  <div className="font-medium">Empresas</div>
                </div>
              </div>
              <div className="flex items-center border border-white rounded-lg px-4 py-2">
                <Truck className="mr-2 h-5 w-5" />
                <div>
                  <div className="text-sm opacity-80">Para</div>
                  <div className="font-medium">Motoristas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Auth form */}
        <div className="md:w-1/2 p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-6">Acessar sua conta</h2>
              
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Tipo de usuário</FormLabel>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-2"
                        >
                          <div className="flex items-center border rounded-lg p-3 cursor-pointer hover:border-blue-600 transition-colors flex-1">
                            <RadioGroupItem value="company" id="company" className="text-blue-600" />
                            <label
                              htmlFor="company"
                              className="ml-2 text-sm font-medium cursor-pointer flex-1"
                            >
                              Empresa
                            </label>
                          </div>
                          <div className="flex items-center border rounded-lg p-3 cursor-pointer hover:border-blue-600 transition-colors flex-1">
                            <RadioGroupItem value="driver" id="driver" className="text-blue-600" />
                            <label
                              htmlFor="driver"
                              className="ml-2 text-sm font-medium cursor-pointer flex-1"
                            >
                              Motorista
                            </label>
                          </div>
                        </RadioGroup>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome de usuário ou email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="seu@email.com" 
                            {...field} 
                            value={field.value ?? ''} 
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Sua senha" 
                            {...field} 
                            value={field.value ?? ''} 
                            className="h-11"
                          />
                        </FormControl>
                        <div className="text-right mt-1">
                          <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                            Esqueceu sua senha?
                          </a>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full h-11" 
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
