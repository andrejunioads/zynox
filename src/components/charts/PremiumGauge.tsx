interface PremiumGaugeProps {
  value: number;
  size?: number;
}

export const PremiumGauge = ({ value, size = 70 }: PremiumGaugeProps) => {
  const strokeWidth = size > 80 ? 12 : 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  // Ajustar tamanho do texto baseado no tamanho do gauge
  const textSize = size > 80 ? "text-xl" : size > 60 ? "text-base" : "text-sm";

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="relative mx-auto" style={{ width: size, height: size, maxWidth: '100px' }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
          </defs>

          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(59, 130, 246, 0.1)"
            strokeWidth={strokeWidth}
          />

          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
              filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))'
            }}
          />
        </svg>

        {/* Center percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${textSize} font-bold text-white`}>{value}%</span>
        </div>
      </div>
    </div>
  );
};
