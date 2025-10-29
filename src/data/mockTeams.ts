import { Team, TeamMember, ProjectType } from '@/types/teams';

// ============================================
// ADMINISTRADOR PRINCIPAL (aparece em TODOS os projetos)
// ============================================
export const adminUser: TeamMember = {
  id: 'admin-001',
  name: 'André Silva',
  email: 'andre@zynox.digital',
  role: 'Administrador Principal',
  isAdmin: true,
  avatar: 'AS',
  isOnline: true,
};

// ============================================
// EQUIPE 1: DESENVOLVIMENTO WEB
// ============================================
export const webDevTeam: Team = {
  id: 'team-001',
  name: 'Equipe de Desenvolvimento Web',
  type: ProjectType.WEBSITE,
  color: '#3b82f6',
  icon: '🌐',
  description: 'Especializada em desenvolvimento de websites, aplicações web e e-commerce',
  members: [
    {
      id: 'tm-001',
      name: 'João Silva',
      email: 'joao.silva@empresa.com',
      role: 'Desenvolvedor Frontend',
      teamId: 'team-001',
      isAdmin: false,
      avatar: 'JS',
      phone: '+55 11 98765-4321',
      workload: 5,
      isOnline: true,
    },
    {
      id: 'tm-002',
      name: 'Maria Costa',
      email: 'maria.costa@empresa.com',
      role: 'Desenvolvedora Backend',
      teamId: 'team-001',
      isAdmin: false,
      avatar: 'MC',
      phone: '+55 11 98765-4322',
      workload: 3,
      isOnline: false,
    },
    {
      id: 'tm-003',
      name: 'Pedro Santos',
      email: 'pedro.santos@empresa.com',
      role: 'UI/UX Designer',
      teamId: 'team-001',
      isAdmin: false,
      avatar: 'PS',
      phone: '+55 11 98765-4323',
      workload: 4,
      isOnline: true,
    },
    {
      id: 'tm-004',
      name: 'Carla Oliveira',
      email: 'carla.oliveira@empresa.com',
      role: 'QA / Tester',
      teamId: 'team-001',
      isAdmin: false,
      avatar: 'CO',
      phone: '+55 11 98765-4324',
      workload: 2,
      isOnline: true,
    },
  ],
};

// ============================================
// EQUIPE 2: MARKETING DIGITAL / TRÁFEGO
// ============================================
export const marketingTeam: Team = {
  id: 'team-002',
  name: 'Equipe de Marketing Digital',
  type: ProjectType.TRAFFIC,
  color: '#f59e0b',
  icon: '📈',
  description: 'Especializada em tráfego pago, SEO, redes sociais e campanhas digitais',
  members: [
    {
      id: 'tm-010',
      name: 'Ana Paula',
      email: 'ana.paula@empresa.com',
      role: 'Especialista em Tráfego Pago',
      teamId: 'team-002',
      isAdmin: false,
      avatar: 'AP',
      phone: '+55 11 98765-5001',
      workload: 6,
      isOnline: true,
    },
    {
      id: 'tm-011',
      name: 'Carlos Lima',
      email: 'carlos.lima@empresa.com',
      role: 'Copywriter',
      teamId: 'team-002',
      isAdmin: false,
      avatar: 'CL',
      phone: '+55 11 98765-5002',
      workload: 4,
      isOnline: false,
    },
    {
      id: 'tm-012',
      name: 'Lucia Rocha',
      email: 'lucia.rocha@empresa.com',
      role: 'Social Media Manager',
      teamId: 'team-002',
      isAdmin: false,
      avatar: 'LR',
      phone: '+55 11 98765-5003',
      workload: 5,
      isOnline: true,
    },
    {
      id: 'tm-013',
      name: 'Fernando Dias',
      email: 'fernando.dias@empresa.com',
      role: 'Analista de SEO',
      teamId: 'team-002',
      isAdmin: false,
      avatar: 'FD',
      phone: '+55 11 98765-5004',
      workload: 3,
      isOnline: true,
    },
  ],
};

// ============================================
// EQUIPE 3: AUTOMAÇÃO
// ============================================
export const automationTeam: Team = {
  id: 'team-003',
  name: 'Equipe de Automação',
  type: ProjectType.AUTOMATION,
  color: '#8b5cf6',
  icon: '🤖',
  description: 'Especializada em automações, integrações, APIs e workflows',
  members: [
    {
      id: 'tm-020',
      name: 'Roberto Almeida',
      email: 'roberto.almeida@empresa.com',
      role: 'Especialista em Automação',
      teamId: 'team-003',
      isAdmin: false,
      avatar: 'RA',
      phone: '+55 11 98765-6001',
      workload: 7,
      isOnline: true,
    },
    {
      id: 'tm-021',
      name: 'Fernanda Silva',
      email: 'fernanda.silva@empresa.com',
      role: 'Engenheira de QA',
      teamId: 'team-003',
      isAdmin: false,
      avatar: 'FS',
      phone: '+55 11 98765-6002',
      workload: 4,
      isOnline: true,
    },
    {
      id: 'tm-022',
      name: 'Gustavo Lima',
      email: 'gustavo.lima@empresa.com',
      role: 'Integrador de Sistemas',
      teamId: 'team-003',
      isAdmin: false,
      avatar: 'GL',
      phone: '+55 11 98765-6003',
      workload: 5,
      isOnline: false,
    },
  ],
};

// ============================================
// EQUIPE 4: DESIGN
// ============================================
export const designTeam: Team = {
  id: 'team-004',
  name: 'Equipe de Design',
  type: ProjectType.DESIGN,
  color: '#ec4899',
  icon: '🎨',
  description: 'Especializada em design gráfico, branding e identidade visual',
  members: [
    {
      id: 'tm-030',
      name: 'Julia Mendes',
      email: 'julia.mendes@empresa.com',
      role: 'Designer Gráfico',
      teamId: 'team-004',
      isAdmin: false,
      avatar: 'JM',
      phone: '+55 11 98765-7001',
      workload: 4,
      isOnline: true,
    },
    {
      id: 'tm-031',
      name: 'Ricardo Pinto',
      email: 'ricardo.pinto@empresa.com',
      role: 'Diretor de Arte',
      teamId: 'team-004',
      isAdmin: false,
      avatar: 'RP',
      phone: '+55 11 98765-7002',
      workload: 3,
      isOnline: false,
    },
  ],
};

// ============================================
// EQUIPE 5: MOBILE
// ============================================
export const mobileTeam: Team = {
  id: 'team-005',
  name: 'Equipe Mobile',
  type: ProjectType.MOBILE,
  color: '#10b981',
  icon: '📱',
  description: 'Especializada em desenvolvimento de aplicativos iOS e Android',
  members: [
    {
      id: 'tm-040',
      name: 'Marcos Ferreira',
      email: 'marcos.ferreira@empresa.com',
      role: 'Desenvolvedor iOS',
      teamId: 'team-005',
      isAdmin: false,
      avatar: 'MF',
      phone: '+55 11 98765-8001',
      workload: 5,
      isOnline: true,
    },
    {
      id: 'tm-041',
      name: 'Patricia Souza',
      email: 'patricia.souza@empresa.com',
      role: 'Desenvolvedora Android',
      teamId: 'team-005',
      isAdmin: false,
      avatar: 'PS',
      phone: '+55 11 98765-8002',
      workload: 4,
      isOnline: true,
    },
  ],
};

// ============================================
// EQUIPE 6: CONSULTORIA
// ============================================
export const consultingTeam: Team = {
  id: 'team-006',
  name: 'Equipe de Consultoria',
  type: ProjectType.CONSULTING,
  color: '#6366f1',
  icon: '💼',
  description: 'Especializada em consultoria estratégica, análise e gestão de projetos',
  members: [
    {
      id: 'tm-050',
      name: 'Beatriz Cardoso',
      email: 'beatriz.cardoso@empresa.com',
      role: 'Consultora de Negócios',
      teamId: 'team-006',
      isAdmin: false,
      avatar: 'BC',
      phone: '+55 11 98765-9001',
      workload: 3,
      isOnline: false,
    },
    {
      id: 'tm-051',
      name: 'Eduardo Martins',
      email: 'eduardo.martins@empresa.com',
      role: 'Analista de Processos',
      teamId: 'team-006',
      isAdmin: false,
      avatar: 'EM',
      phone: '+55 11 98765-9002',
      workload: 4,
      isOnline: true,
    },
  ],
};

// ============================================
// ARRAY COM TODAS AS EQUIPES
// ============================================
export const allTeams: Team[] = [
  webDevTeam,
  marketingTeam,
  automationTeam,
  designTeam,
  mobileTeam,
  consultingTeam,
];

// ============================================
// FUNÇÕES HELPER
// ============================================

/**
 * Obter equipe por tipo de projeto
 */
export const getTeamByProjectType = (type: ProjectType): Team | undefined => {
  return allTeams.find((team) => team.type === type);
};

/**
 * Obter membros disponíveis para um projeto
 * Retorna: [Admin] + [Membros da equipe específica]
 */
export const getAvailableMembersForProject = (
  projectType: ProjectType
): TeamMember[] => {
  const team = getTeamByProjectType(projectType);
  const teamMembers = team ? team.members : [];

  // Admin sempre vem primeiro
  return [adminUser, ...teamMembers];
};

/**
 * Obter todos os membros (incluindo admin e todas as equipes)
 */
export const getAllMembers = (): TeamMember[] => {
  const allMembers = allTeams.flatMap((team) => team.members);
  return [adminUser, ...allMembers];
};

/**
 * Buscar membro por ID
 */
export const getMemberById = (memberId: string): TeamMember | undefined => {
  if (memberId === adminUser.id) return adminUser;
  
  for (const team of allTeams) {
    const member = team.members.find((m) => m.id === memberId);
    if (member) return member;
  }
  
  return undefined;
};

/**
 * Buscar membro por nome
 */
export const getMemberByName = (memberName: string): TeamMember | undefined => {
  if (memberName === adminUser.name) return adminUser;
  
  for (const team of allTeams) {
    const member = team.members.find((m) => m.name === memberName);
    if (member) return member;
  }
  
  return undefined;
};
