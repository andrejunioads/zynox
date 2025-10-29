interface PremiumAreaChartProps {
  data: number[];
  color?: "blue" | "green";
}

export const PremiumAreaChart = ({ data, color = "green" }: PremiumAreaChartProps) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1; // Evita divisão por zero

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = range === 0 ? 50 : 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  const strokeColor = color === "blue" ? "#3B82F6" : "#10B981";
  const gradientId = `area-gradient-${color}-${Math.random()}`;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Filled area */}
      <polyline
        points={`0,100 ${points} 100,100`}
        fill={`url(#${gradientId})`}
      />
      
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        style={{ 
          filter: `drop-shadow(0 0 4px ${strokeColor})`,
          transition: 'all 0.3s ease'
        }}
      />
    </svg>
  );
};
