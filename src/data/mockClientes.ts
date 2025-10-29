// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA - CLIENTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Cliente } from '@/types/cliente';

export const mockClientes: Cliente[] = [
  {
    id: "cliente-1",
    nome: "TechCorp",
    sobrenome: "Ltda",
    email: "contato@techcorp.com",
    telefone: "(11) 3456-7890",
    cpfCnpj: "12.345.678/0001-90",
    tipo: "PJ",
    status: "ativo",
    avatar: "TC",
    healthScore: 95,
    razaoSocial: "TechCorp Tecnologia Ltda",
    nomeFantasia: "TechCorp",
    endereco: {
      cep: "01234-567",
      logradouro: "Rua das Tecnologias",
      numero: "123",
      complemento: "Sala 45",
      bairro: "Centro",
      cidade: "São Paulo",
      estado: "SP"
    },
    contrato: {
      dataInicio: "2024-01-15",
      tipo: "recorrente",
      valorMensal: 5000,
      status: "ativo"
    },
    saldoAtual: 15000,
    totalEntradas: 20000,
    totalSaidas: 5000,
    lucroAcumulado: 15000,
    observacoes: "Cliente premium, sempre pontual nos pagamentos",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2025-10-26T10:00:00Z",
    totalProjetos: 3,
    totalDocumentos: 12,
    totalMovimentacoes: 8
  },
  {
    id: "cliente-2",
    nome: "StartupXYZ",
    sobrenome: "Inc",
    email: "contato@startupxyz.com",
    telefone: "(11) 2345-6789",
    cpfCnpj: "98.765.432/0001-10",
    tipo: "PJ",
    status: "ativo",
    avatar: "SX",
    healthScore: 88,
    razaoSocial: "StartupXYZ Inovação Inc",
    nomeFantasia: "StartupXYZ",
    endereco: {
      cep: "04567-890",
      logradouro: "Av. da Inovação",
      numero: "456",
      complemento: "Andar 8",
      bairro: "Vila Olímpia",
      cidade: "São Paulo",
      estado: "SP"
    },
    contrato: {
      dataInicio: "2024-03-01",
      tipo: "recorrente",
      valorMensal: 8000,
      status: "ativo"
    },
    saldoAtual: 24000,
    totalEntradas: 32000,
    totalSaidas: 8000,
    lucroAcumulado: 24000,
    observacoes: "Startup em crescimento, muito satisfeita com os resultados",
    createdAt: "2024-03-01T14:00:00Z",
    updatedAt: "2025-10-25T14:00:00Z",
    totalProjetos: 2,
    totalDocumentos: 8,
    totalMovimentacoes: 5
  },
  {
    id: "cliente-3",
    nome: "João",
    sobrenome: "Silva",
    email: "joao.silva@email.com",
    telefone: "(11) 98765-4321",
    cpfCnpj: "123.456.789-00",
    tipo: "PF",
    status: "ativo",
    avatar: "JS",
    healthScore: 92,
    endereco: {
      cep: "01234-567",
      logradouro: "Rua das Flores",
      numero: "789",
      complemento: "Apto 12",
      bairro: "Jardins",
      cidade: "São Paulo",
      estado: "SP"
    },
    contrato: {
      dataInicio: "2024-02-10",
      tipo: "recorrente",
      valorMensal: 3000,
      status: "ativo"
    },
    saldoAtual: 9000,
    totalEntradas: 12000,
    totalSaidas: 3000,
    lucroAcumulado: 9000,
    observacoes: "Cliente pessoa física, consultor independente",
    createdAt: "2024-02-10T09:00:00Z",
    updatedAt: "2025-10-24T09:00:00Z",
    totalProjetos: 1,
    totalDocumentos: 4,
    totalMovimentacoes: 3
  },
  {
    id: "cliente-4",
    nome: "Empresa ABC",
    sobrenome: "Ltda",
    email: "contato@empresaabc.com",
    telefone: "(11) 3456-7890",
    cpfCnpj: "11.222.333/0001-44",
    tipo: "PJ",
    status: "inativo",
    avatar: "EA",
    healthScore: 45,
    razaoSocial: "Empresa ABC Comércio Ltda",
    nomeFantasia: "Empresa ABC",
    endereco: {
      cep: "05678-901",
      logradouro: "Rua do Comércio",
      numero: "321",
      complemento: "Loja 1",
      bairro: "Centro",
      cidade: "São Paulo",
      estado: "SP"
    },
    contrato: {
      dataInicio: "2023-11-01",
      tipo: "recorrente",
      valorMensal: 2000,
      status: "suspenso"
    },
    saldoAtual: -2000,
    totalEntradas: 8000,
    totalSaidas: 10000,
    lucroAcumulado: -2000,
    observacoes: "Cliente com dificuldades financeiras, contrato suspenso",
    createdAt: "2023-11-01T08:00:00Z",
    updatedAt: "2025-09-15T08:00:00Z",
    totalProjetos: 1,
    totalDocumentos: 6,
    totalMovimentacoes: 4
  },
  {
    id: "cliente-5",
    nome: "Maria",
    sobrenome: "Santos",
    email: "maria.santos@email.com",
    telefone: "(11) 87654-3210",
    cpfCnpj: "987.654.321-00",
    tipo: "PF",
    status: "ativo",
    avatar: "MS",
    healthScore: 78,
    endereco: {
      cep: "02345-678",
      logradouro: "Av. das Palmeiras",
      numero: "654",
      complemento: "Casa 2",
      bairro: "Alto da Boa Vista",
      cidade: "São Paulo",
      estado: "SP"
    },
    contrato: {
      dataInicio: "2024-05-20",
      tipo: "recorrente",
      valorMensal: 1500,
      status: "ativo"
    },
    saldoAtual: 4500,
    totalEntradas: 6000,
    totalSaidas: 1500,
    lucroAcumulado: 4500,
    observacoes: "Designer freelancer, projetos pequenos mas constantes",
    createdAt: "2024-05-20T16:00:00Z",
    updatedAt: "2025-10-23T16:00:00Z",
    totalProjetos: 2,
    totalDocumentos: 3,
    totalMovimentacoes: 2
  }
];