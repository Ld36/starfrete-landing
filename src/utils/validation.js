/**
 * Utilitários para validação e formatação de campos de formulário
 */

// ===== FORMATAÇÃO =====

/**
 * Formatar CPF: 000.000.000-00
 */
export const formatCPF = (value) => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
  if (!match) return cleaned;
  
  let formatted = match[1];
  if (match[2]) formatted += '.' + match[2];
  if (match[3]) formatted += '.' + match[3];
  if (match[4]) formatted += '-' + match[4];
  
  return formatted;
};

/**
 * Formatar CNPJ: 00.000.000/0000-00
 */
export const formatCNPJ = (value) => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})$/);
  if (!match) return cleaned;
  
  let formatted = match[1];
  if (match[2]) formatted += '.' + match[2];
  if (match[3]) formatted += '.' + match[3];
  if (match[4]) formatted += '/' + match[4];
  if (match[5]) formatted += '-' + match[5];
  
  return formatted;
};

/**
 * Formatar CEP: 00000-000
 */
export const formatCEP = (value) => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,5})(\d{0,3})$/);
  if (!match) return cleaned;
  
  let formatted = match[1];
  if (match[2]) formatted += '-' + match[2];
  
  return formatted;
};

/**
 * Formatar telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export const formatPhone = (value) => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    const match = cleaned.match(/^(\d{0,2})(\d{0,4})(\d{0,4})$/);
    if (!match) return cleaned;
    
    let formatted = '';
    if (match[1]) formatted += '(' + match[1];
    if (match[2]) formatted += ') ' + match[2];
    if (match[3]) formatted += '-' + match[3];
    
    return formatted;
  } else {
    // Celular: (00) 00000-0000
    const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    if (!match) return cleaned;
    
    let formatted = '';
    if (match[1]) formatted += '(' + match[1];
    if (match[2]) formatted += ') ' + match[2];
    if (match[3]) formatted += '-' + match[3];
    
    return formatted;
  }
};

/**
 * Formatar RG: 00.000.000-0
 */
export const formatRG = (value) => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,1})$/);
  if (!match) return cleaned;
  
  let formatted = match[1];
  if (match[2]) formatted += '.' + match[2];
  if (match[3]) formatted += '.' + match[3];
  if (match[4]) formatted += '-' + match[4];
  
  return formatted;
};

/**
 * Formatar apenas números
 */
export const formatOnlyNumbers = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

/**
 * Formatar moeda: R$ 0.000,00
 */
export const formatCurrency = (value) => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  const number = parseFloat(cleaned) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(number);
};

/**
 * Formatar peso: 0.000 kg
 */
export const formatWeight = (value) => {
  if (!value) return '';
  const cleaned = value.replace(/[^\d,]/g, '');
  return cleaned + (cleaned ? ' kg' : '');
};

// ===== VALIDAÇÃO =====

/**
 * Validar CPF
 */
export const validateCPF = (cpf) => {
  if (!cpf) return false;
  
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  // Validar dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;
  
  return true;
};

/**
 * Validar CNPJ
 */
export const validateCNPJ = (cnpj) => {
  if (!cnpj) return false;
  
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleaned)) return false;
  
  // Validar primeiro dígito verificador
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleaned.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  if (firstDigit !== parseInt(cleaned.charAt(12))) return false;
  
  // Validar segundo dígito verificador
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleaned.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  if (secondDigit !== parseInt(cleaned.charAt(13))) return false;
  
  return true;
};

/**
 * Validar CEP
 */
export const validateCEP = (cep) => {
  if (!cep) return false;
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8;
};

/**
 * Validar email
 */
export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar telefone
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
};

/**
 * Validar senha (mínimo 6 caracteres)
 */
export const validatePassword = (password) => {
  if (!password) return false;
  return password.length >= 6;
};

/**
 * Validar senha forte
 */
export const validateStrongPassword = (password) => {
  if (!password) return false;
  // Mínimo 8 caracteres, pelo menos 1 letra maiúscula, 1 minúscula, 1 número
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return strongRegex.test(password);
};

/**
 * Validar nome completo
 */
export const validateFullName = (name) => {
  if (!name) return false;
  const trimmed = name.trim();
  return trimmed.split(' ').length >= 2 && trimmed.length >= 3;
};

/**
 * Validar campo obrigatório
 */
export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

// ===== HANDLERS PARA INPUTS =====

/**
 * Handler para input de CPF
 */
export const handleCPFInput = (e, setValue) => {
  const formatted = formatCPF(e.target.value);
  setValue(formatted);
};

/**
 * Handler para input de CNPJ
 */
export const handleCNPJInput = (e, setValue) => {
  const formatted = formatCNPJ(e.target.value);
  setValue(formatted);
};

/**
 * Handler para input de CEP
 */
export const handleCEPInput = (e, setValue) => {
  const formatted = formatCEP(e.target.value);
  setValue(formatted);
};

/**
 * Handler para input de telefone
 */
export const handlePhoneInput = (e, setValue) => {
  const formatted = formatPhone(e.target.value);
  setValue(formatted);
};

/**
 * Handler para input de RG
 */
export const handleRGInput = (e, setValue) => {
  const formatted = formatRG(e.target.value);
  setValue(formatted);
};

/**
 * Handler para input de apenas números
 */
export const handleNumbersOnlyInput = (e, setValue) => {
  const formatted = formatOnlyNumbers(e.target.value);
  setValue(formatted);
};

/**
 * Handler para input de moeda
 */
export const handleCurrencyInput = (e, setValue) => {
  const formatted = formatCurrency(e.target.value);
  setValue(formatted);
};

// ===== UTILITÁRIOS =====

/**
 * Limpar formatação
 */
export const cleanFormat = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

/**
 * Obter apenas números de string formatada
 */
export const getOnlyNumbers = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

/**
 * Mensagens de erro padronizadas
 */
export const errorMessages = {
  required: 'Campo obrigatório',
  email: 'Email inválido',
  cpf: 'CPF inválido',
  cnpj: 'CNPJ inválido',
  cep: 'CEP inválido',
  phone: 'Telefone inválido',
  password: 'Senha deve ter no mínimo 6 caracteres',
  strongPassword: 'Senha deve ter no mínimo 8 caracteres, com letras maiúsculas, minúsculas e números',
  fullName: 'Digite o nome completo',
  minLength: (min) => `Mínimo de ${min} caracteres`,
  maxLength: (max) => `Máximo de ${max} caracteres`
};