import { Member, Activity } from "@/types/member";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA - MEMBERS & ACTIVITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const mockMembers: Member[] = [
  {
    id: "1",
    name: "André Junio",
    email: "andre@zynox.com.br",
    phone: "(11) 98765-4321",
    avatar: "AJ",
    instagram: "andrejunio",
    role: "admin",
    department: "comercial",
    status: "online",
    type: "human",
    stats: {
      totalLeads: 48,
      convertedLeads: 44,
      conversionRate: 92,
      avgResponseTime: 5,
      completedTasks: 127,
      totalInteractions: 384,
      followUpsCreated: 56,
      periodStart: new Date(2025, 0, 1),
      periodEnd: new Date()
    },
    assignedLeads: 12,
    activeProjects: 8,
    activeTasks: 15,
    joinedAt: new Date(2024, 0, 15),
    lastActivity: new Date(),
    isActive: true
  },
  {
    id: "2",
    name: "Bianca Silva",
    email: "bianca@zynox.com.br",
    phone: "(11) 98765-4322",
    avatar: "BS",
    instagram: "biancasilva_design",
    role: "manager",
    department: "design",
    status: "online",
    type: "human",
    stats: {
      totalLeads: 32,
      convertedLeads: 28,
      conversionRate: 88,
      avgResponseTime: 12,
      completedTasks: 95,
      totalInteractions: 210,
      followUpsCreated: 38,
      periodStart: new Date(2025, 0, 1),
      periodEnd: new Date()
    },
    assignedLeads: 8,
    activeProjects: 12,
    activeTasks: 18,
    joinedAt: new Date(2024, 1, 10),
    lastActivity: new Date(Date.now() - 10 * 60 * 1000), // 10 min atrás
    isActive: true
  },
  {
    id: "3",
    name: "Carlos Mendes",
    email: "carlos@zynox.com.br",
    phone: "(11) 98765-4323",
    avatar: "CM",
    role: "operator",
    department: "dev",
    status: "away",
    type: "human",
    stats: {
      totalLeads: 15,
      convertedLeads: 12,
      conversionRate: 80,
      avgResponseTime: 45,
      completedTasks: 156,
      totalInteractions: 89,
      followUpsCreated: 12,
      periodStart: new Date(2025, 0, 1),
      periodEnd: new Date()
    },
    assignedLeads: 3,
    activeProjects: 15,
    activeTasks: 28,
    joinedAt: new Date(2024, 2, 5),
    lastActivity: new Date(Date.now() - 25 * 60 * 1000), // 25 min atrás
    isActive: true
  },
  {
    id: "4",
    name: "Diana Costa",
    email: "diana@zynox.com.br",
    phone: "(11) 98765-4324",
    avatar: "DC",
    instagram: "dianacosta",
    role: "operator",
    department: "comercial",
    status: "online",
    type: "human",
    stats: {
      totalLeads: 38,
      convertedLeads: 32,
      conversionRate: 84,
      avgResponseTime: 8,
      completedTasks: 78,
      totalInteractions: 298,
      followUpsCreated: 45,
      periodStart: new Date(2025, 0, 1),
      periodEnd: new Date()
    },
    assignedLeads: 10,
    activeProjects: 5,
    activeTasks: 12,
    joinedAt: new Date(2024, 3, 20),
    lastActivity: new Date(Date.now() - 2 * 60 * 1000), // 2 min atrás
    isActive: true
  },
  {
    id: "5",
    name: "Eduardo Alves",
    email: "eduardo@zynox.com.br",
    phone: "(11) 98765-4325",
    avatar: "EA",
    role: "operator",
    department: "financeiro",
    status: "offline",
    type: "human",
    stats: {
      totalLeads: 8,
      convertedLeads: 7,
      conversionRate: 88,
      avgResponseTime: 30,
      completedTasks: 142,
      totalInteractions: 156,
      followUpsCreated: 18,
      periodStart: new Date(2025, 0, 1),
      periodEnd: new Date()
    },
    assignedLeads: 2,
    activeProjects: 3,
    activeTasks: 8,
    joinedAt: new Date(2024, 4, 12),
    lastActivity: new Date(Date.now() - 180 * 60 * 1000), // 3h atrás
    isActive: true
  },
  {
    id: "ai-001",
    name: "IA Atendimento",
    email: "ia.atendimento@zynox.ai",
    avatar: "🤖",
    role: "operator",
    department: "suporte",
    status: "online",
    type: "ai",
    stats: {
      totalLeads: 456,
      convertedLeads: 432,
      conversionRate: 95,
      avgResponseTime: 0.5, // 30 segundos
      completedTasks: 1250,
      totalInteractions: 4580,
      followUpsCreated: 289,
      periodStart: new Date(2025, 0, 1),
      periodEnd: new Date()
    },
    assignedLeads: 45,
    activeProjects: 0,
    activeTasks: 78,
    joinedAt: new Date(2024, 5, 1),
    lastActivity: new Date(),
    isActive: true,
    aiModel: "GPT-4",
    aiCapabilities: ["WhatsApp", "Email", "Chat", "Qualificação de Leads"]
  },
  {
    id: "ai-002",
    name: "IA Análise",
    email: "ia.analise@zynox.ai",
    avatar: "🧠",
    role: "viewer",
    department: "ia",
    status: "online",
    type: "ai",
    stats: {
      totalLeads: 0,
      convertedLeads: 0,
      conversionRate: 0,
      avgResponseTime: 0.1, // 6 segundos
      completedTasks: 3450,
      totalInteractions: 8920,
      followUpsCreated: 0,
      periodStart: new Date(2025, 0, 1),
      periodEnd: new Date()
    },
    assignedLeads: 0,
    activeProjects: 0,
    activeTasks: 0,
    joinedAt: new Date(2024, 6, 15),
    lastActivity: new Date(),
    isActive: true,
    aiModel: "Claude Sonnet 4",
    aiCapabilities: ["Análise de Dados", "Relatórios", "Insights", "Previsões"]
  },
  {
    id: "6",
    name: "Fernanda Lima",
    email: "fernanda@zynox.com.br",
    phone: "(11) 98765-4326",
    avatar: "FL",
    role: "viewer",
    department: "suporte",
    status: "online",
    type: "human",
    stats: {
      totalLeads: 0,
      convertedLeads: 0,
      conversionRate: 0,
      avgResponseTime: 0,
      completedTasks: 34,
      totalInteractions: 125,
      followUpsCreated: 5,
      periodStart: new Date(2025, 0, 1),
      periodEnd: new Date()
    },
    assignedLeads: 0,
    activeProjects: 0,
    activeTasks: 5,
    joinedAt: new Date(2024, 8, 1),
    lastActivity: new Date(Date.now() - 5 * 60 * 1000), // 5 min atrás
    isActive: true
  }
];

export const mockActivities: Activity[] = [
  {
    id: "act-1",
    memberId: "1",
    type: "lead_converted",
    title: "Lead Convertido",
    description: "Fechou negócio com Tech Solutions",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
    metadata: {
      leadId: "lead-123",
      leadName: "Tech Solutions",
      value: 15000
    }
  },
  {
    id: "act-2",
    memberId: "1",
    type: "followup_created",
    title: "Follow-up Criado",
    description: "Agendou retorno com João Silva",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5h atrás
    metadata: {
      leadId: "lead-456",
      leadName: "João Silva"
    }
  },
  {
    id: "act-3",
    memberId: "1",
    type: "message_sent",
    title: "Proposta Enviada",
    description: "Enviou proposta comercial por email",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
    metadata: {
      leadId: "lead-789",
      leadName: "Maria Santos"
    }
  },
  {
    id: "act-4",
    memberId: "2",
    type: "project_updated",
    title: "Projeto Atualizado",
    description: "Finalizou design do website",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3h atrás
    metadata: {
      projectId: "proj-001",
      projectName: "Website Tech Solutions"
    }
  },
  {
    id: "act-5",
    memberId: "2",
    type: "task_completed",
    title: "Tarefa Concluída",
    description: "Criou mockups da landing page",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6h atrás
  },
  {
    id: "act-6",
    memberId: "ai-001",
    type: "lead_assigned",
    title: "Lead Qualificado",
    description: "Qualificou lead automático via WhatsApp",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min atrás
    metadata: {
      leadId: "lead-999",
      leadName: "Carlos Oliveira"
    }
  },
  {
    id: "act-7",
    memberId: "ai-001",
    type: "message_sent",
    title: "Mensagem Automática",
    description: "Respondeu dúvida sobre serviços",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 min atrás
  },
  {
    id: "act-8",
    memberId: "4",
    type: "lead_updated",
    title: "Lead Atualizado",
    description: "Moveu lead para negociação",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h atrás
    metadata: {
      leadId: "lead-555",
      leadName: "InnovaSoft"
    }
  }
];

