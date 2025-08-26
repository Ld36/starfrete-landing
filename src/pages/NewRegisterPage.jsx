import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/use-auth.jsx";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "../components/ui/form";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Loader2, Check, Truck, Building2, MapPin, Mail, 
  Phone, Lock, User, Upload, Calendar, FileText, 
  CreditCard, Users, Building, Bike, AlertCircle
} from "lucide-react";
import { registerCompany, registerDriver } from "../config/api";

// Componente para upload de documentos
const DocumentUpload = ({ label, description, required, accept, value, onChange }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange(file, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <FormItem>
      <FormLabel>{label} {required && <span className="text-red-500">*</span>}</FormLabel>
      <FormControl>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <label
            htmlFor={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className="cursor-pointer"
          >
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              Clique para enviar ou arraste o arquivo aqui
            </p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </label>
          {value && (
            <p className="text-xs text-green-600 mt-2">
              ✓ Arquivo selecionado
            </p>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default function NewRegisterPage() {
  const [registerStep, setRegisterStep] = useState("userType");
  const [selectedUserType, setSelectedUserType] = useState("company");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Limpeza forçada de sessão quando acessar a página de registro
  useEffect(() => {
    // Se chegou na página de registro, fazer logout completo
    logout();
    localStorage.clear();
    sessionStorage.clear();
    console.log('Sessão limpa ao acessar página de registro');
  }, []);

  // Redirect if user is already logged in (desabilitado enquanto testamos)
  /*
  useEffect(() => {
    if (user) {
      if (user.user_type === "company") {
        navigate("/company/dashboard");
      } else if (user.user_type === "driver") {
        navigate("/driver/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);
  */

  // Funções para navegação entre etapas
  const nextStep = () => {
    switch (registerStep) {
      case "userType":
        setRegisterStep("personalInfo");
        break;
      case "personalInfo":
        setRegisterStep("documents");
        break;
      case "documents":
        if (selectedUserType === "company") {
          setRegisterStep("complete");
        } else {
          setRegisterStep("vehicleInfo");
        }
        break;
      case "vehicleInfo":
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
      case "documents":
        setRegisterStep("personalInfo");
        break;
      case "vehicleInfo":
        setRegisterStep("documents");
        break;
      case "complete":
        if (selectedUserType === "company") {
          setRegisterStep("documents");
        } else {
          setRegisterStep("vehicleInfo");
        }
        break;
      default:
        break;
    }
  };

  // Register form
  const registerForm = useForm({
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      userType: "company",
      address: "",
      
      // Campos para empresa
      company_name: "",
      cnpj: "",
      responsible_name: "",
      responsible_cpf: "",
      phone: "",
      
      // Campos para motorista
      full_name: "",
      cpf: "",
      driver_license: "",
      birth_date: "",
      
      // Campos para veículo
      vehicle_plate: "",
      vehicle_type: "",
      vehicle_model: "",
      vehicle_year: 2024,
      vehicle_brand: "",
      capacity_weight: 0,
      cargo_volume_m3: 0,
      
      // Documentos
      identity_document: null,
      address_proof: null,
      company_document: null,
      vehicle_document: null,
      driver_license_document: null,
    },
  });

  const onRegisterSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Validar confirmação de senha
      if (data.password !== data.confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }

      // Preparar dados baseado no tipo de usuário
      let registerData = {
        username: data.username,
        password: data.password,
        email: data.email,
        user_type: data.userType,
        address: data.address,
      };

      if (data.userType === "company") {
        registerData = {
          ...registerData,
          company_name: data.company_name,
          cnpj: data.cnpj,
          responsible_name: data.responsible_name,
          responsible_cpf: data.responsible_cpf,
          phone: data.phone,
        };
      } else if (data.userType === "driver") {
        registerData = {
          ...registerData,
          full_name: data.full_name,
          cpf: data.cpf,
          phone: data.phone,
          driver_license: data.driver_license,
          birth_date: data.birth_date,
          // Dados do veículo se fornecidos
          vehicle_plate: data.vehicle_plate,
          vehicle_type: data.vehicle_type,
          vehicle_model: data.vehicle_model,
          vehicle_year: data.vehicle_year,
          vehicle_brand: data.vehicle_brand,
          capacity_weight: data.capacity_weight,
          cargo_volume_m3: data.cargo_volume_m3,
        };
      }

      console.log("Dados de registro:", registerData);
      
      let response;
      if (data.userType === "client") {
        response = await registerCompany(registerData);
      } else if (data.userType === "driver") {
        response = await registerDriver(registerData);
      } else {
        throw new Error("Tipo de usuário não suportado");
      }
      
      if (response.data.success) {
        toast.success("Cadastro realizado com sucesso! Faça login para continuar.");
        navigate("/login");
      } else {
        toast.error(response.data.message || "Erro ao realizar cadastro");
      }
      
    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast.error(error.response?.data?.message || "Erro ao realizar cadastro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getStepNumber = () => {
    switch (registerStep) {
      case "userType": return 1;
      case "personalInfo": return 2;
      case "documents": return 3;
      case "vehicleInfo": return 4;
      case "complete": return selectedUserType === "company" ? 4 : 5;
      default: return 1;
    }
  };

  const getTotalSteps = () => {
    return selectedUserType === "company" ? 4 : 5;
  };

  const getProgressPercentage = () => {
    return (getStepNumber() / getTotalSteps()) * 100;
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">StarFrete</h1>
          </div>
          <nav className="block">
            <ul className="flex space-x-4 md:space-x-8">
              <li><Link to="/login" className="text-neutral-600 hover:text-blue-600 font-medium">Fazer Login</Link></li>
              <li><Link to="/about" className="text-neutral-600 hover:text-blue-600 font-medium">Sobre</Link></li>
              <li><a href="#" className="text-neutral-600 hover:text-blue-600 font-medium">Contato</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow flex flex-col md:flex-row">
        {/* Left side - Intro */}
        <div className="md:w-1/2 bg-blue-600 text-white p-8 flex items-center justify-center">
          <div className="max-w-lg">
            <h2 className="text-3xl font-bold mb-6">Junte-se à StarFrete</h2>
            <p className="mb-8">
              Crie sua conta e conecte-se à maior rede de transporte de cargas do Brasil. 
              Seja você uma empresa ou motorista, temos a solução ideal para você.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-start">
                <Check className="text-blue-200 mr-2 h-5 w-5" />
                <span>Cadastro gratuito</span>
              </div>
              <div className="flex items-start">
                <Check className="text-blue-200 mr-2 h-5 w-5" />
                <span>Suporte 24/7</span>
              </div>
              <div className="flex items-start">
                <Check className="text-blue-200 mr-2 h-5 w-5" />
                <span>Pagamentos seguros</span>
              </div>
              <div className="flex items-start">
                <Check className="text-blue-200 mr-2 h-5 w-5" />
                <span>App mobile</span>
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
        
        {/* Right side - Register form */}
        <div className="md:w-1/2 p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {registerStep === "userType" && "Criar sua conta"}
                {registerStep === "personalInfo" && "Suas informações"}
                {registerStep === "documents" && "Documentos necessários"}
                {registerStep === "vehicleInfo" && "Informações do veículo"}
                {registerStep === "complete" && "Finalizar cadastro"}
              </h2>
              
              {/* Barra de progresso */}
              <div className="w-full">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">
                    Etapa {getStepNumber()} de {getTotalSteps()}
                  </span>
                  <span className="text-sm font-medium">
                    {Math.round(getProgressPercentage())}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all" 
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                
                {/* Etapa 1: Tipo de usuário */}
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
                    {/* Campos para empresa */}
                    {selectedUserType === "company" && (
                      <>
                        <FormField
                          control={registerForm.control}
                          name="company_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da empresa</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Razão social da empresa" 
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
                          control={registerForm.control}
                          name="cnpj"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CNPJ</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="00.000.000/0000-00" 
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
                          control={registerForm.control}
                          name="responsible_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do responsável</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Nome completo do responsável" 
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
                          control={registerForm.control}
                          name="responsible_cpf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPF do responsável</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="000.000.000-00" 
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

                    {/* Campos para motorista */}
                    {selectedUserType === "driver" && (
                      <>
                        <FormField
                          control={registerForm.control}
                          name="full_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome completo</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Seu nome completo" 
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
                          control={registerForm.control}
                          name="cpf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPF</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="000.000.000-00" 
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
                          control={registerForm.control}
                          name="driver_license"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número da CNH</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Número da carteira de habilitação" 
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
                          control={registerForm.control}
                          name="birth_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data de nascimento</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
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

                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome de usuário</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Escolha um nome de usuário" 
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
                      control={registerForm.control}
                      name="email"
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
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="(00) 00000-0000" 
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
                      control={registerForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Endereço completo" 
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
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Crie uma senha" 
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
                
                {/* Etapa 3: Documentos */}
                {registerStep === "documents" && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium mb-1">Documentos necessários</h4>
                        <p className="text-sm text-gray-600">
                          Os documentos serão analisados para validação do seu cadastro.
                        </p>
                      </div>
                    </div>

                    <FormField
                      control={registerForm.control}
                      name="identity_document"
                      render={({ field }) => (
                        <DocumentUpload
                          label="Documento de identidade (RG/CNH)"
                          description="Envie a foto ou PDF do documento"
                          required
                          accept="image/*,.pdf"
                          value={field.value}
                          onChange={(file, dataUrl) => field.onChange(dataUrl)}
                        />
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="address_proof"
                      render={({ field }) => (
                        <DocumentUpload
                          label="Comprovante de endereço"
                          description="Conta de luz, água, telefone recente"
                          required
                          accept="image/*,.pdf"
                          value={field.value}
                          onChange={(file, dataUrl) => field.onChange(dataUrl)}
                        />
                      )}
                    />
                    
                    {selectedUserType === "company" && (
                      <FormField
                        control={registerForm.control}
                        name="company_document"
                        render={({ field }) => (
                          <DocumentUpload
                            label="Contrato social"
                            description="Documento da empresa"
                            required
                            accept="image/*,.pdf"
                            value={field.value}
                            onChange={(file, dataUrl) => field.onChange(dataUrl)}
                          />
                        )}
                      />
                    )}
                    
                    {selectedUserType === "driver" && (
                      <>
                        <FormField
                          control={registerForm.control}
                          name="driver_license_document"
                          render={({ field }) => (
                            <DocumentUpload
                              label="Carteira de Habilitação (CNH)"
                              description="Foto da CNH válida"
                              required
                              accept="image/*,.pdf"
                              value={field.value}
                              onChange={(file, dataUrl) => field.onChange(dataUrl)}
                            />
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="vehicle_document"
                          render={({ field }) => (
                            <DocumentUpload
                              label="Documento do veículo (CRLV)"
                              description="Documento atualizado do veículo"
                              required
                              accept="image/*,.pdf"
                              value={field.value}
                              onChange={(file, dataUrl) => field.onChange(dataUrl)}
                            />
                          )}
                        />
                      </>
                    )}
                  </div>
                )}
                
                {/* Etapa 4: Informações do veículo (apenas para motoristas) */}
                {registerStep === "vehicleInfo" && selectedUserType === "driver" && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <h3 className="font-medium mb-2">Informações do veículo</h3>
                      <p className="text-sm text-gray-600">
                        Dados técnicos do seu veículo para encontrar fretes compatíveis.
                      </p>
                    </div>
                    
                    <FormField
                      control={registerForm.control}
                      name="vehicle_plate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Placa do veículo</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="ABC1234" 
                              {...field} 
                              value={field.value ?? ''} 
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="vehicle_brand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Marca</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ex: Scania" 
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
                        control={registerForm.control}
                        name="vehicle_model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Modelo</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ex: R450" 
                                {...field} 
                                value={field.value ?? ''} 
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="vehicle_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ex: Carreta" 
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
                        control={registerForm.control}
                        name="vehicle_year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ano</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="2024" 
                                {...field} 
                                value={field.value ?? 2024}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="capacity_weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Capacidade (kg)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="30000" 
                                {...field} 
                                value={field.value ?? 0}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="cargo_volume_m3"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Volume (m³)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="120" 
                                {...field} 
                                value={field.value ?? 0}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                
                {/* Etapa final: Conclusão */}
                {registerStep === "complete" && (
                  <div className="text-center space-y-4 py-8">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 mb-4">
                      <Check className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold">Pronto para finalizar!</h3>
                    <p className="text-gray-600">
                      Todos os dados foram preenchidos. Clique em "Criar conta" para finalizar.
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
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Criar conta
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
          </div>
        </div>
      </main>
    </div>
  );
}
