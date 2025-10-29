import { FolderKanban, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  name: string;
  path: string;
  category: string;
  duration: string;
  status: "live" | "offline";
  members: number;
}

export const ProjectCard = ({ name, path, category, duration, status, members }: ProjectCardProps) => {
  return (
    <div className="glass-card p-4 min-w-[270px] flex-shrink-0 translate-y-[6%]">
      <div className="flex items-start gap-2 mb-3">
        <div className="decorative-line h-12" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white mb-1 truncate">{name}</h4>
          <p className="text-[10px] text-muted-foreground truncate">{path}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <FolderKanban className="w-3 h-3" />
          <span>{category}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{duration}</span>
        </div>
      </div>

      <div className={cn(
        "inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold mb-3",
        status === "live" 
          ? "bg-success/20 text-success glow-success" 
          : "bg-muted/20 text-muted-foreground"
      )}>
        {status === "live" ? "AO VIVO" : "OFFLINE"}
      </div>

      <div className="flex -space-x-1.5">
        {[...Array(Math.min(3, members))].map((_, i) => (
          <div 
            key={i}
            className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-light border-2 border-card flex items-center justify-center"
          >
            <Users className="w-3 h-3 text-white" />
          </div>
        ))}
        {members > 3 && (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-light border-2 border-card flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">+{members - 3}</span>
          </div>
        )}
      </div>
    </div>
  );
};
