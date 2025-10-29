interface MiniLineChartProps {
  data: number[];
  color?: "blue" | "green";
}

export const MiniLineChart = ({ data, color = "blue" }: MiniLineChartProps) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  const gradientId = `gradient-${color}-${Math.random()}`;
  const strokeColor = color === "blue" ? "#3B82F6" : "#10B981";
  const fillColor = color === "blue" ? "rgba(59, 130, 246, 0.2)" : "rgba(16, 185, 129, 0.2)";

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: strokeColor, stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: strokeColor, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <polyline
        points={`0,100 ${points} 100,100`}
        fill={`url(#${gradientId})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        style={{ filter: `drop-shadow(0 0 4px ${strokeColor})` }}
      />
    </svg>
  );
};
