/**
 * 🤖 TIPOS PARA SISTEMA DE AUTOMAÇÕES
 */

// Gatilhos disponíveis
export type TriggerType = 
  | 'lead_created'
  | 'lead_stage_changed'
  | 'lead_updated'
  | 'project_created'
  | 'project_progress_changed'
  | 'project_status_changed'
  | 'project_completed'
  | 'payment_received'
  | 'expense_added'
  | 'task_created'
  | 'task_completed'
  | 'client_inactive'
  | 'contract_expiring'
  | 'birthday'
  | 'followup_overdue'
  | 'member_added'
  | 'scheduled'
  | 'custom';

// Tipos de condição
export type ConditionOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';

// Condição individual
export interface AutomationCondition {
  field: string;
  operator: ConditionOperator;
  value: string | number | boolean;
}

// Tipos de ação
export type ActionType = 
  | 'send_notification'
  | 'create_task'
  | 'send_email'
  | 'create_followup'
  | 'update_field'
  | 'webhook'
  | 'custom';

// Ação individual
export interface AutomationAction {
  type: ActionType;
  config: {
    // Para notificação
    title?: string;
    message?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    
    // Para tarefa
    taskName?: string;
    assignedTo?: string;
    
    // Para follow-up
    followUpTitle?: string;
    followUpDays?: number;
    
    // Para webhook
    webhookUrl?: string;
    webhookPayload?: Record<string, any>;
    
    // Para update
    field?: string;
    newValue?: string | number | boolean;
    
    // Custom
    [key: string]: any;
  };
}

// Automação completa
export interface Automation {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  
  // Configuração padrão de notificação (opcional)
  defaultTitle?: string;
  defaultPriority?: 'low' | 'medium' | 'high' | 'urgent';
  
  // Gatilho
  trigger: {
    type: TriggerType;
    config?: Record<string, any>;
  };
  
  // Condições (todas devem ser verdadeiras - AND)
  conditions: AutomationCondition[];
  
  // Ações (executadas em sequência)
  actions: AutomationAction[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  executionCount: number;
  lastExecutedAt?: Date;
}

// Log de execução
export interface AutomationExecutionLog {
  id: string;
  automationId: string;
  automationName: string;
  timestamp: Date;
  trigger: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

