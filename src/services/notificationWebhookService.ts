/**
 * 🔔 NOTIFICATION WEBHOOK SERVICE
 * 
 * Serviço para enviar todos os eventos de notificação para um webhook n8n configurado
 */

import { STORAGE_KEYS } from '@/config/storage';
import { safeParse, safeStringify } from '@/lib/safeParse';

export interface NotificationEvent {
  tipo: 'lead' | 'meeting' | 'task' | 'project' | 'financial' | 'team' | 'followup' | 'stage_change' | 'payment' | 'birthday' | 'contract_expiring' | 'project_deadline' | 'custom';
  titulo: string;
  mensagem: string;
  prioridade: 'low' | 'medium' | 'high' | 'urgent' | number; // Aceita string ou número
  actionUrl?: string;
  timestamp: string;
  metadata?: Record<string, any>;
  userId?: string;
  userName?: string;
}

class NotificationWebhookService {
  private webhookUrl: string | null = null;
  private isEnabled: boolean = false;

  constructor() {
    this.loadConfig();
  }

  /**
   * Carregar configuração do localStorage
   */
  private loadConfig() {
    const stored = localStorage.getItem(STORAGE_KEYS.WEBHOOK_CONFIG);
    const config = safeParse<any>(stored, {}, {
      storageKey: STORAGE_KEYS.WEBHOOK_CONFIG,
      silent: true
    });
    
    this.webhookUrl = config.webhookUrl || null;
    this.isEnabled = config.isEnabled !== false; // true por padrão
  }

  /**
   * Salvar configuração no localStorage
   */
  private saveConfig() {
    const config = {
      webhookUrl: this.webhookUrl,
      isEnabled: this.isEnabled,
      lastUpdated: new Date().toISOString()
    };
    
    const json = safeStringify(config, { silent: true });
    if (json) {
      try {
        localStorage.setItem(STORAGE_KEYS.WEBHOOK_CONFIG, json);
      } catch (error) {
        console.error('Erro ao salvar config webhook:', error);
      }
    }
  }

  /**
   * Configurar webhook URL
   */
  setWebhookUrl(url: string) {
    this.webhookUrl = url;
    this.saveConfig();
  }

  /**
   * Obter webhook URL atual
   */
  getWebhookUrl(): string | null {
    return this.webhookUrl;
  }

  /**
   * Ativar/desativar webhook
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    this.saveConfig();
  }

  /**
   * Verificar se webhook está configurado e ativo
   */
  isConfigured(): boolean {
    return Boolean(this.webhookUrl && this.isEnabled);
  }

  /**
   * Converter prioridade de string para número (formato Pushover)
   */
  private priorityToNumber(priority: 'low' | 'medium' | 'high' | 'urgent'): number {
    const map: Record<string, number> = {
      'low': -2,      // Silencioso, sem som
      'medium': 0,    // Normal, som padrão
      'high': 1,      // Alta, som alto
      'urgent': 2     // Urgente, sirene + retry
    };
    return map[priority] ?? 0; // Default: medium (0)
  }

  /**
   * Enviar evento para webhook
   */
  async sendEvent(event: Partial<NotificationEvent>): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('Webhook não configurado ou desativado');
      return false;
    }

    try {
      const prioridade = event.prioridade || 'medium';
      
      // Converter para número se for string
      const prioridadeNum = typeof prioridade === 'number' 
        ? prioridade 
        : this.priorityToNumber(prioridade);
      
      const payload = {
        tipo: event.tipo || 'custom',
        titulo: event.titulo || 'Notificação',
        mensagem: event.mensagem || '',
        prioridade: prioridadeNum,
        actionUrl: event.actionUrl || '/',
        timestamp: event.timestamp || new Date().toISOString(),
        metadata: event.metadata || {},
        userId: event.userId,
        userName: event.userName
      };

      console.log('📤 Enviando evento para webhook:', payload);

      const response = await fetch(this.webhookUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook retornou ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Evento enviado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar evento para webhook:', error);
      return false;
    }
  }

  /**
   * Enviar teste de notificação
   */
  async sendTestNotification(): Promise<{ success: boolean; message: string }> {
    if (!this.webhookUrl) {
      return {
        success: false,
        message: 'Webhook URL não configurada'
      };
    }

    try {
      const testEvent: NotificationEvent = {
        tipo: 'custom',
        titulo: '🧪 Teste de Notificação - Zynox CRM',
        mensagem: 'Esta é uma notificação de teste enviada pelo sistema Zynox. Se você recebeu isso, sua integração está funcionando perfeitamente! 🎉',
        prioridade: 'medium',
        actionUrl: '/configuracoes',
        timestamp: new Date().toISOString(),
        metadata: {
          test: true,
          source: 'zynox_crm',
          version: '1.0.0'
        }
      };

      const success = await this.sendEvent(testEvent);
      
      return {
        success,
        message: success 
          ? 'Notificação de teste enviada com sucesso! Verifique seu celular/n8n.' 
          : 'Erro ao enviar notificação de teste. Verifique a URL do webhook.'
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  /**
   * Helpers para eventos específicos
   */

  // Novo Lead
  sendLeadEvent(leadName: string, origin: string, temperature: string, metadata?: any) {
    return this.sendEvent({
      tipo: 'lead',
      titulo: `🚀 Novo Lead: ${leadName}`,
      mensagem: `Origem: ${origin}\nTemperatura: ${temperature}`,
      prioridade: temperature === 'Quente' ? 'high' : 'medium',
      actionUrl: '/comercial',
      metadata: {
        leadName,
        origin,
        temperature,
        ...metadata
      }
    });
  }

  // Mudança de Etapa
  sendStageChangeEvent(leadName: string, fromStage: string, toStage: string) {
    return this.sendEvent({
      tipo: 'stage_change',
      titulo: `📊 Lead Movido: ${leadName}`,
      mensagem: `De: ${fromStage}\nPara: ${toStage}`,
      prioridade: 'medium',
      actionUrl: '/comercial',
      metadata: {
        leadName,
        fromStage,
        toStage
      }
    });
  }

  // Follow-up Criado
  sendFollowUpEvent(leadName: string, description: string, dueDate: Date) {
    return this.sendEvent({
      tipo: 'followup',
      titulo: `⏰ Follow-up Agendado: ${leadName}`,
      mensagem: `${description}\nData: ${dueDate.toLocaleDateString('pt-BR')}`,
      prioridade: 'medium',
      actionUrl: '/comercial',
      metadata: {
        leadName,
        description,
        dueDate: dueDate.toISOString()
      }
    });
  }

  // Follow-up Atrasado
  sendOverdueFollowUpEvent(count: number) {
    return this.sendEvent({
      tipo: 'followup',
      titulo: `⚠️ ${count} Follow-ups Atrasados`,
      mensagem: `Você tem ${count} follow-ups que precisam de atenção urgente.`,
      prioridade: 'urgent',
      actionUrl: '/comercial?filter=atrasados',
      metadata: {
        count,
        type: 'overdue'
      }
    });
  }

  // Reunião Iminente
  sendMeetingEvent(clientName: string, minutesUntil: number) {
    return this.sendEvent({
      tipo: 'meeting',
      titulo: `📅 Reunião em ${minutesUntil} minutos!`,
      mensagem: `Cliente: ${clientName}\nPrepare-se!`,
      prioridade: 'urgent',
      actionUrl: '/comercial',
      metadata: {
        clientName,
        minutesUntil
      }
    });
  }

  // Pagamento Recebido
  sendPaymentEvent(amount: number, clientName: string, invoiceNumber: string) {
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);

    return this.sendEvent({
      tipo: 'payment',
      titulo: '💰 Pagamento Recebido!',
      mensagem: `${formatted} de ${clientName}\nFatura: ${invoiceNumber}`,
      prioridade: 'high',
      actionUrl: '/financeiro',
      metadata: {
        amount,
        clientName,
        invoiceNumber
      }
    });
  }

  // Projeto Atualizado
  sendProjectEvent(projectName: string, status: string, progress: number) {
    return this.sendEvent({
      tipo: 'project',
      titulo: `📊 Projeto Atualizado: ${projectName}`,
      mensagem: `Status: ${status}\nProgresso: ${progress}%`,
      prioridade: 'medium',
      actionUrl: '/projetos',
      metadata: {
        projectName,
        status,
        progress
      }
    });
  }

  // Novo Membro da Equipe
  sendTeamEvent(memberName: string, role: string) {
    return this.sendEvent({
      tipo: 'team',
      titulo: '👥 Novo Membro Adicionado',
      mensagem: `${memberName} foi adicionado como ${role}`,
      prioridade: 'low',
      actionUrl: '/equipe',
      metadata: {
        memberName,
        role
      }
    });
  }

  // Aniversário de Cliente
  sendBirthdayEvent(clientName: string, company: string, age?: number) {
    const ageText = age ? ` - ${age} anos` : '';
    return this.sendEvent({
      tipo: 'birthday',
      titulo: `🎂 Aniversário Hoje: ${clientName}`,
      mensagem: `${clientName} (${company})${ageText}\nEnvie uma mensagem especial!`,
      prioridade: 'medium',
      actionUrl: '/clientes',
      metadata: {
        clientName,
        company,
        age,
        type: 'birthday'
      }
    });
  }

  // Contrato Próximo do Vencimento
  sendContractExpiringEvent(clientName: string, company: string, daysUntil: number, value: number) {
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);

    const urgency = daysUntil <= 7 ? 'urgent' : daysUntil <= 15 ? 'high' : 'medium';

    return this.sendEvent({
      tipo: 'contract_expiring',
      titulo: `⚠️ Contrato Vencendo em ${daysUntil} dias`,
      mensagem: `Cliente: ${clientName} (${company})\nValor: ${formatted}\nAção necessária para renovação!`,
      prioridade: urgency,
      actionUrl: '/clientes',
      metadata: {
        clientName,
        company,
        daysUntil,
        value,
        type: 'contract_expiring'
      }
    });
  }

  // Projeto Próximo do Prazo
  sendProjectDeadlineEvent(projectName: string, clientName: string, daysUntil: number, progress: number) {
    const urgency = daysUntil <= 3 ? 'urgent' : daysUntil <= 7 ? 'high' : 'medium';
    const progressStatus = progress < 50 ? '🔴 Atrasado' : progress < 80 ? '🟡 Atenção' : '🟢 No prazo';

    return this.sendEvent({
      tipo: 'project_deadline',
      titulo: `⏰ Prazo em ${daysUntil} dias: ${projectName}`,
      mensagem: `Cliente: ${clientName}\nProgresso: ${progress}%\nStatus: ${progressStatus}`,
      prioridade: urgency,
      actionUrl: '/projetos',
      metadata: {
        projectName,
        clientName,
        daysUntil,
        progress,
        type: 'project_deadline'
      }
    });
  }

  // Tarefa Criada
  sendTaskCreatedEvent(taskName: string, assignedTo: string, priority: string) {
    return this.sendEvent({
      tipo: 'task',
      titulo: `✅ Nova Tarefa: ${taskName}`,
      mensagem: `Atribuída para: ${assignedTo}\nPrioridade: ${priority}`,
      prioridade: priority === 'Alta' ? 'high' : 'medium',
      actionUrl: '/',
      metadata: {
        taskName,
        assignedTo,
        priority,
        type: 'task_created'
      }
    });
  }

  // Tarefa Concluída
  sendTaskCompletedEvent(taskName: string, completedBy: string) {
    return this.sendEvent({
      tipo: 'task',
      titulo: `🎉 Tarefa Concluída: ${taskName}`,
      mensagem: `Concluída por: ${completedBy}`,
      prioridade: 'low',
      actionUrl: '/',
      metadata: {
        taskName,
        completedBy,
        type: 'task_completed'
      }
    });
  }

  // Movimentação Financeira
  sendFinancialMovementEvent(type: 'receita' | 'despesa', amount: number, description: string, category: string) {
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);

    const icon = type === 'receita' ? '💰' : '💸';
    const typeLabel = type === 'receita' ? 'Receita' : 'Despesa';

    return this.sendEvent({
      tipo: 'financial',
      titulo: `${icon} ${typeLabel}: ${formatted}`,
      mensagem: `${description}\nCategoria: ${category}`,
      prioridade: type === 'receita' ? 'medium' : 'low',
      actionUrl: '/financeiro',
      metadata: {
        type,
        amount,
        description,
        category
      }
    });
  }

  // Cliente Inativo
  sendInactiveClientEvent(clientName: string, company: string, daysInactive: number) {
    return this.sendEvent({
      tipo: 'task',
      titulo: `😴 Cliente Inativo: ${clientName}`,
      mensagem: `${company} sem interação há ${daysInactive} dias\nAgendar follow-up?`,
      prioridade: daysInactive >= 60 ? 'high' : 'medium',
      actionUrl: '/clientes',
      metadata: {
        clientName,
        company,
        daysInactive,
        type: 'client_inactive'
      }
    });
  }
}

// Singleton instance
export const webhookService = new NotificationWebhookService();

// Hook React para usar o serviço
export const useWebhookService = () => {
  return webhookService;
};

