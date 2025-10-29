/**
 * 🤖 TEMPLATES DE AUTOMAÇÕES
 * 
 * Templates prontos para facilitar a criação de automações
 */

import { TriggerType, AutomationCondition, AutomationAction } from '@/types/automation';

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'vendas' | 'produtividade' | 'atendimento' | 'financeiro' | 'marketing';
  icon: string;
  trigger: {
    type: TriggerType;
    config?: Record<string, any>;
  };
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  difficulty: 'fácil' | 'intermediário' | 'avançado';
}

export const automationTemplates: AutomationTemplate[] = [
  // ===== VENDAS =====
  {
    id: 'alert-big-deal',
    name: 'Lead de Alto Valor',
    description: 'Receba notificação urgente quando um lead de alto valor for criado',
    category: 'vendas',
    icon: '💰',
    trigger: {
      type: 'lead_created',
    },
    conditions: [
      {
        field: 'value',
        operator: 'greater_than',
        value: 10000,
      },
    ],
    actions: [
      {
        type: 'send_notification',
        config: {
          title: '💰 Nova Oportunidade Grande Detectada',
          message: 'Lead: {{name}}\nEmpresa: {{company}}\nValor: R$ {{value}}\nOrigem: {{origin}}\n\nNão deixe o lead esfriar.',
          priority: 'high',
        },
      },
    ],
    difficulty: 'fácil',
  },
  {
    id: 'won-deal-celebration',
    name: 'Venda Confirmada',
    description: 'Comemore vendas fechadas com a equipe',
    category: 'vendas',
    icon: '🎉',
    trigger: {
      type: 'lead_stage_changed',
    },
    conditions: [
      {
        field: 'newStage',
        operator: 'equals',
        value: 'won',
      },
    ],
    actions: [
      {
        type: 'send_notification',
        config: {
          title: '🎉 Mais um contrato fechado',
          message: 'Cliente: {{company}}\nLead: {{name}}\nValor: R$ {{value}}\n\nBoa jogada. Hora de iniciar o onboarding.',
          priority: 'medium',
        },
      },
    ],
    difficulty: 'fácil',
  },
  {
    id: 'instagram-hot-lead',
    name: 'Lead Quente do Instagram',
    description: 'Priorize leads quentes vindos do Instagram',
    category: 'marketing',
    icon: '📸',
    trigger: {
      type: 'lead_created',
    },
    conditions: [
      {
        field: 'origin',
        operator: 'equals',
        value: 'Instagram',
      },
      {
        field: 'value',
        operator: 'greater_than',
        value: 5000,
      },
    ],
    actions: [
      {
        type: 'send_notification',
        config: {
          title: '🔥 Lead Quente Detectado',
          message: 'Nome: {{name}}\nEmpresa: {{company}}\nValor: R$ {{value}}\nOrigem: Instagram\n\nResponder em menos de 5 minutos aumenta conversão em 40%.',
          priority: 'high',
        },
      },
    ],
    difficulty: 'intermediário',
  },
  {
    id: 'lost-deal-analysis',
    name: 'Analisar Lead Perdido',
    description: 'Crie tarefa para entender motivo de perda',
    category: 'vendas',
    icon: '📊',
    trigger: {
      type: 'lead_stage_changed',
    },
    conditions: [
      {
        field: 'newStage',
        operator: 'equals',
        value: 'lost',
      },
    ],
    actions: [
      {
        type: 'create_task',
        config: {
          taskName: '📝 Analisar motivo da perda: {{name}}',
          assignedTo: 'Gerente Comercial',
        },
      },
      {
        type: 'send_notification',
        config: {
          title: '📊 Lead Perdido — Analisar Motivo',
          message: 'Lead: {{name}}\nEmpresa: {{company}}\nValor: R$ {{value}}\n\nTarefa criada para revisar o processo.',
          priority: 'medium',
        },
      },
    ],
    difficulty: 'intermediário',
  },

  // ===== PRODUTIVIDADE =====
  {
    id: 'project-milestone',
    name: 'Meta de Projeto Atingida',
    description: 'Notifique quando projeto atingir 50% ou 80%',
    category: 'produtividade',
    icon: '🎯',
    trigger: {
      type: 'project_progress_changed',
    },
    conditions: [
      {
        field: 'progress',
        operator: 'equals',
        value: 50,
      },
    ],
    actions: [
      {
        type: 'send_notification',
        config: {
          title: '🎯 Projeto na Metade do Caminho',
          message: 'Projeto: {{projectName}}\nCliente: {{clientName}}\nProgresso: 50%\n\nContinue assim. Você tá no ritmo certo.',
          priority: 'medium',
        },
      },
    ],
    difficulty: 'fácil',
  },
  {
    id: 'task-completed',
    name: 'Tarefa Concluída',
    description: 'Notifique conclusão de tarefas importantes',
    category: 'produtividade',
    icon: '✅',
    trigger: {
      type: 'task_completed',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          title: '✅ Tarefa Concluída',
          message: 'Tarefa: {{taskName}}\nPor: {{completedBy}}\n\nMais uma na conta.',
          priority: 'low',
        },
      },
    ],
    difficulty: 'fácil',
  },

  // ===== ATENDIMENTO =====
  {
    id: 'new-lead-welcome',
    name: 'Primeiro Contato Automático',
    description: 'Crie follow-up de boas-vindas automaticamente',
    category: 'atendimento',
    icon: '👋',
    trigger: {
      type: 'lead_created',
    },
    conditions: [],
    actions: [
      {
        type: 'create_followup',
        config: {
          followUpTitle: '👋 Primeiro contato: {{name}}',
          followUpDays: 1,
        },
      },
      {
        type: 'send_notification',
        config: {
          title: '🚀 Nova Oportunidade Detectada',
          message: 'Lead: {{name}}\nEmpresa: {{company}}\nEmail: {{email}}\n\nFollow-up agendado para amanhã.',
          priority: 'medium',
        },
      },
    ],
    difficulty: 'intermediário',
  },
  {
    id: 'meeting-scheduled',
    name: 'Reunião Agendada',
    description: 'Crie lembretes quando reunião for agendada',
    category: 'atendimento',
    icon: '📅',
    trigger: {
      type: 'lead_stage_changed',
    },
    conditions: [
      {
        field: 'newStage',
        operator: 'equals',
        value: 'meeting',
      },
    ],
    actions: [
      {
        type: 'create_followup',
        config: {
          followUpTitle: '📞 Preparar reunião: {{name}}',
          followUpDays: 2,
        },
      },
      {
        type: 'send_notification',
        config: {
          title: '📅 Nova Reunião Agendada',
          message: 'Cliente: {{company}}\nLead: {{name}}\n\nLembrete criado para preparar a call.',
          priority: 'medium',
        },
      },
    ],
    difficulty: 'intermediário',
  },

  // ===== FINANCEIRO =====
  {
    id: 'payment-received',
    name: 'Pagamento Recebido',
    description: 'Notifique recebimento de pagamentos',
    category: 'financeiro',
    icon: '💵',
    trigger: {
      type: 'payment_received',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          title: '💰 Recebimento Registrado',
          message: 'Cliente: {{clientName}}\nValor: R$ {{amount}}\nFatura: {{invoiceNumber}}\n\nReceita adicionada ao sistema.',
          priority: 'medium',
        },
      },
    ],
    difficulty: 'fácil',
  },
  {
    id: 'big-expense',
    name: 'Despesa Grande',
    description: 'Alerta para despesas acima de certo valor',
    category: 'financeiro',
    icon: '🚨',
    trigger: {
      type: 'expense_added',
    },
    conditions: [
      {
        field: 'amount',
        operator: 'greater_than',
        value: 5000,
      },
    ],
    actions: [
      {
        type: 'send_notification',
        config: {
          title: '⚠️ Despesa Grande Registrada',
          message: 'Valor: R$ {{amount}}\nCategoria: {{category}}\nDescrição: {{description}}\n\nRevisar e aprovar.',
          priority: 'high',
        },
      },
    ],
    difficulty: 'fácil',
  },

  // ===== AVANÇADO =====
  {
    id: 'custom-webhook',
    name: 'Integração Externa',
    description: 'Envie dados para sistema externo via webhook',
    category: 'produtividade',
    icon: '🌐',
    trigger: {
      type: 'lead_created',
    },
    conditions: [],
    actions: [
      {
        type: 'webhook',
        config: {
          webhookUrl: 'https://seu-webhook.com/endpoint',
        },
      },
    ],
    difficulty: 'avançado',
  },
];

// ===== TEMPLATES ADICIONAIS ZYNOX =====
export const additionalTemplates: AutomationTemplate[] = [
  // Follow-up Atrasado
  {
    id: 'followup-overdue',
    name: 'Follow-up Pendente',
    description: 'Lembre quando follow-ups ficarem atrasados',
    category: 'atendimento',
    icon: '⏰',
    trigger: {
      type: 'followup_overdue',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          title: '⏰ Follow-up Pendente',
          message: 'Você tem {{count}} follow-ups atrasados\n\nRetorne os contatos hoje.',
          priority: 'high',
        },
      },
    ],
    difficulty: 'fácil',
  },
  
  // Aniversário de Cliente
  {
    id: 'client-birthday',
    name: 'Aniversário de Cliente',
    description: 'Lembre dos aniversários dos seus clientes',
    category: 'atendimento',
    icon: '🎂',
    trigger: {
      type: 'birthday',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          title: '🎂 Aniversário Hoje',
          message: 'Cliente: {{clientName}}\nEmpresa: {{company}}\n\nEnvie uma mensagem especial para fortalecer o relacionamento.',
          priority: 'medium',
        },
      },
    ],
    difficulty: 'fácil',
  },
  
  // Contrato Vencendo
  {
    id: 'contract-expiring',
    name: 'Contrato Vencendo',
    description: 'Alerta quando contratos estiverem próximos do vencimento',
    category: 'financeiro',
    icon: '⚠️',
    trigger: {
      type: 'contract_expiring',
    },
    conditions: [
      {
        field: 'daysUntil',
        operator: 'less_than',
        value: 15,
      },
    ],
    actions: [
      {
        type: 'send_notification',
        config: {
          title: '⚠️ Contrato Vencendo em {{daysUntil}} Dias',
          message: 'Cliente: {{clientName}}\nEmpresa: {{company}}\nValor: R$ {{value}}/ano\n\nAgendar reunião para renovação.',
          priority: 'high',
        },
      },
    ],
    difficulty: 'intermediário',
  },

  // Projeto Próximo do Prazo
  {
    id: 'project-deadline-near',
    name: 'Projeto com Prazo Próximo',
    description: 'Alerta para projetos próximos do deadline',
    category: 'produtividade',
    icon: '📁',
    trigger: {
      type: 'project_progress_changed',
    },
    conditions: [
      {
        field: 'daysUntil',
        operator: 'less_than',
        value: 7,
      },
    ],
    actions: [
      {
        type: 'send_notification',
        config: {
          title: '📁 Projeto Próximo do Prazo',
          message: 'Projeto: {{projectName}}\nCliente: {{clientName}}\nPrazo: {{daysUntil}} dias\nProgresso: {{progress}}%\n\nRevisar timeline e recursos.',
          priority: 'high',
        },
      },
    ],
    difficulty: 'intermediário',
  },
];

// Helper para obter templates por categoria
export const getTemplatesByCategory = (category: string) => {
  return automationTemplates.filter(t => t.category === category);
};

// Helper para obter template por ID
export const getTemplateById = (id: string) => {
  return automationTemplates.find(t => t.id === id);
};

// Categorias disponíveis
export const categories = [
  { value: 'vendas', label: '💰 Vendas', color: 'green' },
  { value: 'produtividade', label: '⚡ Produtividade', color: 'blue' },
  { value: 'atendimento', label: '🤝 Atendimento', color: 'purple' },
  { value: 'financeiro', label: '💵 Financeiro', color: 'emerald' },
  { value: 'marketing', label: '📣 Marketing', color: 'pink' },
];

