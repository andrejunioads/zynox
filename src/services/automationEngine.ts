/**
 * 🤖 AUTOMATION ENGINE
 * 
 * Sistema que executa automações personalizadas baseadas em gatilhos e condições
 */

import { 
  Automation, 
  AutomationCondition, 
  AutomationAction, 
  TriggerType,
  AutomationExecutionLog 
} from '@/types/automation';
import { webhookService } from './notificationWebhookService';
import { toast } from 'sonner';
import { systemAutomations } from '@/data/systemAutomations';

class AutomationEngine {
  private automations: Automation[] = [];
  private executionLogs: AutomationExecutionLog[] = [];
  private notificationHandler?: (notification: any) => void;

  constructor() {
    this.loadAutomations();
    this.loadLogs();
    this.installSystemAutomations();
  }

  /**
   * Registrar handler de notificações (usado pelo NotificationContext)
   */
  setNotificationHandler(handler: (notification: any) => void) {
    this.notificationHandler = handler;
    console.log('📬 Handler de notificações registrado');
  }

  /**
   * Carregar automações do localStorage
   */
  private loadAutomations() {
    try {
      const stored = localStorage.getItem('zynox_automations');
      if (stored) {
        this.automations = JSON.parse(stored);
        console.log(`🤖 ${this.automations.length} automações carregadas`);
      }
    } catch (error) {
      console.error('Erro ao carregar automações:', error);
    }
  }

  /**
   * Salvar automações no localStorage
   */
  private saveAutomations() {
    try {
      localStorage.setItem('zynox_automations', JSON.stringify(this.automations));
    } catch (error) {
      console.error('Erro ao salvar automações:', error);
    }
  }

  /**
   * Carregar logs do localStorage
   */
  private loadLogs() {
    try {
      const stored = localStorage.getItem('zynox_automation_logs');
      if (stored) {
        const parsedLogs = JSON.parse(stored);
        // Converter timestamps de string para Date
        this.executionLogs = parsedLogs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
        console.log(`📋 ${this.executionLogs.length} logs carregados`);
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      this.executionLogs = [];
    }
  }

  /**
   * Deletar todas as automações do sistema antigas
   */
  deleteSystemAutomations() {
    try {
      // Função helper para remover emojis e normalizar nome
      const normalizeName = (name: string) => {
        return name
          .replace(/[^\p{L}\p{N}\s]/gu, '') // Remove emojis e caracteres especiais
          .trim()
          .toLowerCase();
      };
      
      // Criar um Set com os NOMES normalizados das automações do sistema
      const systemAutomationNames = new Set(
        systemAutomations.map(a => normalizeName(a.name))
      );
      
      console.log(`🔍 Procurando automações do sistema para deletar...`);
      console.log(`📋 Total de automações antes:`, this.automations.length);
      
      const initialCount = this.automations.length;
      
      // Filtrar apenas as automações que NÃO são do sistema
      this.automations = this.automations.filter(automation => {
        const normalizedName = normalizeName(automation.name);
        
        // Identificar por:
        // 1. Nome normalizado (sem emojis) nas automações do sistema
        // 2. ID começa com 'system-'
        // 3. createdBy é 'Sistema Zynox'
        const isSystemAutomation = 
          systemAutomationNames.has(normalizedName) ||
          automation.id.startsWith('system-') ||
          automation.createdBy === 'Sistema Zynox';
        
        if (isSystemAutomation) {
          console.log(`🗑️ Deletando: ${automation.name} (ID: ${automation.id})`);
        }
        
        return !isSystemAutomation;
      });
      
      const deletedCount = initialCount - this.automations.length;
      
      this.saveAutomations();
      console.log(`✅ ${deletedCount} automações do sistema deletadas`);
      console.log(`📊 Restantes: ${this.automations.length} automações`);
    } catch (error) {
      console.error('Erro ao deletar automações do sistema:', error);
    }
  }

  /**
   * Instalar automações do sistema (na primeira inicialização)
   */
  private installSystemAutomations() {
    try {
      const installedFlag = localStorage.getItem('zynox_system_automations_installed');
      
      if (!installedFlag) {
        console.log('📦 Instalando automações do sistema...');
        
        // Deletar automações antigas primeiro (caso existam)
        this.deleteSystemAutomations();
        
        // Instalar cada automação do sistema
        for (let i = 0; i < systemAutomations.length; i++) {
          const sysAutomation = systemAutomations[i];
          const automation: Automation = {
            ...sysAutomation,
            id: `system-${i}`, // ID único para automações do sistema
            createdAt: new Date(),
            updatedAt: new Date(),
            executionCount: 0,
            createdBy: 'Sistema Zynox',
          };
          
          this.automations.push(automation);
          console.log(`✅ Automação instalada: ${automation.name}`);
        }
        
        this.saveAutomations();
        
        // Marcar como instalado
        localStorage.setItem('zynox_system_automations_installed', 'true');
        console.log(`🎉 ${systemAutomations.length} automações do sistema instaladas!`);
      } else {
        console.log('✓ Automações do sistema já instaladas');
      }
    } catch (error) {
      console.error('Erro ao instalar automações do sistema:', error);
    }
  }

  /**
   * Obter todas as automações
   */
  getAutomations(): Automation[] {
    return this.automations;
  }

  /**
   * Obter automação por ID
   */
  getAutomation(id: string): Automation | undefined {
    return this.automations.find(a => a.id === id);
  }

  /**
   * Criar nova automação
   */
  createAutomation(automation: Omit<Automation, 'id' | 'createdAt' | 'updatedAt' | 'executionCount'>): Automation {
    const newAutomation: Automation = {
      ...automation,
      id: `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      executionCount: 0,
    };

    this.automations.push(newAutomation);
    this.saveAutomations();

    console.log('✅ Automação criada:', newAutomation.name);
    return newAutomation;
  }

  /**
   * Atualizar automação
   */
  updateAutomation(id: string, updates: Partial<Automation>): boolean {
    const index = this.automations.findIndex(a => a.id === id);
    if (index === -1) return false;

    this.automations[index] = {
      ...this.automations[index],
      ...updates,
      updatedAt: new Date(),
    };

    this.saveAutomations();
    console.log('✅ Automação atualizada:', this.automations[index].name);
    return true;
  }

  /**
   * Deletar automação
   */
  deleteAutomation(id: string): boolean {
    const index = this.automations.findIndex(a => a.id === id);
    if (index === -1) return false;

    const deleted = this.automations.splice(index, 1)[0];
    this.saveAutomations();

    console.log('🗑️ Automação deletada:', deleted.name);
    return true;
  }

  /**
   * Ativar/desativar automação
   */
  toggleAutomation(id: string, enabled: boolean): boolean {
    return this.updateAutomation(id, { enabled });
  }

  /**
   * EXECUTAR GATILHO
   * Esta é a função principal que deve ser chamada quando algo acontece no sistema
   */
  async trigger(triggerType: TriggerType, data: Record<string, any>) {
    console.log(`🎯 Gatilho disparado: ${triggerType}`, data);

    // Se o gatilho é 'scheduled' e tem automationId, executar apenas essa automação
    if (triggerType === 'scheduled' && data.automationId) {
      const automation = this.automations.find(a => a.id === data.automationId);
      if (automation && automation.enabled) {
        try {
          await this.executeAutomation(automation, data);
        } catch (error) {
          console.error(`❌ Erro ao executar automação "${automation.name}":`, error);
          this.logExecution(automation, false, error instanceof Error ? error.message : 'Erro desconhecido', data);
        }
      }
      return;
    }

    // Buscar automações ativas para este gatilho
    const activeAutomations = this.automations.filter(
      a => a.enabled && a.trigger.type === triggerType
    );

    if (activeAutomations.length === 0) {
      console.log('📭 Nenhuma automação ativa para este gatilho');
      return;
    }

    console.log(`🔍 ${activeAutomations.length} automação(ões) encontrada(s)`);

    // Executar cada automação
    for (const automation of activeAutomations) {
      try {
        await this.executeAutomation(automation, data);
      } catch (error) {
        console.error(`❌ Erro ao executar automação "${automation.name}":`, error);
        this.logExecution(automation, false, error instanceof Error ? error.message : 'Erro desconhecido', data);
      }
    }
  }

  /**
   * Executar uma automação específica
   */
  private async executeAutomation(automation: Automation, data: Record<string, any>) {
    console.log(`⚙️ Executando automação: "${automation.name}"`);

    // Verificar condições
    if (!this.checkConditions(automation.conditions, data)) {
      console.log(`⏭️ Condições não atendidas para "${automation.name}"`);
      return;
    }

    console.log(`✅ Condições atendidas! Executando ações...`);

    // Executar ações
    for (const action of automation.actions) {
      await this.executeAction(action, data, automation);
    }

    // Atualizar contador de execuções
    this.updateAutomation(automation.id, {
      executionCount: automation.executionCount + 1,
      lastExecutedAt: new Date(),
    });

    // Log de sucesso
    this.logExecution(automation, true, undefined, data);

    console.log(`🎉 Automação "${automation.name}" executada com sucesso!`);
  }

  /**
   * Verificar se todas as condições são verdadeiras
   */
  private checkConditions(conditions: AutomationCondition[], data: Record<string, any>): boolean {
    if (conditions.length === 0) return true;

    return conditions.every(condition => {
      const fieldValue = this.getNestedValue(data, condition.field);
      return this.evaluateCondition(fieldValue, condition.operator, condition.value);
    });
  }

  /**
   * Obter valor aninhado de um objeto (ex: "lead.value" -> data.lead.value)
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Avaliar condição individual
   */
  private evaluateCondition(fieldValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue == expectedValue;
      case 'not_equals':
        return fieldValue != expectedValue;
      case 'greater_than':
        return Number(fieldValue) > Number(expectedValue);
      case 'less_than':
        return Number(fieldValue) < Number(expectedValue);
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(expectedValue).toLowerCase());
      case 'not_contains':
        return !String(fieldValue).toLowerCase().includes(String(expectedValue).toLowerCase());
      default:
        console.warn(`⚠️ Operador desconhecido: ${operator}`);
        return false;
    }
  }

  /**
   * Executar ação individual
   */
  private async executeAction(action: AutomationAction, data: Record<string, any>, automation: Automation) {
    console.log(`🔧 Executando ação: ${action.type}`);

    try {
      switch (action.type) {
        case 'send_notification':
          await this.actionSendNotification(action, data, automation);
          break;

        case 'create_task':
          this.actionCreateTask(action, data);
          break;

        case 'create_followup':
          this.actionCreateFollowUp(action, data);
          break;

        case 'webhook':
          await this.actionWebhook(action, data);
          break;

        case 'update_field':
          this.actionUpdateField(action, data);
          break;

        default:
          console.warn(`⚠️ Tipo de ação não implementado: ${action.type}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao executar ação ${action.type}:`, error);
      throw error;
    }
  }

  /**
   * AÇÃO: Enviar Notificação
   */
  private async actionSendNotification(action: AutomationAction, data: Record<string, any>, automation: Automation) {
    const message = this.interpolateString(action.config.message || '', data);
    
    // Hierarquia de prioridade: defaultPriority (automação) → priority (ação) → 'medium'
    const priority = (automation.defaultPriority || action.config.priority || 'medium') as 'low' | 'medium' | 'high' | 'urgent';

    // Hierarquia de título: defaultTitle (automação) → title (ação) → extrair da mensagem
    let title: string;
    if (automation.defaultTitle) {
      // 1º: Título padrão da automação (preenchido no formulário) - MAIOR PRIORIDADE
      title = this.interpolateString(automation.defaultTitle, data);
      console.log(`📝 Usando título da automação: ${title}`);
    } else if (action.config.title) {
      // 2º: Título específico da ação (do template)
      title = this.interpolateString(action.config.title, data);
      console.log(`📝 Usando título da ação: ${title}`);
    } else {
      // 3º: Extrair da primeira linha em negrito da mensagem
      const titleMatch = message.match(/<b>(.*?)<\/b>/);
      title = titleMatch ? titleMatch[1] : 'Notificação da Automação';
      console.log(`📝 Título extraído da mensagem: ${title}`);
    }
    
    // Remover HTML tags para mensagem limpa
    const cleanMessage = message.replace(/<\/?[^>]+(>|$)/g, '');

    // 1. Adicionar ao painel de notificações (se handler estiver disponível)
    if (this.notificationHandler) {
      this.notificationHandler({
        type: 'task', // tipo padrão para automações
        title,
        message: cleanMessage,
        priority,
      });
      console.log(`📬 Notificação adicionada ao painel: ${title}`);
    }

    // 2. Enviar via webhook (Pushover/n8n)
    await webhookService.sendEvent({
      tipo: 'custom',
      titulo: title,
      mensagem: message, // Mantém HTML para Pushover
      prioridade: priority,
      actionUrl: '/',
      timestamp: new Date().toISOString(),
      metadata: {
        automation: true,
        trigger: data,
      }
    });

    console.log(`📤 Notificação enviada: ${title}`);
  }

  /**
   * AÇÃO: Criar Tarefa
   */
  private actionCreateTask(action: AutomationAction, data: Record<string, any>) {
    const taskName = this.interpolateString(action.config.taskName || 'Nova Tarefa', data);
    const assignedTo = action.config.assignedTo || 'Sem atribuição';

    // TODO: Integrar com sistema de tarefas quando implementado
    console.log(`✅ Tarefa criada: ${taskName} (${assignedTo})`);

    toast.success('🤖 Automação: Tarefa Criada', {
      description: `${taskName} atribuída para ${assignedTo}`,
      duration: 5000,
    });
  }

  /**
   * AÇÃO: Criar Follow-up
   */
  private actionCreateFollowUp(action: AutomationAction, data: Record<string, any>) {
    const title = this.interpolateString(action.config.followUpTitle || 'Follow-up Automático', data);
    const days = action.config.followUpDays || 7;

    // TODO: Integrar com sistema de follow-ups
    console.log(`📅 Follow-up criado: ${title} (em ${days} dias)`);

    toast.success('🤖 Automação: Follow-up Criado', {
      description: `${title} agendado para daqui ${days} dias`,
      duration: 5000,
    });
  }

  /**
   * AÇÃO: Webhook Customizado
   */
  private async actionWebhook(action: AutomationAction, data: Record<string, any>) {
    const url = action.config.webhookUrl;
    if (!url) {
      console.warn('⚠️ URL do webhook não configurada');
      return;
    }

    const payload = action.config.webhookPayload || data;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook retornou ${response.status}`);
    }

    console.log(`🌐 Webhook executado: ${url}`);
  }

  /**
   * AÇÃO: Atualizar Campo
   */
  private actionUpdateField(action: AutomationAction, data: Record<string, any>) {
    const field = action.config.field;
    const newValue = action.config.newValue;

    // TODO: Implementar atualização real baseada no tipo de objeto
    console.log(`📝 Campo atualizado: ${field} = ${newValue}`);

    toast.info('🤖 Automação: Campo Atualizado', {
      description: `${field} alterado para ${newValue}`,
      duration: 3000,
    });
  }

  /**
   * Interpolar variáveis em strings (ex: "Lead {{name}} movido" -> "Lead João movido")
   */
  private interpolateString(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+(\.\w+)*)\}\}/g, (match, path) => {
      const value = this.getNestedValue(data, path);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Salvar log de execução
   */
  private logExecution(
    automation: Automation, 
    success: boolean, 
    error?: string, 
    metadata?: Record<string, any>
  ) {
    const log: AutomationExecutionLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      automationId: automation.id,
      automationName: automation.name,
      timestamp: new Date(),
      trigger: automation.trigger.type,
      success,
      error,
      metadata,
    };

    this.executionLogs.unshift(log);

    // Manter apenas os últimos 100 logs
    if (this.executionLogs.length > 100) {
      this.executionLogs = this.executionLogs.slice(0, 100);
    }

    // Salvar logs no localStorage
    try {
      localStorage.setItem('zynox_automation_logs', JSON.stringify(this.executionLogs));
    } catch (error) {
      console.error('Erro ao salvar logs:', error);
    }
  }

  /**
   * Obter logs de execução
   */
  getExecutionLogs(automationId?: string, limit: number = 50): AutomationExecutionLog[] {
    let logs = this.executionLogs;

    if (automationId) {
      logs = logs.filter(log => log.automationId === automationId);
    }

    return logs.slice(0, limit);
  }

  /**
   * Limpar logs
   */
  clearLogs() {
    this.executionLogs = [];
    localStorage.removeItem('zynox_automation_logs');
  }

  /**
   * Reinstalar automações do sistema (força reinstalação)
   */
  reinstallSystemAutomations() {
    try {
      console.log('🔄 Reinstalando automações do sistema...');
      
      // 1. Deletar automações antigas do sistema
      this.deleteSystemAutomations();
      
      // 2. Remover flag de instalação
      localStorage.removeItem('zynox_system_automations_installed');
      
      // 3. Instalar novamente
      this.installSystemAutomations();
      
      console.log('✅ Automações do sistema reinstaladas com sucesso!');
      
      return {
        success: true,
        count: systemAutomations.length,
        automations: this.automations.filter(a => a.createdBy === 'Sistema Zynox')
      };
    } catch (error) {
      console.error('❌ Erro ao reinstalar automações do sistema:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Obter estatísticas das automações
   */
  getStats() {
    const total = this.automations.length;
    const enabled = this.automations.filter(a => a.enabled).length;
    const disabled = total - enabled;
    const systemAutomations = this.automations.filter(a => a.createdBy === 'Sistema Zynox').length;
    const userAutomations = total - systemAutomations;
    
    return {
      total,
      enabled,
      disabled,
      systemAutomations,
      userAutomations,
      executionCount: this.automations.reduce((sum, a) => sum + a.executionCount, 0)
    };
  }
}

// Singleton instance
export const automationEngine = new AutomationEngine();

// Helper hook para usar no React
export const useAutomationEngine = () => {
  return automationEngine;
};

