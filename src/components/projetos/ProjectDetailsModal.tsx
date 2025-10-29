import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Edit, Copy, Archive, Trash2, AlertCircle, Clock, Flame } from "lucide-react";
import { Project, Task } from "@/pages/Projetos";
import { ProjectTasksKanban } from "./ProjectTasksKanban";
import { AddTaskModal } from "./AddTaskModal";
import { 
  getProjectSmartStatus,
  getStatusColor,
  getStatusLabel,
  getDaysRemaining,
  formatDaysRemaining,
  needsUrgentAttention,
  updateProjectProgress,
  addActivityToProject
} from "@/utils/projectHelpers";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (project: Project) => void;
}

export const ProjectDetailsModal = ({
  project,
  isOpen,
  onClose,
  onUpdate,
}: ProjectDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Atualizar quando o project mudar
  useEffect(() => {
    if (project) {
      setCurrentProject(project);
    }
  }, [project]);

  if (!project || !currentProject) return null;

  const smartStatus = getProjectSmartStatus(currentProject);
  const daysRemaining = getDaysRemaining(currentProject.deadline);
  const isUrgent = needsUrgentAttention(currentProject);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Manipuladores de tarefas
  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    const updatedProject = addActivityToProject(
      { ...currentProject, tasks: [...currentProject.tasks, newTask] },
      'task_created',
      taskData.assignedTo || 'Sistema',
      `criou a tarefa "${newTask.name}"`,
      { taskId: newTask.id }
    );

    const finalProject = updateProjectProgress(updatedProject);
    setCurrentProject(finalProject);
    onUpdate(finalProject);

    toast.success('Tarefa criada!', {
      description: `"${newTask.name}" foi adicionada ao projeto.`,
    });

    setIsAddTaskModalOpen(false);
  };

  const handleTaskMove = (taskId: string, newStatus: Task['status']) => {
    const updatedTasks = currentProject.tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask: Task = {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'done' ? new Date().toISOString() : task.completedAt,
        };
        return updatedTask;
      }
      return task;
    });

    const movedTask = updatedTasks.find(t => t.id === taskId);
    if (!movedTask) return;

    let activityType: Project['activities'][0]['type'] = 'task_moved';
    let activityDescription = `moveu a tarefa "${movedTask.name}" para "${
      newStatus === 'todo' ? 'A Fazer' : 
      newStatus === 'in-progress' ? 'Em Progresso' : 
      'Concluído'
    }"`;

    if (newStatus === 'done') {
      activityType = 'task_completed';
      activityDescription = `concluiu a tarefa "${movedTask.name}"`;
    }

    const updatedProject = addActivityToProject(
      { ...currentProject, tasks: updatedTasks },
      activityType,
      movedTask.assignedTo || 'Sistema',
      activityDescription,
      { taskId, previousStatus: movedTask.status, newStatus }
    );

    const finalProject = updateProjectProgress(updatedProject);
    setCurrentProject(finalProject);
    onUpdate(finalProject);

    if (newStatus === 'done') {
      toast.success('Tarefa concluída!', {
        description: `Progresso atualizado para ${finalProject.progress}%`,
        style: {
          background: 'rgba(34, 197, 94, 0.15)',
          color: '#22C55E',
          border: '1px solid rgba(34, 197, 94, 0.3)',
        }
      });
    }
  };

  const handleTaskClick = (task: Task) => {
    // TODO: Abrir modal de detalhes da tarefa
    console.log('Task clicked:', task);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-4xl max-h-[90vh] overflow-y-auto glass-card",
        isUrgent ? "border-red-500/50" : "border-primary/20"
      )}>
        <DialogHeader>
          {/* Header com Visual de Urgência */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <DialogTitle className="text-2xl font-bold text-white">
                    {currentProject.name}
                  </DialogTitle>
                  <Badge 
                    variant="outline"
                    className={cn(
                      `border-${getStatusColor(smartStatus)}-500/50`,
                      `text-${getStatusColor(smartStatus)}-400`,
                      `bg-${getStatusColor(smartStatus)}-500/10`
                    )}
                  >
                    {getStatusLabel(smartStatus)}
                  </Badge>
                  {isUrgent && (
                    <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10 animate-pulse">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {smartStatus === 'overdue' ? 'Atrasado' : 'Em Risco'}
                    </Badge>
                  )}
                </div>
                <p className="text-muted text-sm">{currentProject.client}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="glass-card border-slate-700">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="glass-card border-slate-700">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="glass-card border-slate-700">
                  <Archive className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="text-danger border-danger/50 glass-card">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Indicadores de Prazo e Progresso */}
            <div className="flex items-center gap-4 text-sm">
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card",
                isUrgent ? "border-red-500/30" : "border-slate-700"
              )}>
                {daysRemaining < 0 ? (
                  <Flame className="w-4 h-4 text-red-400" />
                ) : daysRemaining <= 3 ? (
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
                <span className={cn(
                  "font-medium",
                  daysRemaining < 0 ? "text-red-400" :
                  daysRemaining <= 3 ? "text-orange-400" :
                  "text-slate-300"
                )}>
                  {formatDaysRemaining(currentProject.deadline)}
                </span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card border-slate-700">
                <span className="text-slate-400">Progresso:</span>
                <span className="text-white font-bold">{currentProject.progress}%</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card border-slate-700">
                <span className="text-slate-400">Tarefas:</span>
                <span className="text-white font-bold">
                  {currentProject.tasks.filter(t => t.status === 'done').length}/{currentProject.tasks.length}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="team">Time</TabsTrigger>
            <TabsTrigger value="files">Arquivos</TabsTrigger>
            <TabsTrigger value="comments">Comentários</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Status and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 rounded-lg">
                <p className="text-sm text-muted mb-2">Status</p>
                <Badge variant="default" className="text-sm">
                  {getStatusLabel(smartStatus)}
                </Badge>
              </div>
              <div className="glass-card p-4 rounded-lg">
                <p className="text-sm text-muted mb-2">Prioridade</p>
                <Badge
                  variant="outline"
                  className={
                    currentProject.priority === "high"
                      ? "border-danger text-danger"
                      : currentProject.priority === "medium"
                      ? "border-warning text-warning"
                      : "border-success text-success"
                  }
                >
                  {currentProject.priority === "high" && "Alta"}
                  {currentProject.priority === "medium" && "Média"}
                  {currentProject.priority === "low" && "Baixa"}
                </Badge>
              </div>
            </div>

            {/* Progress */}
            <div className="glass-card p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Progresso Geral</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Conclusão</span>
                  <span className="text-2xl font-bold text-primary">{currentProject.progress}%</span>
                </div>
                <Progress value={currentProject.progress} className="h-4" />
              </div>
            </div>

            {/* Dates and Value */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card p-4 rounded-lg">
                <p className="text-sm text-muted mb-1">Data Início</p>
                <p className="text-white font-semibold">{formatDate(currentProject.startDate)}</p>
              </div>
              <div className="glass-card p-4 rounded-lg">
                <p className="text-sm text-muted mb-1">Prazo Entrega</p>
                <p className="text-white font-semibold">{formatDate(currentProject.deadline)}</p>
              </div>
              <div className="glass-card p-4 rounded-lg">
                <p className="text-sm text-muted mb-1">Valor</p>
                <p className="text-white font-semibold">{formatCurrency(currentProject.value)}</p>
              </div>
            </div>

            {/* Description */}
            <div className="glass-card p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Descrição</h3>
              <p className="text-muted">{currentProject.description}</p>
            </div>

            {/* Tags */}
            <div className="glass-card p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {currentProject.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4 mt-6">
            <ProjectTasksKanban
              tasks={currentProject.tasks}
              onTaskMove={handleTaskMove}
              onAddTask={() => setIsAddTaskModalOpen(true)}
              onTaskClick={handleTaskClick}
            />
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-6">
            <div className="glass-card p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Membros do Time</h3>
                <Button size="sm">Adicionar Membro</Button>
              </div>
              <div className="space-y-3">
                {project.team.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 glass-card rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      {member.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{member.name}</p>
                      <p className="text-muted text-sm">Desenvolvedor</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4 mt-6">
            <div className="glass-card p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Arquivos Anexados</h3>
                <Button size="sm">Upload</Button>
              </div>
              <p className="text-muted text-center py-8">
                {currentProject.files.length} arquivo(s) anexado(s)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4 mt-6">
            <div className="glass-card p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Comentários</h3>
              </div>
              <p className="text-muted text-center py-8">
                {currentProject.comments.length} comentário(s)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-6">
            <div className="glass-card p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Histórico de Alterações</h3>
              <p className="text-muted text-center py-8">
                Histórico de alterações em desenvolvimento
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Modal de Adicionar Tarefa */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAdd={handleAddTask}
        teamMembers={currentProject.team}
      />
    </Dialog>
  );
};
