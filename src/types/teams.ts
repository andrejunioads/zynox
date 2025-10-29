// Tipos de Projeto - Cada tipo tem uma equipe especializada
export enum ProjectType {
  WEBSITE = 'website',
  TRAFFIC = 'traffic',
  AUTOMATION = 'automation',
  DESIGN = 'design',
  MOBILE = 'mobile',
  CONSULTING = 'consulting',
}

// Labels legíveis para os tipos de projeto
export const ProjectTypeLabels: Record<ProjectType, { label: string; icon: string; color: string }> = {
  [ProjectType.WEBSITE]: {
    label: 'Desenvolvimento Web',
    icon: '🌐',
    color: '#3b82f6', // blue
  },
  [ProjectType.TRAFFIC]: {
    label: 'Marketing Digital / Tráfego',
    icon: '📈',
    color: '#f59e0b', // amber
  },
  [ProjectType.AUTOMATION]: {
    label: 'Automação',
    icon: '🤖',
    color: '#8b5cf6', // purple
  },
  [ProjectType.DESIGN]: {
    label: 'Design',
    icon: '🎨',
    color: '#ec4899', // pink
  },
  [ProjectType.MOBILE]: {
    label: 'Mobile',
    icon: '📱',
    color: '#10b981', // green
  },
  [ProjectType.CONSULTING]: {
    label: 'Consultoria',
    icon: '💼',
    color: '#6366f1', // indigo
  },
};

// Interface de Membro da Equipe (atualizada com isAdmin)
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isAdmin: boolean; // Se é o administrador principal
  teamId?: string; // ID da equipe (null/undefined se for admin)
  phone?: string;
  workload?: number;
  isOnline?: boolean;
}

// Interface de Equipe
export interface Team {
  id: string;
  name: string;
  type: ProjectType; // Tipo de projeto que esta equipe atende
  members: TeamMember[];
  description?: string;
  color?: string; // Cor da equipe para UI
  icon?: string;
}

// Helper function: Obter label do tipo de projeto
export const getProjectTypeLabel = (type: ProjectType): string => {
  return ProjectTypeLabels[type]?.label || type;
};

// Helper function: Obter ícone do tipo de projeto
export const getProjectTypeIcon = (type: ProjectType): string => {
  return ProjectTypeLabels[type]?.icon || '📁';
};

// Helper function: Obter cor do tipo de projeto
export const getProjectTypeColor = (type: ProjectType): string => {
  return ProjectTypeLabels[type]?.color || '#64748b';
};


