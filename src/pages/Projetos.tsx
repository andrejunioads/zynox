import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProjects, useData } from "@/contexts/DataContext";
// import { useProjectSync } from "@/hooks/useSmartSync";
import { DndContext, closestCorners, DragEndEvent } from "@dnd-kit/core";
import {
  Search,
  Filter,
  Download,
  Plus,
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  FolderKanban,
  Zap,
  Target,
  DollarSign,
  ClipboardList,
  Eye,
  CheckCircle2,
  TrendingUp,
  LucideIcon
} from "lucide-react";
import { PremiumMiniBar } from "@/components/charts/PremiumMiniBar";
import { PremiumAreaChart } from "@/components/charts/PremiumAreaChart";
import { ProjectKanbanColumn } from "@/components/projetos/ProjectKanbanColumn";
import { ProjectDetailsModalNew } from "@/components/projetos/ProjectDetailsModalNew";
import { CreateProjectModal } from "@/components/projetos/CreateProjectModal";
import { FilterPanelProjetos } from "@/components/projetos/FilterPanelProjetos";
import { ProjectListView } from "@/components/projetos/ProjectListView";
import { ProjectTimelineView } from "@/components/projetos/ProjectTimelineView";

import { RecentActivityWidget } from "@/components/projetos/RecentActivityWidget";
import { TeamPerformanceWidget } from "@/components/projetos/TeamPerformanceWidget";
import { ProjectAnalytics } from "@/components/projetos/ProjectAnalytics";
import { ProjectType } from "@/types/teams";
import { getAvailableMembersForProject, getTeamByProjectType } from "@/data/mockTeams";

export interface TaskFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  usuario_id: string; // ✅ ATUALIZADO: Relacionamento com Usuario
  priority: 'high' | 'medium' | 'low';
  deadline?: string;
  createdAt: string;
  completedAt?: string;
  blockedBy?: string[]; // IDs de tarefas que bloqueiam esta
  dependencies?: string[]; // IDs de tarefas que dependem desta
  files?: TaskFile[];
  checklist?: TaskChecklistItem[];
  comments?: TaskComment[];
}

export interface ProjectFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface ProjectComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface ProjectActivity {
  id: string;
  type: 'project_created' | 'task_created' | 'task_completed' | 'task_moved' |
        'status_changed' | 'file_uploaded' | 'comment_added' | 'progress_updated' |
        'milestone_completed' | 'risk_added' | 'budget_updated' | 'team_member_added';
  author: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: 'project_manager' | 'tech_lead' | 'developer' | 'designer' | 'qa' | 'client';
  email?: string;
  phone?: string;
  workload?: number; // número de tarefas atribuídas
  isOnline?: boolean;
  isAdmin?: boolean;
}

export interface LinkedClient {
  id: string; // ID do cliente na base (ex: CLI-001)
  name: string;
  company: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface Budget {
  total: number;
  spent: number;
  breakdown: {
    labor: number;
    infrastructure: number;
    external: number;
    other: number;
  };
}

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  date: string;
  status: 'pending' | 'in-progress' | 'completed';
  responsible: string;
  checklist?: Array<{ id: string; item: string; completed: boolean }>;
  completedAt?: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'technical' | 'business' | 'resource' | 'external';
  status: 'identified' | 'mitigating' | 'resolved';
  createdAt: string;
  createdBy: string;
}

export interface QuickNote {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  tags: string[];
  isPinned?: boolean;
}

export interface ProjectInvoice {
  id: string;
  number: string; // Número da fatura (ex: "001/2025")
  description: string;
  value: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paidAt?: string;
  paymentMethod?: string;
  notes?: string;
  linkedFinanceId?: string; // ID da movimentação no módulo Financeiro
}

export interface ProjectPaymentPlan {
  totalValue: number;
  invoices: ProjectInvoice[];
  paymentType: 'single' | 'installments' | 'recurring';
  installmentCount?: number;
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType; // Tipo do projeto (usando enum de @/types/teams)
  teamId: string; // ID da equipe responsável
  client: string; // Deprecated - usar linkedClient
  linkedClient?: LinkedClient; // Cliente vinculado
  status: "backlog" | "in-progress" | "review" | "completed" | "overdue" | "at-risk";
  priority: "high" | "medium" | "low";
  progress: number; // Calculado automaticamente
  healthScore: number; // 0-100
  deadline: string;
  team: TeamMember[]; // Array de membros com papéis
  tags: string[];
  tasks: Task[];
  files: ProjectFile[];
  comments: ProjectComment[];
  activities: ProjectActivity[];
  milestones: Milestone[];
  observations?: string;
  value: number;
  budget: Budget;
  paymentPlan?: ProjectPaymentPlan;
  description: string;
  startDate: string;
  createdBy: string;
  updatedAt: string;
  isFavorite?: boolean;
  lastActivityAt?: string;
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Website Empresa X",
    type: ProjectType.WEBSITE,
    teamId: "team-001",
    client: "Empresa X Ltda",
    linkedClient: {
      id: "cliente-3", // João Silva - Tech Innovations
      name: "João Silva",
      company: "Tech Innovations LTDA",
      email: "joao@techinnovations.com",
      phone: "+55 11 99999-9999",
      avatar: "JS"
    },
    status: "in-progress",
    priority: "high",
    progress: 60,
    healthScore: 75,
    deadline: "2025-11-15",
    team: getAvailableMembersForProject(ProjectType.WEBSITE).map(m => ({
      id: m.id,
      name: m.name,
      avatar: m.avatar || 'U',
      role: m.isAdmin ? 'project_manager' : 'developer' as any,
      email: m.email,
      workload: m.workload || 0,
      isOnline: m.isOnline || false
    })),
    budget: {
      total: 50000,
      spent: 28500,
      breakdown: {
        labor: 20000,
        infrastructure: 5000,
        external: 2500,
        other: 1000
      }
    },
    milestones: [
      {
        id: "ms-1",
        name: "Kickoff do Projeto",
        description: "Reunião inicial com stakeholders",
        date: "2025-10-01",
        status: "completed",
        responsible: "João Silva",
        completedAt: "2025-10-01T10:00:00Z"
      },
      {
        id: "ms-2",
        name: "Design Aprovado",
        description: "Aprovação final dos layouts",
        date: "2025-10-20",
        status: "completed",
        responsible: "Maria Santos",
        completedAt: "2025-10-19T15:00:00Z"
      },
      {
        id: "ms-3",
        name: "MVP Pronto",
        description: "Versão mínima viável funcional",
        date: "2025-11-05",
        status: "in-progress",
        responsible: "João Silva"
      },
      {
        id: "ms-4",
        name: "Go-live",
        description: "Lançamento oficial do site",
        date: "2025-11-15",
        status: "pending",
        responsible: "Pedro Costa"
      }
    ],
    observations: `Projeto em andamento com bom progresso. Cliente satisfeito com as entregas até o momento.`,
    risks: [
      {
        id: "risk-1",
        title: "Atraso na API de integração",
        description: "Cliente não forneceu acesso à API prometida",
        severity: "high",
        type: "external",
        status: "identified",
        createdAt: "2025-10-24T14:00:00Z",
        createdBy: "João Silva"
      },
      {
        id: "risk-2",
        title: "Designer de férias",
        description: "Maria estará de férias na semana final",
        severity: "medium",
        type: "resource",
        status: "mitigating",
        createdAt: "2025-10-20T09:00:00Z",
        createdBy: "Sistema"
      }
    ],
    tags: ["Design", "Desenvolvimento"],
    isFavorite: true,
    lastActivityAt: "2025-10-26T10:30:00Z",
    paymentPlan: {
      totalValue: 45000,
      paymentType: 'installments',
      installmentCount: 3,
      invoices: [
        {
          id: "inv-1-1",
          number: "001/2025",
          description: "Entrada (30%) - Início do projeto",
          value: 13500,
          dueDate: "2025-10-05",
          status: "paid",
          paidAt: "2025-10-04T14:30:00Z",
          paymentMethod: "PIX",
          linkedFinanceId: "fin-123"
        },
        {
          id: "inv-1-2",
          number: "002/2025",
          description: "Parcela 2 (30%) - Entrega do MVP",
          value: 13500,
          dueDate: "2025-11-05",
          status: "pending",
        },
        {
          id: "inv-1-3",
          number: "003/2025",
          description: "Parcela Final (40%) - Entrega completa",
          value: 18000,
          dueDate: "2025-11-20",
          status: "pending",
        }
      ]
    },
    tasks: [
      {
        id: "task-1-1",
        name: "Criar wireframes do site",
        description: "Desenvolver wireframes de todas as páginas principais",
        status: "done",
        usuario_id: "2", // Maria Santos
        priority: "high",
        deadline: "2025-10-15",
        createdAt: "2025-10-01T10:00:00Z",
        completedAt: "2025-10-14T16:30:00Z"
      },
      {
        id: "task-1-2",
        name: "Desenvolver Homepage",
        description: "Implementar layout responsivo da página inicial",
        status: "done",
        usuario_id: "1", // João Silva
        priority: "high",
        deadline: "2025-10-20",
        createdAt: "2025-10-15T09:00:00Z",
        completedAt: "2025-10-19T18:00:00Z"
      },
      {
        id: "task-1-3",
        name: "Página Sobre Nós",
        description: "Criar seção institucional com história da empresa",
        status: "in-progress",
        usuario_id: "3", // Pedro Costa
        priority: "medium",
        deadline: "2025-10-28",
        createdAt: "2025-10-20T10:00:00Z"
      },
      {
        id: "task-1-4",
        name: "Página de Serviços",
        description: "Desenvolver catálogo de serviços com filtros",
        status: "in-progress",
        usuario_id: "1", // João Silva
        priority: "high",
        deadline: "2025-10-30",
        createdAt: "2025-10-22T11:00:00Z"
      },
      {
        id: "task-1-5",
        name: "Formulário de Contato",
        description: "Criar formulário integrado com API de envio",
        status: "todo",
        usuario_id: "3", // Pedro Costa
        priority: "medium",
        deadline: "2025-11-05",
        createdAt: "2025-10-23T14:00:00Z"
      }
    ],
    files: [],
    comments: [],
    activities: [
      {
        id: "act-1-1",
        type: "project_created",
        author: "Sistema",
        description: "criou o projeto",
        timestamp: "2025-10-01T09:00:00Z"
      },
      {
        id: "act-1-2",
        type: "task_completed",
        author: "Maria Santos",
        description: 'concluiu a tarefa "Criar wireframes do site"',
        timestamp: "2025-10-14T16:30:00Z"
      },
      {
        id: "act-1-3",
        type: "task_completed",
        author: "João Silva",
        description: 'concluiu a tarefa "Desenvolver Homepage"',
        timestamp: "2025-10-19T18:00:00Z"
      }
    ],
    value: 45000,
    description: "Desenvolvimento de website institucional completo",
    startDate: "2025-10-01",
    createdBy: "André Júnio",
    updatedAt: "2025-10-26T10:00:00Z"
  },
  {
    id: "2",
    name: "App Mobile Delivery",
    type: ProjectType.WEBSITE,
    client: "Startup Food",
    status: "in-progress",
    priority: "high",
    progress: 67,
    healthScore: 85,
    deadline: "2025-10-28",
    team: [
      { id: "tm-4", name: "Ana Lima", avatar: "AL", role: "developer", workload: 2, isOnline: true },
      { id: "tm-5", name: "Carlos Souza", avatar: "CS", role: "developer", workload: 1, isOnline: false }
    ],
    budget: { total: 78000, spent: 52260, breakdown: { labor: 40000, infrastructure: 10000, external: 2260, other: 0 } },
    milestones: [],
    teamId: "team-1", // ✅ ADICIONADO: Campo obrigatório
    paymentPlan: {
      totalValue: 78000,
      paymentType: 'installments',
      installmentCount: 2,
      invoices: [
        {
          id: "inv-2-1",
          number: "004/2025",
          description: "Entrada (50%)",
          value: 39000,
          dueDate: "2025-09-20",
          status: "paid",
          paidAt: "2025-09-19T10:00:00Z",
          paymentMethod: "TED"
        },
        {
          id: "inv-2-2",
          number: "005/2025",
          description: "Saldo Final (50%)",
          value: 39000,
          dueDate: "2025-10-30",
          status: "pending"
        }
      ]
    },
    tags: ["Mobile", "React Native"],
    tasks: [
      { id: "task-2-1", name: "Tela de Login", status: "done", usuario_id: "4", priority: "high", createdAt: "2025-09-15T10:00:00Z", completedAt: "2025-09-20T15:00:00Z" },
      { id: "task-2-2", name: "Tela de Cardápio", status: "done", usuario_id: "5", priority: "high", createdAt: "2025-09-21T10:00:00Z", completedAt: "2025-10-01T17:00:00Z" },
      { id: "task-2-3", name: "Integração com API", status: "in-progress", usuario_id: "4", priority: "high", deadline: "2025-10-27", createdAt: "2025-10-02T09:00:00Z" }
    ],
    files: [],
    comments: [],
    activities: [
      { id: "act-2-1", type: "project_created", author: "Sistema", description: "criou o projeto", timestamp: "2025-09-15T10:00:00Z" }
    ],
    value: 78000,
    description: "Aplicativo de delivery para iOS e Android",
    startDate: "2025-09-15",
    createdBy: "André Júnio",
    updatedAt: "2025-10-26T10:00:00Z"
  },
  {
    id: "3",
    name: "Sistema CRM",
    type: ProjectType.AUTOMATION,
    client: "Tech Solutions",
    status: "review",
    priority: "medium",
    progress: 100,
    healthScore: 92,
    deadline: "2025-11-05",
    team: [
      { id: "tm-6", name: "Roberto Dias", avatar: "RD", role: "tech_lead", workload: 1, isOnline: false },
      { id: "tm-7", name: "Juliana Melo", avatar: "JM", role: "developer", workload: 2, isOnline: true }
    ],
    budget: { total: 52000, spent: 51000, breakdown: { labor: 45000, infrastructure: 4000, external: 2000, other: 0 } },
    milestones: [],
    teamId: "team-1", // ✅ ADICIONADO: Campo obrigatório
    tags: ["Backend", "Dashboard"],
    tasks: [
      { id: "task-3-1", name: "Dashboard Principal", status: "done", usuario_id: "6", priority: "high", createdAt: "2025-09-01T10:00:00Z", completedAt: "2025-09-15T18:00:00Z" },
      { id: "task-3-2", name: "Módulo de Clientes", status: "done", usuario_id: "7", priority: "high", createdAt: "2025-09-16T10:00:00Z", completedAt: "2025-10-05T16:00:00Z" },
      { id: "task-3-3", name: "Módulo de Vendas", status: "done", usuario_id: "6", priority: "medium", createdAt: "2025-10-06T09:00:00Z", completedAt: "2025-10-20T17:00:00Z" }
    ],
    files: [],
    comments: [],
    activities: [
      { id: "act-3-1", type: "project_created", author: "Sistema", description: "criou o projeto", timestamp: "2025-09-01T10:00:00Z" }
    ],
    value: 52000,
    description: "Sistema de gestão de relacionamento com cliente",
    startDate: "2025-09-01",
    createdBy: "André Júnio",
    updatedAt: "2025-10-26T10:00:00Z"
  },
  {
    id: "4",
    name: "Redesign E-commerce",
    type: ProjectType.DESIGN,
    client: "Loja Virtual ABC",
    status: "backlog",
    priority: "low",
    progress: 0,
    healthScore: 60,
    deadline: "2025-12-20",
    team: [
      { id: "tm-8", name: "Fernanda Costa", avatar: "FC", role: "designer", workload: 0, isOnline: true }
    ],
    budget: { total: 35000, spent: 0, breakdown: { labor: 0, infrastructure: 0, external: 0, other: 0 } },
    milestones: [],
    teamId: "team-1", // ✅ ADICIONADO: Campo obrigatório
    tags: ["UI/UX", "E-commerce"],
    tasks: [
      { id: "task-4-1", name: "Pesquisa com usuários", status: "todo", usuario_id: "8", priority: "high", deadline: "2025-11-01", createdAt: "2025-10-20T10:00:00Z" },
      { id: "task-4-2", name: "Criar protótipos", status: "todo", usuario_id: "8", priority: "medium", createdAt: "2025-10-20T11:00:00Z" }
    ],
    files: [],
    comments: [],
    activities: [
      { id: "act-4-1", type: "project_created", author: "Sistema", description: "criou o projeto", timestamp: "2025-10-20T10:00:00Z" }
    ],
    value: 28000,
    description: "Modernização completa da interface do e-commerce",
    startDate: "2025-10-20",
    createdBy: "André Júnio",
    updatedAt: "2025-10-26T10:00:00Z"
  },
  {
    id: "5",
    name: "Plataforma EAD",
    type: ProjectType.WEBSITE,
    client: "Escola Online",
    status: "completed",
    priority: "medium",
    progress: 100,
    healthScore: 95,
    deadline: "2025-10-10",
    team: [
      { id: "tm-9", name: "Lucas Rocha", avatar: "LR", role: "developer", workload: 3, isOnline: false },
      { id: "tm-10", name: "Beatriz Alves", avatar: "BA", role: "developer", workload: 3, isOnline: false }
    ],
    budget: { total: 95000, spent: 95000, breakdown: { labor: 80000, infrastructure: 10000, external: 5000, other: 0 } },
    milestones: [],
    teamId: "team-1", // ✅ ADICIONADO: Campo obrigatório
    tags: ["Plataforma", "Educação"],
    tasks: [
      { id: "task-5-1", name: "Módulo de Vídeos", status: "done", usuario_id: "9", priority: "high", createdAt: "2025-08-01T10:00:00Z", completedAt: "2025-08-20T18:00:00Z" },
      { id: "task-5-2", name: "Sistema de Avaliações", status: "done", usuario_id: "10", priority: "high", createdAt: "2025-08-21T10:00:00Z", completedAt: "2025-09-15T17:00:00Z" },
      { id: "task-5-3", name: "Certificados Digitais", status: "done", usuario_id: "9", priority: "medium", createdAt: "2025-09-16T09:00:00Z", completedAt: "2025-10-08T16:00:00Z" }
    ],
    files: [],
    comments: [],
    activities: [
      { id: "act-5-1", type: "project_created", author: "Sistema", description: "criou o projeto", timestamp: "2025-08-01T10:00:00Z" },
      { id: "act-5-2", type: "status_changed", author: "Sistema", description: "projeto concluído", timestamp: "2025-10-10T18:00:00Z" }
    ],
    value: 95000,
    description: "Plataforma completa de ensino à distância",
    startDate: "2025-08-01",
    createdBy: "André Júnio",
    updatedAt: "2025-10-26T10:00:00Z"
  },
  {
    id: "6",
    name: "Campanha Black Friday 2025",
    type: ProjectType.TRAFFIC,
    client: "E-commerce Fashion",
    status: "in-progress",
    priority: "high",
    progress: 40,
    healthScore: 88,
    deadline: "2025-11-29",
    team: [
      { id: "tm-11", name: "Mariana Costa", avatar: "MC", role: "project_manager", workload: 2, isOnline: true },
      { id: "tm-12", name: "Felipe Ads", avatar: "FA", role: "developer", workload: 3, isOnline: true }
    ],
    budget: { total: 50000, spent: 20000, breakdown: { labor: 5000, infrastructure: 0, external: 15000, other: 0 } },
    milestones: [],
    teamId: "team-1", // ✅ ADICIONADO: Campo obrigatório
    tags: ["Google Ads", "Facebook Ads", "E-commerce"],
    tasks: [
      { id: "task-6-1", name: "Configurar campanhas Google Ads", status: "done", usuario_id: "11", priority: "high", createdAt: "2025-10-15T10:00:00Z", completedAt: "2025-10-18T14:00:00Z" },
      { id: "task-6-2", name: "Criar criativos Facebook/Instagram", status: "in-progress", usuario_id: "12", priority: "high", deadline: "2025-10-28", createdAt: "2025-10-20T10:00:00Z" },
      { id: "task-6-3", name: "Otimizar landing pages", status: "in-progress", usuario_id: "11", priority: "high", deadline: "2025-10-30", createdAt: "2025-10-22T09:00:00Z" },
      { id: "task-6-4", name: "Configurar pixel de conversão", status: "done", usuario_id: "11", priority: "high", createdAt: "2025-10-16T11:00:00Z", completedAt: "2025-10-17T16:00:00Z" }
    ],
    files: [],
    comments: [],
    activities: [
      { id: "act-6-1", type: "project_created", author: "Sistema", description: "criou o projeto", timestamp: "2025-10-15T10:00:00Z" },
      { id: "act-6-2", type: "task_completed", author: "Felipe Ads", description: 'concluiu "Configurar campanhas Google Ads"', timestamp: "2025-10-18T14:00:00Z" }
    ],
    value: 50000,
    description: "Campanha de tráfego pago para Black Friday com foco em Google Ads, Facebook e Instagram",
    startDate: "2025-10-15",
    createdBy: "André Júnio",
    updatedAt: "2025-10-26T11:00:00Z"
  }
];

const Projetos = () => {
  // ✅ CONTEXTO GLOBAL: Usar dados centralizados
  const { projects, createProject, updateProject, deleteProject } = useProjects();
  const { sync } = useData();
  
  // ✅ SINCRONIZAÇÃO INTELIGENTE: Conectar com outros dados
  // useProjectSync(); // Temporariamente desabilitado para evitar loops
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "timeline">("kanban");

  // Sincronização automática
  useEffect(() => {
    sync();
  }, [sync]);

  const stages: Array<{ id: string; title: string; icon: LucideIcon; color: string }> = [
    { id: "backlog", title: "Backlog", icon: ClipboardList, color: "gray" },
    { id: "in-progress", title: "Em Andamento", icon: Zap, color: "blue" },
    { id: "review", title: "Em Revisão", icon: Eye, color: "orange" },
    { id: "completed", title: "Concluído", icon: CheckCircle2, color: "green" }
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const projectId = active.id as string;
    const newStatus = over.id as Project["status"];

    // ✅ CORRIGIDO: Atualizar o projeto via DataContext
    updateProject(projectId, { status: newStatus });
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsDetailsModalOpen(true);
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeProjects = projects.filter((p) => p.status === "in-progress").length;

  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0;

  const onTimeRate = projects.length > 0
    ? Math.round((projects.filter((p) => new Date(p.deadline) >= new Date()).length / projects.length) * 100)
    : 0;

  const totalRevenue = projects.reduce((sum, p) => sum + p.value, 0);

  const formatProjectValue = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return `R$ ${value.toFixed(0)}`;
  };

  return (
    <DashboardLayout showHeader={false}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="font-['Poppins'] text-lg font-semibold text-white">Gestão de Projetos</h1>
          <p className="text-sm text-slate-400">
            Acompanhe projetos em andamento, prazos e entregas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-[280px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
            <Input
              type="text"
              placeholder="Buscar projeto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-card border-white/10 text-white placeholder:text-muted"
            />
          </div>

          <Button
            variant="outline"
            size="default"
            onClick={() => setIsFilterOpen(true)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </Button>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 glow-primary"
          >
            <Plus className="w-4 h-4" />
            Novo Projeto
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Projetos Ativos */}
        <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-primary/30 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <FolderKanban className="w-5 h-5 text-primary" />
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              Em andamento
            </Badge>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{activeProjects}</p>
          <p className="text-sm text-muted-foreground">Projetos Ativos</p>
          <div className="mt-3">
            <div className="h-12 mb-2">
              <PremiumMiniBar data={[8, 10, 9, 11, 12, 10, 12]} />
            </div>
            <p className="text-xs text-muted-foreground">{projects.length} projetos no total</p>
          </div>
        </div>

        {/* Média de Progresso */}
        <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <Badge variant="outline" className="text-xs border-purple-400/30 text-purple-400">
              Geral
            </Badge>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{avgProgress}%</p>
          <p className="text-sm text-muted-foreground">Média de Progresso</p>
          <div className="mt-3">
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full bg-purple-500" style={{ width: `${avgProgress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">Meta: 75%</p>
          </div>
        </div>

        {/* Entregas Pontuais */}
        <div className={cn(
          "glass-card p-5 rounded-xl border border-white/10 transition-all group",
          onTimeRate >= 90 ? "hover:border-green-500/30" : "hover:border-red-500/30"
        )}>
          <div className="flex items-center justify-between mb-3">
            <Target className={cn("w-5 h-5", onTimeRate >= 90 ? "text-green-400" : "text-red-400")} />
            <Badge className={cn(
              "text-xs border",
              onTimeRate >= 90 ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"
            )}>
              {onTimeRate >= 90 ? "Excelente" : "Atenção"}
            </Badge>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{onTimeRate}%</p>
          <p className="text-sm text-muted-foreground">Entregas Pontuais</p>
          <div className="mt-3">
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
              <div
                className={cn("h-full rounded-full", onTimeRate >= 90 ? "bg-green-500" : "bg-red-500")}
                style={{ width: `${onTimeRate}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{onTimeRate >= 90 ? "Desempenho ótimo" : "Requer atenção"}</p>
          </div>
        </div>

        {/* Faturamento Bruto */}
        <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-green-500/30 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-5 h-5 text-green-400" />
            <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
              Total
            </Badge>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{formatProjectValue(totalRevenue)}</p>
          <p className="text-sm text-muted-foreground">Faturamento Bruto</p>
          <div className="mt-3">
            <div className="h-12 mb-2">
              <PremiumAreaChart data={[120, 135, 148, 142, 156, 150, 156]} color="green" />
            </div>
            <p className="text-xs text-muted-foreground">{projects.length} projetos ativos</p>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={viewMode === "kanban" ? "default" : "outline"}
          onClick={() => setViewMode("kanban")}
          className="gap-2"
        >
          <LayoutGrid className="w-4 h-4" />
          Kanban
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          onClick={() => setViewMode("list")}
          className="gap-2"
        >
          <List className="w-4 h-4" />
          Lista
        </Button>
        <Button
          variant={viewMode === "timeline" ? "default" : "outline"}
          onClick={() => setViewMode("timeline")}
          className="gap-2"
        >
          <CalendarIcon className="w-4 h-4" />
          Timeline
        </Button>
      </div>

      <div className="w-full">
        {/* Main Content Area */}
        <div className="w-full">
          {/* Kanban View */}
          {viewMode === "kanban" && (
            <div className="mb-8 w-full min-w-0">
              <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                <div className="w-full max-w-full overflow-x-auto overflow-y-hidden scrollbar-thin overscroll-x-contain">
                  <div className="flex items-start gap-4 w-max pb-4 pr-2">
                    {stages.map((stage) => (
                      <ProjectKanbanColumn
                        key={stage.id}
                        stage={stage}
                        projects={filteredProjects.filter((p) => p.status === stage.id)}
                        onProjectClick={handleProjectClick}
                      />
                    ))}
                  </div>
                </div>
              </DndContext>
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <ProjectListView projects={filteredProjects} onProjectClick={handleProjectClick} />
          )}

          {/* Timeline View */}
          {viewMode === "timeline" && (
            <ProjectTimelineView projects={filteredProjects} onProjectClick={handleProjectClick} />
          )}

          {/* Recent Activity & Team Performance - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RecentActivityWidget />
            <TeamPerformanceWidget />
          </div>

          {/* Analytics */}
          <ProjectAnalytics projects={projects} />
        </div>

      </div>

      {/* Modals */}
      <ProjectDetailsModalNew
        project={selectedProject}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedProject(null);
        }}
        onUpdate={(updatedProject) => {
          // ✅ REMOVIDO: setProjects não existe mais (usar DataContext)
        }}
      />

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateProject={(newProject) => {
          // ✅ REMOVIDO: setProjects não existe mais (usar DataContext)
          setIsCreateModalOpen(false);
        }}
      />

      <FilterPanelProjetos
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={(filters) => {
          console.log("Filters applied:", filters);
          setIsFilterOpen(false);
        }}
      />
    </DashboardLayout>
  );
};

export default Projetos;
