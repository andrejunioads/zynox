// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMART SYNC HOOK - SINCRONIZAÇÃO INTELIGENTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 
// Hook para sincronização automática entre entidades
// Conecta dados de forma inteligente e em tempo real
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useEffect, useCallback, useRef, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { syncLogger } from '@/lib/logger';

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
  // DEBOUNCE E CONTROLE DE SINCRONIZAÇÃO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);
  const isSyncingRef = useRef(false);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SINCRONIZAÇÃO DE CONTADORES (OTIMIZADO)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // ✅ OTIMIZADO: Usar useMemo para cálculos
  const memberCounters = useMemo(() => {
    if (!finalConfig.syncMemberCounters) return new Map();
    
    const counters = new Map();
    
    members.forEach(member => {
      const assignedLeads = leads.filter(lead => lead.owner === member.id).length;
      const activeProjects = projects.filter(project => 
        project.team.some(teamMember => teamMember.id === member.id)
      ).length;
      const activeTasks = projects.flatMap(project => 
        project.tasks.filter(task => task.assignedTo === member.id)
      ).length;
      
      counters.set(member.id, { assignedLeads, activeProjects, activeTasks });
    });
    
    return counters;
  }, [members, leads, projects, finalConfig.syncMemberCounters]);
  
  const syncMemberCounters = useCallback(() => {
    if (!finalConfig.syncMemberCounters || isSyncingRef.current) return;
    
    members.forEach(member => {
      const counters = memberCounters.get(member.id);
      if (!counters) return;
      
      // Atualizar apenas se mudou
      if (
        member.assignedLeads !== counters.assignedLeads ||
        member.activeProjects !== counters.activeProjects ||
        member.activeTasks !== counters.activeTasks
      ) {
        update('member', member.id, {
          ...counters,
          lastActivity: new Date(),
        });
      }
    });
  }, [members, memberCounters, update, finalConfig.syncMemberCounters]);
  
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
  // SINCRONIZAÇÃO PRINCIPAL (OTIMIZADA)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const performSync = useCallback(() => {
    // Prevenir sincronizações simultâneas
    if (isSyncingRef.current) {
      syncLogger.warn('Sincronização em andamento, ignorando nova chamada');
      return;
    }
    
    const now = Date.now();
    const timeSinceLastSync = now - lastSyncRef.current;
    
    // Throttle: no mínimo 1s entre sincronizações
    if (timeSinceLastSync < 1000) {
      syncLogger.log(`Throttling sync (${timeSinceLastSync}ms desde último)`);
      return;
    }
    
    isSyncingRef.current = true;
    lastSyncRef.current = now;
    
    try {
      syncMemberCounters();
      syncClientProjects();
      syncMemberLeads();
      syncProjectTasks();
      syncClientFinancial();
      syncLogger.log('Sincronização concluída');
    } finally {
      isSyncingRef.current = false;
    }
  }, [
    syncMemberCounters,
    syncClientProjects,
    syncMemberLeads,
    syncProjectTasks,
    syncClientFinancial,
  ]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DEBOUNCED SYNC (OTIMIZADO)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const debouncedSync = useCallback(() => {
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }
    
    syncTimerRef.current = setTimeout(() => {
      performSync();
      syncTimerRef.current = null;
    }, finalConfig.debounceMs);
  }, [performSync, finalConfig.debounceMs]);
  
  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, []);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EFEITOS DE SINCRONIZAÇÃO (OTIMIZADO)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // ✅ OTIMIZADO: Sincronizar quando dados mudarem (com debounce)
  useEffect(() => {
    debouncedSync();
  }, [members, clients, leads, projects, financial, debouncedSync]);
  
  // ✅ OTIMIZADO: Sincronizar imediatamente no mount (sem duplicação)
  useEffect(() => {
    const timer = setTimeout(() => {
      performSync();
    }, 100); // Pequeno delay para evitar dupla execução
    
    return () => clearTimeout(timer);
  }, []); // Apenas no mount
  
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

