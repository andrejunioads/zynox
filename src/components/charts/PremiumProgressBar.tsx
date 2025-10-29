interface PremiumProgressBarProps {
  value: number;
  color?: "blue" | "green";
}

export const PremiumProgressBar = ({ value, color = "green" }: PremiumProgressBarProps) => {
  const gradientClass = color === "blue" 
    ? "from-primary to-primary-light" 
    : "from-success to-emerald-400";
  
  const shadowColor = color === "blue"
    ? "rgba(59, 130, 246, 0.5)"
    : "rgba(16, 185, 129, 0.5)";

  return (
    <div className="w-full">
      <div className="h-[3px] bg-primary/10 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${gradientClass} transition-all duration-1000 ease-out`}
          style={{ 
            width: `${value}%`,
            boxShadow: `0 0 10px ${shadowColor}`
          }}
        />
      </div>
    </div>
  );
};
