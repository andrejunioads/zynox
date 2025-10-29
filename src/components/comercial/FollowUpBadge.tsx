import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { FollowUp } from "@/types/followup";
import { getFollowUpCountsByLead } from "@/utils/followUpHelpers";

interface FollowUpBadgeProps {
  followUps: FollowUp[];
  leadId: string;
}

export const FollowUpBadge = ({ followUps, leadId }: FollowUpBadgeProps) => {
  const counts = getFollowUpCountsByLead(followUps, leadId);

  if (counts.total === 0) return null;

  return (
    <Badge
      className={`text-[10px] px-2 py-1 border ${
        counts.atrasados > 0
          ? 'bg-danger/10 text-danger border-danger/30'
          : counts.hoje > 0
            ? 'bg-warning/10 text-warning border-warning/30'
            : 'bg-success/10 text-success border-success/30'
      }`}
    >
      <Bell className="w-3 h-3 mr-1" />
      {counts.total} Follow-up{counts.total > 1 ? 's' : ''}
      {counts.atrasados > 0 && ` (${counts.atrasados} atrasado${counts.atrasados > 1 ? 's' : ''})`}
    </Badge>
  );
};




