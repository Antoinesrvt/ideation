import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  title: string;
  data: DataPoint[];
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ 
  title, 
  data,
  height = 200
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2" style={{ height: `${height}px` }}>
          <div className="flex h-full">
            {data.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="flex-1 w-full flex items-end justify-center px-1">
                  <div 
                    className={`w-full ${item.color || 'bg-blue-500'} rounded-t`}
                    style={{ height: `${(item.value / maxValue) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-2 text-center">{item.label}</div>
                <div className="text-xs font-medium">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface PieChartProps {
  title: string;
  data: DataPoint[];
  size?: number;
}

export const PieChart: React.FC<PieChartProps> = ({ 
  title, 
  data,
  size = 200
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div 
          className="relative rounded-full"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const startAngle = cumulativePercentage * 3.6; // 3.6 = 360 / 100
            cumulativePercentage += percentage;
            const endAngle = cumulativePercentage * 3.6;
            
            return (
              <div 
                key={index}
                className="absolute inset-0"
                style={{
                  background: `conic-gradient(transparent ${startAngle}deg, ${item.color || '#3b82f6'} ${startAngle}deg ${endAngle}deg, transparent ${endAngle}deg)`,
                  borderRadius: '50%'
                }}
              ></div>
            );
          })}
          <div 
            className="absolute bg-white rounded-full"
            style={{ 
              top: '25%', 
              left: '25%', 
              width: '50%', 
              height: '50%' 
            }}
          ></div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color || '#3b82f6' }}
              ></div>
              <span className="text-sm">{item.label}: {Math.round((item.value / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};