// Constantes padronizadas para tipos de veículos e carrocerias
// Estas devem ser usadas tanto na criação de fretes quanto no cadastro de veículos

export const VEHICLE_TYPES = [
  { value: 'caminhao_toco', label: 'Caminhão Toco' },
  { value: 'caminhao_truck', label: 'Caminhão Truck' },
  { value: 'carreta_simples', label: 'Carreta Simples' },
  { value: 'carreta_dupla', label: 'Carreta Dupla' },
  { value: 'bitrem', label: 'Bitrem' },
  { value: 'rodotrem', label: 'Rodotrem' },
  { value: 'van', label: 'Van' },
  { value: 'hr', label: 'HR' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'vuc', label: 'VUC' },
  { value: 'tres_quartos', label: '3/4' },
  { value: 'moto', label: 'Moto' }
]

export const BODY_TYPES = [
  { value: 'bau_fechado', label: 'Baú Fechado' },
  { value: 'graneleiro', label: 'Graneleiro' },
  { value: 'frigorifico', label: 'Frigorífico' },
  { value: 'tanque', label: 'Tanque' },
  { value: 'prancha', label: 'Prancha/Plataforma' },
  { value: 'cacamba', label: 'Caçamba' },
  { value: 'canavieiro', label: 'Canavieiro' },
  { value: 'gaiola', label: 'Gaiola' },
  { value: 'sider', label: 'Sider' },
  { value: 'basculante', label: 'Basculante' },
  { value: 'bitrem_graneleiro', label: 'Bitrem Graneleiro' },
  { value: 'container', label: 'Container' },
  { value: 'fechada', label: 'Carroceria Fechada' }
]

export const CARGO_TYPES = [
  { value: 'ALIMENTOS', label: 'Alimentos' },
  { value: 'ELETRONICOS', label: 'Eletrônicos' },
  { value: 'ROUPAS', label: 'Roupas e Têxtil' },
  { value: 'MOVEIS', label: 'Móveis' },
  { value: 'MATERIAIS_CONSTRUCAO', label: 'Materiais de Construção' },
  { value: 'COMBUSTIVEIS', label: 'Combustíveis' },
  { value: 'QUIMICOS', label: 'Produtos Químicos' },
  { value: 'MEDICAMENTOS', label: 'Medicamentos' },
  { value: 'GRAOS', label: 'Grãos' },
  { value: 'LIQUIDOS', label: 'Líquidos' },
  { value: 'REFRIGERADOS', label: 'Produtos Refrigerados' },
  { value: 'CONGELADOS', label: 'Produtos Congelados' },
  { value: 'DIVERSOS', label: 'Diversos' }
]

// Função para obter o label de um value
export const getVehicleTypeLabel = (value) => {
  const type = VEHICLE_TYPES.find(t => t.value === value)
  return type ? type.label : value
}

export const getBodyTypeLabel = (value) => {
  const type = BODY_TYPES.find(t => t.value === value)
  return type ? type.label : value
}

export const getCargoTypeLabel = (value) => {
  const type = CARGO_TYPES.find(t => t.value === value)
  return type ? type.label : value
}

// Função para obter o value de um label (para compatibilidade com dados antigos)
export const getVehicleTypeValue = (label) => {
  const type = VEHICLE_TYPES.find(t => t.label === label)
  return type ? type.value : label
}

export const getBodyTypeValue = (label) => {
  const type = BODY_TYPES.find(t => t.label === label)
  return type ? type.value : label
}
