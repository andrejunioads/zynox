// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TESTES AUTOMATIZADOS - VALIDAÇÃO EQUIPE/PROJETOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { teamProjectValidator } from '@/services/teamProjectValidator';
import { Member } from '@/types/member';
import { Project, TeamMember } from '@/pages/Projetos';

// Mock data para testes
const mockMembers: Member[] = [
  {
    id: "1",
    name: "André Junio",
    email: "andre@zynox.com.br",
    phone: "(11) 98765-4321",
    avatar: "AJ",
    role: "admin",
    department: "comercial",
    status: "online",
    type: "human",
    stats: {
      totalLeads: 48,
      convertedLeads: 44,
      conversionRate: 92,
      avgResponseTime: 5,
      completedTasks: 127,
      totalInteractions: 384,
      followUpsCreated: 56,
      periodStart: new Date(2025, 0, 1),
      periodEnd: new Date()
    },
    assignedLeads: 12,
    activeProjects: 8,
    activeTasks: 15,
    joinedAt: new Date(2024, 0, 15),
    lastActivity: new Date(),
    isActive: true
  },
  {
    id: "2",
    name: "Bianca Silva",
    email: "bianca@zynox.com.br",
    phone: "(11) 98765-4322",
    avatar: "BS",
    role: "manager",
    department: "design",
    status: "online",
    type: "human",
    stats: {
      totalLeads: 32,
      convertedLeads: 28,
      conversionRate: 88,
      avgResponseTime: 12,
      completedTasks: 95,
      totalInteractions: 210,
      followUpsCreated: 38,
      periodStart: new Date(2025, 0, 1),
      periodEnd: new Date()
    },
    assignedLeads: 8,
    activeProjects: 12,
    activeTasks: 18,
    joinedAt: new Date(2024, 1, 10),
    lastActivity: new Date(),
    isActive: true
  }
];

const mockProjects: Project[] = [
  {
    id: "project-1",
    name: "Website E-commerce",
    type: "WEBSITE",
    teamId: "team-1",
    client: "TechCorp",
    status: "in-progress",
    priority: "high",
    progress: 75,
    healthScore: 90,
    deadline: "2025-11-15",
    team: [
      {
        id: "1",
        name: "André Junio",
        avatar: "AJ",
        role: "project_manager",
        email: "andre@zynox.com.br",
        workload: 3,
        isOnline: true,
        isAdmin: true
      },
      {
        id: "2",
        name: "Bianca Silva",
        avatar: "BS",
        role: "developer",
        email: "bianca@zynox.com.br",
        workload: 2,
        isOnline: true
      }
    ],
    tags: ["E-commerce", "React"],
    tasks: [],
    files: [],
    comments: [],
    activities: [],
    milestones: [],
    risks: [],
    notes: [],
    value: 15000,
    budget: {
      total: 15000,
      spent: 11250,
      breakdown: {
        labor: 10000,
        infrastructure: 1000,
        external: 250,
        other: 0
      }
    },
    paymentPlan: {
      totalValue: 15000,
      paymentType: 'installments',
      installmentCount: 3,
      invoices: []
    },
    description: "Desenvolvimento de e-commerce completo",
    startDate: "2025-10-01",
    createdBy: "André Júnio",
    updatedAt: "2025-10-26T10:00:00Z"
  }
];

const invalidProject: Project = {
  ...mockProjects[0],
  id: "project-invalid",
  name: "Projeto com Membros Inválidos",
  team: [
    {
      id: "999", // ID que não existe na base de membros
      name: "Membro Inexistente",
      avatar: "MI",
      role: "developer",
      email: "inexistente@test.com",
      workload: 1,
      isOnline: true
    },
    {
      id: "1", // ID válido
      name: "André Junio",
      avatar: "AJ",
      role: "project_manager",
      email: "andre@zynox.com.br",
      workload: 3,
      isOnline: true,
      isAdmin: true
    },
    {
      id: "1", // ID duplicado
      name: "André Junio Duplicado",
      avatar: "AJ",
      role: "developer",
      email: "andre@zynox.com.br",
      workload: 1,
      isOnline: true
    }
  ]
};

// Testes
describe('TeamProjectValidator', () => {
  beforeEach(() => {
    // Limpar logs antes de cada teste
    teamProjectValidator.clearOldLogs(0);
  });

  test('deve validar projetos com membros válidos', () => {
    const result = teamProjectValidator.validateProjects(mockProjects, mockMembers);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  test('deve detectar membros inválidos', () => {
    const result = teamProjectValidator.validateProjects([invalidProject], mockMembers);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    
    // Verificar se detectou membro inexistente
    const invalidMemberError = result.errors.find(e => e.type === 'invalid_member');
    expect(invalidMemberError).toBeDefined();
    expect(invalidMemberError?.memberId).toBe('999');
    
    // Verificar se detectou duplicata
    const duplicateError = result.errors.find(e => e.type === 'duplicate_member');
    expect(duplicateError).toBeDefined();
    expect(duplicateError?.memberId).toBe('1');
  });

  test('deve corrigir projeto automaticamente', () => {
    const fixedProject = teamProjectValidator.fixProject(invalidProject, mockMembers);
    
    // Deve ter removido o membro inválido
    expect(fixedProject.team).toHaveLength(1);
    expect(fixedProject.team[0].id).toBe('1');
    
    // Deve ter removido duplicatas
    const memberIds = fixedProject.team.map(m => m.id);
    const uniqueIds = [...new Set(memberIds)];
    expect(memberIds).toHaveLength(uniqueIds.length);
  });

  test('deve gerar logs de auditoria', () => {
    teamProjectValidator.validateProjects([invalidProject], mockMembers);
    const logs = teamProjectValidator.getAuditLogs();
    
    expect(logs.length).toBeGreaterThan(0);
    
    const validationLog = logs.find(log => log.action === 'validation');
    expect(validationLog).toBeDefined();
    expect(validationLog?.severity).toBe('error');
  });

  test('deve gerar relatório de auditoria', () => {
    const report = teamProjectValidator.generateAuditReport([invalidProject], mockMembers);
    
    expect(report).toContain('RELATÓRIO DE AUDITORIA');
    expect(report).toContain('Erros Encontrados:');
    expect(report).toContain('SISTEMA COM ERROS');
  });

  test('deve filtrar logs por projeto', () => {
    teamProjectValidator.validateProjects([invalidProject], mockMembers);
    const allLogs = teamProjectValidator.getAuditLogs();
    const projectLogs = teamProjectValidator.getAuditLogs('project-invalid');
    
    expect(projectLogs.length).toBeLessThanOrEqual(allLogs.length);
    expect(projectLogs.every(log => log.projectId === 'project-invalid' || log.projectId === 'all')).toBe(true);
  });

  test('deve limpar logs antigos', () => {
    // Adicionar logs
    teamProjectValidator.validateProjects([invalidProject], mockMembers);
    const initialLogs = teamProjectValidator.getAuditLogs();
    
    // Limpar logs (simulando logs de 0 dias atrás)
    teamProjectValidator.clearOldLogs(0);
    const afterClear = teamProjectValidator.getAuditLogs();
    
    expect(afterClear.length).toBeLessThan(initialLogs.length);
  });
});

// Teste de integração
describe('Integração - Modal de Seleção de Membros', () => {
  test('deve converter Member para TeamMember corretamente', () => {
    const member = mockMembers[0];
    
    // Simular conversão do modal
    const teamMember: TeamMember = {
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role === 'admin' ? 'project_manager' : 'developer',
      avatar: member.avatar,
      isOnline: member.status === 'online',
      isAdmin: member.role === 'admin',
      workload: 1,
      phone: member.phone
    };
    
    expect(teamMember.id).toBe(member.id);
    expect(teamMember.name).toBe(member.name);
    expect(teamMember.email).toBe(member.email);
    expect(teamMember.avatar).toBe(member.avatar);
    expect(teamMember.isAdmin).toBe(true);
    expect(teamMember.isOnline).toBe(true);
  });
});

// Teste de performance
describe('Performance', () => {
  test('deve validar muitos projetos rapidamente', () => {
    const manyProjects = Array(100).fill(null).map((_, i) => ({
      ...mockProjects[0],
      id: `project-${i}`,
      name: `Projeto ${i}`
    }));
    
    const startTime = Date.now();
    const result = teamProjectValidator.validateProjects(manyProjects, mockMembers);
    const endTime = Date.now();
    
    expect(result.isValid).toBe(true);
    expect(endTime - startTime).toBeLessThan(1000); // Deve ser rápido (< 1s)
  });
});

export { mockMembers, mockProjects, invalidProject };
