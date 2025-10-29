/**
 * 🕐 NOTIFICATION SCHEDULER
 * 
 * Serviço que verifica periodicamente o sistema e dispara automações
 * para aniversários, contratos vencendo, projetos com prazo próximo, etc.
 */

import { automationEngine } from './automationEngine';

interface Cliente {
  id: string;
  nome: string;
  empresa: string;
  nascimento?: string;
  dataInicio?: string;
  valorMensal?: number;
  ultimaInteracao?: Date;
}

interface Projeto {
  id: string;
  name: string;
  client: string;
  deadline: string;
  progress: number;
  status: string;
}

interface FollowUp {
  id: string;
  lead_id: string;
  titulo: string;
  due_date: Date;
  status: string;
}

class NotificationScheduler {
  private checkInterval: NodeJS.Timeout | null = null;
  private lastCheck: { [key: string]: Date } = {};

  /**
   * Iniciar verificações periódicas
   */
  start() {
    console.log('🕐 Notification Scheduler iniciado');

    // Verificação inicial
    this.runAllChecks();

    // Verificar a cada 1 hora (3600000ms)
    this.checkInterval = setInterval(() => {
      this.runAllChecks();
    }, 3600000);
  }

  /**
   * Parar verificações
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('🛑 Notification Scheduler parado');
    }
  }

  /**
   * Executar todas as verificações
   */
  private async runAllChecks() {
    console.log('🔄 Executando verificações automáticas...');

    // Verificações diárias (executa uma vez por dia)
    if (this.shouldRunDailyCheck()) {
      await this.checkBirthdays();
      await this.checkContractsExpiring();
      await this.checkInactiveClients();
      this.lastCheck['daily'] = new Date();
    }

    // Verificações frequentes (sempre)
    await this.checkProjectDeadlines();
    await this.checkOverdueFollowUps();
  }

  /**
   * Verificar se deve rodar checagem diária
   */
  private shouldRunDailyCheck(): boolean {
    const lastDaily = this.lastCheck['daily'];
    if (!lastDaily) return true;

    const now = new Date();
    const diffHours = (now.getTime() - lastDaily.getTime()) / (1000 * 60 * 60);
    return diffHours >= 24;
  }

  /**
   * Verificar aniversários de hoje
   */
  async checkBirthdays() {
    try {
      // Verificar se a automação está ativa
      const automation = automationEngine.getAutomations().find(a => 
        a.name === '🎂 Aniversário de Cliente' && a.enabled
      );
      if (!automation) return;

      const clientes = this.getClientes();
      const today = new Date();
      const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      for (const cliente of clientes) {
        if (cliente.nascimento) {
          const birthDate = new Date(cliente.nascimento);
          const birthStr = `${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;

          if (birthStr === todayStr) {
            const age = today.getFullYear() - birthDate.getFullYear();
            
            // Disparar automação ao invés de enviar diretamente
            await automationEngine.trigger('scheduled' as any, {
              automationId: automation.id,
              clientName: cliente.nome,
              company: cliente.empresa,
              age,
            });
            console.log(`🎂 Aniversário detectado: ${cliente.nome}`);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar aniversários:', error);
    }
  }

  /**
   * Verificar contratos próximos do vencimento
   */
  async checkContractsExpiring() {
    try {
      const clientes = this.getClientes();
      const today = new Date();

      for (const cliente of clientes) {
        if (cliente.dataInicio && cliente.valorMensal) {
          const startDate = new Date(cliente.dataInicio);
          const oneYearLater = new Date(startDate);
          oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

          const diffTime = oneYearLater.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Mapear dias para nome da automação
          const automationNames: { [key: number]: string } = {
            30: '⚠️ Contrato Vencendo (30 dias)',
            15: '⚠️ Contrato Vencendo (15 dias)',
            7: '🚨 Contrato Vencendo (7 dias)',
            3: '🔴 Contrato Vencendo (3 dias)',
          };

          if ([30, 15, 7, 3].includes(diffDays)) {
            const automation = automationEngine.getAutomations().find(a => 
              a.name === automationNames[diffDays] && a.enabled
            );
            
            if (automation) {
              await automationEngine.trigger('scheduled' as any, {
                automationId: automation.id,
                clientName: cliente.nome,
                company: cliente.empresa,
                value: (cliente.valorMensal * 12).toFixed(2),
                daysUntil: diffDays,
              });
              console.log(`⚠️ Contrato expirando em ${diffDays} dias: ${cliente.nome}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar contratos:', error);
    }
  }

  /**
   * Verificar projetos próximos do prazo
   */
  async checkProjectDeadlines() {
    try {
      const projetos = this.getProjetos();
      const today = new Date();

      for (const projeto of projetos) {
        if (projeto.status !== 'Concluído' && projeto.deadline) {
          const deadline = new Date(projeto.deadline);
          const diffTime = deadline.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Mapear dias para nome da automação
          const automationNames: { [key: number]: string } = {
            7: '📁 Projeto com Prazo Próximo (7 dias)',
            3: '⏰ Projeto com Prazo Próximo (3 dias)',
            1: '🚨 Projeto com Prazo Próximo (1 dia)',
            0: '🔴 Projeto Vencendo HOJE',
          };

          if (diffDays >= 0 && [7, 3, 1, 0].includes(diffDays)) {
            const automation = automationEngine.getAutomations().find(a => 
              a.name === automationNames[diffDays] && a.enabled
            );
            
            if (automation) {
              await automationEngine.trigger('scheduled' as any, {
                automationId: automation.id,
                projectName: projeto.name,
                clientName: projeto.client,
                daysUntil: diffDays,
                progress: projeto.progress,
              });
              console.log(`⏰ Projeto próximo do prazo (${diffDays} dias): ${projeto.name}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar prazos de projetos:', error);
    }
  }

  /**
   * Verificar follow-ups atrasados
   */
  async checkOverdueFollowUps() {
    try {
      const automation = automationEngine.getAutomations().find(a => 
        a.name === '⏰ Follow-ups Atrasados' && a.enabled
      );
      if (!automation) return;

      const followUps = this.getFollowUps();
      const today = new Date();

      const overdueCount = followUps.filter(f => {
        return f.status === 'pendente' && new Date(f.due_date) < today;
      }).length;

      if (overdueCount > 0) {
        const lastOverdueCheck = this.lastCheck['overdue'];
        const shouldNotify = !lastOverdueCheck || 
          (today.getTime() - lastOverdueCheck.getTime()) > (4 * 60 * 60 * 1000); // 4 horas

        if (shouldNotify) {
          await automationEngine.trigger('scheduled' as any, {
            automationId: automation.id,
            count: overdueCount,
          });
          this.lastCheck['overdue'] = today;
          console.log(`⚠️ ${overdueCount} follow-ups atrasados`);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar follow-ups:', error);
    }
  }

  /**
   * Verificar clientes inativos
   */
  async checkInactiveClients() {
    try {
      const clientes = this.getClientes();
      const today = new Date();

      // Mapear dias para nome da automação
      const automationNames: { [key: number]: string } = {
        30: '😴 Cliente Inativo (30 dias)',
        60: '⚠️ Cliente Inativo (60 dias)',
        90: '🚨 Cliente Inativo (90 dias)',
      };

      for (const cliente of clientes) {
        if (cliente.ultimaInteracao) {
          const diffTime = today.getTime() - cliente.ultimaInteracao.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if ([30, 60, 90].includes(diffDays)) {
            const automation = automationEngine.getAutomations().find(a => 
              a.name === automationNames[diffDays] && a.enabled
            );
            
            if (automation) {
              await automationEngine.trigger('scheduled' as any, {
                automationId: automation.id,
                clientName: cliente.nome,
                company: cliente.empresa,
                daysInactive: diffDays,
              });
              console.log(`😴 Cliente inativo (${diffDays} dias): ${cliente.nome}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar clientes inativos:', error);
    }
  }

  /**
   * Helpers para obter dados do localStorage/mock
   * Em produção, isso virá do Supabase
   */

  private getClientes(): Cliente[] {
    try {
      const stored = localStorage.getItem('zynox_clientes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getProjetos(): Projeto[] {
    try {
      const stored = localStorage.getItem('zynox_projetos');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getFollowUps(): FollowUp[] {
    try {
      const stored = localStorage.getItem('zynox_followups');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Verificação manual para testes
   */
  async runManualCheck() {
    console.log('🧪 Executando verificação manual...');
    await this.runAllChecks();
  }
}

// Singleton instance
export const notificationScheduler = new NotificationScheduler();

// Auto-start
if (typeof window !== 'undefined') {
  // Iniciar após 5 segundos (dar tempo para o app carregar)
  setTimeout(() => {
    notificationScheduler.start();
  }, 5000);
}

