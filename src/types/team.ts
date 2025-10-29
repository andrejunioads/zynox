// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES - TEAM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Department } from "./member";

export interface Team {
  id: string;
  name: string;
  description?: string;
  department: Department;
  color: string; // Hex color
  leaderId: string; // ID do líder da equipe
  memberIds: string[]; // IDs dos membros
  createdAt: Date;
  isActive: boolean;
}

export interface TeamWithStats extends Team {
  stats: {
    totalMembers: number;
    activeLeads: number;
    avgConversionRate: number;
    completedTasks: number;
  };
}

// Cores predefinidas para equipes
export const TEAM_COLORS = [
  { label: 'Azul', value: '#3B82F6' },
  { label: 'Verde', value: '#10B981' },
  { label: 'Roxo', value: '#8B5CF6' },
  { label: 'Rosa', value: '#EC4899' },
  { label: 'Amarelo', value: '#F59E0B' },
  { label: 'Ciano', value: '#06B6D4' },
  { label: 'Vermelho', value: '#EF4444' },
  { label: 'Laranja', value: '#F97316' },
];




