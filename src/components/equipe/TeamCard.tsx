import { Team } from "@/types/team";
import { Member, DEPARTMENT_LABELS } from "@/types/member";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Crown, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamCardProps {
  team: Team;
  members: Member[];
  onViewDetails?: (team: Team) => void;
}

export const TeamCard = ({ team, members, onViewDetails }: TeamCardProps) => {
  const teamMembers = members.filter(m => team.memberIds.includes(m.id));
  const leader = members.find(m => m.id === team.leaderId);
  const totalLeads = teamMembers.reduce((sum, m) => sum + m.assignedLeads, 0);
  const avgConversion = teamMembers.length > 0
    ? Math.round(teamMembers.reduce((sum, m) => sum + m.stats.conversionRate, 0) / teamMembers.length)
    : 0;

  return (
    <div 
      className="glass-card p-5 rounded-xl border border-white/10 hover:border-primary/30 transition-all group"
      style={{ borderLeftColor: team.color, borderLeftWidth: '4px' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white">{team.name}</h3>
            <Badge 
              variant="outline" 
              className="text-[10px]"
              style={{ 
                color: team.color, 
                borderColor: `${team.color}50`,
                backgroundColor: `${team.color}20`
              }}
            >
              {DEPARTMENT_LABELS[team.department]}
            </Badge>
          </div>
          {team.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{team.description}</p>
          )}
        </div>

        {onViewDetails && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewDetails(team)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Eye className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Leader */}
      {leader && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-white/5 rounded-lg">
          <Crown className="w-4 h-4 text-yellow-400" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Líder</p>
            <p className="text-sm text-white font-medium">{leader.name}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center p-2 bg-white/5 rounded-lg">
          <Users className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{teamMembers.length}</p>
          <p className="text-[10px] text-muted-foreground">Membros</p>
        </div>

        <div className="text-center p-2 bg-white/5 rounded-lg">
          <p className="text-lg font-bold text-white">{totalLeads}</p>
          <p className="text-[10px] text-muted-foreground">Leads</p>
        </div>

        <div className="text-center p-2 bg-white/5 rounded-lg">
          <p className={cn(
            "text-lg font-bold",
            avgConversion >= 90 ? "text-green-400" :
            avgConversion >= 75 ? "text-yellow-400" :
            "text-red-400"
          )}>
            {avgConversion}%
          </p>
          <p className="text-[10px] text-muted-foreground">Conversão</p>
        </div>
      </div>

      {/* Members Preview */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
        <div className="flex -space-x-2">
          {teamMembers.slice(0, 4).map((member) => (
            <div
              key={member.id}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-primary to-purple-600 border-2 border-card overflow-hidden"
              title={member.name}
            >
              {member.photoUrl ? (
                <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                member.avatar
              )}
            </div>
          ))}
          {teamMembers.length > 4 && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white bg-white/10 border-2 border-card">
              +{teamMembers.length - 4}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


