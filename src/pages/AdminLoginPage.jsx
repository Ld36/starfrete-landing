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
import { Shield, Lock, Check, Building2, Truck } from "lucide-react";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Admin login form
  const adminForm = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Função de login para admin
  const onAdminLogin = async (data) => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const response = await loginAPI(data.username, data.password);
      
      if (response?.data && response.data.success) {
        const userData = response.data.data.user;
        const token = response.data.data.access_token;
        
        // Verificar se é realmente um admin
        if (userData.user_type !== 'admin') {
          toast.error('Acesso negado. Esta área é restrita para administradores.');
          setLoading(false);
          return;
        }
        
        if (userData && token) {
          // Salvar dados
          localStorage.setItem('authToken', token);
          localStorage.setItem('userData', JSON.stringify(userData));
          
          // Atualizar estado
          await login(userData, token);
          
          // Redirecionar para dashboard admin
          window.location.href = '/admin/dashboard';
          return;
        }
      }
      
      toast.error("Credenciais inválidas ou usuário não é administrador");
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
              className="h-8 w-auto"
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
        {/* Left side - Intro Admin */}
        <div className="md:w-1/2 bg-red-600 text-white p-8 flex items-center justify-center">
          <div className="max-w-lg">
            <div className="flex items-center mb-6">
              <Shield className="h-12 w-12 text-red-200 mr-4" />
              <h2 className="text-3xl font-bold">Painel Administrativo</h2>
            </div>
            
            <p className="mb-8">Área restrita para administradores do sistema. Gerencie usuários, monitore atividades e configure a plataforma.</p>
            
            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="flex items-start">
                <Check className="text-red-200 mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>Gerenciamento de usuários</span>
              </div>
              <div className="flex items-start">
                <Check className="text-red-200 mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>Monitoramento de atividades</span>
              </div>
              <div className="flex items-start">
                <Check className="text-red-200 mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>Configurações do sistema</span>
              </div>
              <div className="flex items-start">
                <Check className="text-red-200 mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>Relatórios e estatísticas</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center border border-red-400 rounded-lg px-4 py-2">
                <Building2 className="mr-2 h-5 w-5" />
                <div>
                  <div className="text-sm opacity-80">Empresas</div>
                  <div className="font-medium">Cadastradas</div>
                </div>
              </div>
              <div className="flex items-center border border-red-400 rounded-lg px-4 py-2">
                <Truck className="mr-2 h-5 w-5" />
                <div>
                  <div className="text-sm opacity-80">Motoristas</div>
                  <div className="font-medium">Ativos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Login form */}
        <div className="md:w-1/2 p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 mb-4">
                <Lock className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Acesso Administrativo</h2>
              <p className="text-gray-600 mt-2">Entre com suas credenciais de administrador</p>
            </div>
            
            <Form {...adminForm}>
              <form onSubmit={adminForm.handleSubmit(onAdminLogin)} className="space-y-6">
                <FormField
                  control={adminForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email do Administrador</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="admin@starfrete.com" 
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
                  control={adminForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Senha do administrador" 
                          {...field} 
                          value={field.value ?? ''} 
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-red-600 hover:bg-red-700" 
                  disabled={loading}
                >
                  {loading ? "Verificando..." : "Acessar Painel Admin"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <Link 
                to="/login" 
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                ← Voltar ao login normal
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
