// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA - PROJETOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Project } from '@/pages/Projetos';

export const mockProjects: Project[] = [
  {
    id: "project-1",
    name: "Website E-commerce TechCorp",
    type: "WEBSITE",
    teamId: "team-1",
    client: "TechCorp",
    linkedClient: {
      id: "cliente-1",
      name: "TechCorp",
      avatar: "TC"
    },
    status: "in-progress",
    priority: "high",
    progress: 75,
    healthScore: 90,
    deadline: "2025-11-15",
    team: [
      {
        id: "1",
        name: "André Junio",
        avatar: "AJ",
        role: "project_manager",
        email: "andre@zynox.com.br",
        workload: 3,
        isOnline: true,
        isAdmin: true
      },
      {
        id: "2",
        name: "Bianca Silva",
        avatar: "BS",
        role: "developer",
        email: "bianca@zynox.com.br",
        workload: 2,
        isOnline: true
      }
    ],
    tags: ["E-commerce", "React", "Node.js"],
    tasks: [
      {
        id: "task-1-1",
        name: "Configurar ambiente de desenvolvimento",
        status: "done",
        assignedTo: "1",
        priority: "high",
        deadline: "2025-10-20",
        createdAt: "2025-10-15T09:00:00Z",
        completedAt: "2025-10-18T16:00:00Z"
      },
      {
        id: "task-1-2",
        name: "Implementar carrinho de compras",
        status: "in-progress",
        assignedTo: "2",
        priority: "high",
        deadline: "2025-10-25",
        createdAt: "2025-10-18T10:00:00Z"
      }
    ],
    files: [],
    comments: [],
    activities: [
      {
        id: "act-1-1",
        type: "project_created",
        author: "André Junio",
        description: "criou o projeto",
        timestamp: "2025-10-15T09:00:00Z"
      }
    ],
    milestones: [
      {
        id: "milestone-1-1",
        title: "Fase 1 - Configuração",
        description: "Ambiente e estrutura base",
        dueDate: "2025-10-20",
        status: "completed",
        completedAt: "2025-10-18T16:00:00Z"
      }
    ],
    risks: [],
    notes: [],
    value: 15000,
    budget: {
      total: 15000,
      spent: 11250,
      breakdown: {
        labor: 10000,
        infrastructure: 1000,
        external: 250,
        other: 0
      }
    },
    paymentPlan: {
      type: "installments",
      installmentCount: 3
    },
    description: "Desenvolvimento de plataforma de e-commerce completa com painel administrativo",
    startDate: "2025-10-15",
    createdBy: "André Junio",
    updatedAt: "2025-10-26T10:00:00Z",
    isFavorite: true,
    lastActivityAt: "2025-10-26T10:00:00Z"
  },
  {
    id: "project-2",
    name: "App Mobile StartupXYZ",
    type: "MOBILE",
    teamId: "team-2",
    client: "StartupXYZ",
    linkedClient: {
      id: "cliente-2",
      name: "StartupXYZ",
      avatar: "SX"
    },
    status: "review",
    priority: "medium",
    progress: 90,
    healthScore: 85,
    deadline: "2025-11-30",
    team: [
      {
        id: "1",
        name: "André Junio",
        avatar: "AJ",
        role: "project_manager",
        email: "andre@zynox.com.br",
        workload: 1,
        isOnline: true,
        isAdmin: true
      },
      {
        id: "3",
        name: "Carlos Mendes",
        avatar: "CM",
        role: "developer",
        email: "carlos@zynox.com.br",
        workload: 4,
        isOnline: false
      }
    ],
    tags: ["Mobile", "React Native", "iOS", "Android"],
    tasks: [
      {
        id: "task-2-1",
        name: "Implementar autenticação",
        status: "done",
        assignedTo: "3",
        priority: "high",
        deadline: "2025-10-15",
        createdAt: "2025-10-01T09:00:00Z",
        completedAt: "2025-10-14T17:00:00Z"
      },
      {
        id: "task-2-2",
        name: "Implementar dashboard principal",
        status: "done",
        assignedTo: "3",
        priority: "high",
        deadline: "2025-10-25",
        createdAt: "2025-10-15T10:00:00Z",
        completedAt: "2025-10-24T15:00:00Z"
      },
      {
        id: "task-2-3",
        name: "Testes de integração",
        status: "in-progress",
        assignedTo: "3",
        priority: "medium",
        deadline: "2025-11-05",
        createdAt: "2025-10-25T11:00:00Z"
      }
    ],
    files: [],
    comments: [],
    activities: [
      {
        id: "act-2-1",
        type: "project_created",
        author: "André Junio",
        description: "criou o projeto",
        timestamp: "2025-10-01T09:00:00Z"
      }
    ],
    milestones: [
      {
        id: "milestone-2-1",
        title: "MVP - Versão Beta",
        description: "Funcionalidades básicas implementadas",
        dueDate: "2025-10-30",
        status: "completed",
        completedAt: "2025-10-28T14:00:00Z"
      }
    ],
    risks: [
      {
        id: "risk-2-1",
        title: "Atraso na aprovação da App Store",
        description: "Processo de review pode demorar mais que o esperado",
        probability: "medium",
        impact: "high",
        mitigation: "Submeter com antecedência e ter versão alternativa"
      }
    ],
    notes: [],
    value: 25000,
    budget: {
      total: 25000,
      spent: 20000,
      breakdown: {
        labor: 18000,
        infrastructure: 1500,
        external: 500,
        other: 0
      }
    },
    paymentPlan: {
      type: "installments",
      installmentCount: 4
    },
    description: "Desenvolvimento de aplicativo mobile para gestão de vendas",
    startDate: "2025-10-01",
    createdBy: "André Junio",
    updatedAt: "2025-10-26T11:00:00Z",
    isFavorite: false,
    lastActivityAt: "2025-10-26T11:00:00Z"
  },
  {
    id: "project-3",
    name: "Consultoria Estratégica João Silva",
    type: "CONSULTORIA",
    teamId: "team-1",
    client: "João Silva",
    linkedClient: {
      id: "cliente-3",
      name: "João Silva",
      avatar: "JS"
    },
    status: "completed",
    priority: "low",
    progress: 100,
    healthScore: 95,
    deadline: "2025-10-20",
    team: [
      {
        id: "1",
        name: "André Junio",
        avatar: "AJ",
        role: "consultant",
        email: "andre@zynox.com.br",
        workload: 0,
        isOnline: true,
        isAdmin: true
      }
    ],
    tags: ["Consultoria", "Estratégia", "Digital"],
    tasks: [
      {
        id: "task-3-1",
        name: "Análise do mercado atual",
        status: "done",
        assignedTo: "1",
        priority: "high",
        deadline: "2025-10-10",
        createdAt: "2025-10-01T09:00:00Z",
        completedAt: "2025-10-09T16:00:00Z"
      },
      {
        id: "task-3-2",
        name: "Elaborar plano estratégico",
        status: "done",
        assignedTo: "1",
        priority: "high",
        deadline: "2025-10-15",
        createdAt: "2025-10-10T10:00:00Z",
        completedAt: "2025-10-14T15:00:00Z"
      },
      {
        id: "task-3-3",
        name: "Apresentação final",
        status: "done",
        assignedTo: "1",
        priority: "medium",
        deadline: "2025-10-20",
        createdAt: "2025-10-15T11:00:00Z",
        completedAt: "2025-10-19T14:00:00Z"
      }
    ],
    files: [],
    comments: [],
    activities: [
      {
        id: "act-3-1",
        type: "project_created",
        author: "André Junio",
        description: "criou o projeto",
        timestamp: "2025-10-01T09:00:00Z"
      },
      {
        id: "act-3-2",
        type: "project_completed",
        author: "André Junio",
        description: "projeto concluído com sucesso",
        timestamp: "2025-10-20T16:00:00Z"
      }
    ],
    milestones: [
      {
        id: "milestone-3-1",
        title: "Entrega do Plano Estratégico",
        description: "Documento final com recomendações",
        dueDate: "2025-10-20",
        status: "completed",
        completedAt: "2025-10-19T14:00:00Z"
      }
    ],
    risks: [],
    notes: [],
    value: 8000,
    budget: {
      total: 8000,
      spent: 8000,
      breakdown: {
        labor: 8000,
        infrastructure: 0,
        external: 0,
        other: 0
      }
    },
    paymentPlan: {
      type: "single"
    },
    description: "Consultoria estratégica para transformação digital",
    startDate: "2025-10-01",
    createdBy: "André Junio",
    updatedAt: "2025-10-20T16:00:00Z",
    isFavorite: false,
    lastActivityAt: "2025-10-20T16:00:00Z"
  }
];

