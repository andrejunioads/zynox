interface PremiumMiniBarProps {
  data: number[];
}

export const PremiumMiniBar = ({ data }: PremiumMiniBarProps) => {
  const max = Math.max(...data) || 1; // Evita divisão por zero

  return (
    <div className="flex items-end justify-between h-full gap-1">
      {data.map((value, index) => {
        const height = max > 0 ? (value / max) * 100 : 50;
        const isLast = index === data.length - 1;
        
        return (
          <div
            key={index}
            className="flex-1 rounded-t transition-all duration-300"
            style={{
              height: `${height}%`,
              background: isLast 
                ? 'linear-gradient(180deg, #3B82F6 0%, #60A5FA 100%)'
                : 'rgba(26, 29, 41, 0.8)',
              boxShadow: isLast ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none',
              minHeight: '6px'
            }}
          />
        );
      })}
    </div>
  );
};
