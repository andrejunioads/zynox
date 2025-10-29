/**
 * 🧠 HELPERS INTELIGENTES PARA CAMPOS DE AUTOMAÇÃO
 * 
 * Define campos disponíveis para cada gatilho e opções de valores
 */

import { TriggerType } from '@/types/automation';

export interface FieldOption {
  value: string;
  label: string;
  type: 'text' | 'number' | 'select';
  operators: Array<'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains'>;
  options?: Array<{ value: string; label: string }>; // Para campos tipo select
  placeholder?: string;
  prefix?: string; // Ex: "R$" para valores monetários
}

/**
 * Campos disponíveis para cada tipo de gatilho
 */
export const getFieldsForTrigger = (triggerType: TriggerType): FieldOption[] => {
  const commonLeadFields: FieldOption[] = [
    {
      value: 'name',
      label: '👤 Nome do Lead',
      type: 'text',
      operators: ['equals', 'contains', 'not_contains'],
      placeholder: 'Ex: João Silva',
    },
    {
      value: 'company',
      label: '🏢 Empresa',
      type: 'text',
      operators: ['equals', 'contains', 'not_contains'],
      placeholder: 'Ex: Tech Corp',
    },
    {
      value: 'value',
      label: '💰 Valor',
      type: 'number',
      operators: ['equals', 'greater_than', 'less_than'],
      placeholder: 'Ex: 10000',
      prefix: 'R$',
    },
    {
      value: 'origin',
      label: '📍 Origem',
      type: 'select',
      operators: ['equals', 'not_equals'],
      options: [
        { value: 'Instagram', label: '📸 Instagram' },
        { value: 'WhatsApp', label: '💬 WhatsApp' },
        { value: 'Site', label: '🌐 Site' },
        { value: 'Indicação', label: '🤝 Indicação' },
        { value: 'LinkedIn', label: '💼 LinkedIn' },
        { value: 'Google', label: '🔍 Google' },
        { value: 'Outro', label: '📋 Outro' },
      ],
    },
    {
      value: 'status',
      label: '🎯 Temperatura',
      type: 'select',
      operators: ['equals', 'not_equals'],
      options: [
        { value: 'Frio', label: '❄️ Frio' },
        { value: 'Morno', label: '☀️ Morno' },
        { value: 'Quente', label: '🔥 Quente' },
      ],
    },
  ];

  const stageFields: FieldOption[] = [
    {
      value: 'oldStage',
      label: '📊 Etapa Anterior',
      type: 'select',
      operators: ['equals', 'not_equals'],
      options: [
        { value: 'new', label: '🆕 Novas Oportunidades' },
        { value: 'meeting', label: '📅 Reunião Agendada' },
        { value: 'proposal', label: '📄 Proposta Enviada' },
        { value: 'negotiation', label: '💬 Negociação' },
        { value: 'won', label: '✅ Fechado' },
        { value: 'lost', label: '❌ Perdido' },
      ],
    },
    {
      value: 'newStage',
      label: '📊 Nova Etapa',
      type: 'select',
      operators: ['equals', 'not_equals'],
      options: [
        { value: 'new', label: '🆕 Novas Oportunidades' },
        { value: 'meeting', label: '📅 Reunião Agendada' },
        { value: 'proposal', label: '📄 Proposta Enviada' },
        { value: 'negotiation', label: '💬 Negociação' },
        { value: 'won', label: '✅ Fechado' },
        { value: 'lost', label: '❌ Perdido' },
      ],
    },
  ];

  const projectFields: FieldOption[] = [
    {
      value: 'projectName',
      label: '📁 Nome do Projeto',
      type: 'text',
      operators: ['equals', 'contains'],
      placeholder: 'Ex: Website',
    },
    {
      value: 'clientName',
      label: '👤 Cliente',
      type: 'text',
      operators: ['equals', 'contains'],
      placeholder: 'Ex: Tech Corp',
    },
    {
      value: 'progress',
      label: '📈 Progresso (%)',
      type: 'number',
      operators: ['equals', 'greater_than', 'less_than'],
      placeholder: 'Ex: 50',
      prefix: '%',
    },
    {
      value: 'status',
      label: '🎯 Status',
      type: 'select',
      operators: ['equals', 'not_equals'],
      options: [
        { value: 'Novo', label: '🆕 Novo' },
        { value: 'Em Andamento', label: '⏳ Em Andamento' },
        { value: 'Em Revisão', label: '🔍 Em Revisão' },
        { value: 'Concluído', label: '✅ Concluído' },
        { value: 'Pausado', label: '⏸️ Pausado' },
      ],
    },
  ];

  const financialFields: FieldOption[] = [
    {
      value: 'amount',
      label: '💰 Valor',
      type: 'number',
      operators: ['equals', 'greater_than', 'less_than'],
      placeholder: 'Ex: 5000',
      prefix: 'R$',
    },
    {
      value: 'category',
      label: '📂 Categoria',
      type: 'select',
      operators: ['equals', 'not_equals'],
      options: [
        { value: 'Marketing', label: '📣 Marketing' },
        { value: 'Infraestrutura', label: '🖥️ Infraestrutura' },
        { value: 'Pessoal', label: '👥 Pessoal' },
        { value: 'Vendas', label: '💼 Vendas' },
        { value: 'Operacional', label: '⚙️ Operacional' },
        { value: 'Outro', label: '📋 Outro' },
      ],
    },
    {
      value: 'clientName',
      label: '👤 Cliente',
      type: 'text',
      operators: ['equals', 'contains'],
      placeholder: 'Ex: Tech Corp',
    },
  ];

  const taskFields: FieldOption[] = [
    {
      value: 'taskName',
      label: '✅ Nome da Tarefa',
      type: 'text',
      operators: ['equals', 'contains'],
      placeholder: 'Ex: Revisar proposta',
    },
    {
      value: 'assignedTo',
      label: '👤 Atribuída para',
      type: 'text',
      operators: ['equals', 'contains'],
      placeholder: 'Ex: João Silva',
    },
    {
      value: 'priority',
      label: '⚡ Prioridade',
      type: 'select',
      operators: ['equals', 'not_equals'],
      options: [
        { value: 'Baixa', label: '🟢 Baixa' },
        { value: 'Média', label: '🟡 Média' },
        { value: 'Alta', label: '🔴 Alta' },
        { value: 'Urgente', label: '🚨 Urgente' },
      ],
    },
  ];

  // Mapear campos para cada gatilho
  switch (triggerType) {
    case 'lead_created':
    case 'lead_updated':
      return commonLeadFields;

    case 'lead_stage_changed':
      return [...commonLeadFields, ...stageFields];

    case 'project_created':
    case 'project_status_changed':
      return projectFields;

    case 'project_progress_changed':
      return projectFields;

    case 'payment_received':
    case 'expense_added':
      return financialFields;

    case 'task_created':
    case 'task_completed':
      return taskFields;

    case 'client_inactive':
      return [
        {
          value: 'clientName',
          label: '👤 Nome do Cliente',
          type: 'text',
          operators: ['equals', 'contains'],
          placeholder: 'Ex: Tech Corp',
        },
        {
          value: 'daysInactive',
          label: '📅 Dias Inativo',
          type: 'number',
          operators: ['equals', 'greater_than', 'less_than'],
          placeholder: 'Ex: 30',
          prefix: 'dias',
        },
      ];

    case 'contract_expiring':
      return [
        {
          value: 'clientName',
          label: '👤 Nome do Cliente',
          type: 'text',
          operators: ['equals', 'contains'],
          placeholder: 'Ex: Tech Corp',
        },
        {
          value: 'daysUntil',
          label: '⏰ Dias até Vencer',
          type: 'number',
          operators: ['equals', 'greater_than', 'less_than'],
          placeholder: 'Ex: 15',
          prefix: 'dias',
        },
        {
          value: 'value',
          label: '💰 Valor do Contrato',
          type: 'number',
          operators: ['equals', 'greater_than', 'less_than'],
          placeholder: 'Ex: 50000',
          prefix: 'R$',
        },
      ];

    case 'birthday':
      return [
        {
          value: 'clientName',
          label: '👤 Nome do Cliente',
          type: 'text',
          operators: ['equals', 'contains'],
          placeholder: 'Ex: João Silva',
        },
        {
          value: 'company',
          label: '🏢 Empresa',
          type: 'text',
          operators: ['equals', 'contains'],
          placeholder: 'Ex: Tech Corp',
        },
      ];

    case 'followup_overdue':
      return [
        {
          value: 'count',
          label: '📊 Quantidade',
          type: 'number',
          operators: ['equals', 'greater_than', 'less_than'],
          placeholder: 'Ex: 5',
          prefix: 'follow-ups',
        },
      ];

    default:
      return commonLeadFields;
  }
};

/**
 * Labels amigáveis para operadores
 */
export const operatorLabels: Record<string, string> = {
  equals: '= Igual a',
  not_equals: '≠ Diferente de',
  greater_than: '> Maior que',
  less_than: '< Menor que',
  contains: '⊃ Contém',
  not_contains: '⊅ Não contém',
};

/**
 * Obter operadores disponíveis para um campo
 */
export const getOperatorsForField = (field: FieldOption | undefined) => {
  if (!field) return [];
  
  return field.operators.map(op => ({
    value: op,
    label: operatorLabels[op],
  }));
};

/**
 * Validar valor baseado no tipo de campo
 */
export const validateFieldValue = (field: FieldOption | undefined, value: any): boolean => {
  if (!field) return false;
  
  if (field.type === 'number') {
    return !isNaN(Number(value)) && value !== '';
  }
  
  if (field.type === 'text') {
    return value.trim().length > 0;
  }
  
  if (field.type === 'select') {
    return value !== '';
  }
  
  return true;
};



