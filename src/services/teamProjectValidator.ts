// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEAM PROJECT VALIDATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Sistema de validação de integridade referencial
// entre membros da equipe e projetos
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Member } from "@/types/member";
import { Project, TeamMember } from "@/pages/Projetos";

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  fixed: ValidationFix[];
}

export interface ValidationError {
  type: 'invalid_member' | 'duplicate_member' | 'missing_member';
  projectId: string;
  memberId: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export interface ValidationWarning {
  type: 'inconsistent_data' | 'missing_workload' | 'invalid_role';
  projectId: string;
  memberId: string;
  message: string;
}

export interface ValidationFix {
  type: 'member_removed' | 'member_added' | 'data_updated';
  projectId: string;
  memberId: string;
  action: string;
  timestamp: Date;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  action: 'validation' | 'fix' | 'member_added' | 'member_removed';
  projectId: string;
  memberId?: string;
  details: string;
  severity: 'info' | 'warning' | 'error';
}

class TeamProjectValidator {
  private auditLogs: AuditLog[] = [];

  /**
   * Valida todos os projetos contra a base de membros
   */
  validateProjects(projects: Project[], members: Member[]): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fixed: []
    };

    // Criar mapa de membros para busca rápida
    const memberMap = new Map(members.map(m => [m.id, m]));

    projects.forEach(project => {
      const projectValidation = this.validateProject(project, memberMap);
      
      result.errors.push(...projectValidation.errors);
      result.warnings.push(...projectValidation.warnings);
      result.fixed.push(...projectValidation.fixed);
      
      if (projectValidation.errors.length > 0) {
        result.isValid = false;
      }
    });

    // Log da validação
    this.addAuditLog({
      timestamp: new Date(),
      action: 'validation',
      projectId: 'all',
      details: `Validação completa: ${result.errors.length} erros, ${result.warnings.length} avisos, ${result.fixed.length} correções`,
      severity: result.isValid ? 'info' : 'error'
    });

    return result;
  }

  /**
   * Valida um projeto específico
   */
  private validateProject(project: Project, memberMap: Map<string, Member>): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fixed: []
    };

    const seenMemberIds = new Set<string>();

    project.team.forEach(member => {
      // Verificar se membro existe na base de equipe
      if (!memberMap.has(member.id)) {
        result.errors.push({
          type: 'invalid_member',
          projectId: project.id,
          memberId: member.id,
          message: `Membro "${member.name}" (ID: ${member.id}) não existe na base de equipe`,
          severity: 'high'
        });
        result.isValid = false;
        return;
      }

      // Verificar duplicatas no projeto
      if (seenMemberIds.has(member.id)) {
        result.errors.push({
          type: 'duplicate_member',
          projectId: project.id,
          memberId: member.id,
          message: `Membro "${member.name}" está duplicado no projeto`,
          severity: 'medium'
        });
        result.isValid = false;
        return;
      }

      seenMemberIds.add(member.id);

      // Verificar consistência de dados
      const baseMember = memberMap.get(member.id)!;
      this.validateMemberConsistency(project, member, baseMember, result);
    });

    return result;
  }

  /**
   * Valida consistência entre dados do membro no projeto e na base
   */
  private validateMemberConsistency(
    project: Project, 
    projectMember: TeamMember, 
    baseMember: Member, 
    result: ValidationResult
  ) {
    // Verificar nome
    if (projectMember.name !== baseMember.name) {
      result.warnings.push({
        type: 'inconsistent_data',
        projectId: project.id,
        memberId: projectMember.id,
        message: `Nome inconsistente: projeto="${projectMember.name}", base="${baseMember.name}"`
      });
    }

    // Verificar email
    if (projectMember.email && projectMember.email !== baseMember.email) {
      result.warnings.push({
        type: 'inconsistent_data',
        projectId: project.id,
        memberId: projectMember.id,
        message: `Email inconsistente: projeto="${projectMember.email}", base="${baseMember.email}"`
      });
    }

    // Verificar avatar
    if (projectMember.avatar !== baseMember.avatar) {
      result.warnings.push({
        type: 'inconsistent_data',
        projectId: project.id,
        memberId: projectMember.id,
        message: `Avatar inconsistente: projeto="${projectMember.avatar}", base="${baseMember.avatar}"`
      });
    }

    // Verificar workload
    if (!projectMember.workload || projectMember.workload <= 0) {
      result.warnings.push({
        type: 'missing_workload',
        projectId: project.id,
        memberId: projectMember.id,
        message: `Workload não definido ou inválido: ${projectMember.workload}`
      });
    }

    // Verificar role mapping
    const validRoles = ['project_manager', 'developer', 'designer', 'qa', 'analyst'];
    if (!validRoles.includes(projectMember.role)) {
      result.warnings.push({
        type: 'invalid_role',
        projectId: project.id,
        memberId: projectMember.id,
        message: `Role inválido: ${projectMember.role}`
      });
    }
  }

  /**
   * Corrige automaticamente os erros encontrados
   */
  fixProject(project: Project, members: Member[]): Project {
    const memberMap = new Map(members.map(m => [m.id, m]));
    const fixedProject = { ...project };
    
    // Remover membros inválidos
    const validMembers = fixedProject.team.filter(member => {
      if (!memberMap.has(member.id)) {
        this.addAuditLog({
          timestamp: new Date(),
          action: 'member_removed',
          projectId: project.id,
          memberId: member.id,
          details: `Membro "${member.name}" removido por não existir na base de equipe`,
          severity: 'warning'
        });
        return false;
      }
      return true;
    });

    // Remover duplicatas
    const uniqueMembers = validMembers.filter((member, index, array) => 
      array.findIndex(m => m.id === member.id) === index
    );

    // Atualizar dados dos membros com base na equipe
    const updatedMembers = uniqueMembers.map(member => {
      const baseMember = memberMap.get(member.id)!;
      
      // Verificar se precisa atualizar dados
      const needsUpdate = 
        member.name !== baseMember.name ||
        member.email !== baseMember.email ||
        member.avatar !== baseMember.avatar;

      if (needsUpdate) {
        this.addAuditLog({
          timestamp: new Date(),
          action: 'fix',
          projectId: project.id,
          memberId: member.id,
          details: `Dados do membro "${member.name}" atualizados com base na equipe`,
          severity: 'info'
        });

        return {
          ...member,
          name: baseMember.name,
          email: baseMember.email,
          avatar: baseMember.avatar,
          workload: member.workload || 1, // Default workload
          isOnline: baseMember.status === 'online',
          isAdmin: baseMember.role === 'admin'
        };
      }

      return member;
    });

    fixedProject.team = updatedMembers;

    return fixedProject;
  }

  /**
   * Adiciona log de auditoria
   */
  private addAuditLog(log: Omit<AuditLog, 'id'>) {
    const auditLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.auditLogs.push(auditLog);
    
    // Manter apenas os últimos 1000 logs
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-1000);
    }
  }

  /**
   * Obtém logs de auditoria
   */
  getAuditLogs(projectId?: string, limit: number = 100): AuditLog[] {
    let logs = this.auditLogs;
    
    if (projectId) {
      logs = logs.filter(log => log.projectId === projectId || log.projectId === 'all');
    }
    
    return logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Limpa logs antigos
   */
  clearOldLogs(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    this.auditLogs = this.auditLogs.filter(log => log.timestamp > cutoffDate);
  }

  /**
   * Gera relatório de auditoria
   */
  generateAuditReport(projects: Project[], members: Member[]): string {
    const validation = this.validateProjects(projects, members);
    const logs = this.getAuditLogs();
    
    const report = `
# RELATÓRIO DE AUDITORIA - EQUIPE E PROJETOS
Gerado em: ${new Date().toLocaleString('pt-BR')}

## RESUMO
- Total de Projetos: ${projects.length}
- Total de Membros: ${members.length}
- Erros Encontrados: ${validation.errors.length}
- Avisos: ${validation.warnings.length}
- Correções Aplicadas: ${validation.fixed.length}

## ERROS CRÍTICOS
${validation.errors.map(error => 
  `- [${error.severity.toUpperCase()}] Projeto ${error.projectId}: ${error.message}`
).join('\n')}

## AVISOS
${validation.warnings.map(warning => 
  `- Projeto ${warning.projectId}: ${warning.message}`
).join('\n')}

## CORREÇÕES APLICADAS
${validation.fixed.map(fix => 
  `- ${fix.action} (${fix.timestamp.toLocaleString('pt-BR')})`
).join('\n')}

## LOGS RECENTES
${logs.slice(0, 10).map(log => 
  `- [${log.timestamp.toLocaleString('pt-BR')}] ${log.action}: ${log.details}`
).join('\n')}

## STATUS FINAL
${validation.isValid ? '✅ SISTEMA VÁLIDO' : '❌ SISTEMA COM ERROS'}
    `.trim();

    return report;
  }
}

// Instância singleton
export const teamProjectValidator = new TeamProjectValidator();
