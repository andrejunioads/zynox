import { useDroppable } from "@dnd-kit/core";
import { LeadCard } from "./LeadCard";
import { Lead } from "@/pages/Comercial";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FollowUp } from "@/types/followup";

interface Stage {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
}

interface KanbanColumnProps {
  stage: Stage;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  followUps?: FollowUp[];
}

export const KanbanColumn = ({ stage, leads, onLeadClick, followUps = [] }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "border-primary/30 bg-primary/5",
      cyan: "border-accent-blue/30 bg-accent-blue/5",
      teal: "border-[#14B8A6]/30 bg-[#14B8A6]/5",
      purple: "border-[#8B5CF6]/30 bg-[#8B5CF6]/5",
      orange: "border-warning/30 bg-warning/5",
      green: "border-success/30 bg-success/5",
      red: "border-danger/30 bg-danger/5"
    };
    return colorMap[color] || colorMap.blue;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calcular estatísticas dinamicamente
  const stats = {
    count: leads.length,
    total: leads.reduce((sum, lead) => sum + (lead.value || 0), 0)
  };

  const formattedTotal = stats.total >= 1000 
    ? `R$ ${(stats.total / 1000).toFixed(1)}K` 
    : `R$ ${stats.total}`;

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-[320px] glass-card p-4 ${
        isOver ? "border-primary/50 glow-primary" : ""
      }`}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <stage.icon className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">{stage.title}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className={`${getColorClasses(stage.color)} border glow-${stage.color}`}
          >
            {stats.count} leads
          </Badge>
          <Badge 
            variant="secondary"
            className="bg-success/20 text-success border border-success/30"
          >
            {formattedTotal}
          </Badge>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {leads.map(lead => (
          <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} followUps={followUps} />
        ))}
        
        {leads.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhum lead nesta fase
          </div>
        )}
      </div>
    </div>
  );
};
