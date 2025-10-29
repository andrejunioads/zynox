// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES - MEMBER & TEAM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type MemberRole = 'admin' | 'manager' | 'operator' | 'viewer';
export type Department = 'comercial' | 'design' | 'dev' | 'ia' | 'suporte' | 'financeiro';
export type MemberStatus = 'online' | 'away' | 'offline';
export type MemberType = 'human' | 'ai';

export type ActivityType = 
  | 'lead_assigned'
  | 'lead_updated'
  | 'lead_converted'
  | 'task_completed'
  | 'followup_created'
  | 'message_sent'
  | 'project_updated'
  | 'member_added'
  | 'member_updated';

export interface MemberStats {
  // Performance
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;       // %
  avgResponseTime: number;      // minutos
  
  // Atividade
  completedTasks: number;
  totalInteractions: number;
  followUpsCreated: number;
  
  // Período
  periodStart: Date;
  periodEnd: Date;
}

export interface Activity {
  id: string;
  memberId: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  metadata?: {
    leadId?: string;
    leadName?: string;
    projectId?: string;
    projectName?: string;
    value?: number;
  };
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  photoUrl?: string;            // URL da foto do membro
  instagram?: string;           // Username do Instagram (apenas informativo)
  role: MemberRole;
  department: Department;
  status: MemberStatus;
  type: MemberType;
  
  // Estatísticas
  stats: MemberStats;
  
  // Relacionamentos
  assignedLeads: number;        // Contador
  activeProjects: number;       // Contador
  activeTasks: number;          // Contador
  
  // Metadata
  joinedAt: Date;
  lastActivity: Date;
  isActive: boolean;
  
  // Opcional para IA
  aiModel?: string;
  aiCapabilities?: string[];
}

export interface TeamOverview {
  totalMembers: number;
  onlineMembers: number;
  aiAgents: number;
  avgEfficiency: number;
  departmentBreakdown: {
    [key in Department]: number;
  };
}

// Permissões por role
export const ROLE_PERMISSIONS = {
  admin: ['create', 'read', 'update', 'delete', 'manage_team', 'manage_permissions'],
  manager: ['create', 'read', 'update', 'manage_leads', 'assign_tasks'],
  operator: ['create', 'read', 'update'],
  viewer: ['read']
} as const;

// Labels traduzidos
export const ROLE_LABELS: Record<MemberRole, string> = {
  admin: 'Administrador',
  manager: 'Gestor',
  operator: 'Operador',
  viewer: 'Visualizador'
};

export const DEPARTMENT_LABELS: Record<Department, string> = {
  comercial: 'Comercial',
  design: 'Design',
  dev: 'Desenvolvimento',
  ia: 'Inteligência Artificial',
  suporte: 'Suporte',
  financeiro: 'Financeiro'
};

export const DEPARTMENT_COLORS: Record<Department, string> = {
  comercial: 'text-primary bg-primary/10 border-primary/30',
  design: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  dev: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  ia: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  suporte: 'text-green-400 bg-green-400/10 border-green-400/30',
  financeiro: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
};

export const STATUS_COLORS: Record<MemberStatus, string> = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  offline: 'bg-slate-500'
};

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  lead_assigned: 'Lead atribuído',
  lead_updated: 'Lead atualizado',
  lead_converted: 'Lead convertido',
  task_completed: 'Tarefa concluída',
  followup_created: 'Follow-up criado',
  message_sent: 'Mensagem enviada',
  project_updated: 'Projeto atualizado',
  member_added: 'Membro adicionado',
  member_updated: 'Membro atualizado'
};

