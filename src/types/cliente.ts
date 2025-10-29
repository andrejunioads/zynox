export type ClienteStatus = "ativo" | "em_analise" | "inativo";
export type ClienteTipo = "PF" | "PJ";
export type ContratoTipo = "recorrente" | "pontual" | "prestacao_servico";
export type ContratoStatus = "ativo" | "suspenso" | "encerrado";

export interface Endereco {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export interface Contrato {
  dataInicio?: string;
  tipo?: ContratoTipo;
  valorMensal?: number;
  diaVencimento?: number;
  formaPagamento?: string;
  status?: ContratoStatus;
}

export interface Cliente {
  id: string;
  nome: string;
  sobrenome?: string;
  apelido?: string;
  email: string;
  telefone?: string;
  cpfCnpj?: string;
  tipo: ClienteTipo;
  status: ClienteStatus;
  avatar?: string;
  healthScore?: number;
  
  // Empresa (para PJ)
  razaoSocial?: string;
  nomeFantasia?: string;
  
  // Endereço
  endereco?: Endereco;
  
  // Contrato
  contrato?: Contrato;
  
  // Financeiro (resumo)
  saldoAtual?: number;
  totalEntradas?: number;
  totalSaidas?: number;
  lucroAcumulado?: number;
  
  // Observações
  observacoes?: string;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  
  // Relações
  totalProjetos?: number;
  totalDocumentos?: number;
  totalMovimentacoes?: number;
}

export interface ClienteMovimentacao {
  id: string;
  clienteId: string;
  data: string;
  descricao: string;
  categoria: string;
  tipo: "entrada" | "saida";
  valor: number;
  metodo: string;
  status: "pago" | "pendente";
  recorrente: boolean;
}

export interface ClienteDocumento {
  id: string;
  clienteId: string;
  nome: string;
  tipo: string;
  categoria: "contrato" | "nota_fiscal" | "identidade" | "outro";
  tamanho: number;
  url: string;
  dataUpload: string;
}

export type ClienteTab = "informacoes" | "contrato" | "projetos" | "financeiro" | "documentos" | "observacoes";

// ============================================
// TIPOS LEGADOS (para compatibilidade)
// ============================================

export interface ClienteData {
  id: string;
  foto?: string;

  // Básicos
  nome: string;
  email: string;
  telefone?: string;
  whatsapp?: string;
  tipo: "pf" | "pj";
  cpfCnpj?: string;
  dataNascimento?: string;
  linkedin?: string;

  // Empresa (PJ)
  razaoSocial?: string;
  nomeFantasia?: string;
  segmento?: string;
  porte?: string;
  website?: string;
  instagram?: string;

  // Endereço
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;

  // Contrato
  dataInicio?: string;
  tipoContrato?: string;
  valorMensal?: number;
  status: ClienteStatus;
  diaVencimento?: number;
  formaPagamento?: string;

  // Classificação
  responsavel?: string;
  responsavelAvatar?: string;
  tags?: string[];
  servicos?: string[];

  // Observações
  objetivos?: string;
  observacoes?: string;

  // Calculados
  healthScore?: number;
  mrrTendencia?: number;
  projetosAtivos?: number;
  ultimaInteracao?: string;
}

// Função para converter ClienteData (antigo) para Cliente (novo)
export function toClienteViewModel(data: ClienteData): any {
  return {
    id: data.id,
    name: data.nome,
    company: data.razaoSocial || data.nomeFantasia || "",
    email: data.email,
    avatar: data.foto || data.nome.substring(0, 2).toUpperCase(),
    healthScore: data.healthScore || 0,
    mrr: data.valorMensal || 0,
    activeProjects: data.projetosAtivos || 0,
    tags: data.tags || [],
    status: data.status,
    mrrTendencia: data.mrrTendencia || 0,
    responsavel: {
      nome: data.responsavel || "Não atribuído",
      avatar: data.responsavelAvatar || "NA",
    },
    ultimaInteracao: data.ultimaInteracao || new Date().toISOString(),
  };
}
