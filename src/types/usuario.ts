/**
 * 🧑 ENTIDADE UNIFICADA: USUARIO
 * 
 * Esta é a base única para todas as informações de usuário no sistema.
 * Substitui as antigas referências a "Member", "Profile", "Colaborador", etc.
 * 
 * Todos os módulos devem usar esta interface como referência.
 */

export type UsuarioTipo = 'humano' | 'ia';
export type UsuarioStatus = 'online' | 'away' | 'offline';
export type UsuarioCargo = 'comercial' | 'desenvolvedor' | 'designer' | 'gerente' | 'admin' | 'ia';
export type UsuarioDepartamento = 'comercial' | 'dev' | 'design' | 'ia' | 'admin' | 'financeiro';
export type UsuarioNivelAcesso = 'admin' | 'colaborador' | 'visualizador';

export interface Usuario {
  // ===== IDENTIFICAÇÃO =====
  id: string;
  nome: string;
  sobrenome?: string;
  nomeCompleto: string; // Computed: nome + sobrenome
  email: string;
  avatar: string; // Iniciais ou sigla
  photoUrl?: string; // URL da foto (base64 ou URL externa)

  // ===== TIPO E PERMISSÕES =====
  tipo: UsuarioTipo; // 'humano' ou 'ia'
  nivelAcesso: UsuarioNivelAcesso; // 'admin', 'colaborador', 'visualizador'
  isAdmin: boolean;
  isAI: boolean; // Computed: tipo === 'ia'
  
  // ===== CARGO E DEPARTAMENTO =====
  cargo: UsuarioCargo;
  departamento: UsuarioDepartamento;
  cargoCustom?: string; // Cargo personalizado se necessário
  
  // ===== STATUS =====
  status: UsuarioStatus; // 'online', 'away', 'offline'
  isActive: boolean; // Usuário ativo no sistema
  
  // ===== CONTATO =====
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  
  // ===== DADOS PESSOAIS =====
  cpf?: string;
  dataNascimento?: string; // ISO format
  endereco?: {
    rua?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  
  // ===== DATAS =====
  dataIngresso: string; // ISO format
  createdAt: string; // ISO format
  updatedAt?: string; // ISO format
  lastActivity?: string; // ISO format - última atividade
  
  // ===== MÉTRICAS (calculadas automaticamente) =====
  metricas?: {
    leadsAtribuidos: number;
    leadsConvertidos: number;
    projetosAtivos: number;
    projetosUrgentes: number;
    tarefasTotal: number;
    tarefasVencendoHoje: number;
    tarefasConcluidas: number;
    taxaConversao: number; // %
    tempoMedioResposta: number; // minutos
    totalInteracoes: number;
    followupsCriados: number;
  };
  
  // ===== PERFORMANCE =====
  performance?: {
    nivel: 'excelente' | 'boa' | 'regular' | 'critica';
    pontuacao: number; // 0-100
    tendencia: 'subindo' | 'estavel' | 'descendo';
  };
  
  // ===== RELACIONAMENTOS (IDs) =====
  equipeIds?: string[]; // IDs das equipes que o usuário pertence
  projetoIds?: string[]; // IDs dos projetos associados
  leadIds?: string[]; // IDs dos leads atribuídos
  
  // ===== CONFIGURAÇÕES =====
  preferencias?: {
    notificacoes: boolean;
    tema: 'dark' | 'light' | 'auto';
    idioma: 'pt-BR' | 'en' | 'es';
  };
  
  // ===== OBSERVAÇÕES =====
  observacoes?: string;
  
  // ===== METADATA =====
  metadata?: {
    ultimoLogin?: string;
    ip?: string;
    dispositivo?: string;
  };
}

// ===== HELPERS E CONSTANTES =====

export const USUARIO_TIPO_LABELS: Record<UsuarioTipo, string> = {
  humano: 'Humano',
  ia: 'Inteligência Artificial',
};

export const USUARIO_CARGO_LABELS: Record<UsuarioCargo, string> = {
  comercial: 'Comercial',
  desenvolvedor: 'Desenvolvedor',
  designer: 'Designer',
  gerente: 'Gerente de Projetos',
  admin: 'Administrador',
  ia: 'Agente IA',
};

export const USUARIO_DEPARTAMENTO_LABELS: Record<UsuarioDepartamento, string> = {
  comercial: 'Comercial',
  dev: 'Desenvolvimento',
  design: 'Design',
  ia: 'Inteligência Artificial',
  admin: 'Administração',
  financeiro: 'Financeiro',
};

export const USUARIO_DEPARTAMENTO_COLORS: Record<UsuarioDepartamento, string> = {
  comercial: 'text-blue-400',
  dev: 'text-green-400',
  design: 'text-pink-400',
  ia: 'text-purple-400',
  admin: 'text-orange-400',
  financeiro: 'text-yellow-400',
};

export const USUARIO_STATUS_COLORS: Record<UsuarioStatus, string> = {
  online: 'bg-green-400',
  away: 'bg-yellow-400',
  offline: 'bg-gray-400',
};

export const USUARIO_NIVEL_ACESSO_LABELS: Record<UsuarioNivelAcesso, string> = {
  admin: 'Administrador',
  colaborador: 'Colaborador',
  visualizador: 'Visualizador',
};

export const USUARIO_PERFORMANCE_COLORS = {
  excelente: 'text-green-400 bg-green-400/10 border-green-400/30',
  boa: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  regular: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  critica: 'text-red-400 bg-red-400/10 border-red-400/30',
};

// ===== FUNÇÕES AUXILIARES =====

/**
 * Calcula as métricas de um usuário baseado em seus relacionamentos
 */
export const calcularMetricasUsuario = (
  usuario: Usuario,
  leads: any[],
  projetos: any[],
  tarefas: any[],
  interacoes: any[]
): Usuario['metricas'] => {
  const leadsDoUsuario = leads.filter(l => l.userId === usuario.id || l.owner === usuario.id);
  const projetosDoUsuario = projetos.filter(p => 
    p.team?.some((t: any) => t.id === usuario.id) || p.ownerId === usuario.id
  );
  const tarefasDoUsuario = tarefas.filter(t => t.assignedTo === usuario.id);
  const interacoesDoUsuario = interacoes.filter(i => i.userId === usuario.id);

  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);

  return {
    leadsAtribuidos: leadsDoUsuario.length,
    leadsConvertidos: leadsDoUsuario.filter(l => l.status === 'closed-won').length,
    projetosAtivos: projetosDoUsuario.filter(p => p.status === 'in-progress').length,
    projetosUrgentes: projetosDoUsuario.filter(p => p.priority === 'high').length,
    tarefasTotal: tarefasDoUsuario.length,
    tarefasVencendoHoje: tarefasDoUsuario.filter(t => {
      if (!t.deadline) return false;
      const deadline = new Date(t.deadline);
      return deadline <= hoje && t.status !== 'done';
    }).length,
    tarefasConcluidas: tarefasDoUsuario.filter(t => t.status === 'done').length,
    taxaConversao: leadsDoUsuario.length > 0 
      ? (leadsDoUsuario.filter(l => l.status === 'closed-won').length / leadsDoUsuario.length) * 100 
      : 0,
    tempoMedioResposta: 15, // TODO: Calcular baseado em interações
    totalInteracoes: interacoesDoUsuario.length,
    followupsCriados: 0, // TODO: Implementar quando tiver followups
  };
};

/**
 * Calcula a performance de um usuário baseado em suas métricas
 */
export const calcularPerformanceUsuario = (metricas: Usuario['metricas']): Usuario['performance'] => {
  if (!metricas) {
    return {
      nivel: 'regular',
      pontuacao: 50,
      tendencia: 'estavel',
    };
  }

  // Algoritmo de pontuação (0-100)
  let pontuacao = 0;

  // Taxa de conversão (30 pontos)
  pontuacao += Math.min(30, (metricas.taxaConversao / 100) * 30);

  // Tarefas concluídas (25 pontos)
  const taxaConclusao = metricas.tarefasTotal > 0 
    ? (metricas.tarefasConcluidas / metricas.tarefasTotal) * 25 
    : 0;
  pontuacao += taxaConclusao;

  // Total de interações (20 pontos)
  pontuacao += Math.min(20, metricas.totalInteracoes / 5);

  // Leads convertidos (15 pontos)
  pontuacao += Math.min(15, metricas.leadsConvertidos * 3);

  // Projetos ativos (10 pontos)
  pontuacao += Math.min(10, metricas.projetosAtivos * 2);

  // Determinar nível
  let nivel: 'excelente' | 'boa' | 'regular' | 'critica';
  if (pontuacao >= 80) nivel = 'excelente';
  else if (pontuacao >= 60) nivel = 'boa';
  else if (pontuacao >= 40) nivel = 'regular';
  else nivel = 'critica';

  return {
    nivel,
    pontuacao: Math.round(pontuacao),
    tendencia: 'estavel', // TODO: Calcular tendência baseado em histórico
  };
};

/**
 * Converte um Member antigo para Usuario
 */
export const memberParaUsuario = (member: any): Usuario => {
  return {
    id: member.id,
    nome: member.name.split(' ')[0],
    sobrenome: member.name.split(' ').slice(1).join(' '),
    nomeCompleto: member.name,
    email: member.email,
    avatar: member.avatar || member.name.substring(0, 2).toUpperCase(),
    photoUrl: member.photoUrl,
    tipo: member.type === 'ai' ? 'ia' : 'humano',
    nivelAcesso: member.isAdmin ? 'admin' : 'colaborador',
    isAdmin: member.isAdmin || false,
    isAI: member.type === 'ai',
    cargo: member.role as UsuarioCargo,
    departamento: member.department as UsuarioDepartamento,
    status: member.status as UsuarioStatus,
    isActive: member.isActive !== false,
    phone: member.phone,
    whatsapp: member.phone,
    instagram: member.instagram,
    dataIngresso: member.joinedAt || new Date().toISOString(),
    createdAt: member.createdAt || new Date().toISOString(),
    updatedAt: member.updatedAt,
    lastActivity: member.lastActivity,
  };
};

/**
 * Converte um Usuario para Member (compatibilidade reversa)
 */
export const usuarioParaMember = (usuario: Usuario): any => {
  return {
    id: usuario.id,
    name: usuario.nomeCompleto,
    email: usuario.email,
    avatar: usuario.avatar,
    photoUrl: usuario.photoUrl,
    type: usuario.tipo === 'ia' ? 'ai' : 'human',
    isAdmin: usuario.isAdmin,
    role: usuario.cargo,
    department: usuario.departamento,
    status: usuario.status,
    isActive: usuario.isActive,
    phone: usuario.phone,
    instagram: usuario.instagram,
    joinedAt: usuario.dataIngresso,
    createdAt: usuario.createdAt,
    updatedAt: usuario.updatedAt,
    lastActivity: usuario.lastActivity,
  };
};

