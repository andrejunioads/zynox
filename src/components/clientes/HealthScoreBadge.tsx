import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HealthScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const HealthScoreBadge = ({ score, size = "md", showLabel = true }: HealthScoreBadgeProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30", label: "Excelente" };
    if (score >= 50) return { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30", label: "Bom" };
    return { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", label: "Atenção" };
  };

  const colors = getScoreColor(score);

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };

  return (
    <Badge
      className={cn(
        colors.bg,
        colors.text,
        colors.border,
        "border font-semibold",
        sizeClasses[size]
      )}
    >
      {score}% {showLabel && `• ${colors.label}`}
    </Badge>
  );
};
