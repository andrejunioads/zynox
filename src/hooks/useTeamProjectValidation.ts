// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HOOK: TEAM PROJECT VALIDATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Hook para validação e correção automática
// de integridade referencial entre equipe e projetos
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState, useEffect, useCallback } from 'react';
import { Member } from '@/types/member';
import { Project } from '@/pages/Projetos';
import { 
  teamProjectValidator, 
  ValidationResult, 
  AuditLog 
} from '@/services/teamProjectValidator';

export interface UseTeamProjectValidationReturn {
  // Estado
  isValid: boolean;
  validationResult: ValidationResult | null;
  auditLogs: AuditLog[];
  isRunning: boolean;
  
  // Ações
  validateAll: () => Promise<ValidationResult>;
  fixProject: (project: Project) => Project;
  getAuditLogs: (projectId?: string) => AuditLog[];
  generateReport: () => string;
  clearLogs: () => void;
}

export const useTeamProjectValidation = (
  projects: Project[],
  members: Member[]
): UseTeamProjectValidationReturn => {
  const [isValid, setIsValid] = useState(true);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Validar todos os projetos
  const validateAll = useCallback(async (): Promise<ValidationResult> => {
    setIsRunning(true);
    
    try {
      const result = teamProjectValidator.validateProjects(projects, members);
      setValidationResult(result);
      setIsValid(result.isValid);
      
      // Atualizar logs
      const logs = teamProjectValidator.getAuditLogs();
      setAuditLogs(logs);
      
      return result;
    } catch (error) {
      console.error('Erro na validação:', error);
      throw error;
    } finally {
      setIsRunning(false);
    }
  }, [projects, members]);

  // Corrigir um projeto específico
  const fixProject = useCallback((project: Project): Project => {
    const fixedProject = teamProjectValidator.fixProject(project, members);
    
    // Atualizar logs após correção
    const logs = teamProjectValidator.getAuditLogs();
    setAuditLogs(logs);
    
    return fixedProject;
  }, [members]);

  // Obter logs de auditoria
  const getAuditLogs = useCallback((projectId?: string): AuditLog[] => {
    const logs = teamProjectValidator.getAuditLogs(projectId);
    setAuditLogs(logs);
    return logs;
  }, []);

  // Gerar relatório
  const generateReport = useCallback((): string => {
    return teamProjectValidator.generateAuditReport(projects, members);
  }, [projects, members]);

  // Limpar logs antigos
  const clearLogs = useCallback(() => {
    teamProjectValidator.clearOldLogs(30);
    const logs = teamProjectValidator.getAuditLogs();
    setAuditLogs(logs);
  }, []);

  // Validação automática quando dados mudam
  useEffect(() => {
    if (projects.length > 0 && members.length > 0) {
      validateAll();
    }
  }, [projects, members, validateAll]);

  return {
    // Estado
    isValid,
    validationResult,
    auditLogs,
    isRunning,
    
    // Ações
    validateAll,
    fixProject,
    getAuditLogs,
    generateReport,
    clearLogs
  };
};
