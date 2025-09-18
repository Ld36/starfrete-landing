import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/use-auth.jsx";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { login as loginAPI, registerCompany, registerDriver } from "../config/api";
import axios from 'axios';
import StableWrapper from "../components/StableWrapper.jsx";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
import { 
  Check, Truck, Building2, MapPin, Mail, 
  Phone, Lock, User, AlertCircle, Bike
} from "lucide-react";

// Importar utilitários de validação
import {
  validateEmail,
  validateRequired,
  validateStrongPassword,
  validateFullName,
  validateCPF,
  validateCNPJ,
  validateCEP,
  validatePhone,
  handleCPFInput,
  handleCNPJInput,
  handleCEPInput,
  handlePhoneInput,
  errorMessages
} from "../utils/validation.js";

// Schema para validação do login
const loginSchema = {
  username: (value) => {
    if (!validateRequired(value)) return errorMessages.required;
    if (!validateEmail(value)) return errorMessages.email;
    return null;
  },
  password: (value) => {
    if (!validateRequired(value)) return errorMessages.required;
    if (value.length < 6) return errorMessages.minLength(6);
    return null;
  },
  userType: (value) => {
    if (!validateRequired(value)) return "Selecione um tipo de usuário";
    return null;
  }
};

export default function NewLoginPage() {
  return (
    <StableWrapper>
      <NewLoginPageContent />
    </StableWrapper>
  );
}

function NewLoginPageContent() {
  const [activeTab, setActiveTab] = useState("login");
  const [registerStep, setRegisterStep] = useState("userType");
  const [selectedUserType, setSelectedUserType] = useState("company");
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Limpar sessão apenas se vier de um logout explícito ou se o token estiver expirado
  useEffect(() => {
    // Só limpa se for um acesso direto à página de login OU se houver um parâmetro específico
    const urlParams = new URLSearchParams(window.location.search);
    const shouldClear = urlParams.get('logout') === 'true';
    
    if (shouldClear) {
      logout();
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // Sessão limpa por logout explícito
      // Limpar o parâmetro da URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Redirect if user is already logged in (desabilitado enquanto testamos)
  /*
  useEffect(() => {
    if (user) {
      // Usuário autenticado
      
      if (user.user_type === "company") {
        navigate("/company-dashboard");
      } else if (user.user_type === "admin") {
        navigate("/admin/dashboard");
      } else if (user.user_type === "driver") {
        navigate("/driver/dashboard");
      } else {
        console.error("Tipo de usuário desconhecido:", user.user_type);
        navigate("/");
      }
    }
  }, [user, navigate]);
  */

  // Login form
  const loginForm = useForm({
    defaultValues: {
      username: "",
      password: "",
      userType: "company",
    },
  });

  // Register form
  const registerForm = useForm({
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      userType: "company",
      
      // Campos específicos por tipo
      company_name: "",
      cnpj: "",
      full_name: "",
      cpf: "",
      phone: "",
      address: "",
    },
  });

  // Funções para navegação entre etapas
  const nextStep = () => {
    switch (registerStep) {
      case "userType":
        setRegisterStep("personalInfo");
        break;
      case "personalInfo":
        setRegisterStep("complete");
        break;
      default:
        break;
    }
  };
  
  const prevStep = () => {
    switch (registerStep) {
      case "personalInfo":
        setRegisterStep("userType");
        break;
      case "complete":
        setRegisterStep("personalInfo");
        break;
      default:
        break;
    }
  };

  // Form submission handlers
  const onLoginSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Chamar a API de login
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
          
          // Redirecionar baseado no tipo de usuário
          const userType = userData.user_type || userData.role || userData.type || userData.account_type;
          
          // Navegar imediatamente sem delays
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
        } else {
          toast.error("Dados de autenticação incompletos");
          setLoading(false);
        }
      } else {
        toast.error(response?.data?.message || "Credenciais inválidas");
        setLoading(false);
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (data) => {
    try {
      setLoading(true);
      // Dados de registro enviados
      
      // Aqui você implementaria a lógica de registro
      toast.success("Cadastro realizado com sucesso!");
      setActiveTab("login");
    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast.error("Erro ao realizar cadastro. Tente novamente.");
    } finally {
      setLoading(false);
    }
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
            {/* Botão temporário para limpar sessão */}
            {user && (
              <button 
                onClick={() => {
                  logout();
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
              >
                Limpar Sessão
              </button>
            )}
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Cadastrar</TabsTrigger>
              </TabsList>
              
              {/* Login Form */}
              <TabsContent value="login" className="space-y-4">
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
                      rules={{
                        required: errorMessages.required,
                        validate: (value) => {
                          if (!validateEmail(value)) {
                            return errorMessages.email;
                          }
                          return true;
                        }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="seu@email.com" 
                              {...field} 
                              value={field.value ?? ''} 
                              className="h-11"
                              autoComplete="email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      rules={{
                        required: errorMessages.required,
                        minLength: {
                          value: 6,
                          message: errorMessages.minLength(6)
                        }
                      }}
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
                              autoComplete="current-password"
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
                      <span className="flex items-center justify-center">
                        {loading ? "Entrando..." : "Entrar"}
                      </span>
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              {/* Register Form */}
              <TabsContent value="register" className="space-y-4">
                <h2 className="text-2xl font-bold mb-6">
                  {registerStep === "userType" && "Criar sua conta"}
                  {registerStep === "personalInfo" && "Suas informações"}
                  {registerStep === "complete" && "Finalizar cadastro"}
                </h2>
                
                {/* Barra de progresso */}
                {registerStep !== "userType" && (
                  <div className="w-full mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">
                        Etapa {registerStep === "personalInfo" ? "2" : "3"} de 3
                      </span>
                      <span className="text-sm font-medium">
                        {registerStep === "personalInfo" ? "66%" : "100%"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all" 
                        style={{
                          width: registerStep === "personalInfo" ? "66%" : "100%"
                        }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    {/* Etapa 1: Seleção de tipo */}
                    {registerStep === "userType" && (
                      <FormField
                        control={registerForm.control}
                        name="userType"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormLabel>Escolha o tipo de conta</FormLabel>
                            <RadioGroup
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedUserType(value);
                              }}
                              defaultValue={field.value}
                              className="space-y-3"
                            >
                              <div className="flex items-center border rounded-lg p-4 cursor-pointer hover:border-blue-600 transition-colors">
                                <RadioGroupItem value="company" id="reg-company" className="text-blue-600" />
                                <div className="ml-3 flex-1">
                                  <label htmlFor="reg-company" className="text-base font-medium cursor-pointer">
                                    Sou uma empresa
                                  </label>
                                  <p className="text-sm text-gray-500">
                                    Publique fretes e encontre motoristas confiáveis
                                  </p>
                                </div>
                                <Building2 className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex items-center border rounded-lg p-4 cursor-pointer hover:border-blue-600 transition-colors">
                                <RadioGroupItem value="driver" id="reg-driver" className="text-blue-600" />
                                <div className="ml-3 flex-1">
                                  <label htmlFor="reg-driver" className="text-base font-medium cursor-pointer">
                                    Sou um motorista
                                  </label>
                                  <p className="text-sm text-gray-500">
                                    Encontre fretes próximos e aumente sua renda
                                  </p>
                                </div>
                                <Truck className="h-6 w-6 text-blue-600" />
                              </div>
                            </RadioGroup>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {/* Etapa 2: Informações pessoais */}
                    {registerStep === "personalInfo" && (
                      <>
                        <FormField
                          control={registerForm.control}
                          name="username"
                          rules={{
                            required: errorMessages.required,
                            minLength: {
                              value: 3,
                              message: errorMessages.minLength(3)
                            },
                            maxLength: {
                              value: 20,
                              message: errorMessages.maxLength(20)
                            }
                          }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome de usuário</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Escolha um nome de usuário" 
                                  {...field} 
                                  value={field.value ?? ''} 
                                  className="h-11"
                                  autoComplete="username"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          rules={{
                            required: errorMessages.required,
                            validate: (value) => {
                              if (!validateEmail(value)) {
                                return errorMessages.email;
                              }
                              return true;
                            }
                          }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="seu@email.com" 
                                  type="email" 
                                  {...field} 
                                  value={field.value ?? ''} 
                                  className="h-11"
                                  autoComplete="email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Campos específicos para empresa */}
                        {selectedUserType === "company" && (
                          <>
                            <FormField
                              control={registerForm.control}
                              name="company_name"
                              rules={{
                                required: errorMessages.required,
                                minLength: {
                                  value: 2,
                                  message: errorMessages.minLength(2)
                                }
                              }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome da empresa</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Razão social da empresa" 
                                      {...field} 
                                      value={field.value ?? ''} 
                                      className="h-11"
                                      autoComplete="organization"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={registerForm.control}
                              name="cnpj"
                              rules={{
                                required: errorMessages.required,
                                validate: (value) => {
                                  if (!validateCNPJ(value)) {
                                    return errorMessages.cnpj;
                                  }
                                  return true;
                                }
                              }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CNPJ</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="00.000.000/0000-00" 
                                      {...field} 
                                      value={field.value ?? ''} 
                                      className="h-11"
                                      onChange={(e) => handleCNPJInput(e, field.onChange)}
                                      maxLength={18}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}

                        {/* Campos específicos para motorista */}
                        {selectedUserType === "driver" && (
                          <>
                            <FormField
                              control={registerForm.control}
                              name="full_name"
                              rules={{
                                required: errorMessages.required,
                                validate: (value) => {
                                  if (!validateFullName(value)) {
                                    return errorMessages.fullName;
                                  }
                                  return true;
                                }
                              }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome completo</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Seu nome completo" 
                                      {...field} 
                                      value={field.value ?? ''} 
                                      className="h-11"
                                      autoComplete="name"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={registerForm.control}
                              name="cpf"
                              rules={{
                                required: errorMessages.required,
                                validate: (value) => {
                                  if (!validateCPF(value)) {
                                    return errorMessages.cpf;
                                  }
                                  return true;
                                }
                              }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CPF</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="000.000.000-00" 
                                      {...field} 
                                      value={field.value ?? ''} 
                                      className="h-11"
                                      onChange={(e) => handleCPFInput(e, field.onChange)}
                                      maxLength={14}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}

                        <FormField
                          control={registerForm.control}
                          name="phone"
                          rules={{
                            required: errorMessages.required,
                            validate: (value) => {
                              if (!validatePhone(value)) {
                                return errorMessages.phone;
                              }
                              return true;
                            }
                          }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="(00) 00000-0000" 
                                  {...field} 
                                  value={field.value ?? ''} 
                                  className="h-11"
                                  onChange={(e) => handlePhoneInput(e, field.onChange)}
                                  maxLength={15}
                                  type="tel"
                                  autoComplete="tel"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          rules={{
                            required: errorMessages.required,
                            validate: (value) => {
                              if (!validateStrongPassword(value)) {
                                return errorMessages.password;
                              }
                              return true;
                            }
                          }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Crie uma senha forte" 
                                  {...field}
                                  value={field.value ?? ''} 
                                  className="h-11"
                                  autoComplete="new-password"
                                />
                              </FormControl>
                              <FormMessage />
                              <p className="text-xs text-gray-500">
                                Mínimo 8 caracteres, com letras maiúsculas, minúsculas e números
                              </p>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmar senha</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Confirme sua senha" 
                                  {...field}
                                  value={field.value ?? ''} 
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    
                    {/* Etapa 3: Conclusão */}
                    {registerStep === "complete" && (
                      <div className="text-center space-y-4 py-8">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 mb-4">
                          <Check className="h-10 w-10 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold">Pronto para finalizar!</h3>
                        <p className="text-gray-600">
                          Seus dados foram preenchidos. Clique em "Criar conta" para finalizar seu cadastro.
                        </p>
                      </div>
                    )}
                    
                    {/* Botões de navegação */}
                    <div className="flex justify-between gap-4 mt-6">
                      {registerStep !== "userType" && (
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={prevStep}
                          className="h-11"
                        >
                          Voltar
                        </Button>
                      )}
                      
                      {registerStep === "complete" ? (
                        <Button 
                          type="submit" 
                          className="flex-1 h-11" 
                          disabled={loading}
                        >
                          <span className="flex items-center justify-center">
                            {loading ? "Criando..." : "Criar conta"}
                          </span>
                        </Button>
                      ) : (
                        <Button 
                          type="button" 
                          className={registerStep === "userType" ? "w-full h-11" : "flex-1 h-11"}
                          onClick={nextStep}
                        >
                          Continuar
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
