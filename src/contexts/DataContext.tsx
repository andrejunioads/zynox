// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATA CONTEXT - SINCRONIZAÇÃO COMPLETA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 
// Contexto unificado para TODOS os dados do sistema
// Conecta equipe, clientes, leads, projetos, tarefas, financeiro
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { Member } from '@/types/member';
import { Usuario, memberParaUsuario, usuarioParaMember } from '@/types/usuario';
import { Cliente } from '@/types/cliente';
import { Lead } from '@/data/mockLeads';
import { Project } from '@/pages/Projetos';
import { FollowUp } from '@/types/followup';
import { mockMembers, mockActivities } from '@/data/mockMembers';
import { mockClientes } from '@/data/mockClientes';
import { mockLeads } from '@/data/mockLeads';
import { mockProjects } from '@/data/mockProjects';
import { mockFollowUps } from '@/data/mockFollowUps';
import { mockFinancial, FinancialTransaction } from '@/data/mockFinancial';
import { Automation } from '@/types/automation';
import { automationEngine } from '@/services/automationEngine';
import { safeLocalStorageGet, safeLocalStorageSet, initStorageMonitoring, createBackup, restoreBackup } from '@/utils/storageHelpers';
import { safeParse } from '@/lib/safeParse';
import { STORAGE_KEYS } from '@/config/storage';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIPOS DE RELACIONAMENTOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Relationships {
  // Cliente ↔ Projetos
  clientProjects: Map<string, string[]>;
  
  // Projeto ↔ Tarefas
  projectTasks: Map<string, string[]>;
  
  // Projeto ↔ Membros
  projectMembers: Map<string, string[]>;
  
  // Lead ↔ Membros
  memberLeads: Map<string, string[]>;
  
  // Cliente ↔ Financeiro
  clientFinancial: Map<string, string[]>;
  
  // Lead ↔ FollowUps
  leadFollowUps: Map<string, string[]>;
  
  // Tarefa ↔ Membros
  taskMembers: Map<string, string[]>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIPOS DE VALIDAÇÃO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ValidationResult {
  entity: string;
  id: string;
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIPOS DE EVENTOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface DataEvent {
  type: 'create' | 'update' | 'delete' | 'link' | 'unlink';
  entity: string;
  id: string;
  data?: any;
  timestamp: Date;
  userId?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTEXT TYPE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface DataContextType {
  // Estado das entidades
  members: Member[];
  clients: Cliente[];
  leads: Lead[];
  projects: Project[];
  followUps: FollowUp[];
  financial: any[];
  activities: any[];
  automations: Automation[];
  
  // Relacionamentos
  relationships: Relationships;
  
  // Estado de carregamento
  isLoading: boolean;
  lastSync: Date | null;
  
  // Ações CRUD unificadas
  create: (entity: string, data: any) => string;
  update: (entity: string, id: string, data: any) => void;
  delete: (entity: string, id: string) => void;
  
  // Ações de relacionamento
  link: (fromEntity: string, fromId: string, toEntity: string, toId: string) => void;
  unlink: (fromEntity: string, fromId: string, toEntity: string, toId: string) => void;
  
  // Validação e sincronização
  validate: () => ValidationResult[];
  sync: () => void;
  cleanOrphans: () => { cleaned: number; details: string[] };
  validateAndClean: () => boolean;
  clearAllData: (options?: { keepMembers?: boolean; createBackup?: boolean }) => void;
  reset: () => void;
  
  // Eventos
  events: DataEvent[];
  addEventListener: (callback: (event: DataEvent) => void) => void;
  removeEventListener: (callback: (event: DataEvent) => void) => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTEXT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DataContext = createContext<DataContextType | undefined>(undefined);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROVIDER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ESTADO DAS ENTIDADES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const [members, setMembers] = useState<Member[]>([]);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [financial, setFinancial] = useState<FinancialTransaction[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RELACIONAMENTOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const [relationships, setRelationships] = useState<Relationships>({
    clientProjects: new Map(),
    projectTasks: new Map(),
    projectMembers: new Map(),
    memberLeads: new Map(),
    clientFinancial: new Map(),
    leadFollowUps: new Map(),
    taskMembers: new Map(),
  });
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ESTADO DE SINCRONIZAÇÃO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [events, setEvents] = useState<DataEvent[]>([]);
  const [eventListeners, setEventListeners] = useState<((event: DataEvent) => void)[]>([]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CARREGAMENTO INICIAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Carregar dados do localStorage ou usar mocks
        const savedMembers = localStorage.getItem('nebula-members');
        const savedClients = localStorage.getItem('nebula-clients');
        const savedLeads = localStorage.getItem('nebula-leads');
        const savedProjects = localStorage.getItem('nebula-projects');
        const savedFollowUps = localStorage.getItem('nebula-followups');
        const savedFinancial = localStorage.getItem('nebula-financial');
        
        // Membros - com safeParse
        const parsedMembers = safeParse<Member[]>(
          savedMembers,
          mockMembers,
          { storageKey: STORAGE_KEYS.MEMBERS, silent: true }
        );
        setMembers(parsedMembers);
        
        // Clientes - com safeParse
        const parsedClients = safeParse<Cliente[]>(
          savedClients,
          mockClientes,
          { storageKey: STORAGE_KEYS.CLIENTS, silent: true }
        );
        setClients(parsedClients);
        
        // Leads - com safeParse
        const parsedLeads = safeParse<Lead[]>(
          savedLeads,
          mockLeads,
          { storageKey: STORAGE_KEYS.LEADS, silent: true }
        );
        setLeads(parsedLeads);
        
        // Projetos - com safeParse e normalização
        const parsedProjects = safeParse<Project[]>(
          savedProjects,
          mockProjects,
          { storageKey: STORAGE_KEYS.PROJECTS, silent: true }
        );
        const normalizedProjects = parsedProjects.map((p: any) => ({
          ...p,
          tasks: p.tasks?.map((t: any) => ({
            ...t,
            createdAt: t.createdAt ? t.createdAt : undefined,
            completedAt: t.completedAt ? t.completedAt : undefined,
          })) || [],
          activities: p.activities?.map((a: any) => ({
            ...a,
            timestamp: a.timestamp || new Date().toISOString(),
          })) || [],
        }));
        setProjects(normalizedProjects);
        
        // Follow-ups - com safeParse
        const parsedFollowUps = safeParse<FollowUp[]>(
          savedFollowUps,
          mockFollowUps,
          { storageKey: STORAGE_KEYS.FOLLOWUPS, silent: true }
        );
        setFollowUps(parsedFollowUps);
        
        // Financeiro - com safeParse
        const parsedFinancial = safeParse<FinancialTransaction[]>(
          savedFinancial,
          mockFinancial,
          { storageKey: STORAGE_KEYS.FINANCIAL, silent: true }
        );
        setFinancial(parsedFinancial);
        
        // Atividades
        setActivities(mockActivities);
        
        // Automações - carregar do AutomationEngine
        const engineAutomations = automationEngine.getAutomations();
        setAutomations(engineAutomations);
        console.log(`🤖 ${engineAutomations.length} automações carregadas do AutomationEngine`);
        
        setLastSync(new Date());
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PERSISTÊNCIA AUTOMÁTICA COM DEBOUNCE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // Refs para debounce timers
  const persistTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  // Helper de persistência com debounce
  const debouncedPersist = useCallback((key: string, data: any, delay: number = 500) => {
    // Limpar timer anterior se existir
    const existingTimer = persistTimers.current.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Criar novo timer
    const timer = setTimeout(() => {
      if (data && (Array.isArray(data) ? data.length > 0 : true)) {
        safeLocalStorageSet(key, data);
      }
      persistTimers.current.delete(key);
    }, delay);
    
    persistTimers.current.set(key, timer);
  }, []);
  
  // Limpar timers ao desmontar
  useEffect(() => {
    return () => {
      persistTimers.current.forEach(timer => clearTimeout(timer));
      persistTimers.current.clear();
    };
  }, []);
  
  // ✅ CORRIGIDO: Persistência com debounce para evitar race conditions
  useEffect(() => {
    if (!isLoading && members.length > 0) {
      debouncedPersist(STORAGE_KEYS.MEMBERS, members);
    }
  }, [members, isLoading, debouncedPersist]);

  useEffect(() => {
    if (!isLoading && clients.length > 0) {
      debouncedPersist(STORAGE_KEYS.CLIENTS, clients);
    }
  }, [clients, isLoading, debouncedPersist]);

  useEffect(() => {
    if (!isLoading && leads.length > 0) {
      debouncedPersist(STORAGE_KEYS.LEADS, leads);
    }
  }, [leads, isLoading, debouncedPersist]);

  useEffect(() => {
    if (!isLoading && projects.length > 0) {
      debouncedPersist(STORAGE_KEYS.PROJECTS, projects);
    }
  }, [projects, isLoading, debouncedPersist]);

  useEffect(() => {
    if (!isLoading && followUps.length > 0) {
      debouncedPersist(STORAGE_KEYS.FOLLOWUPS, followUps);
    }
  }, [followUps, isLoading, debouncedPersist]);

  useEffect(() => {
    if (!isLoading && financial.length > 0) {
      debouncedPersist(STORAGE_KEYS.FINANCIAL, financial);
    }
  }, [financial, isLoading, debouncedPersist]);

  // ✅ Inicializar monitoramento de storage
  useEffect(() => {
    initStorageMonitoring();
  }, []);
  
  // ✅ NOVO: Auto-limpeza de órfãos periódica
  useEffect(() => {
    // Executar limpeza inicial após carregar
    if (!isLoading) {
      const timer = setTimeout(() => {
        const result = cleanOrphans();
        if (result.cleaned > 0) {
          console.log('🧹 Limpeza inicial de órfãos:', result.details);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, cleanOrphans]);
  
  // Auto-limpeza periódica (a cada 5 minutos)
  useEffect(() => {
    const interval = setInterval(() => {
      const result = cleanOrphans();
      if (result.cleaned > 0) {
        console.warn('🧹 Auto-limpeza periódica:', result.details);
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [cleanOrphans]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FUNÇÕES DE EVENTO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const emitEvent = useCallback((event: DataEvent) => {
    setEvents(prev => [...prev.slice(-99), event]); // Manter últimos 100 eventos
    setLastSync(new Date());
    
    // Notificar listeners
    eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Erro ao notificar listener:', error);
      }
    });
  }, [eventListeners]);
  
  // ✅ CORRIGIDO: addEventListener retorna cleanup function
  const addEventListener = useCallback((callback: (event: DataEvent) => void) => {
    setEventListeners(prev => [...prev, callback]);
    
    // Retornar função de cleanup para remover listener
    return () => {
      setEventListeners(prev => prev.filter(cb => cb !== callback));
    };
  }, []);
  
  const removeEventListener = useCallback((callback: (event: DataEvent) => void) => {
    setEventListeners(prev => prev.filter(cb => cb !== callback));
  }, []);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // AÇÕES CRUD UNIFICADAS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const create = useCallback((entity: string, data: any): string => {
    const id = `${entity}-${Date.now()}`;
    const newData = { ...data, id };
    
    switch (entity) {
      case 'member':
        setMembers(prev => [...prev, newData as Member]);
        break;
      case 'client':
        setClients(prev => [...prev, newData as Cliente]);
        break;
      case 'lead':
        setLeads(prev => [...prev, newData as Lead]);
        break;
      case 'project':
        setProjects(prev => [...prev, newData as Project]);
        break;
      case 'followUp':
      case 'followup':
        setFollowUps(prev => [...prev, newData as FollowUp]);
        break;
      case 'financial':
        setFinancial(prev => [...prev, newData]);
        break;
      case 'automation':
        // Criar no AutomationEngine e sincronizar
        const createdAutomation = automationEngine.createAutomation(newData);
        setAutomations(automationEngine.getAutomations());
        return createdAutomation.id;
      default:
        throw new Error(`Entidade desconhecida: ${entity}`);
    }
    
    emitEvent({
      type: 'create',
      entity,
      id,
      data: newData,
      timestamp: new Date(),
    });
    
    return id;
  }, [emitEvent]);
  
  const update = useCallback((entity: string, id: string, data: any) => {
    switch (entity) {
      case 'member':
        setMembers(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
        break;
      case 'client':
        setClients(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
        break;
      case 'lead':
        setLeads(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
        break;
      case 'project':
        setProjects(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
        break;
      case 'followUp':
      case 'followup':
        setFollowUps(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
        break;
      case 'financial':
        setFinancial(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
        break;
      case 'automation':
        // Atualizar no AutomationEngine e sincronizar
        automationEngine.updateAutomation(id, data);
        setAutomations(automationEngine.getAutomations());
        break;
      default:
        throw new Error(`Entidade desconhecida: ${entity}`);
    }
    
    emitEvent({
      type: 'update',
      entity,
      id,
      data,
      timestamp: new Date(),
    });
  }, [emitEvent]);
  
  const deleteEntity = useCallback((entity: string, id: string) => {
    console.log('🗑️ DataContext.deleteEntity chamado:', { entity, id });

    // ✅ NOVO: Criar backup automático antes de deletar
    try {
      const backup = createBackup();
      sessionStorage.setItem('nebula-last-backup', backup);
      sessionStorage.setItem('nebula-last-backup-time', new Date().toISOString());
      console.log('💾 Backup criado antes de deletar');
    } catch (error) {
      console.warn('Não foi possível criar backup antes de deletar:', error);
    }

    switch (entity) {
      case 'member':
        console.log('Deletando member:', id);
        setMembers(prev => prev.filter(item => item.id !== id));
        break;
      case 'client':
        console.log('Deletando client:', id);
        setClients(prev => {
          const before = prev.length;
          const after = prev.filter(item => item.id !== id);
          console.log(`Clients antes: ${before}, depois: ${after.length}`);
          return after;
        });
        break;
      case 'lead':
        setLeads(prev => prev.filter(item => item.id !== id));
        break;
      case 'project':
        setProjects(prev => prev.filter(item => item.id !== id));
        break;
      case 'followUp':
      case 'followup':
        setFollowUps(prev => prev.filter(item => item.id !== id));
        break;
      case 'financial':
        setFinancial(prev => prev.filter(item => item.id !== id));
        break;
      case 'automation':
        // Deletar no AutomationEngine e sincronizar
        automationEngine.deleteAutomation(id);
        setAutomations(automationEngine.getAutomations());
        break;
      default:
        throw new Error(`Entidade desconhecida: ${entity}`);
    }

    emitEvent({
      type: 'delete',
      entity,
      id,
      timestamp: new Date(),
    });
  }, [emitEvent]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // AÇÕES DE RELACIONAMENTO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const link = useCallback((fromEntity: string, fromId: string, toEntity: string, toId: string) => {
    const relationshipKey = `${fromEntity}${toEntity}` as keyof Relationships;
    const reverseKey = `${toEntity}${fromEntity}` as keyof Relationships;
    
    setRelationships(prev => {
      const newRelationships = { ...prev };
      
      // Link direto
      const currentLinks = newRelationships[relationshipKey]?.get(fromId) || [];
      if (!currentLinks.includes(toId)) {
        newRelationships[relationshipKey]?.set(fromId, [...currentLinks, toId]);
      }
      
      // Link reverso
      const currentReverseLinks = newRelationships[reverseKey]?.get(toId) || [];
      if (!currentReverseLinks.includes(fromId)) {
        newRelationships[reverseKey]?.set(toId, [...currentReverseLinks, fromId]);
      }
      
      return newRelationships;
    });
    
    emitEvent({
      type: 'link',
      entity: `${fromEntity}-${toEntity}`,
      id: `${fromId}-${toId}`,
      timestamp: new Date(),
    });
  }, [emitEvent]);
  
  const unlink = useCallback((fromEntity: string, fromId: string, toEntity: string, toId: string) => {
    const relationshipKey = `${fromEntity}${toEntity}` as keyof Relationships;
    const reverseKey = `${toEntity}${fromEntity}` as keyof Relationships;
    
    setRelationships(prev => {
      const newRelationships = { ...prev };
      
      // Unlink direto
      const currentLinks = newRelationships[relationshipKey]?.get(fromId) || [];
      newRelationships[relationshipKey]?.set(fromId, currentLinks.filter(id => id !== toId));
      
      // Unlink reverso
      const currentReverseLinks = newRelationships[reverseKey]?.get(toId) || [];
      newRelationships[reverseKey]?.set(toId, currentReverseLinks.filter(id => id !== fromId));
      
      return newRelationships;
    });
    
    emitEvent({
      type: 'unlink',
      entity: `${fromEntity}-${toEntity}`,
      id: `${fromId}-${toId}`,
      timestamp: new Date(),
    });
  }, [emitEvent]);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VALIDAÇÃO E SINCRONIZAÇÃO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const validate = useCallback((): ValidationResult[] => {
    const results: ValidationResult[] = [];
    
    // Validar membros
    members.forEach(member => {
      if (!member.email) {
        results.push({
          entity: 'member',
          id: member.id,
          field: 'email',
          message: 'Email é obrigatório',
          severity: 'error'
        });
      }
    });
    
    // Validar clientes
    clients.forEach(client => {
      if (!client.email) {
        results.push({
          entity: 'client',
          id: client.id,
          field: 'email',
          message: 'Email é obrigatório',
          severity: 'error'
        });
      }
    });
    
    // Validar leads
    leads.forEach(lead => {
      if (!lead.email) {
        results.push({
          entity: 'lead',
          id: lead.id,
          field: 'email',
          message: 'Email é obrigatório',
          severity: 'error'
        });
      }
    });
    
    return results;
  }, [members, clients, leads]);
  
  const sync = useCallback(() => {
    // Sincronizar contadores e relacionamentos
    setMembers(prev => prev.map(member => ({
      ...member,
      assignedLeads: leads.filter(lead => lead.owner === member.id).length,
      activeProjects: projects.filter(project =>
        project.team.some(teamMember => teamMember.id === member.id)
      ).length,
      activeTasks: projects.flatMap(project =>
        project.tasks.filter(task => task.assignedTo === member.id)
      ).length,
    })));

    setLastSync(new Date());
  }, [leads, projects]);

  // ✅ NOVO: Limpar relacionamentos órfãos
  const cleanOrphans = useCallback((): { cleaned: number; details: string[] } => {
    let cleanedCount = 0;
    const details: string[] = [];

    // 1. Limpar follow-ups órfãos (sem lead correspondente)
    const leadIds = new Set(leads.map(l => l.id));
    const orphanFollowUps = followUps.filter(fu => !leadIds.has(fu.lead_id));

    if (orphanFollowUps.length > 0) {
      setFollowUps(prev => prev.filter(fu => leadIds.has(fu.lead_id)));
      cleanedCount += orphanFollowUps.length;
      details.push(`${orphanFollowUps.length} follow-ups órfãos removidos`);
    }

    // 2. Limpar projetos com clientes inexistentes
    const clientIds = new Set(clients.map(c => c.id));
    const orphanProjects = projects.filter(p =>
      p.linkedClient && !clientIds.has(p.linkedClient.id)
    );

    if (orphanProjects.length > 0) {
      // Não deletar, apenas desvincular
      setProjects(prev => prev.map(p => {
        if (p.linkedClient && !clientIds.has(p.linkedClient.id)) {
          return { ...p, linkedClient: undefined };
        }
        return p;
      }));
      cleanedCount += orphanProjects.length;
      details.push(`${orphanProjects.length} projetos desvinculados de clientes inexistentes`);
    }

    // 3. Limpar tarefas com usuários inexistentes
    const memberIds = new Set(members.map(m => m.id));
    let orphanTasksCount = 0;

    setProjects(prev => prev.map(project => {
      const cleanedTasks = project.tasks.filter(task => {
        const isOrphan = task.usuario_id && !memberIds.has(task.usuario_id);
        if (isOrphan) orphanTasksCount++;
        return !isOrphan;
      });

      return {
        ...project,
        tasks: cleanedTasks
      };
    }));

    if (orphanTasksCount > 0) {
      cleanedCount += orphanTasksCount;
      details.push(`${orphanTasksCount} tarefas órfãs removidas`);
    }

    // 4. Limpar movimentações financeiras de clientes inexistentes
    const orphanFinancial = financial.filter(f =>
      f.clienteId && !clientIds.has(f.clienteId)
    );

    if (orphanFinancial.length > 0) {
      setFinancial(prev => prev.filter(f =>
        !f.clienteId || clientIds.has(f.clienteId)
      ));
      cleanedCount += orphanFinancial.length;
      details.push(`${orphanFinancial.length} movimentações financeiras órfãs removidas`);
    }

    if (cleanedCount > 0) {
      console.log('🧹 Limpeza de órfãos concluída:', details);
    }

    return { cleaned: cleanedCount, details };
  }, [leads, followUps, clients, projects, members, financial]);

  // ✅ NOVO: Validar e corrigir automaticamente antes de operações destrutivas
  const validateAndClean = useCallback((): boolean => {
    const orphans = cleanOrphans();

    if (orphans.cleaned > 0) {
      console.warn('⚠️ Dados órfãos detectados e limpos:', orphans.details);
    }

    const validationResults = validate();

    if (validationResults.length > 0) {
      console.warn('⚠️ Problemas de validação encontrados:', validationResults);
      return false;
    }

    return true;
  }, [cleanOrphans, validate]);

  // ✅ NOVO: Limpar TODOS os dados das abas (Comercial, Clientes, Projetos, Financeiro)
  const clearAllData = useCallback((options?: {
    keepMembers?: boolean;
    createBackup?: boolean;
  }) => {
    const { keepMembers = true, createBackup: shouldBackup = true } = options || {};

    // 1. Criar backup antes de limpar
    if (shouldBackup) {
      try {
        const backup = createBackup();
        localStorage.setItem('nebula-backup-before-clear', backup);
        localStorage.setItem('nebula-backup-before-clear-time', new Date().toISOString());
        console.log('💾 Backup completo criado antes da limpeza');
      } catch (error) {
        console.error('Erro ao criar backup:', error);
      }
    }

    // 2. Validar e limpar órfãos antes de limpar
    validateAndClean();

    // 3. Limpar dados das abas
    setClients([]);
    setLeads([]);
    setProjects([]);
    setFollowUps([]);
    setFinancial([]);
    setActivities([]);
    setAutomations([]);

    // 4. Manter ou limpar membros
    if (!keepMembers) {
      setMembers([]);
    }

    // 5. Limpar relacionamentos
    setRelationships({
      clientProjects: new Map(),
      projectTasks: new Map(),
      projectMembers: new Map(),
      memberLeads: new Map(),
      clientFinancial: new Map(),
      leadFollowUps: new Map(),
      taskMembers: new Map(),
    });

    // 6. Limpar localStorage das abas
    try {
      localStorage.removeItem('nebula-clients');
      localStorage.removeItem('nebula-leads');
      localStorage.removeItem('nebula-projects');
      localStorage.removeItem('nebula-followups');
      localStorage.removeItem('nebula-financial');

      if (!keepMembers) {
        localStorage.removeItem('nebula-members');
        localStorage.removeItem('nebula-teams');
      }
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
    }

    setLastSync(new Date());

    console.log('🧹 Limpeza completa concluída!', {
      membrosManutidos: keepMembers,
      backupCriado: shouldBackup
    });
  }, [validateAndClean]);

  const reset = useCallback(() => {
    // ✅ NOVO: Criar backup antes de reset
    try {
      const backup = createBackup();
      sessionStorage.setItem('nebula-backup-before-reset', backup);
      sessionStorage.setItem('nebula-backup-before-reset-time', new Date().toISOString());
      console.log('💾 Backup criado antes do reset');
    } catch (error) {
      console.warn('Não foi possível criar backup antes do reset:', error);
    }

    setMembers(mockMembers);
    setClients(mockClientes);
    setLeads(mockLeads);
    setProjects(mockProjects);
    setFollowUps(mockFollowUps);
    setFinancial(mockFinancial);
    setActivities(mockActivities);
    setLastSync(new Date());
  }, []);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VALOR DO CONTEXT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const value: DataContextType = {
    members,
    clients,
    leads,
    projects,
    followUps,
    financial,
    activities,
    automations,
    relationships,
    isLoading,
    lastSync,
    create,
    update,
    delete: deleteEntity,
    link,
    unlink,
    validate,
    sync,
    cleanOrphans,
    validateAndClean,
    clearAllData,
    reset,
    events,
    addEventListener,
    removeEventListener,
  };
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOOK PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }
  return context;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOOKS ESPECÍFICOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const useMembers = () => {
  const { members, create, update, delete: deleteMember } = useData();
  
  const createMember = useCallback((data: any) => create('member', data), [create]);
  const updateMember = useCallback((id: string, data: any) => update('member', id, data), [update]);
  const deleteMemberCallback = useCallback((id: string) => deleteMember('member', id), [deleteMember]);
  
  return { members, createMember, updateMember, deleteMember: deleteMemberCallback };
};

export const useClients = () => {
  const { clients, create, update, delete: deleteEntity } = useData();

  const createClient = useCallback((data: any) => create('client', data), [create]);
  const updateClient = useCallback((id: string, data: any) => update('client', id, data), [update]);
  const deleteClient = useCallback((id: string) => {
    console.log('🗑️ useClients.deleteClient chamado com ID:', id);
    deleteEntity('client', id);
  }, [deleteEntity]);

  return { clients, createClient, updateClient, deleteClient };
};

export const useLeads = () => {
  const { leads, create, update, delete: deleteEntity } = useData();

  const createLead = useCallback((data: any) => create('lead', data), [create]);
  const updateLead = useCallback((id: string, data: any) => update('lead', id, data), [update]);
  const deleteLead = useCallback((id: string) => deleteEntity('lead', id), [deleteEntity]);

  return { leads, createLead, updateLead, deleteLead };
};

export const useProjects = () => {
  const { projects, create, update, delete: deleteEntity } = useData();

  const createProject = useCallback((data: any) => create('project', data), [create]);
  const updateProject = useCallback((id: string, data: any) => update('project', id, data), [update]);
  const deleteProject = useCallback((id: string) => deleteEntity('project', id), [deleteEntity]);

  return { projects, createProject, updateProject, deleteProject };
};

export const useFinancial = () => {
  const { financial, create, update, delete: deleteEntity } = useData();

  const createFinancial = useCallback((data: any) => create('financial', data), [create]);
  const updateFinancial = useCallback((id: string, data: any) => update('financial', id, data), [update]);
  const deleteFinancial = useCallback((id: string) => deleteEntity('financial', id), [deleteEntity]);

  return { financial, createFinancial, updateFinancial, deleteFinancial };
};

export const useAutomations = () => {
  const { automations, create, update, delete: deleteEntity } = useData();

  const createAutomation = useCallback((data: any) => create('automation', data), [create]);
  const updateAutomation = useCallback((id: string, data: any) => update('automation', id, data), [update]);
  const deleteAutomation = useCallback((id: string) => deleteEntity('automation', id), [deleteEntity]);
  
  // Função para reinstalar automações do sistema
  const reinstallSystemAutomations = useCallback(() => {
    const result = automationEngine.reinstallSystemAutomations();
    if (result.success) {
      // Atualizar o estado do DataContext com as novas automações
      window.location.reload(); // Recarregar para garantir sincronização completa
    }
    return result;
  }, []);
  
  // Função para obter estatísticas
  const getStats = useCallback(() => {
    return automationEngine.getStats();
  }, []);
  
  return {
    automations,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    reinstallSystemAutomations,
    getStats
  };
};

export const useFollowUps = () => {
  const { followUps, create, update, delete: deleteEntity } = useData();

  const createFollowUp = useCallback((data: any) => create('followup', data), [create]);
  const updateFollowUp = useCallback((id: string, data: any) => update('followup', id, data), [update]);
  const deleteFollowUp = useCallback((id: string) => deleteEntity('followup', id), [deleteEntity]);

  return {
    followUps,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp
  };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOOK: useUsuarios (Nova interface unificada)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const useUsuarios = () => {
  const { members, leads, projects, activities, create, update, delete: deleteMember } = useData();
  
  // Converter Members para Usuarios
  const usuarios: Usuario[] = React.useMemo(() => {
    return members.map(member => memberParaUsuario(member));
  }, [members]);

  // Criar usuário (converte para Member internamente)
  const createUsuario = useCallback((data: Partial<Usuario>) => {
    const memberData = usuarioParaMember(data as Usuario);
    return create('member', memberData);
  }, [create]);

  // Atualizar usuário (converte para Member internamente)
  const updateUsuario = useCallback((id: string, data: Partial<Usuario>) => {
    const memberData = usuarioParaMember(data as Usuario);
    update('member', id, memberData);
  }, [update]);

  // Deletar usuário
  const deleteUsuario = useCallback((id: string) => {
    deleteMember('member', id);
  }, [deleteMember]);

  // Obter usuário por ID com métricas calculadas
  const getUsuario = useCallback((id: string): Usuario | undefined => {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return undefined;

    // Calcular métricas em tempo real
    const { calcularMetricasUsuario, calcularPerformanceUsuario } = require('@/types/usuario');
    const metricas = calcularMetricasUsuario(usuario, leads, projects, [], []);
    const performance = calcularPerformanceUsuario(metricas);

    return {
      ...usuario,
      metricas,
      performance,
    };
  }, [usuarios, leads, projects]);

  // Obter todos os usuários com métricas
  const getUsuariosComMetricas = useCallback((): Usuario[] => {
    const { calcularMetricasUsuario, calcularPerformanceUsuario } = require('@/types/usuario');
    
    return usuarios.map(usuario => {
      const metricas = calcularMetricasUsuario(usuario, leads, projects, [], []);
      const performance = calcularPerformanceUsuario(metricas);

      return {
        ...usuario,
        metricas,
        performance,
      };
    });
  }, [usuarios, leads, projects]);

  return {
    usuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    getUsuario,
    getUsuariosComMetricas,
  };
};
