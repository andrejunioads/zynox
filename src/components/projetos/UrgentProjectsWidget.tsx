import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Clock } from "lucide-react";
import { Project } from "@/pages/Projetos";

interface UrgentProjectsWidgetProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

export const UrgentProjectsWidget = ({ projects, onProjectClick }: UrgentProjectsWidgetProps) => {
  const urgentProjects = projects
    .filter((p) => {
      const daysUntilDeadline = Math.ceil(
        (new Date(p.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilDeadline < 7 || daysUntilDeadline < 0;
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  const getDaysText = (deadline: string) => {
    const days = Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days < 0) return `${Math.abs(days)} dias atrasado`;
    if (days === 0) return "Entrega hoje";
    if (days === 1) return "1 dia restante";
    return `${days} dias restantes`;
  };

  return (
    <div className="glass-card rounded-xl p-6 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-danger" />
        <h3 className="text-lg font-semibold text-white">Projetos Urgentes</h3>
      </div>

      {urgentProjects.length === 0 ? (
        <p className="text-muted text-sm text-center py-4">
          Nenhum projeto urgente no momento
        </p>
      ) : (
        <div className="space-y-3">
          {urgentProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onProjectClick(project)}
              className="p-3 glass-card rounded-lg border border-danger/20 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-white line-clamp-1 flex-1">
                  {project.name}
                </h4>
                <Badge variant="destructive" className="text-[10px] ml-2">
                  URGENTE
                </Badge>
              </div>
              
              <p className="text-xs text-muted mb-2">{project.client}</p>
              
              <div className="flex items-center gap-1 text-xs text-danger mb-2">
                <Clock className="w-3 h-3" />
                <span>{getDaysText(project.deadline)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Progress value={project.progress} className="h-1.5 flex-1" />
                <span className="text-xs text-muted">{project.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
