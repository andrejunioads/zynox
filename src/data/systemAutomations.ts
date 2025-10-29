/**
 * 🤖 AUTOMAÇÕES DO SISTEMA
 * 
 * Automações pré-configuradas que são instaladas automaticamente
 * quando o usuário abre o sistema pela primeira vez
 */

import { Automation } from '@/types/automation';

export const systemAutomations: Omit<Automation, 'id' | 'createdAt' | 'updatedAt' | 'executionCount'>[] = [
  // ===== ANIVERSÁRIOS =====
  {
    name: 'Aniversário de Cliente',
    description: 'Notifica quando é aniversário de um cliente',
    enabled: true,
    defaultTitle: '🎂 Aniversário Hoje!',
    defaultPriority: 'medium',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Cliente: {{clientName}}\nEmpresa: {{company}}\nIdade: {{age}} anos\n\nEnvie uma mensagem especial para fortalecer o relacionamento.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },

  // ===== CONTRATOS =====
  {
    name: 'Contrato Vencendo (30 dias)',
    description: 'Alerta 30 dias antes do contrato vencer',
    enabled: true,
    defaultTitle: '⚠️ Contrato Vencendo em 30 Dias',
    defaultPriority: 'medium',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Cliente: {{clientName}}\nEmpresa: {{company}}\nValor Anual: R$ {{value}}\n\nIniciar processo de renovação.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Contrato Vencendo (15 dias)',
    description: 'Alerta 15 dias antes do contrato vencer',
    enabled: true,
    defaultTitle: '⚠️ Contrato Vencendo em 15 Dias',
    defaultPriority: 'high',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Cliente: {{clientName}}\nEmpresa: {{company}}\nValor Anual: R$ {{value}}\n\nAgendar reunião para renovação urgente.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Contrato Vencendo (7 dias)',
    description: 'Alerta 7 dias antes do contrato vencer',
    enabled: true,
    defaultTitle: '🚨 Contrato Vencendo em 7 Dias',
    defaultPriority: 'urgent',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Cliente: {{clientName}}\nEmpresa: {{company}}\nValor Anual: R$ {{value}}\n\nPRAZO CRÍTICO. Negociar renovação imediatamente.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Contrato Vencendo (3 dias)',
    description: 'Alerta 3 dias antes do contrato vencer',
    enabled: true,
    defaultTitle: '🔴 Contrato Vencendo em 3 Dias',
    defaultPriority: 'urgent',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Cliente: {{clientName}}\nEmpresa: {{company}}\nValor Anual: R$ {{value}}\n\nÚLTIMA CHANCE. Contato urgente necessário.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },

  // ===== PROJETOS =====
  {
    name: 'Projeto com Prazo Próximo (7 dias)',
    description: 'Alerta para projetos que vencem em 7 dias',
    enabled: true,
    defaultTitle: '📁 Projeto Próximo do Prazo',
    defaultPriority: 'medium',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Projeto: {{projectName}}\nCliente: {{clientName}}\nPrazo: 7 dias\nProgresso: {{progress}}%\n\nRevisar timeline e recursos.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Projeto com Prazo Próximo (3 dias)',
    description: 'Alerta para projetos que vencem em 3 dias',
    enabled: true,
    defaultTitle: '⏰ Projeto Próximo do Prazo',
    defaultPriority: 'high',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Projeto: {{projectName}}\nCliente: {{clientName}}\nPrazo: 3 dias\nProgresso: {{progress}}%\n\nPRAZO CRÍTICO. Priorizar entrega.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Projeto com Prazo Próximo (1 dia)',
    description: 'Alerta para projetos que vencem amanhã',
    enabled: true,
    defaultTitle: '🚨 Projeto Vence Amanhã',
    defaultPriority: 'urgent',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Projeto: {{projectName}}\nCliente: {{clientName}}\nPrazo: 1 dia\nProgresso: {{progress}}%\n\nENTREGA URGENTE. Mobilizar equipe.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Projeto Vencendo HOJE',
    description: 'Alerta para projetos que vencem hoje',
    enabled: true,
    defaultTitle: '🔴 Projeto Vence HOJE',
    defaultPriority: 'urgent',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Projeto: {{projectName}}\nCliente: {{clientName}}\nProgresso: {{progress}}%\n\nDEADLINE HOJE. Finalizar imediatamente.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },

  // ===== FOLLOW-UPS =====
  {
    name: 'Follow-ups Atrasados',
    description: 'Notifica quando há follow-ups atrasados',
    enabled: true,
    defaultTitle: '⏰ Follow-ups Atrasados',
    defaultPriority: 'high',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Quantidade: {{count}} follow-ups atrasados\n\nRetorne os contatos hoje.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },

  // ===== CLIENTES INATIVOS =====
  {
    name: 'Cliente Inativo (30 dias)',
    description: 'Alerta para cliente sem interação há 30 dias',
    enabled: true,
    defaultTitle: '😴 Cliente Inativo há 30 Dias',
    defaultPriority: 'medium',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Cliente: {{clientName}}\nEmpresa: {{company}}\nÚltima Interação: 30 dias atrás\n\nRetomar contato para manter relacionamento.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Cliente Inativo (60 dias)',
    description: 'Alerta para cliente sem interação há 60 dias',
    enabled: true,
    defaultTitle: '⚠️ Cliente Inativo há 60 Dias',
    defaultPriority: 'high',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Cliente: {{clientName}}\nEmpresa: {{company}}\nÚltima Interação: 60 dias atrás\n\nRISCO DE PERDA. Reagendar reunião urgente.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Cliente Inativo (90 dias)',
    description: 'Alerta para cliente sem interação há 90 dias',
    enabled: true,
    defaultTitle: '🚨 Cliente Inativo há 90 Dias',
    defaultPriority: 'urgent',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Cliente: {{clientName}}\nEmpresa: {{company}}\nÚltima Interação: 90 dias atrás\n\nCRÍTICO. Cliente em risco de churn.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },

  // ===== CRM / COMERCIAL =====
  {
    name: 'Lead Parado em Etapa (7 dias)',
    description: 'Alerta quando lead fica parado em uma etapa por 7 dias',
    enabled: true,
    defaultTitle: '🐌 Lead Parado há 7 Dias',
    defaultPriority: 'high',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Lead: {{name}}\nEmpresa: {{company}}\nEtapa: {{stage}}\nValor: R$ {{value}}\n\nRetomar contato urgente para não perder oportunidade.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Lead Movido para Perdido',
    description: 'Notifica quando um lead é marcado como perdido',
    enabled: true,
    defaultTitle: '❌ Lead Perdido — Analisar Motivo',
    defaultPriority: 'medium',
    trigger: {
      type: 'lead_stage_changed',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Lead: {{name}}\nEmpresa: {{company}}\nValor: R$ {{value}}\nEtapa Anterior: {{previousStage}}\n\nRegistrar motivo da perda para melhorar processo.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Lead de Alto Valor Criado',
    description: 'Alerta para leads com valor acima de R$ 20.000',
    enabled: true,
    defaultTitle: '💎 Oportunidade de Alto Valor!',
    defaultPriority: 'high',
    trigger: {
      type: 'lead_created',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Lead: {{name}}\nEmpresa: {{company}}\nValor: R$ {{value}}\nOrigem: {{origin}}\n\nPriorizar atendimento. Alta conversão potencial.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Lembrete de Reunião (1 hora antes)',
    description: 'Lembrete 1 hora antes de reuniões agendadas',
    enabled: true,
    defaultTitle: '📅 Reunião em 1 Hora',
    defaultPriority: 'high',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Cliente: {{clientName}}\nEmpresa: {{company}}\nHorário: {{meetingTime}}\n\nPreparar materiais e revisar histórico do cliente.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Lead Sem Interação (14 dias)',
    description: 'Alerta para leads sem interação há 14 dias',
    enabled: true,
    defaultTitle: '😴 Lead Sem Interação há 14 Dias',
    defaultPriority: 'medium',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Lead: {{name}}\nEmpresa: {{company}}\nEtapa: {{stage}}\nÚltima Interação: {{lastInteraction}}\n\nRetomar contato para não esfriar.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },

  // ===== PROJETOS (continuação) =====
  {
    name: 'Projeto Sem Atualização (5 dias)',
    description: 'Alerta quando projeto não tem atualização de progresso há 5 dias',
    enabled: true,
    defaultTitle: '📈 Projeto Sem Atualização há 5 Dias',
    defaultPriority: 'medium',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Projeto: {{projectName}}\nCliente: {{clientName}}\nProgresso: {{progress}}%\nStatus: {{status}}\n\nAtualizar progresso ou verificar bloqueios.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Projeto com Progresso Baixo',
    description: 'Alerta quando progresso está abaixo do esperado',
    enabled: true,
    defaultTitle: '⚠️ Projeto Atrasado — Progresso Baixo',
    defaultPriority: 'high',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Projeto: {{projectName}}\nCliente: {{clientName}}\nProgresso: {{progress}}%\nEsperado: {{expectedProgress}}%\nPrazo: {{daysUntilDeadline}} dias\n\nRevisar timeline e recursos urgente.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Projeto Concluído',
    description: 'Celebra quando um projeto é finalizado',
    enabled: true,
    defaultTitle: '🎉 Projeto Concluído!',
    defaultPriority: 'medium',
    trigger: {
      type: 'project_completed',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Projeto: {{projectName}}\nCliente: {{clientName}}\nDuração: {{duration}} dias\nEquipe: {{teamMembers}}\n\nParabéns! Solicitar feedback do cliente.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },

  // ===== FINANCEIRO =====
  {
    name: 'Receita Grande Registrada',
    description: 'Notifica quando uma receita acima de R$ 10.000 é registrada',
    enabled: true,
    defaultTitle: '💰 Receita Grande Recebida!',
    defaultPriority: 'high',
    trigger: {
      type: 'payment_received',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Cliente: {{clientName}}\nValor: R$ {{amount}}\nFatura: {{invoiceNumber}}\nMétodo: {{paymentMethod}}\n\nReceita adicionada ao caixa.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Despesa Grande Registrada',
    description: 'Alerta para despesas acima de R$ 3.000',
    enabled: true,
    defaultTitle: '🚨 Despesa Grande Registrada',
    defaultPriority: 'high',
    trigger: {
      type: 'expense_added',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Valor: R$ {{amount}}\nCategoria: {{category}}\nDescrição: {{description}}\nResponsável: {{responsible}}\n\nRevisar e aprovar.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Meta Mensal Atingida',
    description: 'Celebra quando a meta mensal de faturamento é atingida',
    enabled: true,
    defaultTitle: '🎯 Meta Mensal Atingida!',
    defaultPriority: 'medium',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Faturamento: R$ {{revenue}}\nMeta: R$ {{goal}}\nPercentual: {{percentage}}%\nCrescimento: +{{growth}}% vs mês anterior\n\nParabéns equipe! 🚀',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Faturamento Baixo no Mês',
    description: 'Alerta quando faturamento está abaixo de 50% da meta',
    enabled: true,
    defaultTitle: '📉 Faturamento Abaixo da Meta',
    defaultPriority: 'high',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Faturamento Atual: R$ {{revenue}}\nMeta: R$ {{goal}}\nPercentual: {{percentage}}%\nDias Restantes: {{daysLeft}}\n\nAcelerar vendas e fechar negociações pendentes.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },

  // ===== EQUIPE =====
  {
    name: 'Novo Membro Adicionado',
    description: 'Notifica quando um novo membro entra na equipe',
    enabled: true,
    defaultTitle: '👋 Novo Membro na Equipe!',
    defaultPriority: 'medium',
    trigger: {
      type: 'member_added',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Nome: {{memberName}}\nCargo: {{role}}\nDepartamento: {{department}}\nEmail: {{email}}\n\nBoas-vindas! Iniciar onboarding.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Membro com Tarefas Atrasadas',
    description: 'Alerta quando membro tem 3+ tarefas atrasadas',
    enabled: true,
    defaultTitle: '⏰ Membro com Tarefas Atrasadas',
    defaultPriority: 'high',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Membro: {{memberName}}\nTarefas Atrasadas: {{overdueCount}}\nMais Antiga: {{oldestTask}} ({{daysOverdue}} dias)\n\nRealizar 1:1 para identificar bloqueios.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Membro Inativo',
    description: 'Alerta quando membro não registra atividade há 3 dias',
    enabled: true,
    defaultTitle: '😴 Membro Sem Atividade há 3 Dias',
    defaultPriority: 'medium',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Membro: {{memberName}}\nÚltima Atividade: {{lastActivity}}\nTarefas Pendentes: {{pendingTasks}}\n\nVerificar se há algum problema.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },

  // ===== HEALTH SCORE =====
  {
    name: 'Cliente com Health Score Baixo',
    description: 'Alerta para clientes com health score abaixo de 40%',
    enabled: true,
    defaultTitle: '🔴 Cliente em Risco — Health Score Baixo',
    defaultPriority: 'urgent',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Cliente: {{clientName}}\nEmpresa: {{company}}\nHealth Score: {{healthScore}}%\nMotivo: {{reason}}\n\nAgendar call urgente para recuperar relacionamento.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Health Score Caindo Rapidamente',
    description: 'Alerta quando health score cai mais de 20% em 7 dias',
    enabled: true,
    defaultTitle: '📉 Health Score Caindo Rapidamente',
    defaultPriority: 'urgent',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Cliente: {{clientName}}\nEmpresa: {{company}}\nScore Atual: {{currentScore}}%\nScore Anterior: {{previousScore}}%\nQueda: -{{drop}}%\n\nAtenção urgente necessária!',
        },
      },
    ],
    lastExecutedAt: undefined,
  },

  // ===== PERFORMANCE & INSIGHTS =====
  {
    name: 'Resumo Semanal',
    description: 'Envia resumo de performance toda segunda-feira',
    enabled: true,
    defaultTitle: '📊 Resumo da Semana',
    defaultPriority: 'low',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Novos Leads: {{newLeads}}\nVendas Fechadas: {{closedDeals}}\nFaturamento: R$ {{revenue}}\nProjetos Concluídos: {{completedProjects}}\nTaxa de Conversão: {{conversionRate}}%\n\nContinue assim! 🚀',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
  {
    name: 'Tendência Positiva Detectada',
    description: 'Celebra quando o sistema detecta uma tendência positiva',
    enabled: true,
    defaultTitle: '🔥 Tendência Positiva Detectada!',
    defaultPriority: 'medium',
    trigger: {
      type: 'scheduled',
    },
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: {
          message: 'Métrica: {{metric}}\nCrescimento: +{{growth}}%\nPeríodo: Últimos {{period}} dias\n\nSeu sistema tá rodando liso! Continue assim.',
        },
      },
    ],
    lastExecutedAt: undefined,
  },
];

