import { Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface MeetingCardProps {
  title: string;
  date: string;
  time: string;
  category: "Comercial" | "Projeto";
  duration: string;
  status: "live" | "starting" | "scheduled";
  participants: number;
  confirmed: { accepted: number; total: number };
}

export const MeetingCard = ({ 
  title, 
  date, 
  time, 
  category, 
  duration, 
  status,
  participants,
  confirmed 
}: MeetingCardProps) => {
  const statusConfig = {
    live: { label: "AO VIVO", color: "bg-success text-white", glow: "glow-success" },
    starting: { label: "INICIA EM 5 MIN", color: "bg-warning text-white", glow: "glow-warning" },
    scheduled: { label: "AGENDADA", color: "bg-primary text-white", glow: "glow-primary" },
  };

  const statusInfo = statusConfig[status];

  return (
    <div className="glass-card p-4 min-w-[270px] flex-shrink-0 translate-y-[6%]">
      <div className="flex items-start gap-2 mb-3">
        <div className="decorative-line h-12" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white mb-1 truncate">{title}</h4>
          <p className="text-xs text-muted-foreground truncate">{date}</p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-primary/20 text-primary-light border border-primary/30">
          {category}
        </span>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{duration}</span>
        </div>
      </div>

      <div className={cn("inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold mb-3", statusInfo.color, statusInfo.glow)}>
        {statusInfo.label}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex -space-x-1.5">
          {[...Array(Math.min(3, participants))].map((_, i) => (
            <div 
              key={i}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-light border-2 border-card flex items-center justify-center"
            >
              <Users className="w-3 h-3 text-white" />
            </div>
          ))}
          {participants > 3 && (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-light border-2 border-card flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">+{participants - 3}</span>
            </div>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground whitespace-nowrap">
          {confirmed.accepted}/{confirmed.total} confirmados
        </p>
      </div>
    </div>
  );
};
