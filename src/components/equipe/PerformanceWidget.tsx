import { Member } from "@/types/member";
import { TrendingUp, Clock, CheckCircle2, MessageSquare, Target, Zap } from "lucide-react";

interface PerformanceWidgetProps {
  member: Member;
}

export const PerformanceWidget = ({ member }: PerformanceWidgetProps) => {
  const isAI = member.type === 'ai';

  const kpis = [
    {
      icon: TrendingUp,
      label: "Taxa de Conversão",
      value: `${member.stats.conversionRate}%`,
      color: "text-green-400",
      bgColor: "bg-green-400/10"
    },
    {
      icon: Clock,
      label: "Tempo Médio de Resposta",
      value: member.stats.avgResponseTime < 1 
        ? `${Math.round(member.stats.avgResponseTime * 60)}s`
        : `${Math.round(member.stats.avgResponseTime)}min`,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10"
    },
    {
      icon: CheckCircle2,
      label: "Tarefas Concluídas",
      value: member.stats.completedTasks.toString(),
      color: "text-blue-400",
      bgColor: "bg-blue-400/10"
    },
    {
      icon: MessageSquare,
      label: "Total de Interações",
      value: member.stats.totalInteractions.toString(),
      color: "text-purple-400",
      bgColor: "bg-purple-400/10"
    },
    {
      icon: Target,
      label: "Leads Convertidos",
      value: `${member.stats.convertedLeads}/${member.stats.totalLeads}`,
      color: "text-cyan-400",
      bgColor: "bg-cyan-400/10"
    },
    {
      icon: Zap,
      label: "Follow-ups Criados",
      value: member.stats.followUpsCreated.toString(),
      color: "text-orange-400",
      bgColor: "bg-orange-400/10"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Performance (Últimos 30 dias)</h3>
        {isAI && (
          <span className="text-xs px-2 py-1 rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/30">
            🤖 Agente IA
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className="glass-card p-4 rounded-lg border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`${kpi.bgColor} p-2 rounded-lg`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-white">{kpi.value}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Overall Performance */}
      <div className="glass-card p-4 rounded-lg border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Performance Geral</span>
          <span className={`text-sm font-semibold ${
            member.stats.conversionRate >= 90 ? 'text-green-400' :
            member.stats.conversionRate >= 75 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {member.stats.conversionRate >= 90 ? 'Excelente' :
             member.stats.conversionRate >= 75 ? 'Bom' :
             'Precisa Melhorar'}
          </span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              member.stats.conversionRate >= 90 ? 'bg-green-500' :
              member.stats.conversionRate >= 75 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${member.stats.conversionRate}%` }}
          />
        </div>
      </div>

      {/* AI Specific Stats */}
      {isAI && member.aiModel && (
        <div className="glass-card p-4 rounded-lg border border-cyan-400/20 bg-cyan-400/5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-cyan-400">Modelo de IA</span>
          </div>
          <p className="text-sm text-white">{member.aiModel}</p>
          
          {member.aiCapabilities && member.aiCapabilities.length > 0 && (
            <div className="mt-3 pt-3 border-t border-cyan-400/10">
              <p className="text-xs text-muted-foreground mb-2">Capacidades</p>
              <div className="flex flex-wrap gap-1">
                {member.aiCapabilities.map((capability, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/30"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};




