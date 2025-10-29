/**
 * 🛠️ FUNÇÕES UTILITÁRIAS PARA PROJETOS
 * 
 * Sistema inteligente de cálculo de progresso, status e métricas
 */

import { Project, Task } from '@/pages/Projetos';

/**
 * Calcula o progresso do projeto baseado nas tarefas concluídas
 */
export function calculateProjectProgress(tasks: Task[]): number {
  if (!tasks || tasks.length === 0) return 0;
  
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  return Math.round((completedTasks / tasks.length) * 100);
}

/**
 * Calcula os dias restantes até o deadline
 */
export function getDaysRemaining(deadline: string): number {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Determina o status inteligente do projeto
 */
export function getProjectSmartStatus(project: Project): Project['status'] {
  const progress = calculateProjectProgress(project.tasks);
  const daysRemaining = getDaysRemaining(project.deadline);
  
  // Projeto concluído
  if (progress === 100) {
    return 'completed';
  }
  
  // Projeto atrasado (passou do prazo e não está 100%)
  if (daysRemaining < 0) {
    return 'overdue';
  }
  
  // Projeto em risco (prazo próximo e progresso baixo)
  if (daysRemaining <= 3 && progress < 80) {
    return 'at-risk';
  }
  
  // Status normal baseado no status atual
  return project.status === 'backlog' ? 'backlog' : 'in-progress';
}

/**
 * Retorna a cor do status
 */
export function getStatusColor(status: Project['status']): string {
  const colors = {
    'backlog': 'slate',
    'in-progress': 'blue',
    'review': 'purple',
    'completed': 'green',
    'overdue': 'red',
    'at-risk': 'orange',
  };
  return colors[status] || 'gray';
}

/**
 * Retorna o label do status em português
 */
export function getStatusLabel(status: Project['status']): string {
  const labels = {
    'backlog': 'Backlog',
    'in-progress': 'Em Andamento',
    'review': 'Em Revisão',
    'completed': 'Concluído',
    'overdue': 'Atrasado',
    'at-risk': 'Em Risco',
  };
  return labels[status] || status;
}

/**
 * Formata o texto de dias restantes
 */
export function formatDaysRemaining(deadline: string): string {
  const days = getDaysRemaining(deadline);
  
  if (days < 0) {
    return `Atrasado ${Math.abs(days)} dias`;
  }
  
  if (days === 0) {
    return 'Vence hoje';
  }
  
  if (days === 1) {
    return 'Vence amanhã';
  }
  
  if (days <= 7) {
    return `${days} dias restantes`;
  }
  
  return `${days} dias restantes`;
}

/**
 * Verifica se o projeto precisa de atenção urgente
 */
export function needsUrgentAttention(project: Project): boolean {
  const status = getProjectSmartStatus(project);
  return status === 'overdue' || status === 'at-risk';
}

/**
 * Calcula métricas das tarefas
 */
export function getTaskMetrics(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const todo = tasks.filter(t => t.status === 'todo').length;
  
  // Tarefas atrasadas
  const now = new Date();
  const overdue = tasks.filter(t => {
    if (!t.deadline || t.status === 'done') return false;
    return new Date(t.deadline) < now;
  }).length;
  
  return {
    total,
    completed,
    inProgress,
    todo,
    overdue,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

/**
 * Atualiza o progresso do projeto automaticamente
 */
export function updateProjectProgress(project: Project): Project {
  const newProgress = calculateProjectProgress(project.tasks);
  const newStatus = getProjectSmartStatus({ ...project, progress: newProgress });
  
  return {
    ...project,
    progress: newProgress,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Cria atividade automática no histórico
 */
export function createActivity(
  type: Project['activities'][0]['type'],
  author: string,
  description: string,
  metadata?: Record<string, any>
): Project['activities'][0] {
  return {
    id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    author,
    description,
    metadata,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Adiciona atividade ao histórico do projeto
 */
export function addActivityToProject(
  project: Project,
  type: Project['activities'][0]['type'],
  author: string,
  description: string,
  metadata?: Record<string, any>
): Project {
  const activity = createActivity(type, author, description, metadata);
  
  return {
    ...project,
    activities: [activity, ...project.activities],
    lastActivityAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calcula o Health Score do projeto (0-100)
 */
export function calculateHealthScore(project: Project): number {
  let score = 100;
  
  // 1. Progresso vs Tempo (peso: 35%)
  const daysTotal = Math.ceil(
    (new Date(project.deadline).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysElapsed = Math.ceil(
    (new Date().getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const timeProgress = Math.min((daysElapsed / daysTotal) * 100, 100);
  const progressGap = timeProgress - project.progress;
  
  if (progressGap > 20) score -= 35; // Muito atrasado
  else if (progressGap > 10) score -= 20; // Atrasado
  else if (progressGap > 5) score -= 10; // Levemente atrasado
  else if (progressGap < -10) score -= 5; // Adiantado demais pode indicar problemas
  
  // 2. Tarefas atrasadas (peso: 25%)
  const metrics = getTaskMetrics(project.tasks);
  if (metrics.overdue > 5) score -= 25;
  else if (metrics.overdue > 3) score -= 15;
  else if (metrics.overdue > 0) score -= 10;
  
  // 3. Orçamento (peso: 20%)
  if (project.budget) {
    const budgetUsage = (project.budget.spent / project.budget.total) * 100;
    const budgetVsProgress = budgetUsage - project.progress;
    
    if (budgetUsage > 100) score -= 20; // Estourou orçamento
    else if (budgetVsProgress > 30) score -= 15; // Gastando muito rápido
    else if (budgetVsProgress > 20) score -= 10;
  }
  
  // 4. Atividade recente (peso: 10%)
  if (project.lastActivityAt) {
    const daysSinceActivity = Math.ceil(
      (new Date().getTime() - new Date(project.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceActivity > 7) score -= 10; // Sem atividade há 1 semana
    else if (daysSinceActivity > 3) score -= 5;
  }
  
  // 5. Riscos ativos (peso: 10%)
  if (project.risks) {
    const activeRisks = project.risks.filter(r => r.status !== 'resolved');
    const criticalRisks = activeRisks.filter(r => r.severity === 'critical').length;
    const highRisks = activeRisks.filter(r => r.severity === 'high').length;
    
    score -= (criticalRisks * 5);
    score -= (highRisks * 3);
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Retorna cor e label do Health Score
 */
export function getHealthScoreInfo(score: number): {
  color: string;
  label: string;
  icon: string;
} {
  if (score >= 80) {
    return { color: 'green', label: 'Saudável', icon: '🟢' };
  } else if (score >= 60) {
    return { color: 'yellow', label: 'Atenção', icon: '🟡' };
  } else if (score >= 40) {
    return { color: 'orange', label: 'Em Risco', icon: '🟠' };
  } else {
    return { color: 'red', label: 'Crítico', icon: '🔴' };
  }
}

/**
 * Retorna label do papel do membro
 */
export function getTeamRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    'project_manager': 'Project Manager',
    'tech_lead': 'Tech Lead',
    'developer': 'Desenvolvedor',
    'designer': 'Designer',
    'qa': 'QA/Tester',
    'client': 'Cliente',
  };
  return labels[role] || role;
}

