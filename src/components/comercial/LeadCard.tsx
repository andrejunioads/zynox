import { useDraggable } from "@dnd-kit/core";
import { Lead } from "@/pages/Comercial";
import { Badge } from "@/components/ui/badge";
import { Building2, Clock, Eye, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FollowUp } from "@/types/followup";
import { getFollowUpCountsByLead } from "@/utils/followUpHelpers";

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  followUps?: FollowUp[];
}

export const LeadCard = ({ lead, onClick, followUps = [] }: LeadCardProps) => {
  // Contadores de follow-ups para este lead
  const followUpCounts = getFollowUpCountsByLead(followUps, lead.id);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
        scale: isDragging ? 1.05 : 1,
      }
    : undefined;

  const getOriginColor = (origin: string) => {
    const colorMap: Record<string, string> = {
      LinkedIn: "bg-[#0A66C2]/20 text-[#0A66C2] border-[#0A66C2]/30",
      Instagram: "bg-[#C13584]/20 text-[#C13584] border-[#C13584]/30",
      Indicação: "bg-success/20 text-success border-success/30",
      Google: "bg-[#4285F4]/20 text-[#4285F4] border-[#4285F4]/30",
      WhatsApp: "bg-[#25D366]/20 text-[#25D366] border-[#25D366]/30",
      Website: "bg-primary/20 text-primary border-primary/30",
      Evento: "bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30"
    };
    return colorMap[origin] || "bg-muted/20 text-muted-foreground border-muted/30";
  };

  const getStatusColor = (status: string) => {
    if (status === "hot") return "border-danger/50 glow-danger";
    if (status === "warm") return "border-warning/50 glow-warning";
    return "border-primary/30";
  };

  const getDaysColor = (days: number) => {
    if (days > 14) return "text-danger";
    if (days > 7) return "text-warning";
    return "text-muted-foreground";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getLastInteractionColor = (days?: number) => {
    if (!days) return "text-muted-foreground";
    if (days < 7) return "text-success";
    if (days <= 14) return "text-warning";
    return "text-danger";
  };

  const getTemperatureBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      hot: { bg: 'bg-danger/20', text: 'text-danger', label: '🔥 HOT' },
      warm: { bg: 'bg-warning/20', text: 'text-warning', label: '⚡ WARM' },
      cold: { bg: 'bg-primary/20', text: 'text-primary', label: '❄️ COLD' }
    };
    return badges[status] || badges.cold;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="glass-card p-4 border border-white/10 cursor-grab active:cursor-grabbing relative group"
    >
      {/* Header */}
      <div className="mb-3">
        {/* Badge Temperatura + Menu */}
        <div className="flex items-start justify-between mb-2">
          <Badge className={`text-[10px] px-2 py-0.5 ${getTemperatureBadge(lead.status).bg} ${getTemperatureBadge(lead.status).text} border-0 font-semibold`}>
            {getTemperatureBadge(lead.status).label}
          </Badge>
          
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-3 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 hover:bg-primary/20 text-primary cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Ver</span>
          </Button>
        </div>

        {/* Nome e Empresa */}
        <h4 className="font-bold text-foreground text-[18px] leading-tight mb-1">
          {lead.name}
        </h4>
        <div className="flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="text-[14px] text-[#94A3B8]">{lead.company}</span>
        </div>
      </div>

      {/* Valor */}
      <div className="mb-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
          BUDGET
        </p>
        <p className="text-[20px] font-bold text-success">{formatCurrency(lead.value)}</p>
      </div>

      {/* Última Interação */}
      {lead.lastInteraction !== undefined && (
        <div className="mb-3 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className={`text-[12px] font-medium ${getLastInteractionColor(lead.lastInteraction)}`}>
            há {lead.lastInteraction} {lead.lastInteraction === 1 ? 'dia' : 'dias'}
          </span>
        </div>
      )}

      {/* Badge de Follow-ups */}
      {followUpCounts.total > 0 && (
        <div className="mb-3">
          <Badge 
            className={`text-[10px] px-2 py-1 border ${
              followUpCounts.atrasados > 0 
                ? 'bg-danger/10 text-danger border-danger/30' 
                : followUpCounts.hoje > 0 
                  ? 'bg-warning/10 text-warning border-warning/30'
                  : 'bg-success/10 text-success border-success/30'
            }`}
          >
            <Bell className="w-3 h-3 mr-1" />
            {followUpCounts.total} Follow-up{followUpCounts.total > 1 ? 's' : ''}
            {followUpCounts.atrasados > 0 && ` (${followUpCounts.atrasados} atrasado${followUpCounts.atrasados > 1 ? 's' : ''})`}
          </Badge>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Badge className={`text-[10px] ${getOriginColor(lead.origin)} border`}>
          {lead.origin}
        </Badge>
        
        <div className={`flex items-center gap-1 text-xs ${getDaysColor(lead.daysInStage)}`}>
          <Clock className="w-3 h-3" />
          <span>{lead.daysInStage}d</span>
        </div>
      </div>
    </div>
  );
};
