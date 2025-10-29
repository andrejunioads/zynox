import { Activity, ACTIVITY_LABELS } from "@/types/member";
import { 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  MessageSquare, 
  Briefcase,
  UserPlus,
  RefreshCw,
  Trophy
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ActivityTimelineProps {
  activities: Activity[];
  maxItems?: number;
}

export const ActivityTimeline = ({ activities, maxItems = 10 }: ActivityTimelineProps) => {
  const displayActivities = activities.slice(0, maxItems);

  if (displayActivities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Nenhuma atividade recente
      </div>
    );
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'lead_assigned':
        return Target;
      case 'lead_updated':
        return RefreshCw;
      case 'lead_converted':
        return Trophy;
      case 'task_completed':
        return CheckCircle2;
      case 'followup_created':
        return TrendingUp;
      case 'message_sent':
        return MessageSquare;
      case 'project_updated':
        return Briefcase;
      case 'member_added':
      case 'member_updated':
        return UserPlus;
      default:
        return CheckCircle2;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'lead_converted':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'lead_assigned':
      case 'lead_updated':
        return 'text-primary bg-primary/10 border-primary/30';
      case 'task_completed':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'followup_created':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'message_sent':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      case 'project_updated':
        return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';
      default:
        return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    }
  };

  return (
    <div className="space-y-3">
      {displayActivities.map((activity, index) => {
        const Icon = getActivityIcon(activity.type);
        const colorClass = getActivityColor(activity.type);
        const isLast = index === displayActivities.length - 1;

        return (
          <div key={activity.id} className="flex gap-3 relative">
            {/* Timeline Line */}
            {!isLast && (
              <div className="absolute left-4 top-8 bottom-0 w-px bg-white/5" />
            )}

            {/* Icon */}
            <div className={cn(
              "w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 z-10",
              colorClass
            )}>
              <Icon className="w-4 h-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-white">
                  {ACTIVITY_LABELS[activity.type]}
                </p>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatDistanceToNow(activity.timestamp, { 
                    locale: ptBR, 
                    addSuffix: true 
                  })}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-1">
                {activity.description}
              </p>

              {/* Metadata */}
              {activity.metadata && (
                <div className="flex items-center gap-2 mt-2">
                  {activity.metadata.leadName && (
                    <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/70">
                      {activity.metadata.leadName}
                    </span>
                  )}
                  {activity.metadata.projectName && (
                    <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/70">
                      {activity.metadata.projectName}
                    </span>
                  )}
                  {activity.metadata.value && (
                    <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-400 font-medium">
                      R$ {activity.metadata.value.toLocaleString('pt-BR')}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};




