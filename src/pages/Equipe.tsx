import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, Bot, Filter, Layers, RefreshCw } from "lucide-react";
import { Member, Department, MemberType } from "@/types/member";
import { Usuario, memberParaUsuario } from "@/types/usuario";
import { mockActivities } from "@/data/mockMembers";
import { Team } from "@/types/team";
import { TeamStats } from "@/components/equipe/TeamStats";
import { MemberCard } from "@/components/equipe/MemberCard";
import { TeamCard } from "@/components/equipe/TeamCard";
import { MemberModal } from "@/components/equipe/MemberModal";
import { UsuarioModal } from "@/components/equipe/UsuarioModal";
import { AddMemberModal } from "@/components/equipe/AddMemberModal";
import { useMembers, useUsuarios, useLeads, useProjects } from "@/contexts/DataContext";
// import { useTeamSync } from "@/hooks/useSmartSync";
import { toast } from "sonner";

type FilterType = 'all' | 'human' | 'ai';
type ViewMode = 'members' | 'teams';

// Equipes mockadas
const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Equipe Comercial',
    description: 'Responsável por vendas e atendimento',
    department: 'comercial',
    color: '#3B82F6',
    leaderId: '1', // André Junio
    memberIds: ['1', '5'], // André + Lucas
    createdAt: new Date(2024, 0, 1),
    isActive: true,
  },
  {
    id: 'team-2',
    name: 'Equipe de Design',
    description: 'Criação e identidade visual',
    department: 'design',
    color: '#EC4899',
    leaderId: '2', // Bianca Silva
    memberIds: ['2', '6'], // Bianca + Sofia
    createdAt: new Date(2024, 0, 15),
    isActive: true,
  },
  {
    id: 'team-3',
    name: 'Equipe de Desenvolvimento',
    description: 'Desenvolvimento de software e APIs',
    department: 'dev',
    color: '#10B981',
    leaderId: '3', // Carlos Santos
    memberIds: ['3', '7'], // Carlos + Rafael
    createdAt: new Date(2024, 1, 1),
    isActive: true,
  },
  {
    id: 'team-4',
    name: 'Equipe de IA',
    description: 'Inteligência artificial e automação',
    department: 'ia',
    color: '#8B5CF6',
    leaderId: '4', // Daniela Costa
    memberIds: ['4', '8', '9'], // Daniela + AI agents
    createdAt: new Date(2024, 2, 1),
    isActive: true,
  },
];

const Equipe = () => {
  // ✅ CONTEXTO GLOBAL: Usar dados centralizados (Members - compatibilidade)
  const { 
    members, 
    createMember, 
    updateMember, 
    deleteMember 
  } = useMembers();
  
  // ✅ NOVO: Usar hook de usuários unificado
  const { 
    usuarios,
    updateUsuario,
    deleteUsuario,
    getUsuario
  } = useUsuarios();
  
  // ✅ Dados para métricas
  const { leads } = useLeads();
  const { projects } = useProjects();
  
  // ✅ SINCRONIZAÇÃO INTELIGENTE: Conectar com outros dados
  // useTeamSync(); // Temporariamente desabilitado para evitar loops
  
  // Teams são mock data estáticos, não precisam de persistência
  const teams = mockTeams;
  const [viewMode, setViewMode] = useState<ViewMode>('members');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isUsuarioModalOpen, setIsUsuarioModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterDepartment, setFilterDepartment] = useState<Department | 'all'>('all');

  // Filtrar membros
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      // Filtro de busca
      const matchesSearch = 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Filtro de tipo
      if (filterType !== 'all' && member.type !== filterType) {
        return false;
      }

      // Filtro de departamento
      if (filterDepartment !== 'all' && member.department !== filterDepartment) {
        return false;
      }

      return true;
    });
  }, [members, searchTerm, filterType, filterDepartment]);

  const handleViewDetails = (member: Member) => {
    // ✅ NOVO: Usar modal unificado de usuário
    const usuario = memberParaUsuario(member);
    setSelectedUsuario(usuario);
    setIsUsuarioModalOpen(true);
  };

  const handleUpdateUsuario = (usuario: Usuario) => {
    updateUsuario(usuario.id, usuario);
    setSelectedUsuario(usuario);
  };

  const handleDeleteUsuario = (usuarioId: string) => {
    deleteUsuario(usuarioId);
    setSelectedUsuario(null);
    setIsUsuarioModalOpen(false);
  };

  // ✅ Manter handlers antigos para compatibilidade
  const handleUpdateMember = (updatedMember: Member) => {
    updateMember(updatedMember.id, updatedMember);
    setSelectedMember(updatedMember);
  };

  const handleDeleteMember = (memberId: string) => {
    deleteMember(memberId);
    setSelectedMember(null);
    setIsMemberModalOpen(false);
  };

  const handleAddMember = (newMemberData: Omit<Member, 'id' | 'stats' | 'joinedAt' | 'lastActivity'>) => {
    createMember(newMemberData);
    toast.success('✅ Membro salvo com sucesso!', {
      description: `${newMemberData.name} foi adicionado e os dados foram salvos automaticamente.`
    });
  };

  const handleResetData = () => {
    if (confirm('⚠️ Tem certeza que deseja resetar todos os dados? Isso vai apagar todas as alterações e voltar aos dados iniciais.')) {
      // TODO: Implementar reset no DataContext
      toast.success('Dados resetados com sucesso!');
    }
  };

  const departments: { value: Department | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'design', label: 'Design' },
    { value: 'dev', label: 'Desenvolvimento' },
    { value: 'ia', label: 'IA' },
    { value: 'suporte', label: 'Suporte' },
    { value: 'financeiro', label: 'Financeiro' }
  ];

  return (
    <DashboardLayout showHeader={false}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-['Poppins'] text-lg font-semibold text-white">Gestão de Equipe</h1>
            <p className="text-sm text-slate-400">
              Gerencie membros da equipe e agentes de IA
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Campo de Busca */}
            {viewMode === 'members' && (
              <div className="relative w-[280px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar membro..."
                  className="pl-10 glass-card border-primary/20 focus:border-primary/50"
                />
              </div>
            )}
            
            <Button
              onClick={handleResetData}
              variant="outline"
              size="sm"
              className="border-white/10 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-all"
              title="Resetar dados para valores iniciais"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary-gradient glow-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Membro
            </Button>
          </div>
        </div>

        {/* Stats */}
        <TeamStats members={members} />

        {/* View Mode Toggle + Filters */}
        <div className="flex items-center justify-between glass-card p-2 rounded-lg border border-white/10">
          {/* View Mode */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'members' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('members')}
              className={viewMode === 'members' ? 'btn-primary-gradient' : ''}
            >
              <Users className="w-4 h-4 mr-2" />
              Membros ({members.length})
            </Button>
            <Button
              variant={viewMode === 'teams' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('teams')}
              className={viewMode === 'teams' ? 'btn-primary-gradient' : ''}
            >
              <Layers className="w-4 h-4 mr-2" />
              Equipes ({teams.length})
            </Button>
          </div>

          {/* Filters - Apenas em view Membros */}
          {viewMode === 'members' && (
            <div className="flex items-center gap-2">
              {/* Type Filter */}
              <div className="flex items-center gap-1">
                <Button
                  variant={filterType === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                  className={filterType === 'all' ? 'btn-primary-gradient' : 'text-xs'}
                >
                  Todos
                </Button>
                <Button
                  variant={filterType === 'human' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterType('human')}
                  className={filterType === 'human' ? 'btn-primary-gradient' : ''}
                >
                  <Users className="w-4 h-4" />
                </Button>
                <Button
                  variant={filterType === 'ai' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterType('ai')}
                  className={filterType === 'ai' ? 'btn-primary-gradient' : ''}
                >
                  <Bot className="w-4 h-4" />
                </Button>
              </div>

              <div className="h-6 w-px bg-white/10" />

              {/* Department Filter - Compacto */}
              <div className="flex items-center gap-1">
                {departments.slice(0, 7).map(dept => (
                  <Badge
                    key={dept.value}
                    variant={filterDepartment === dept.value ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all text-xs px-2 py-1 ${
                      filterDepartment === dept.value 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'hover:bg-white/5'
                    }`}
                    onClick={() => setFilterDepartment(dept.value)}
                  >
                    {dept.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        {(searchTerm || filterType !== 'all' || filterDepartment !== 'all') && (
          <div className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-lg border border-white/10">
            <span className="text-sm text-muted-foreground">
              {filteredMembers.length} {filteredMembers.length === 1 ? 'membro encontrado' : 'membros encontrados'}
            </span>
            {(filterType !== 'all' || filterDepartment !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterType('all');
                  setFilterDepartment('all');
                }}
                className="text-primary hover:text-primary/80"
              >
                Limpar filtros
              </Button>
            )}
          </div>
        )}

        {/* Content Grid - Membros ou Equipes */}
        {viewMode === 'members' ? (
          /* Members Grid */
          filteredMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map(member => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 rounded-xl border border-white/10 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhum membro encontrado
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm 
                  ? 'Tente ajustar sua busca ou filtros'
                  : 'Adicione o primeiro membro da sua equipe'
                }
              </p>
              {!searchTerm && filterType === 'all' && filterDepartment === 'all' && (
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="btn-primary-gradient glow-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Membro
                </Button>
              )}
            </div>
          )
        ) : (
          /* Teams Grid */
          teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map(team => (
                <TeamCard
                  key={team.id}
                  team={team}
                  members={members}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 rounded-xl border border-white/10 text-center">
              <Layers className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhuma equipe criada
              </h3>
              <p className="text-muted-foreground mb-6">
                Crie a primeira equipe para organizar seus membros
              </p>
              <Button
                onClick={() => toast.info("Criar equipe", { description: "Funcionalidade será implementada em breve" })}
                className="btn-primary-gradient glow-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Equipe
              </Button>
            </div>
          )
        )}
      </div>

      {/* Modals */}
      
      {/* ✅ NOVO: Modal Unificado de Usuário */}
      <UsuarioModal
        usuario={selectedUsuario}
        isOpen={isUsuarioModalOpen}
        onClose={() => {
          setIsUsuarioModalOpen(false);
          setSelectedUsuario(null);
        }}
        onUpdate={handleUpdateUsuario}
        onDelete={handleDeleteUsuario}
        leads={leads}
        projects={projects}
        tasks={[]}
        activities={mockActivities}
      />

      {/* ✅ Modal antigo (mantido para compatibilidade) */}
      <MemberModal
        member={selectedMember}
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setSelectedMember(null);
        }}
        activities={mockActivities}
        onUpdate={handleUpdateMember}
        onDelete={handleDeleteMember}
      />

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddMember}
      />
    </DashboardLayout>
  );
};

export default Equipe;

