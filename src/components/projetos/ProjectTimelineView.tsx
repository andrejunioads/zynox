import { Project } from "@/pages/Projetos";

interface ProjectTimelineViewProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

export const ProjectTimelineView = ({ projects, onProjectClick }: ProjectTimelineViewProps) => {
  const getProjectDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProjectPosition = (start: string) => {
    const startDate = new Date(start);
    const minDate = new Date(Math.min(...projects.map((p) => new Date(p.startDate).getTime())));
    const diffTime = startDate.getTime() - minDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: Project["status"]) => {
    const colors = {
      backlog: "bg-muted",
      "in-progress": "bg-primary",
      review: "bg-warning",
      completed: "bg-success",
    };
    return colors[status];
  };

  const today = new Date();
  const minDate = new Date(Math.min(...projects.map((p) => new Date(p.startDate).getTime())));
  const maxDate = new Date(Math.max(...projects.map((p) => new Date(p.deadline).getTime())));
  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  const todayPosition = Math.ceil((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="glass-card rounded-xl border border-white/10 p-6 mb-8 overflow-x-auto">
      <h3 className="text-lg font-semibold text-white mb-6">Timeline de Projetos</h3>
      
      <div className="relative min-w-[800px]">
        {/* Today Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
          style={{ left: `${(todayPosition / totalDays) * 100}%` }}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-primary font-semibold whitespace-nowrap">
            Hoje
          </div>
        </div>

        {/* Projects */}
        <div className="space-y-4 mt-8">
          {projects.map((project) => {
            const duration = getProjectDuration(project.startDate, project.deadline);
            const position = getProjectPosition(project.startDate);
            const width = (duration / totalDays) * 100;
            const left = (position / totalDays) * 100;

            return (
              <div key={project.id} className="relative h-12">
                <div className="absolute left-0 top-0 w-48 text-sm text-white truncate">
                  {project.name}
                </div>
                <div className="ml-52 relative h-full">
                  <div
                    className={`absolute h-8 rounded-lg ${getStatusColor(
                      project.status
                    )} cursor-pointer flex items-center px-3 text-white text-xs font-medium`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    onClick={() => onProjectClick(project)}
                  >
                    <span className="truncate">{project.progress}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline Grid */}
        <div className="ml-52 mt-6 border-t border-white/10 pt-2">
          <div className="flex justify-between text-xs text-muted">
            {Array.from({ length: 6 }, (_, i) => {
              const date = new Date(minDate);
              date.setDate(date.getDate() + (totalDays / 5) * i);
              return (
                <span key={i}>
                  {date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
