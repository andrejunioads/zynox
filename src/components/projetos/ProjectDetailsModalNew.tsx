import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCliente } from "@/context/ClienteContext";
import { mockClientes } from "@/data/mockClientes";
import { useMembers } from "@/contexts/DataContext";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "@/components/common/FileUploader";
import { FileData } from "@/services/fileService";
import { 
  Star,
  Copy,
  Download,
  Archive,
  ChevronRight,
  Home,
  LayoutDashboard,
  ListTodo,
  Users,
  FileText,
  MessageSquare,
  History,
  Target,
  AlertCircle,
  StickyNote,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Plus,
  X,
  Check,
  Edit,
  Trash2,
  Building2,
  Mail,
  Phone,
  Circle
} from "lucide-react";
import { Project, Task, TeamMember, Milestone, ProjectInvoice, ProjectPaymentPlan } from "@/pages/Projetos";
import { ProjectTasksKanban } from "./ProjectTasksKanban";
import { AddTaskModal } from "./AddTaskModal";
import { AddMilestoneModal } from "./AddMilestoneModal";
import { AddTeamMemberModal } from "./AddTeamMemberModal";
import { TaskDetailsModal } from "./TaskDetailsModal";
import { SelectTeamMemberModal } from "./SelectTeamMemberModal";
import { 
  calculateHealthScore,
  getHealthScoreInfo,
  getDaysRemaining,
  formatDaysRemaining,
  updateProjectProgress,
  addActivityToProject,
  getTeamRoleLabel,
  getProjectSmartStatus,
  getStatusColor,
  getStatusLabel,
  getTaskMetrics
} from "@/utils/projectHelpers";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, formatDistanceToNow, parseISO, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProjectDetailsModalNewProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (project: Project) => void;
}

export const ProjectDetailsModalNew = ({
  project,
  isOpen,
  onClose,
  onUpdate,
}: ProjectDetailsModalNewProps) => {
  const navigate = useNavigate();
  const { setClienteAtivo, setActiveTab } = useCliente();
  
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddMilestoneModalOpen, setIsAddMilestoneModalOpen] = useState(false);
  const [isAddTeamMemberModalOpen, setIsAddTeamMemberModalOpen] = useState(false);
  const [isSelectMemberModalOpen, setIsSelectMemberModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Obter membros do contexto (dados corretos da aba Equipe)
  const { members } = useMembers();

  useEffect(() => {
    try {
      if (project && isOpen) {
        // Calcular health score ao abrir
        const healthScore = calculateHealthScore(project);
        setCurrentProject({ ...project, healthScore });
        setError(null);
      }
    } catch (err) {
      console.error('Erro ao processar projeto:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }, [project, isOpen]);

  // Usar project ou currentProject, o que estiver disponível
  const displayProject = currentProject || project;

  
  if (!displayProject) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 glass-card border-slate-700">
          <div className="p-8 text-center text-white">
            {error ? `Erro: ${error}` : 'Carregando projeto...'}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  let healthInfo, daysRemaining;
  try {
    healthInfo = getHealthScoreInfo(displayProject.healthScore || 0);
    daysRemaining = getDaysRemaining(displayProject.deadline);
  } catch (err) {
    console.error('Erro ao calcular informações do projeto:', err);
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 glass-card border-slate-700">
          <div className="p-8 text-center text-white">
            Erro ao carregar informações do projeto
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Handlers
  const handleToggleFavorite = () => {
    const updated = { ...displayProject, isFavorite: !displayProject.isFavorite };
    setCurrentProject(updated);
    onUpdate(updated);
    toast.success(updated.isFavorite ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
  };

  const handleAddMilestone = (milestone: Omit<Milestone, 'id'>) => {
    const newMilestone: Milestone = {
      ...milestone,
      id: `ms-${Date.now()}`,
    };
    const updated = addActivityToProject(
      {
        ...displayProject,
        milestones: [...(displayProject.milestones || []), newMilestone],
      },
      'milestone_completed',
      'Sistema',
      `adicionou o marco "${milestone.name}"`
    );
    setCurrentProject(updated);
    onUpdate(updated);
    toast.success('Marco adicionado com sucesso!');
  };


  const handleAddTeamMember = (member: Omit<TeamMember, 'id' | 'workload'>) => {
    const newMember: TeamMember = {
      ...member,
      id: `tm-${Date.now()}`,
      workload: 0,
    };
    const updated = addActivityToProject(
      {
        ...displayProject,
        team: [...displayProject.team, newMember],
      },
      'team_member_added',
      'Sistema',
      `adicionou ${member.name} à equipe`
    );
    setCurrentProject(updated);
    onUpdate(updated);
    toast.success(`${member.name} adicionado à equipe!`);
  };

  const handleDeleteProject = () => {
    // TODO: Implementar exclusão real do projeto
    toast.success('Projeto excluído com sucesso!');
    setIsDeleteDialogOpen(false);
    onClose();
  };

  const handleAddMembers = (newMembers: TeamMember[]) => {
    if (onUpdate) {
      const updatedProject = {
        ...displayProject,
        team: [...displayProject.team, ...newMembers]
      };
      onUpdate(updatedProject);
      toast.success(`${newMembers.length} membro(s) adicionado(s) ao projeto!`);
    }
  };

  const handleOpenClientModal = async () => {
    if (!displayProject.linkedClient) {
      toast.error('Cliente não vinculado a este projeto');
      return;
    }

    try {
      console.log('Buscando cliente com ID:', displayProject.linkedClient.id);
      console.log('Clientes disponíveis:', mockClientes.map(c => ({ id: c.id, nome: c.nome })));
      
      // Buscar o cliente completo da base usando o ID
      const clienteCompleto = mockClientes.find(c => c.id === displayProject.linkedClient?.id);
      
      if (!clienteCompleto) {
        console.error('Cliente não encontrado:', displayProject.linkedClient.id);
        toast.error(`Cliente não encontrado na base de dados (ID: ${displayProject.linkedClient.id})`);
        return;
      }

      console.log('Cliente encontrado:', clienteCompleto);

      // Converter ClienteData para Cliente (formato do contexto)
      const cliente = {
        ...clienteCompleto,
        projetos: [],
        documentos: [],
        movimentacoes: []
      };

      console.log('Cliente convertido:', cliente);

      // Definir cliente ativo e navegar
      setClienteAtivo(cliente);
      setActiveTab('informacoes');
      navigate('/clientes');
      toast.success(`Abrindo perfil de ${cliente.nome}`);
    } catch (error) {
      console.error('Erro ao abrir perfil do cliente:', error);
      toast.error('Erro ao abrir perfil do cliente');
    }
  };

  const handleCompleteTask = (taskId: string) => {
    const updatedTasks = displayProject.tasks.map(task => 
      task.id === taskId ? { ...task, status: 'done' as const } : task
    );
    const updatedProject = addActivityToProject(
      { ...displayProject, tasks: updatedTasks },
      'task_completed',
      'André Silva',
      `concluiu uma tarefa`
    );
    const recalculatedHealth = calculateHealthScore(updatedProject);
    const finalProject = { ...updatedProject, healthScore: recalculatedHealth };
    setCurrentProject(finalProject);
    onUpdate(finalProject);
    toast.success('Tarefa concluída com sucesso!');
  };

  const handleEditTask = (taskId: string) => {
    // TODO: Abrir modal de edição de tarefa
    toast.info('Edição de tarefa será implementada em breve');
  };

  const handleCommentTask = (taskId: string) => {
    setActiveSection('comments');
    toast.info('Abrindo comentários do projeto');
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (updatedTask: Task) => {
    const updatedTasks = displayProject.tasks.map(t => 
      t.id === updatedTask.id ? updatedTask : t
    );
    const updatedProject = addActivityToProject(
      { ...displayProject, tasks: updatedTasks },
      'task_completed',
      'André Silva',
      `atualizou a tarefa "${updatedTask.name}"`
    );
    const recalculatedHealth = calculateHealthScore(updatedProject);
    const finalProject = { ...updatedProject, healthScore: recalculatedHealth };
    setCurrentProject(finalProject);
    onUpdate(finalProject);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = displayProject.tasks.filter(t => t.id !== taskId);
    const updatedProject = addActivityToProject(
      { ...displayProject, tasks: updatedTasks },
      'task_completed',
      'André Silva',
      `excluiu uma tarefa`
    );
    const recalculatedHealth = calculateHealthScore(updatedProject);
    const finalProject = { ...updatedProject, healthScore: recalculatedHealth };
    setCurrentProject(finalProject);
    onUpdate(finalProject);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calcular itens que precisam de atenção
  const urgentTasksCount = displayProject.tasks.filter(t => 
    t.status !== 'done' && (t.priority === 'high' || (t.deadline && isPast(parseISO(t.deadline))))
  ).length;

  const overdueInvoicesCount = displayProject.paymentPlan?.invoices.filter(inv => 
    inv.status !== 'paid' && inv.status !== 'cancelled' && isPast(parseISO(inv.dueDate))
  ).length || 0;

  // Seções do menu - badges apenas para itens que requerem atenção
  const menuSections = [
    { id: "overview", label: "Visão Geral", icon: LayoutDashboard, badge: null },
    { id: "tasks", label: "Tarefas", icon: ListTodo, badge: urgentTasksCount > 0 ? urgentTasksCount : null },
    { id: "team", label: "Equipe", icon: Users, badge: null },
    { id: "milestones", label: "Marcos", icon: Target, badge: null },
    { id: "budget", label: "Faturamento", icon: DollarSign, badge: overdueInvoicesCount > 0 ? overdueInvoicesCount : null },
    { id: "files", label: "Arquivos", icon: FileText, badge: null },
    { id: "history", label: "Histórico", icon: History, badge: null },
    { id: "observations", label: "Anotações", icon: StickyNote, badge: null },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 glass-card border-slate-700 overflow-hidden">
        <div className="flex h-[95vh]">
          {/* SIDEBAR DE NAVEGAÇÃO */}
          <div className="w-64 glass-card border-r border-slate-700 flex flex-col">
            {/* Logo/Breadcrumb */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <Home className="w-3 h-3" />
                <ChevronRight className="w-3 h-3" />
                <span>Projetos</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-white truncate">{displayProject.name}</span>
              </div>
            </div>

            {/* Menu de Navegação */}
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-1.5">
                {menuSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group",
                        isActive
                          ? "bg-primary/20 text-primary border-2 border-primary/40 shadow-lg shadow-primary/10"
                          : "text-slate-300 hover:bg-slate-800/70 hover:text-white border-2 border-transparent"
                      )}
                    >
                      {/* Indicador visual proeminente quando ativo */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                      )}
                      
                      <div className="flex items-center gap-3">
                        <Icon className={cn(
                          "w-4 h-4 transition-all",
                          isActive && "scale-110"
                        )} />
                        <span>{section.label}</span>
                      </div>
                      
                      {/* Badge apenas para itens que requerem atenção */}
                      {section.badge !== null && section.badge > 0 && (
                        <Badge className={cn(
                          "text-xs h-5 px-1.5 font-bold",
                          "bg-red-500/20 text-red-400 border border-red-500/40",
                          isActive && "bg-red-500/30 border-red-500/60"
                        )}>
                          {section.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* ÁREA PRINCIPAL */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* CONTEÚDO - Header está dentro do Overview agora */}
            <ScrollArea className="flex-1">
              <div className="p-6">
                {activeSection === "overview" && (
                  <OverviewSection 
                    project={displayProject} 
                    onOpenClientModal={handleOpenClientModal}
                    goToSection={setActiveSection}
                    onCompleteTask={handleCompleteTask}
                    onEditTask={handleEditTask}
                    onCommentTask={handleCommentTask}
                    onToggleFavorite={handleToggleFavorite}
                    onDeleteProject={() => setIsDeleteDialogOpen(true)}
                    onAddTask={() => setIsAddTaskModalOpen(true)}
                    onAddMilestone={() => setIsAddMilestoneModalOpen(true)}
                    formatCurrency={formatCurrency}
                    daysRemaining={daysRemaining}
                  />
                )}
                {activeSection === "tasks" && (
                  <ProjectTasksKanban
                    tasks={displayProject.tasks}
                    onTaskMove={(taskId, newStatus) => {
                      const updatedTasks = displayProject.tasks.map(task => 
                        task.id === taskId ? { ...task, status: newStatus } : task
                      );
                      const updatedProject = addActivityToProject(
                        { ...displayProject, tasks: updatedTasks },
                        'task_moved',
                        'André Silva',
                        `moveu uma tarefa para ${newStatus}`
                      );
                      const recalculatedHealth = calculateHealthScore(updatedProject);
                      const finalProject = { ...updatedProject, healthScore: recalculatedHealth };
                      setCurrentProject(finalProject);
                      onUpdate(finalProject);
                      toast.success('Tarefa movida com sucesso!');
                    }}
                    onAddTask={() => setIsAddTaskModalOpen(true)}
                    onTaskClick={handleTaskClick}
                  />
                )}
                {activeSection === "team" && (
                  <TeamSection 
                    team={displayProject.team} 
                    onAddMember={() => setIsSelectMemberModalOpen(true)}
                    onRemoveMember={(memberId) => {
                      if (onUpdate) {
                        const updatedProject = {
                          ...displayProject,
                          team: displayProject.team.filter(m => m.id !== memberId)
                        };
                        onUpdate(updatedProject);
                        toast.success('Membro removido do projeto!');
                      }
                    }}
                  />
                )}
                {activeSection === "milestones" && (
                  <MilestonesSection 
                    milestones={displayProject.milestones || []} 
                    onAddMilestone={() => setIsAddMilestoneModalOpen(true)}
                  />
                )}
                {activeSection === "budget" && (
                  <BudgetSection 
                    value={displayProject.value} 
                    paymentPlan={displayProject.paymentPlan}
                  />
                )}
                {activeSection === "observations" && (
                  <ObservationsSection 
                    observations={displayProject.observations || ""} 
                    onUpdateObservations={(observations) => {
                      if (onUpdate) {
                        const updatedProject = {
                          ...displayProject,
                          observations
                        };
                        onUpdate(updatedProject);
                      }
                    }}
                  />
                )}
                {activeSection === "files" && (
                  <div className="space-y-4">
                    <FileUploader
                      files={displayProject.files || []}
                      onFilesChange={(files) => {
                        if (onUpdate) {
                          const updatedProject = {
                            ...displayProject,
                            files
                          };
                          onUpdate(updatedProject);
                        }
                      }}
                      uploadedBy="André Silva"
                      category="project"
                      relatedId={displayProject.id}
                      maxFiles={50}
                      maxSizeMB={20}
                      showPreview={true}
                      title="Arquivos do Projeto"
                    />
                  </div>
                )}
                {activeSection === "history" && (
                  <HistorySection activities={displayProject.activities} />
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Modais */}
        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
          onAdd={() => {}}
          teamMembers={displayProject.team}
        />

        <AddMilestoneModal
          isOpen={isAddMilestoneModalOpen}
          onClose={() => setIsAddMilestoneModalOpen(false)}
          onAdd={handleAddMilestone}
          teamMembers={displayProject.team}
        />


        <AddTeamMemberModal
          isOpen={isAddTeamMemberModalOpen}
          onClose={() => setIsAddTeamMemberModalOpen(false)}
          onAdd={handleAddTeamMember}
        />

        <SelectTeamMemberModal
          isOpen={isSelectMemberModalOpen}
          onClose={() => setIsSelectMemberModalOpen(false)}
          onAdd={handleAddMembers}
          availableMembers={members}
          currentProjectMembers={displayProject.team}
        />

        <TaskDetailsModal
          task={selectedTask}
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          projectType={displayProject.type}
        />
      </DialogContent>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="glass-card border-red-500/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              Excluir Projeto
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Tem certeza que deseja excluir o projeto <strong>{displayProject?.name}</strong>? 
              Esta ação não pode ser desfeita. Todos os dados, tarefas, arquivos e histórico serão permanentemente removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass-card border-slate-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProject}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Projeto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

// COMPONENTES DAS SEÇÕES

interface OverviewSectionProps {
  project: Project;
  onOpenClientModal: () => void;
  goToSection: (sectionId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onEditTask: (taskId: string) => void;
  onCommentTask: (taskId: string) => void;
  onToggleFavorite: () => void;
  onDeleteProject: () => void;
  onAddTask: () => void;
  onAddMilestone: () => void;
  formatCurrency: (value: number) => string;
  daysRemaining: number;
}

const OverviewSection = ({ 
  project, 
  onOpenClientModal, 
  goToSection, 
  onCompleteTask, 
  onEditTask, 
  onCommentTask,
  onToggleFavorite,
  onDeleteProject,
  onAddTask,
  onAddMilestone,
  formatCurrency,
  daysRemaining
}: OverviewSectionProps) => {

  // Verificações de segurança para evitar erros
  if (!project) return null;

  // Próximo marco
  const nextMilestone = project.milestones
    ?.filter(m => m.status !== 'completed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];


  // Tarefas urgentes (high priority + atrasadas ou perto do deadline)
  const urgentTasks = (project.tasks || []).filter(t => {
    if (t.status === 'done') return false;
    if (t.priority === 'high') return true;
    if (t.deadline && isPast(parseISO(t.deadline))) return true;
    return false;
  }).slice(0, 5);

  // Últimas atividades
  const recentActivities = (project.activities || []).slice(0, 5);

  // Próximo pagamento
  const nextPayment = project.paymentPlan?.invoices
    ?.filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];


  return (
    <div className="space-y-6">
      {/* HEADER DO PROJETO - Apenas no Overview */}
      <div className="space-y-4">
        {/* Título e Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white truncate">{project.name}</h1>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs flex-shrink-0",
                project.priority === 'high' ? "border-red-500/50 text-red-400" :
                project.priority === 'medium' ? "border-yellow-500/50 text-yellow-400" :
                "border-slate-500/50 text-slate-400"
              )}
            >
              {project.priority === 'high' ? '🔴 ALTA' : 
               project.priority === 'medium' ? '🟡 MÉDIA' : 
               '🔵 BAIXA'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFavorite}
              className={cn(
                "h-8 w-8 p-0",
                project.isFavorite ? "text-yellow-400 border-yellow-400/50 bg-yellow-400/10" : "border-slate-700"
              )}
            >
              <Star className={cn("w-4 h-4", project.isFavorite && "fill-yellow-400")} />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-700">
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-700">
              <Download className="w-3.5 h-3.5" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDeleteProject}
              className="h-8 w-8 p-0 border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Métricas Principais - 4 cards compactos */}
        <div className="grid grid-cols-4 gap-3">
          {/* Progresso + Health Score combinados */}
          <Card className={cn(
            "glass-card p-4 relative overflow-hidden",
            project.healthScore >= 80 ? "border-green-500/30" :
            project.healthScore >= 60 ? "border-yellow-500/30" :
            project.healthScore >= 40 ? "border-orange-500/30" :
            "border-red-500/30"
          )}>
            <div className="relative z-10">
              <div className="text-xs font-medium text-slate-400 mb-1">Progresso</div>
              <div className="flex items-baseline gap-2 mb-2">
                <div className="text-3xl font-bold text-white">{project.progress}%</div>
                <div className="text-lg font-semibold text-slate-400">·</div>
                <div className={cn(
                  "text-lg font-bold",
                  project.healthScore >= 80 ? "text-green-400" :
                  project.healthScore >= 60 ? "text-yellow-400" :
                  project.healthScore >= 40 ? "text-orange-400" :
                  "text-red-400"
                )}>{project.healthScore}</div>
              </div>
              <Progress value={project.progress} className="h-1.5" />
            </div>
            <div className="absolute top-2 right-2 text-2xl opacity-20">
              {project.healthScore >= 80 ? '🟢' :
               project.healthScore >= 60 ? '🟡' :
               project.healthScore >= 40 ? '🟠' :
               '🔴'}
            </div>
          </Card>

          {/* Prazo */}
          <Card className={cn(
            "glass-card p-4",
            daysRemaining < 0 ? "border-red-500/50 bg-red-500/5" : 
            daysRemaining <= 7 ? "border-orange-500/50 bg-orange-500/5" :
            "border-slate-700"
          )}>
            <div className="text-xs font-medium text-slate-400 mb-1">Prazo</div>
            <div className={cn(
              "text-3xl font-bold mb-2",
              daysRemaining < 0 ? "text-red-400" :
              daysRemaining <= 7 ? "text-orange-400" :
              "text-white"
            )}>
              {Math.abs(daysRemaining)}d
            </div>
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
              {daysRemaining < 0 ? '⚠️ Atrasado' : 
               daysRemaining <= 7 ? '⏰ Urgente' : 
               '✓ No prazo'}
            </div>
          </Card>

          {/* Tarefas */}
          <Card className="glass-card border-slate-700 p-4">
            <div className="text-xs font-medium text-slate-400 mb-1">Tarefas</div>
            <div className="flex items-baseline gap-1 mb-2">
              <div className="text-3xl font-bold text-green-400">
                {project.tasks.filter(t => t.status === 'done').length}
              </div>
              <div className="text-lg font-semibold text-slate-600">/</div>
              <div className="text-lg font-semibold text-slate-400">
                {project.tasks.length}
              </div>
            </div>
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
              {Math.round((project.tasks.filter(t => t.status === 'done').length / project.tasks.length) * 100)}% concluído
            </div>
          </Card>

          {/* Orçamento */}
          <Card className={cn(
            "glass-card p-4",
            project.budget && (project.budget.spent / project.budget.total) > 0.9 ? 
            "border-orange-500/50" : "border-slate-700"
          )}>
            <div className="text-xs font-medium text-slate-400 mb-1">Orçamento</div>
            <div className="text-xl font-bold text-white mb-2 truncate">
              {formatCurrency(project.budget?.spent || 0)}
            </div>
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
              {project.budget ? 
                `${Math.round((project.budget.spent / project.budget.total) * 100)}% usado` : 
                'Sem orçamento'}
            </div>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={onAddTask}
            className="bg-primary hover:bg-primary/90 h-8 text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Nova Tarefa
          </Button>
          <Button 
            size="sm" 
            onClick={onAddMilestone}
            variant="outline"
            className="border-slate-700 h-8 text-xs"
          >
            <Target className="w-3.5 h-3.5 mr-1.5" />
            Marco
          </Button>
        </div>
      </div>

      {/* ALERTAS E AVISOS - Prioridade máxima */}
      {(urgentTasks.length > 0 || (nextPayment && isPast(parseISO(nextPayment.dueDate)))) && (
        <div className="space-y-3">

          {/* Tarefas Urgentes Banner */}
          {urgentTasks.length > 0 && (
            <Card className="glass-card border-orange-500/50 bg-orange-500/5 p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold text-base mb-1">⚠️ {urgentTasks.length} Tarefa(s) Urgente(s)</h4>
                  <p className="text-sm text-slate-300">Tarefas com alta prioridade ou atrasadas</p>
                </div>
              </div>
            </Card>
          )}

          {/* Pagamento Atrasado */}
          {nextPayment && isPast(parseISO(nextPayment.dueDate)) && (
            <Card className="glass-card border-red-500/50 bg-red-500/5 p-4 hover:border-red-500/70 transition-all cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-bold text-base">💰 Pagamento Atrasado</h4>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 text-xs border-red-500/50 text-red-400 hover:bg-red-500/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToSection('budget');
                      }}
                    >
                      Ver Faturamento →
                    </Button>
                  </div>
                  <p className="text-sm text-slate-300">
                    Fatura {nextPayment.number} - {format(parseISO(nextPayment.dueDate), "dd/MM/yyyy")}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAREFAS URGENTES EXPANDIDAS - 2-3 tarefas com ações */}
      {urgentTasks.length > 0 && (
        <Card className="glass-card border-orange-500/40 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-orange-400" />
              </div>
              Tarefas Urgentes
            </h3>
            <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold">
              {urgentTasks.length} {urgentTasks.length === 1 ? 'tarefa' : 'tarefas'}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {urgentTasks.slice(0, 3).map((task, index) => (
              <Card key={task.id} className={cn(
                "p-4 border-2 transition-all hover:shadow-lg",
                isPast(task.deadline ? parseISO(task.deadline) : new Date()) 
                  ? "border-red-500/50 bg-red-500/5" 
                  : "border-orange-500/50 bg-orange-500/5"
              )}>
                <div className="flex items-start gap-4">
                  {/* Status Visual */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm",
                      isPast(task.deadline ? parseISO(task.deadline) : new Date())
                        ? "bg-red-500/20 text-red-400 border-2 border-red-500/40"
                        : "bg-orange-500/20 text-orange-400 border-2 border-orange-500/40"
                    )}>
                      #{index + 1}
                    </div>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      task.status === 'todo' ? "bg-slate-400" :
                      task.status === 'in-progress' ? "bg-blue-500 animate-pulse" :
                      "bg-green-500"
                    )} />
                  </div>

                  {/* Conteúdo da Tarefa */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="text-white font-bold text-base leading-tight">{task.name}</h4>
                      <Badge className={cn(
                        "text-xs font-bold flex-shrink-0",
                        task.priority === 'high' 
                          ? "bg-red-500/20 text-red-400 border-red-500/40" 
                          : "bg-orange-500/20 text-orange-400 border-orange-500/40"
                      )}>
                        {task.priority === 'high' ? '🔴 ALTA' : '🟠 URGENTE'}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-sm text-slate-300 mb-3 line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs mb-3">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Users className="w-3.5 h-3.5" />
                        <span className="font-medium">{task.assignedTo}</span>
                      </div>
                      {task.deadline && (
                        <div className={cn(
                          "flex items-center gap-1.5 font-semibold",
                          isPast(parseISO(task.deadline)) ? "text-red-400" : "text-orange-400"
                        )}>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {isPast(parseISO(task.deadline)) && '⚠️ '}
                            {format(parseISO(task.deadline), "dd/MM/yyyy")}
                          </span>
                        </div>
                      )}
                      <div className={cn(
                        "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                        task.status === 'todo' ? "bg-slate-700 text-slate-300" :
                        task.status === 'in-progress' ? "bg-blue-500/20 text-blue-400" :
                        "bg-green-500/20 text-green-400"
                      )}>
                        {task.status === 'todo' ? '📋 A Fazer' :
                         task.status === 'in-progress' ? '⚡ Em Andamento' :
                         '✓ Concluída'}
                      </div>
                    </div>

                    {/* Botões de Ação Rápida */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="h-7 text-xs bg-primary hover:bg-primary/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCompleteTask(task.id);
                        }}
                        disabled={task.status === 'done'}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        {task.status === 'done' ? 'Concluída' : 'Concluir'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 text-xs border-slate-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTask(task.id);
                        }}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 text-xs border-slate-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCommentTask(task.id);
                        }}
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Comentar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {urgentTasks.length > 3 && (
            <Button 
              variant="outline" 
              className="w-full mt-4 border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
              onClick={() => goToSection('tasks')}
            >
              Ver todas as {urgentTasks.length} tarefas urgentes →
            </Button>
          )}
        </Card>
      )}

      {/* GRID: Próximo Marco + Próximo Pagamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* PRÓXIMO MARCO */}
        {nextMilestone && (
          <Card className="glass-card border-blue-500/30 p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-400 mb-1">🎯 Próximo Marco</div>
                <div className="text-white font-bold mb-1 truncate">{nextMilestone.name}</div>
                <div className="text-xs text-slate-400 mb-2 line-clamp-2">{nextMilestone.description}</div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                    {format(parseISO(nextMilestone.date), "dd MMM", { locale: ptBR })}
                  </Badge>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{nextMilestone.responsible}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* PRÓXIMO PAGAMENTO */}
        {nextPayment && (
          <Card className={cn(
            "glass-card p-5",
            isPast(parseISO(nextPayment.dueDate)) ? "border-red-500/50 bg-red-500/5" : "border-green-500/30"
          )}>
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                isPast(parseISO(nextPayment.dueDate)) ? "bg-red-500/20" : "bg-green-500/20"
              )}>
                <DollarSign className={cn(
                  "w-5 h-5",
                  isPast(parseISO(nextPayment.dueDate)) ? "text-red-400" : "text-green-400"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-400 mb-1">💰 Próximo Pagamento</div>
                <div className="text-white font-bold text-lg mb-1">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(nextPayment.value)}
                </div>
                <div className="text-xs text-slate-400 mb-2">{nextPayment.description}</div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge className={cn(
                    isPast(parseISO(nextPayment.dueDate))
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "bg-green-500/20 text-green-400 border-green-500/30"
                  )}>
                    {isPast(parseISO(nextPayment.dueDate)) ? "ATRASADO" : "A RECEBER"}
                  </Badge>
                  <span className="text-slate-500">•</span>
                  <span className={cn(
                    "text-slate-400",
                    isPast(parseISO(nextPayment.dueDate)) && "text-red-400 font-semibold"
                  )}>
                    {format(parseISO(nextPayment.dueDate), "dd/MM/yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* INFORMAÇÕES DO PROJETO */}
      <Card className="glass-card border-slate-700 p-6">
        <div className="space-y-6">
          {/* Cliente */}
          {project.linkedClient && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Cliente do Projeto
                </h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onOpenClientModal}
                  className="glass-card border-primary/50 text-primary hover:bg-primary/10 text-xs h-8"
                >
                  Ver Perfil Completo →
                </Button>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {project.linkedClient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold">{project.linkedClient.name}</div>
                  <div className="text-slate-400 text-sm">{project.linkedClient.company}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="truncate">{project.linkedClient.email}</span>
                    {project.linkedClient.phone && (
                      <>
                        <span>•</span>
                        <span>{project.linkedClient.phone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Descrição */}
          <div>
            <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Descrição do Projeto
            </h3>
            <p className="text-slate-300 leading-relaxed text-sm">{project.description}</p>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Cronograma
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">📅 Início</span>
                <span className="text-white font-medium">
                  {format(parseISO(project.startDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
              <div className="relative">
                <Progress value={project.progress} className="h-2" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold text-white drop-shadow-lg">
                  {project.progress}%
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">🏁 Entrega</span>
                <span className={cn(
                  "font-medium",
                  daysRemaining < 0 ? "text-red-400" : "text-white"
                )}>
                  {format(parseISO(project.deadline), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  {daysRemaining < 0 && ` (${Math.abs(daysRemaining)}d atrasado)`}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {project.tags.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-primary" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ATIVIDADE RECENTE */}
      {recentActivities.length > 0 && (
        <Card className="glass-card border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Últimas Atividades
          </h3>
          <div className="space-y-3">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="text-white font-medium">{activity.author}</span>
                    <span className="text-slate-400"> {activity.description}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true, locale: ptBR })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

const TeamSection = ({ team, onAddMember, onRemoveMember }: { team: TeamMember[]; onAddMember: () => void; onRemoveMember: (memberId: string) => void }) => {
  // Separar admin dos membros regulares
  const adminMembers = team.filter(m => (m as any).isAdmin);
  const regularMembers = team.filter(m => !(m as any).isAdmin);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Equipe do Projeto</h3>
          <p className="text-sm text-slate-400 mt-1">{team.length} {team.length === 1 ? 'membro' : 'membros'}</p>
        </div>
        <Button size="sm" onClick={onAddMember} variant="outline" className="border-slate-700">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Membro
        </Button>
      </div>

      {/* Administrador destacado */}
      {adminMembers.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full"></div>
            Administrador
          </div>
          {adminMembers.map((member) => (
            <Card key={member.id} className="group glass-card border-primary/30 bg-primary/5 p-4 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-12 h-12 border-2 border-primary">
                    <AvatarFallback className="bg-primary/30 text-primary font-bold">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  {member.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-slate-900 rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    {member.name}
                    <Badge className="text-xs bg-primary/20 text-primary border-primary/40">
                      Admin
                    </Badge>
                  </div>
                  <div className="text-sm text-primary/80">{getTeamRoleLabel(member.role)}</div>
                  {member.email && (
                    <div className="text-xs text-slate-400 mt-1">{member.email}</div>
                  )}
                </div>
                {member.workload !== undefined && (
                  <Badge variant="outline" className="text-xs border-primary/40 text-primary">
                    {member.workload} {member.workload === 1 ? 'tarefa' : 'tarefas'}
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveMember(member.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Membros da equipe */}
      {regularMembers.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-2">
            <div className="w-1 h-4 bg-slate-600 rounded-full"></div>
            Equipe ({regularMembers.length})
          </div>
          <div className="grid gap-3">
            {regularMembers.map((member) => (
              <Card key={member.id} className="group glass-card border-slate-700 p-4 hover:border-slate-600 transition-all">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-slate-700 text-slate-300">
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {member.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-slate-900 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{member.name}</div>
                    <div className="text-sm text-slate-400">{getTeamRoleLabel(member.role)}</div>
                    {member.email && (
                      <div className="text-xs text-slate-500 mt-0.5">{member.email}</div>
                    )}
                  </div>
                  {member.workload !== undefined && (
                    <Badge variant="outline" className="text-xs border-slate-600">
                      {member.workload} {member.workload === 1 ? 'tarefa' : 'tarefas'}
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveMember(member.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MilestonesSection = ({ milestones, onAddMilestone }: { milestones: Milestone[]; onAddMilestone: () => void }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Marcos do Projeto</h3>
        <Button size="sm" onClick={onAddMilestone}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Marco
        </Button>
      </div>

      <div className="space-y-3">
        {milestones.map((milestone) => (
          <Card key={milestone.id} className={cn(
            "glass-card p-4",
            milestone.status === 'completed' ? "border-green-500/50" : "border-slate-700"
          )}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mt-0.5",
                  milestone.status === 'completed' ? "bg-green-500/20 text-green-400" :
                  milestone.status === 'in-progress' ? "bg-blue-500/20 text-blue-400" :
                  "bg-slate-700 text-slate-400"
                )}>
                  {milestone.status === 'completed' ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white mb-1">{milestone.name}</div>
                  {milestone.description && (
                    <div className="text-sm text-slate-400 mb-2">{milestone.description}</div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(milestone.date), "dd/MM/yyyy")}
                    </div>
                    <div>{milestone.responsible}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const BudgetSection = ({ paymentPlan, value }: { paymentPlan?: ProjectPaymentPlan; value: number }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const getInvoiceStatusColor = (status: ProjectInvoice['status']) => {
    const colors = {
      paid: 'green',
      pending: 'blue',
      overdue: 'red',
      cancelled: 'gray',
    };
    return colors[status];
  };

  const getInvoiceStatusLabel = (status: ProjectInvoice['status']) => {
    const labels = {
      paid: 'Pago',
      pending: 'Pendente',
      overdue: 'Atrasado',
      cancelled: 'Cancelado',
    };
    return labels[status];
  };

  const getInvoiceStatusIcon = (status: ProjectInvoice['status']) => {
    switch (status) {
      case 'paid': return <Check className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
    }
  };

  const isOverdue = (dueDate: string, status: ProjectInvoice['status']) => {
    if (status === 'paid' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  const totalReceived = paymentPlan?.invoices.filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.value, 0) || 0;

  const totalPending = paymentPlan?.invoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.value, 0) || 0;

  const progressPercentage = paymentPlan ? (totalReceived / paymentPlan.totalValue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header com KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-card border-slate-700 p-4">
          <div className="text-xs text-slate-400 mb-1">Valor Total</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(value)}</div>
        </Card>
        <Card className="glass-card border-green-500/30 p-4">
          <div className="text-xs text-slate-400 mb-1">Recebido</div>
          <div className="text-2xl font-bold text-green-400">{formatCurrency(totalReceived)}</div>
        </Card>
        <Card className="glass-card border-blue-500/30 p-4">
          <div className="text-xs text-slate-400 mb-1">A Receber</div>
          <div className="text-2xl font-bold text-blue-400">{formatCurrency(totalPending)}</div>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="glass-card border-slate-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-semibold">Progresso de Recebimento</h4>
          <span className="text-sm text-slate-400">{progressPercentage.toFixed(1)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-3" />
      </Card>

      {/* Faturas/Parcelas */}
      {paymentPlan && paymentPlan.invoices.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Faturas ({paymentPlan.invoices.length})
            </h3>
            <Button size="sm" variant="outline" className="glass-card border-primary/50 text-primary">
              <Plus className="w-4 h-4 mr-2" />
              Nova Fatura
            </Button>
          </div>

          {paymentPlan.invoices.map((invoice) => {
            const overdueCheck = isOverdue(invoice.dueDate, invoice.status);
            const displayStatus = overdueCheck ? 'overdue' : invoice.status;
            
            return (
              <Card key={invoice.id} className={cn(
                "glass-card p-4 transition-all hover:scale-[1.01]",
                displayStatus === 'paid' ? "border-green-500/30" :
                displayStatus === 'overdue' ? "border-red-500/50 bg-red-500/5" :
                "border-slate-700"
              )}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs font-mono">
                        {invoice.number}
                      </Badge>
                      <Badge 
                        className={cn(
                          "text-xs",
                          `bg-${getInvoiceStatusColor(displayStatus)}-500/20`,
                          `text-${getInvoiceStatusColor(displayStatus)}-400`,
                          `border-${getInvoiceStatusColor(displayStatus)}-500/30`
                        )}
                      >
                        {getInvoiceStatusIcon(displayStatus)}
                        <span className="ml-1">{getInvoiceStatusLabel(displayStatus)}</span>
                      </Badge>
                    </div>
                    <p className="text-white font-medium mb-1">{invoice.description}</p>
                    {invoice.notes && (
                      <p className="text-xs text-slate-400">{invoice.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{formatCurrency(invoice.value)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Vencimento: {format(new Date(invoice.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                    {invoice.paidAt && (
                      <div className="flex items-center gap-1 text-green-400">
                        <Check className="w-3 h-3" />
                        Pago em: {format(new Date(invoice.paidAt), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    )}
                  </div>
                  {invoice.linkedFinanceId && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-primary hover:text-primary/80"
                    >
                      Ver no Financeiro →
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="glass-card border-slate-700 p-8">
          <div className="text-center">
            <DollarSign className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h4 className="text-white font-semibold mb-2">Nenhuma fatura configurada</h4>
            <p className="text-sm text-slate-400 mb-4">
              Configure as faturas e parcelas deste projeto para acompanhar os pagamentos
            </p>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Fatura
            </Button>
          </div>
        </Card>
      )}

      {/* Link para Financeiro */}
      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
        <TrendingUp className="w-4 h-4" />
        <span>Gerencie todas as movimentações na aba</span>
        <Button variant="link" className="h-auto p-0 text-primary hover:text-primary/80 font-semibold">
          Financeiro
        </Button>
      </div>
    </div>
  );
};

const ObservationsSection = ({ 
  observations, 
  onUpdateObservations 
}: { 
  observations: string; 
  onUpdateObservations: (observations: string) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="glass-card border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <StickyNote className="w-5 h-5 text-primary" />
          Observações do Projeto
        </h3>
        
        <Textarea
          value={observations}
          onChange={(e) => onUpdateObservations(e.target.value)}
          placeholder="Adicione observações importantes sobre o projeto, decisões tomadas, mudanças de escopo, ou qualquer informação relevante..."
          className="min-h-[400px] glass-card border-slate-700/50 text-white resize-none focus:border-primary/50 transition-colors"
        />
        
        <div className="text-xs text-slate-400 flex items-center gap-2 mt-3">
          <StickyNote className="w-4 h-4" />
          <span>As observações são salvas automaticamente ao editar o projeto</span>
        </div>
      </div>
    </div>
  );
};

// FilesSection removido - usando FileUploader component universal

const CommentsSection = ({ comments }: { comments: any[] }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Comentários</h3>
      </div>

      <Card className="glass-card border-slate-700 p-4">
        <Textarea 
          placeholder="Adicionar um comentário..." 
          className="bg-slate-800 border-slate-700 text-white mb-2"
        />
        <Button size="sm">
          <MessageSquare className="w-4 h-4 mr-2" />
          Comentar
        </Button>
      </Card>

      <div className="space-y-3">
        {comments.map((comment) => (
          <Card key={comment.id} className="glass-card border-slate-700 p-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {comment.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white text-sm">{comment.author}</span>
                  <span className="text-xs text-slate-500">
                    {format(new Date(comment.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{comment.text}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center text-slate-400 py-8">Nenhum comentário ainda</div>
      )}
    </div>
  );
};

const HistorySection = ({ activities }: { activities: any[] }) => {
  const getActivityIcon = (type: string) => {
    const icons = {
      'project_created': Target,
      'task_created': Plus,
      'task_completed': Check,
      'task_moved': Circle,
      'status_changed': TrendingUp,
      'file_uploaded': FileText,
      'comment_added': MessageSquare,
      'progress_updated': TrendingUp,
      'milestone_completed': Target,
      'budget_updated': DollarSign,
      'team_member_added': Users,
    };
    return icons[type] || Circle;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Histórico do Projeto</h3>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-slate-700" />

        <div className="space-y-4">
          {activities.map((activity, idx) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="relative flex items-start gap-4">
                <div className="relative z-10 w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <Card className="flex-1 glass-card border-slate-700 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-white mb-1">
                        <span className="font-semibold">{activity.author}</span>
                        {' '}{activity.description}
                      </div>
                      <div className="text-xs text-slate-500">
                        {format(new Date(activity.timestamp), "dd/MM/yyyy 'às' HH:mm")}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {activities.length === 0 && (
        <div className="text-center text-slate-400 py-8">Nenhuma atividade registrada</div>
      )}
    </div>
  );
};

