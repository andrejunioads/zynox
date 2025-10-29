import { Users, Circle, Bot, TrendingUp, UserCheck, UserX } from "lucide-react";
import { Member } from "@/types/member";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TeamStatsProps {
  members: Member[];
}

export const TeamStats = ({ members }: TeamStatsProps) => {
  const totalMembers = members.length;
  const humanMembers = members.filter(m => m.type === 'human').length;
  const aiAgents = members.filter(m => m.type === 'ai').length;
  const onlineMembers = members.filter(m => m.status === 'online').length;
  const offlineMembers = members.filter(m => m.status === 'offline').length;
  const awayMembers = members.filter(m => m.status === 'away').length;
  
  // Calcula eficácia média (conversão)
  const avgEfficiency = members.length > 0
    ? Math.round(members.reduce((sum, m) => sum + m.stats.conversionRate, 0) / members.length)
    : 0;

  // Total de leads atribuídos
  const totalLeads = members.reduce((sum, m) => sum + m.assignedLeads, 0);

  return (
    <div className="space-y-4">
      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Membros */}
        <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-primary/30 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-5 h-5 text-primary" />
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              Total
            </Badge>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{totalMembers}</p>
          <p className="text-sm text-muted-foreground">Membros da Equipe</p>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">{humanMembers} humanos</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-cyan-400">{aiAgents} IAs</span>
          </div>
        </div>

        {/* Online Agora */}
        <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-green-500/30 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="relative">
              <Circle className="w-5 h-5 text-green-400" fill="currentColor" />
              <div className="absolute inset-0 animate-ping">
                <Circle className="w-5 h-5 text-green-400 opacity-75" fill="currentColor" />
              </div>
            </div>
            <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
              Ativo
            </Badge>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{onlineMembers}</p>
          <p className="text-sm text-muted-foreground">Online Agora</p>
          <div className="mt-3 flex items-center gap-2 text-xs">
            {awayMembers > 0 && (
              <>
                <span className="text-yellow-400">{awayMembers} ausente{awayMembers > 1 ? 's' : ''}</span>
                <span className="text-muted-foreground">•</span>
              </>
            )}
            <span className="text-slate-400">{offlineMembers} offline</span>
          </div>
        </div>

        {/* Leads Atribuídos */}
        <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <UserCheck className="w-5 h-5 text-purple-400" />
            <Badge variant="outline" className="text-xs border-purple-400/30 text-purple-400">
              Leads
            </Badge>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{totalLeads}</p>
          <p className="text-sm text-muted-foreground">Leads Atribuídos</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            {totalMembers > 0 ? (
              <span>Média de {Math.round(totalLeads / totalMembers)} por membro</span>
            ) : (
              <span>Nenhum lead atribuído</span>
            )}
          </div>
        </div>

        {/* Eficácia Média */}
        <div className={cn(
          "glass-card p-5 rounded-xl border border-white/10 transition-all group",
          avgEfficiency >= 90 ? "hover:border-green-500/30" :
          avgEfficiency >= 75 ? "hover:border-yellow-500/30" :
          "hover:border-red-500/30"
        )}>
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className={cn(
              "w-5 h-5",
              avgEfficiency >= 90 ? "text-green-400" :
              avgEfficiency >= 75 ? "text-yellow-400" :
              "text-red-400"
            )} />
            <Badge className={cn(
              "text-xs border",
              avgEfficiency >= 90 ? "bg-green-500/20 text-green-400 border-green-500/30" :
              avgEfficiency >= 75 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
              "bg-red-500/20 text-red-400 border-red-500/30"
            )}>
              {avgEfficiency >= 90 ? "Ótimo" : avgEfficiency >= 75 ? "Bom" : "Precisa atenção"}
            </Badge>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{avgEfficiency}%</p>
          <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
          <div className="mt-3 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                avgEfficiency >= 90 ? "bg-green-500" :
                avgEfficiency >= 75 ? "bg-yellow-500" :
                "bg-red-500"
              )}
              style={{ width: `${avgEfficiency}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

