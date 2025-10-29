import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Badge } from "./ui/badge";

interface MetricCardProps {
  value: string;
  label: string;
  icon?: LucideIcon;
  chart?: ReactNode;
  trend?: string;
  trendColor?: "green" | "red" | "gray";
  badgeLabel?: string;
  badgeColor?: string;
  className?: string;
}

export const MetricCard = ({
  value,
  label,
  icon: Icon,
  chart,
  trend,
  trendColor = "gray",
  badgeLabel,
  badgeColor = "primary",
  className
}: MetricCardProps) => {
  const getIconColor = () => {
    if (trendColor === "green") return "text-green-400";
    if (trendColor === "red") return "text-red-400";
    return "text-primary";
  };

  const getBadgeColor = () => {
    if (trendColor === "green") return "border-green-400/30 text-green-400";
    if (trendColor === "red") return "border-red-400/30 text-red-400";
    return `border-${badgeColor}/30 text-${badgeColor}`;
  };

  const getHoverBorder = () => {
    if (trendColor === "green") return "hover:border-green-500/30";
    if (trendColor === "red") return "hover:border-red-500/30";
    return "hover:border-primary/30";
  };

  return (
    <div
      className={cn(
        "glass-card p-5 rounded-xl border border-white/10 transition-all group",
        getHoverBorder(),
        className
      )}
    >
      {/* Header: Ícone + Badge */}
      <div className="flex items-center justify-between mb-3">
        {Icon && <Icon className={cn("w-5 h-5", getIconColor())} />}
        {badgeLabel && (
          <Badge variant="outline" className={cn("text-xs", getBadgeColor())}>
            {badgeLabel}
          </Badge>
        )}
      </div>

      {/* Valor Principal */}
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      
      {/* Label */}
      <p className="text-sm text-muted-foreground">{label}</p>

      {/* Trend ou Chart */}
      {(trend || chart) && (
        <div className="mt-3">
          {trend && (
            <div className="flex items-center gap-2 text-xs">
              <span className={cn(
                "font-medium",
                trendColor === "green" ? "text-green-400" :
                trendColor === "red" ? "text-red-400" :
                "text-muted-foreground"
              )}>
                {trend}
              </span>
            </div>
          )}
          {chart && <div className="mt-2">{chart}</div>}
        </div>
      )}
    </div>
  );
};
