import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const teamMembers = [
  { name: "João Silva", avatar: "JS", activeProjects: 3, deliveryRate: 92 },
  { name: "Maria Santos", avatar: "MS", activeProjects: 4, deliveryRate: 88 },
  { name: "Pedro Costa", avatar: "PC", activeProjects: 2, deliveryRate: 95 },
  { name: "Ana Lima", avatar: "AL", activeProjects: 3, deliveryRate: 85 },
];

export const TeamPerformanceWidget = () => {
  return (
    <div className="glass-card rounded-xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">Performance da Equipe</h3>

      <div className="space-y-4">
        {teamMembers.map((member, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="text-xs bg-primary/20 text-primary">
                  {member.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{member.name}</p>
                <p className="text-xs text-muted">
                  {member.activeProjects} {member.activeProjects === 1 ? "projeto ativo" : "projetos ativos"}
                </p>
              </div>
              <span className="text-xs font-semibold text-primary">{member.deliveryRate}%</span>
            </div>
            <Progress value={member.deliveryRate} className="h-1.5" />
          </div>
        ))}
      </div>
    </div>
  );
};
