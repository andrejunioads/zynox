import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Project } from "@/pages/Projetos";

interface ProjectListViewProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

export const ProjectListView = ({ projects, onProjectClick }: ProjectListViewProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="glass-card rounded-xl border border-white/10 overflow-hidden mb-8">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox />
            </TableHead>
            <TableHead className="text-white">Projeto</TableHead>
            <TableHead className="text-white">Cliente</TableHead>
            <TableHead className="text-white">Status</TableHead>
            <TableHead className="text-white">Prioridade</TableHead>
            <TableHead className="text-white">Progresso</TableHead>
            <TableHead className="text-white">Prazo</TableHead>
            <TableHead className="text-white">Time</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow
              key={project.id}
              className="border-white/10 hover:bg-transparent cursor-pointer"
              onClick={() => onProjectClick(project)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox />
              </TableCell>
              <TableCell className="font-medium text-white">{project.name}</TableCell>
              <TableCell className="text-muted">{project.client}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {project.status === "backlog" && "Backlog"}
                  {project.status === "in-progress" && "Em Andamento"}
                  {project.status === "review" && "Em Revisão"}
                  {project.status === "completed" && "Concluído"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    project.priority === "high"
                      ? "border-danger text-danger"
                      : project.priority === "medium"
                      ? "border-warning text-warning"
                      : "border-success text-success"
                  }`}
                >
                  {project.priority === "high" && "Alta"}
                  {project.priority === "medium" && "Média"}
                  {project.priority === "low" && "Baixa"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 min-w-[120px]">
                  <Progress value={project.progress} className="h-2 flex-1" />
                  <span className="text-xs text-muted w-10 text-right">{project.progress}%</span>
                </div>
              </TableCell>
              <TableCell className="text-muted text-sm">{formatDate(project.deadline)}</TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
