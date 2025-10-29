import { CheckCircle2, FileEdit, MessageCircle, UserPlus } from "lucide-react";

const activities = [
  {
    id: 1,
    user: "João Silva",
    action: "atualizou",
    target: "Website Empresa X",
    time: "há 2h",
    icon: FileEdit,
    color: "text-primary",
  },
  {
    id: 2,
    user: "Maria Santos",
    action: "concluiu tarefa",
    target: "Design Homepage",
    time: "há 5h",
    icon: CheckCircle2,
    color: "text-success",
  },
  {
    id: 3,
    user: "Pedro Costa",
    action: "comentou em",
    target: "App Mobile Delivery",
    time: "ontem",
    icon: MessageCircle,
    color: "text-warning",
  },
  {
    id: 4,
    user: "Ana Lima",
    action: "foi adicionada ao",
    target: "Sistema CRM",
    time: "ontem",
    icon: UserPlus,
    color: "text-muted",
  },
];

export const RecentActivityWidget = () => {
  return (
    <div className="glass-card rounded-xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">Atividade Recente</h3>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex gap-3">
              <div className={`mt-1 ${activity.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">
                  <span className="font-medium">{activity.user}</span>{" "}
                  <span className="text-muted">{activity.action}</span>{" "}
                  <span className="font-medium">"{activity.target}"</span>
                </p>
                <p className="text-xs text-muted mt-1">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
