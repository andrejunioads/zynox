interface MiniBarChartProps {
  data: number[];
}

export const MiniBarChart = ({ data }: MiniBarChartProps) => {
  const max = Math.max(...data);
  
  return (
    <div className="flex items-end justify-between h-full gap-1">
      {data.map((value, index) => {
        const height = (value / max) * 100;
        const isLast = index === data.length - 1;
        
        return (
          <div
            key={index}
            className="flex-1 rounded-t transition-all duration-300"
            style={{
              height: `${height}%`,
              background: isLast 
                ? 'linear-gradient(180deg, #3B82F6 0%, #60A5FA 100%)'
                : '#1A1D29',
              boxShadow: isLast ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'
            }}
          />
        );
      })}
    </div>
  );
};
