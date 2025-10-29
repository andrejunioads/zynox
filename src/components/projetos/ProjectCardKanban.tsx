import { useDraggable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarDays, MessageSquare, Paperclip, CheckSquare, Eye } from "lucide-react";
import { Project } from "@/pages/Projetos";

interface ProjectCardKanbanProps {
  project: Project;
  onClick: () => void;
}

export const ProjectCardKanban = ({ project, onClick }: ProjectCardKanbanProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;


  const getPriorityLabel = (priority: string) => {
    const labels = {
      high: "Alta",
      medium: "Média",
      low: "Baixa",
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const getDeadlineStatus = () => {
    const today = new Date();
    const deadline = new Date(project.deadline);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `Atrasado ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? "dia" : "dias"}`,
        color: "text-danger",
      };
    } else if (diffDays === 0) {
      return { text: "Entrega hoje", color: "text-warning" };
    } else if (diffDays === 1) {
      return { text: "Entrega amanhã", color: "text-warning" };
    } else if (diffDays <= 7) {
      return { text: `Em ${diffDays} dias`, color: "text-warning" };
    } else {
      return { text: `Em ${diffDays} dias`, color: "text-muted" };
    }
  };

  const deadlineStatus = getDeadlineStatus();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card rounded-lg p-4 border border-white/10 ${
        isDragging ? "opacity-50 shadow-2xl" : ""
      }`}
    >
      {/* Header */}
      <div 
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-semibold text-white text-sm line-clamp-2 flex-1 pr-2">
            {project.name}
          </h4>
          <Badge
            variant="secondary"
            className="text-xs whitespace-nowrap border-none"
          >
            {getPriorityLabel(project.priority)}
          </Badge>
        </div>
      </div>

      <div 
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing"
      >
        {/* Client */}
        <p className="text-xs text-muted mb-3">{project.client}</p>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted">Progresso</span>
            <span className="text-xs text-primary font-semibold">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        {/* Deadline */}
        <div className={`flex items-center gap-1.5 mb-3 text-xs ${deadlineStatus.color}`}>
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{deadlineStatus.text}</span>
        </div>

        {/* Team Avatars */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex -space-x-2">
            {project.team.slice(0, 3).map((member, idx) => (
              <Avatar key={idx} className="w-7 h-7 border-2 border-card">
                <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                  {member.avatar}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.team.length > 3 && (
              <Avatar className="w-7 h-7 border-2 border-card">
                <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                  +{project.team.length - 3}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.tags.slice(0, 2).map((tag, idx) => (
            <Badge key={idx} variant="outline" className="text-[10px] px-2 py-0">
              {tag}
            </Badge>
          ))}
          {project.tags.length > 2 && (
            <Badge variant="outline" className="text-[10px] px-2 py-0">
              +{project.tags.length - 2}
            </Badge>
          )}
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-white/5">
          <div className="flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>
              {project.tasks.filter(t => t.status === 'done').length}/{project.tasks.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{project.comments.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <Paperclip className="w-3.5 h-3.5" />
            <span>{project.files.length}</span>
          </div>
        </div>
      </div>

      {/* Botão Ver - NÃO arrasta */}
      <div className="mt-3 pt-3 border-t border-white/5">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          variant="outline"
          size="sm"
          className="w-full glass-card border-slate-700 hover:bg-primary/10 hover:border-primary/50 transition-all"
        >
          <Eye className="w-3.5 h-3.5 mr-2" />
          Ver Projeto
        </Button>
      </div>
    </div>
  );
};
