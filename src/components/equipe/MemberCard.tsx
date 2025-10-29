import { Member, DEPARTMENT_LABELS, DEPARTMENT_COLORS, STATUS_COLORS, ROLE_LABELS } from "@/types/member";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock, CheckCircle2, Target, Bot, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MemberCardProps {
  member: Member;
  onViewDetails: (member: Member) => void;
}

export const MemberCard = ({ member, onViewDetails }: MemberCardProps) => {
  const isAI = member.type === 'ai';

  return (
    <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-primary/30 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Avatar/Status */}
          <div className="relative">
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white overflow-hidden",
              isAI ? "bg-gradient-to-br from-cyan-500 to-blue-600" : "bg-gradient-to-br from-primary to-purple-600"
            )}>
              {member.photoUrl ? (
                <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                member.avatar
              )}
            </div>
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card",
              STATUS_COLORS[member.status]
            )} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white truncate">{member.name}</h3>
              {isAI && (
                <Bot className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn("text-[10px] border", DEPARTMENT_COLORS[member.department])}>
                {DEPARTMENT_LABELS[member.department]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {ROLE_LABELS[member.role]}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onViewDetails(member)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        {/* Primeira linha: Leads e Última Atividade */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Leads Atribuídos</p>
              <p className="text-sm font-semibold text-white">{member.assignedLeads}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Última Atividade</p>
              <p className="text-sm font-semibold text-white truncate">
                {formatDistanceToNow(new Date(member.lastActivity), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Segunda linha: Resposta e Taxa */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Tempo Resposta</p>
              <p className="text-sm font-semibold text-white">
                {member.stats.avgResponseTime < 1 
                  ? `${Math.round(member.stats.avgResponseTime * 60)}s`
                  : `${Math.round(member.stats.avgResponseTime)}min`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Conversão</p>
              <p className="text-sm font-semibold text-white">{member.stats.conversionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Bar */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground">Performance</span>
          <span className={cn(
            "font-semibold",
            member.stats.conversionRate >= 90 ? "text-green-400" :
            member.stats.conversionRate >= 75 ? "text-yellow-400" :
            "text-red-400"
          )}>
            {member.stats.conversionRate}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              member.stats.conversionRate >= 90 ? "bg-green-500" :
              member.stats.conversionRate >= 75 ? "bg-yellow-500" :
              "bg-red-500"
            )}
            style={{ width: `${member.stats.conversionRate}%` }}
          />
        </div>
      </div>

      {/* AI Capabilities */}
      {isAI && member.aiCapabilities && member.aiCapabilities.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-xs text-muted-foreground mb-2">Capacidades</p>
          <div className="flex flex-wrap gap-1">
            {member.aiCapabilities.slice(0, 3).map((capability, idx) => (
              <Badge key={idx} variant="outline" className="text-[10px] text-cyan-400 border-cyan-400/30">
                {capability}
              </Badge>
            ))}
            {member.aiCapabilities.length > 3 && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-white/10">
                +{member.aiCapabilities.length - 3}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

