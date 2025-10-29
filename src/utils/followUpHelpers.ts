import { FollowUp, FollowUpStatus } from "@/types/followup";
import { differenceInDays, differenceInHours, isToday, isPast, isFuture, format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Calcula o status automático baseado na data de vencimento
 */
export const calculateFollowUpStatus = (followUp: FollowUp): FollowUpStatus => {
  try {
    // Se já foi marcado como feito ou cancelado, mantém o status
    if (followUp.status === 'feito' || followUp.status === 'cancelado') {
      return followUp.status;
    }

    if (!followUp.due_date) {
      return 'pendente';
    }

    const now = new Date();
    const dueDate = new Date(followUp.due_date);

    // Verifica se a data é válida
    if (isNaN(dueDate.getTime())) {
      console.warn("Data inválida no follow-up:", followUp);
      return 'pendente';
    }

    // Se já passou da data → atrasado
    if (isPast(dueDate) && !isToday(dueDate)) {
      return 'atrasado';
    }

    // Se é hoje ou nas próximas 24h → pendente (será marcado como "próximo" na UI)
    return 'pendente';
  } catch (error) {
    console.error("Erro ao calcular status do follow-up:", error);
    return 'pendente';
  }
};

/**
 * Retorna a classe de cor baseada no status
 */
export const getFollowUpStatusColor = (followUp: FollowUp): string => {
  const status = calculateFollowUpStatus(followUp);

  const colorMap: Record<FollowUpStatus, string> = {
    pendente: 'bg-success/10 border-success/30 text-success',
    atrasado: 'bg-danger/10 border-danger/30 text-danger',
    feito: 'bg-muted/10 border-muted/30 text-muted-foreground',
    cancelado: 'bg-muted/10 border-muted/30 text-muted-foreground'
  };

  return colorMap[status];
};

/**
 * Retorna o ícone baseado no status
 */
export const getFollowUpStatusIcon = (followUp: FollowUp): string => {
  const status = calculateFollowUpStatus(followUp);

  const iconMap: Record<FollowUpStatus, string> = {
    pendente: '🟢',
    atrasado: '🔴',
    feito: '✅',
    cancelado: '❌'
  };

  return iconMap[status];
};

/**
 * Retorna o label do status
 */
export const getFollowUpStatusLabel = (followUp: FollowUp): string => {
  const status = calculateFollowUpStatus(followUp);
  const dueDate = new Date(followUp.due_date);
  const hoursUntilDue = differenceInHours(dueDate, new Date());

  if (status === 'pendente') {
    if (isToday(dueDate)) {
      return 'Hoje';
    }
    if (hoursUntilDue <= 24 && hoursUntilDue > 0) {
      return 'Próximas 24h';
    }
    return 'Agendado';
  }

  const labelMap: Record<FollowUpStatus, string> = {
    pendente: 'Agendado',
    atrasado: 'Atrasado',
    feito: 'Concluído',
    cancelado: 'Cancelado'
  };

  return labelMap[status];
};

/**
 * Formata a data de vencimento de forma amigável
 */
export const formatFollowUpDate = (date: Date): string => {
  const dueDate = new Date(date);
  
  if (isToday(dueDate)) {
    return `Hoje às ${format(dueDate, 'HH:mm')}`;
  }

  return format(dueDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

/**
 * Verifica se o follow-up está próximo (próximas 24h)
 */
export const isFollowUpUpcoming = (followUp: FollowUp): boolean => {
  const dueDate = new Date(followUp.due_date);
  const hoursUntilDue = differenceInHours(dueDate, new Date());
  
  return hoursUntilDue <= 24 && hoursUntilDue > 0;
};

/**
 * Verifica se o follow-up está atrasado
 */
export const isFollowUpOverdue = (followUp: FollowUp): boolean => {
  try {
    if (!followUp || followUp.status === 'feito' || followUp.status === 'cancelado') {
      return false;
    }
    
    if (!followUp.due_date) {
      return false;
    }
    
    const dueDate = new Date(followUp.due_date);
    if (isNaN(dueDate.getTime())) {
      return false;
    }
    
    return isPast(dueDate) && !isToday(dueDate);
  } catch (error) {
    console.error("Erro ao verificar se follow-up está atrasado:", error);
    return false;
  }
};

/**
 * Filtra follow-ups por período
 */
export const filterFollowUpsByPeriod = (
  followUps: FollowUp[],
  period: 'today' | 'overdue' | 'upcoming' | 'all'
): FollowUp[] => {
  if (!followUps || !Array.isArray(followUps)) return [];
  
  const now = new Date();

  try {
    switch (period) {
      case 'today':
        return followUps.filter(f => {
          try {
            return f.status !== 'feito' && 
              f.status !== 'cancelado' && 
              f.due_date &&
              isToday(new Date(f.due_date));
          } catch {
            return false;
          }
        });

      case 'overdue':
        return followUps.filter(f => {
          try {
            return isFollowUpOverdue(f);
          } catch {
            return false;
          }
        });

      case 'upcoming':
        return followUps.filter(f => {
          try {
            if (f.status === 'feito' || f.status === 'cancelado' || !f.due_date) return false;
            const dueDate = new Date(f.due_date);
            if (isNaN(dueDate.getTime())) return false;
            const daysUntilDue = differenceInDays(dueDate, now);
            return daysUntilDue >= 0 && daysUntilDue <= 7 && !isToday(dueDate);
          } catch {
            return false;
          }
        });

      case 'all':
      default:
        return followUps.filter(f => 
          f.status !== 'feito' && 
          f.status !== 'cancelado'
        );
    }
  } catch (error) {
    console.error("Erro ao filtrar follow-ups:", error);
    return [];
  }
};

/**
 * Ordena follow-ups por urgência (atrasados primeiro, depois por data)
 */
export const sortFollowUpsByUrgency = (followUps: FollowUp[]): FollowUp[] => {
  if (!followUps || !Array.isArray(followUps)) return [];
  
  try {
    return [...followUps].sort((a, b) => {
      try {
        const aOverdue = isFollowUpOverdue(a);
        const bOverdue = isFollowUpOverdue(b);

        // Atrasados primeiro
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        // Depois por data de vencimento
        const aTime = a.due_date ? new Date(a.due_date).getTime() : 0;
        const bTime = b.due_date ? new Date(b.due_date).getTime() : 0;
        
        if (isNaN(aTime) || isNaN(bTime)) return 0;
        
        return aTime - bTime;
      } catch {
        return 0;
      }
    });
  } catch (error) {
    console.error("Erro ao ordenar follow-ups:", error);
    return followUps;
  }
};

/**
 * Cria um novo follow-up automático baseado na mudança de etapa
 */
export const createAutoFollowUp = (
  leadId: string,
  fromStage: string,
  toStage: string,
  responsavel: string
): Partial<FollowUp> | null => {
  const now = new Date();
  
  // Regras de criação automática - expandidas
  const rules: Record<string, { days: number; titulo: string; descricao: string; prioridade?: 'baixa' | 'media' | 'alta' }> = {
    // De Novas Oportunidades para Reunião Agendada
    'new_to_meeting': {
      days: 1,
      titulo: 'Confirmar presença na reunião',
      descricao: 'Enviar lembrete 1 dia antes da reunião para confirmar presença do cliente',
      prioridade: 'alta'
    },
    // De Reunião Agendada para Proposta Enviada
    'meeting_to_proposal': {
      days: 2,
      titulo: 'Acompanhar recebimento da proposta',
      descricao: 'Verificar se o cliente recebeu e está revisando a proposta comercial',
      prioridade: 'alta'
    },
    // De Proposta Enviada para Negociação
    'proposal_to_negotiation': {
      days: 3,
      titulo: 'Verificar dúvidas sobre a proposta',
      descricao: 'Entrar em contato para esclarecer dúvidas e entender objeções',
      prioridade: 'alta'
    },
    // De Negociação para Fechado
    'negotiation_to_won': {
      days: 1,
      titulo: 'Enviar contrato e próximos passos',
      descricao: 'Enviar documentação, contrato e agendar kickoff do projeto',
      prioridade: 'alta'
    },
    // Se ficou parado em Novas Oportunidades (fallback)
    'new_to_proposal': {
      days: 2,
      titulo: 'Enviar proposta comercial',
      descricao: 'Cliente pulou etapa de reunião - enviar proposta diretamente',
      prioridade: 'media'
    },
    // Se voltou de Negociação para Proposta (retrabalho)
    'negotiation_to_proposal': {
      days: 2,
      titulo: 'Ajustar e reenviar proposta',
      descricao: 'Cliente solicitou alterações - revisar proposta e reenviar',
      prioridade: 'alta'
    },
    // Se voltou de Proposta para Reunião (reagendar)
    'proposal_to_meeting': {
      days: 1,
      titulo: 'Reagendar reunião com o cliente',
      descricao: 'Cliente precisa de mais informações antes da proposta - agendar nova reunião',
      prioridade: 'alta'
    },
    // Se voltou de Reunião para Novas Oportunidades
    'meeting_to_new': {
      days: 1,
      titulo: 'Retomar contato inicial',
      descricao: 'Reunião não aconteceu ou foi cancelada - retomar o primeiro contato',
      prioridade: 'media'
    },
    // Se voltou de Negociação para Reunião
    'negotiation_to_meeting': {
      days: 1,
      titulo: 'Agendar reunião de revisão',
      descricao: 'Cliente precisa discutir pontos da negociação - agendar reunião presencial',
      prioridade: 'alta'
    },
    // Se voltou de Proposta para Novas Oportunidades (reset completo)
    'proposal_to_new': {
      days: 2,
      titulo: 'Requalificar lead',
      descricao: 'Lead voltou ao início - verificar interesse real e requalificar',
      prioridade: 'media'
    },
    // Se moveu de Qualificados para Reunião
    'qualified_to_meeting': {
      days: 1,
      titulo: 'Preparar reunião de qualificação',
      descricao: 'Preparar apresentação e materiais para reunião de qualificação',
      prioridade: 'media'
    },
    // De Novas Oportunidades para Qualificados
    'new_to_qualified': {
      days: 1,
      titulo: 'Iniciar qualificação do lead',
      descricao: 'Fazer perguntas de qualificação e entender necessidades do cliente',
      prioridade: 'media'
    }
  };

  const ruleKey = `${fromStage}_to_${toStage}`;
  const rule = rules[ruleKey];

  if (!rule) return null;

  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + rule.days);
  dueDate.setHours(10, 0, 0, 0); // 10h da manhã

  return {
    lead_id: leadId,
    titulo: rule.titulo,
    descricao: rule.descricao,
    due_date: dueDate,
    status: 'pendente',
    prioridade: rule.prioridade || 'media',
    responsavel,
    stage_id: toStage,
    is_automatico: true
  };
};

/**
 * Retorna contador de follow-ups por status para um lead
 */
export const getFollowUpCountsByLead = (followUps: FollowUp[], leadId: string) => {
  const leadFollowUps = followUps.filter(f => f.lead_id === leadId);
  
  return {
    total: leadFollowUps.filter(f => f.status !== 'feito' && f.status !== 'cancelado').length,
    atrasados: leadFollowUps.filter(f => isFollowUpOverdue(f)).length,
    hoje: leadFollowUps.filter(f => 
      f.status !== 'feito' && 
      f.status !== 'cancelado' && 
      isToday(new Date(f.due_date))
    ).length,
    proximos: leadFollowUps.filter(f => isFollowUpUpcoming(f)).length
  };
};

