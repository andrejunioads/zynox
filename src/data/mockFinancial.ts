// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA - FINANCEIRO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface FinancialTransaction {
  id: string;
  tipo: 'entrada' | 'despesa';
  data: string;
  descricao: string;
  valor: number;
  categoria: string;
  metodoPagamento: string;
  clienteId?: string;
  fornecedor?: string;
  status: 'pago' | 'pendente' | 'agendado';
  dataVencimento?: string;
  numeroNF?: string;
  recorrente: boolean;
  recorrenciaConfig?: {
    frequencia: 'mensal' | 'trimestral' | 'semestral' | 'anual';
    dataFim?: string;
    indefinido: boolean;
  };
  tags?: string[];
  observacoes?: string;
  anexos?: string[];
  createdAt: string;
  updatedAt: string;
}

export const mockFinancial: FinancialTransaction[] = [
  {
    id: 'fin-1',
    tipo: 'entrada',
    data: '2025-10-25',
    descricao: 'Pagamento Projeto Website E-commerce',
    valor: 15000,
    categoria: 'Desenvolvimento',
    metodoPagamento: 'PIX',
    clienteId: 'cliente-1',
    status: 'pago',
    numeroNF: 'NF-001',
    recorrente: false,
    tags: ['website', 'ecommerce'],
    observacoes: 'Pagamento à vista conforme combinado',
    createdAt: '2025-10-25T10:00:00Z',
    updatedAt: '2025-10-25T10:00:00Z'
  },
  {
    id: 'fin-2',
    tipo: 'entrada',
    data: '2025-10-24',
    descricao: 'Mensalidade Cliente Consultoria',
    valor: 5000,
    categoria: 'Consultoria',
    metodoPagamento: 'Transferência',
    clienteId: 'cliente-2',
    status: 'pago',
    recorrente: true,
    recorrenciaConfig: {
      frequencia: 'mensal',
      indefinido: true
    },
    tags: ['consultoria', 'mensal'],
    createdAt: '2025-10-24T09:00:00Z',
    updatedAt: '2025-10-24T09:00:00Z'
  },
  {
    id: 'fin-3',
    tipo: 'despesa',
    data: '2025-10-23',
    descricao: 'Servidor AWS - Outubro',
    valor: 450,
    categoria: 'Infraestrutura',
    metodoPagamento: 'Cartão de Crédito',
    fornecedor: 'Amazon Web Services',
    status: 'pago',
    recorrente: true,
    recorrenciaConfig: {
      frequencia: 'mensal',
      indefinido: true
    },
    tags: ['servidor', 'aws', 'infraestrutura'],
    createdAt: '2025-10-23T08:00:00Z',
    updatedAt: '2025-10-23T08:00:00Z'
  },
  {
    id: 'fin-4',
    tipo: 'despesa',
    data: '2025-10-22',
    descricao: 'Ferramentas de Design - Adobe Creative',
    valor: 89.90,
    categoria: 'Ferramentas',
    metodoPagamento: 'Cartão de Crédito',
    fornecedor: 'Adobe',
    status: 'pago',
    recorrente: true,
    recorrenciaConfig: {
      frequencia: 'mensal',
      indefinido: true
    },
    tags: ['design', 'adobe', 'ferramentas'],
    createdAt: '2025-10-22T07:00:00Z',
    updatedAt: '2025-10-22T07:00:00Z'
  },
  {
    id: 'fin-5',
    tipo: 'entrada',
    data: '2025-10-21',
    descricao: 'Projeto App Mobile - Fase 1',
    valor: 25000,
    categoria: 'Desenvolvimento',
    metodoPagamento: 'PIX',
    clienteId: 'cliente-3',
    status: 'pago',
    numeroNF: 'NF-002',
    recorrente: false,
    tags: ['mobile', 'app', 'desenvolvimento'],
    observacoes: 'Primeira parcela do projeto mobile',
    createdAt: '2025-10-21T14:00:00Z',
    updatedAt: '2025-10-21T14:00:00Z'
  },
  {
    id: 'fin-6',
    tipo: 'despesa',
    data: '2025-10-20',
    descricao: 'Marketing Digital - Google Ads',
    valor: 1200,
    categoria: 'Marketing',
    metodoPagamento: 'Cartão de Crédito',
    fornecedor: 'Google',
    status: 'pago',
    recorrente: true,
    recorrenciaConfig: {
      frequencia: 'mensal',
      indefinido: true
    },
    tags: ['marketing', 'google-ads', 'digital'],
    createdAt: '2025-10-20T16:00:00Z',
    updatedAt: '2025-10-20T16:00:00Z'
  },
  {
    id: 'fin-7',
    tipo: 'entrada',
    data: '2025-10-19',
    descricao: 'Consultoria Estratégica - Q4',
    valor: 8000,
    categoria: 'Consultoria',
    metodoPagamento: 'Transferência',
    clienteId: 'cliente-4',
    status: 'pago',
    recorrente: false,
    tags: ['consultoria', 'estrategia', 'q4'],
    observacoes: 'Consultoria estratégica para Q4 2025',
    createdAt: '2025-10-19T11:00:00Z',
    updatedAt: '2025-10-19T11:00:00Z'
  },
  {
    id: 'fin-8',
    tipo: 'despesa',
    data: '2025-10-18',
    descricao: 'Escritório - Aluguel Outubro',
    valor: 3500,
    categoria: 'Operacional',
    metodoPagamento: 'Transferência',
    fornecedor: 'Imobiliária Central',
    status: 'pago',
    recorrente: true,
    recorrenciaConfig: {
      frequencia: 'mensal',
      indefinido: true
    },
    tags: ['escritorio', 'aluguel', 'operacional'],
    createdAt: '2025-10-18T09:00:00Z',
    updatedAt: '2025-10-18T09:00:00Z'
  },
  {
    id: 'fin-9',
    tipo: 'entrada',
    data: '2025-10-17',
    descricao: 'Manutenção Website - Cliente VIP',
    valor: 2000,
    categoria: 'Manutenção',
    metodoPagamento: 'PIX',
    clienteId: 'cliente-1',
    status: 'pago',
    recorrente: false,
    tags: ['manutencao', 'website', 'vip'],
    observacoes: 'Manutenção mensal do website',
    createdAt: '2025-10-17T15:00:00Z',
    updatedAt: '2025-10-17T15:00:00Z'
  },
  {
    id: 'fin-10',
    tipo: 'despesa',
    data: '2025-10-16',
    descricao: 'Cursos e Treinamentos',
    valor: 299,
    categoria: 'Educação',
    metodoPagamento: 'Cartão de Crédito',
    fornecedor: 'Udemy',
    status: 'pago',
    recorrente: false,
    tags: ['educacao', 'cursos', 'treinamento'],
    observacoes: 'Curso de React Avançado',
    createdAt: '2025-10-16T13:00:00Z',
    updatedAt: '2025-10-16T13:00:00Z'
  }
];

