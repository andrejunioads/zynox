import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, LucideIcon } from "lucide-react";
import { ProjectCardKanban } from "./ProjectCardKanban";
import { Project } from "@/pages/Projetos";

interface Stage {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
}

interface ProjectKanbanColumnProps {
  stage: Stage;
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

export const ProjectKanbanColumn = ({ stage, projects, onProjectClick }: ProjectKanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const getColorClasses = (color: string) => {
    // Todas as colunas agora usam borda neutra cinza
    return "border-muted/50 bg-muted/5";
  };

  const totalValue = projects.reduce((sum, p) => sum + p.value, 0);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-[320px] glass-card rounded-xl border ${
        getColorClasses(stage.color)
      } ${isOver ? "ring-2 ring-primary glow-primary" : ""}`}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <stage.icon className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-white text-base">{stage.title}</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-transparent"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {projects.length} {projects.length === 1 ? "projeto" : "projetos"}
          </Badge>
          {totalValue > 0 && (
            <Badge variant="outline" className="text-xs">
              {formatCurrency(totalValue)}
            </Badge>
          )}
        </div>
      </div>

      {/* Column Content */}
      <div className="p-3 space-y-3 overflow-y-auto scrollbar-thin">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-muted text-sm">
            Nenhum projeto nesta fase
          </div>
        ) : (
          projects.map((project) => (
            <ProjectCardKanban
              key={project.id}
              project={project}
              onClick={() => onProjectClick(project)}
            />
          ))
        )}
      </div>
    </div>
  );
};
