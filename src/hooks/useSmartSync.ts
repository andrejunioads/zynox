// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMART SYNC HOOK - SINCRONIZAÇÃO INTELIGENTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 
// Hook para sincronização automática entre entidades
// Conecta dados de forma inteligente e em tempo real
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useEffect, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIPOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SyncConfig {
  // Sincronizar contadores de membros
  syncMemberCounters: boolean;
  
  // Sincronizar relacionamentos cliente-projeto
  syncClientProjects: boolean;
  
  // Sincronizar leads com membros
  syncMemberLeads: boolean;
  
  // Sincronizar tarefas com projetos
  syncProjectTasks: boolean;
  
  // Sincronizar financeiro com clientes
  syncClientFinancial: boolean;
  
  // Debounce em ms
  debounceMs: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURAÇÃO PADRÃO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DEFAULT_CONFIG: SyncConfig = {
  syncMemberCounters: true,
  syncClientProjects: true,
  syncMemberLeads: true,
  syncProjectTasks: true,
  syncClientFinancial: true,
  debounceMs: 300,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOOK PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const useSmartSync = (config: Partial<SyncConfig> = {}) => {
  const {
    members,
    clients,
    leads,
    projects,
    followUps,
    financial,
    relationships,
    sync,
    update,
    link,
    unlink,
  } = useData();
  
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DEBOUNCE HELPER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SINCRONIZAÇÃO DE CONTADORES DE MEMBROS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const syncMemberCounters = useCallback(() => {
    if (!finalConfig.syncMemberCounters) return;
    
    members.forEach(member => {
      const assignedLeads = leads.filter(lead => lead.owner === member.id).length;
      const activeProjects = projects.filter(project => 
        project.team.some(teamMember => teamMember.id === member.id)
      ).length;
      const activeTasks = projects.flatMap(project => 
        project.tasks.filter(task => task.assignedTo === member.id)
      ).length;
      
      // Atualizar apenas se mudou
      if (
        member.assignedLeads !== assignedLeads ||
        member.activeProjects !== activeProjects ||
        member.activeTasks !== activeTasks
      ) {
        update('member', member.id, {
          assignedLeads,
          activeProjects,
          activeTasks,
          lastActivity: new Date(),
        });
      }
    });
  }, [members, leads, projects, update, finalConfig.syncMemberCounters]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SINCRONIZAÇÃO CLIENTE-PROJETO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const syncClientProjects = useCallback(() => {
    if (!finalConfig.syncClientProjects) return;
    
    clients.forEach(client => {
      const clientProjects = projects.filter(project => 
        project.linkedClient?.id === client.id || project.client === client.nome
      );
      
      // Atualizar contador de projetos
      if (client.totalProjetos !== clientProjects.length) {
        update('client', client.id, {
          totalProjetos: clientProjects.length,
          projetosAtivos: clientProjects.filter(p => 
            ['in-progress', 'review'].includes(p.status)
          ).length,
        });
      }
      
      // Criar relacionamentos
      clientProjects.forEach(project => {
        const currentLinks = relationships.clientProjects.get(client.id) || [];
        if (!currentLinks.includes(project.id)) {
          link('client', client.id, 'project', project.id);
        }
      });
    });
  }, [clients, projects, relationships, update, link, finalConfig.syncClientProjects]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SINCRONIZAÇÃO MEMBRO-LEADS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const syncMemberLeads = useCallback(() => {
    if (!finalConfig.syncMemberLeads) return;
    
    leads.forEach(lead => {
      if (lead.owner) {
        const member = members.find(m => m.id === lead.owner);
        if (member) {
          const currentLinks = relationships.memberLeads.get(member.id) || [];
          if (!currentLinks.includes(lead.id)) {
            link('member', member.id, 'lead', lead.id);
          }
        }
      }
    });
  }, [leads, members, relationships, link, finalConfig.syncMemberLeads]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SINCRONIZAÇÃO PROJETO-TAREFAS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const syncProjectTasks = useCallback(() => {
    if (!finalConfig.syncProjectTasks) return;
    
    projects.forEach(project => {
      const projectTasks = project.tasks || [];
      
      // Criar relacionamentos
      projectTasks.forEach(task => {
        const currentLinks = relationships.projectTasks.get(project.id) || [];
        if (!currentLinks.includes(task.id)) {
          link('project', project.id, 'task', task.id);
        }
        
        // Relacionar tarefa com membro
        if (task.assignedTo) {
          const currentTaskLinks = relationships.taskMembers.get(task.id) || [];
          if (!currentTaskLinks.includes(task.assignedTo)) {
            link('task', task.id, 'member', task.assignedTo);
          }
        }
      });
    });
  }, [projects, relationships, link, finalConfig.syncProjectTasks]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SINCRONIZAÇÃO CLIENTE-FINANCEIRO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const syncClientFinancial = useCallback(() => {
    if (!finalConfig.syncClientFinancial) return;
    
    clients.forEach(client => {
      const clientFinancial = financial.filter(transaction => 
        transaction.clienteId === client.id
      );
      
      // Calcular totais
      const totalEntradas = clientFinancial
        .filter(t => t.tipo === 'entrada' && t.status === 'pago')
        .reduce((sum, t) => sum + t.valor, 0);
      
      const totalSaidas = clientFinancial
        .filter(t => t.tipo === 'despesa' && t.status === 'pago')
        .reduce((sum, t) => sum + t.valor, 0);
      
      const saldoAtual = totalEntradas - totalSaidas;
      
      // Atualizar se mudou
      if (
        client.totalEntradas !== totalEntradas ||
        client.totalSaidas !== totalSaidas ||
        client.saldoAtual !== saldoAtual
      ) {
        update('client', client.id, {
          totalEntradas,
          totalSaidas,
          saldoAtual,
          totalMovimentacoes: clientFinancial.length,
        });
      }
      
      // Criar relacionamentos
      clientFinancial.forEach(transaction => {
        const currentLinks = relationships.clientFinancial.get(client.id) || [];
        if (!currentLinks.includes(transaction.id)) {
          link('client', client.id, 'financial', transaction.id);
        }
      });
    });
  }, [clients, financial, relationships, update, finalConfig.syncClientFinancial]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SINCRONIZAÇÃO PRINCIPAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const performSync = useCallback(() => {
    syncMemberCounters();
    syncClientProjects();
    syncMemberLeads();
    syncProjectTasks();
    syncClientFinancial();
  }, [
    syncMemberCounters,
    syncClientProjects,
    syncMemberLeads,
    syncProjectTasks,
    syncClientFinancial,
  ]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DEBOUNCED SYNC
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const debouncedSync = useCallback(
    debounce(performSync, finalConfig.debounceMs),
    [performSync, finalConfig.debounceMs, debounce]
  );
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EFEITOS DE SINCRONIZAÇÃO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // Sincronizar quando dados mudarem
  useEffect(() => {
    debouncedSync();
  }, [members, clients, leads, projects, financial, debouncedSync]);
  
  // Sincronizar imediatamente no mount
  useEffect(() => {
    performSync();
  }, [performSync]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RETORNO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  return {
    sync: performSync,
    syncMemberCounters,
    syncClientProjects,
    syncMemberLeads,
    syncProjectTasks,
    syncClientFinancial,
  };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOOKS ESPECÍFICOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Hook para sincronização de equipe
export const useTeamSync = () => {
  return useSmartSync({
    syncMemberCounters: true,
    syncMemberLeads: true,
    syncProjectTasks: true,
    debounceMs: 200,
  });
};

// Hook para sincronização de projetos
export const useProjectSync = () => {
  return useSmartSync({
    syncClientProjects: true,
    syncProjectTasks: true,
    syncMemberCounters: true,
    debounceMs: 300,
  });
};

// Hook para sincronização de clientes
export const useClientSync = () => {
  return useSmartSync({
    syncClientProjects: true,
    syncClientFinancial: true,
    debounceMs: 400,
  });
};

// Hook para sincronização completa
export const useFullSync = () => {
  return useSmartSync({
    syncMemberCounters: true,
    syncClientProjects: true,
    syncMemberLeads: true,
    syncProjectTasks: true,
    syncClientFinancial: true,
    debounceMs: 500,
  });
};

