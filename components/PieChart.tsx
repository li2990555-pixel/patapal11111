import React from 'react';

export interface PieChartData {
  label: string;
  value: number;
  color: string;
  id: string; 
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  onSliceClick: (id: string) => void;
}

const PieChart: React.FC<PieChartProps> = ({ data, size = 120, onSliceClick }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (data.length === 0 || total === 0) {
    return (
        <div style={{ width: size, height: size }} className="flex items-center justify-center bg-slate-100 rounded-full">
           <p className="text-xs text-slate-500">无数据</p>
        </div>
    );
  }

  const radius = size / 2;
  const center = radius;

  const polarToCartesian = (angle: number) => {
    const angleInRadians = ((angle - 90) * Math.PI) / 180.0;
    const x = center + radius * Math.cos(angleInRadians);
    const y = center + radius * Math.sin(angleInRadians);
    return { x, y };
  };

  let cumulativeAngle = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((slice) => {
        const sliceAngle = (slice.value / total) * 360;
        
        // Handle full circle case to avoid SVG path glitches
        if (slice.value === total) {
           return <circle key={slice.id} cx={center} cy={center} r={radius} fill={slice.color} onClick={() => onSliceClick(slice.id)} className="cursor-pointer" />
        }

        const startPoint = polarToCartesian(cumulativeAngle);
        const endPoint = polarToCartesian(cumulativeAngle + sliceAngle);
        const largeArcFlag = sliceAngle > 180 ? 1 : 0;

        const pathData = [
          `M ${center},${center}`,
          `L ${startPoint.x},${startPoint.y}`,
          `A ${radius},${radius} 0 ${largeArcFlag} 1 ${endPoint.x},${endPoint.y}`,
          'Z',
        ].join(' ');

        cumulativeAngle += sliceAngle;

        return (
          <path
            key={slice.id}
            d={pathData}
            fill={slice.color}
            onClick={() => onSliceClick(slice.id)}
            className="cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105 origin-center"
          />
        );
      })}
    </svg>
  );
};

export default PieChart;