import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrandEssentialsData, AudienceSegment } from '../../types/brand-essentials.types';
import { cn } from '@/lib/utils';

interface AudienceAnalysisProps {
  data: BrandEssentialsData;
  className?: string;
}

export function AudienceAnalysis({ data, className }: AudienceAnalysisProps) {
  const maxMarketSize = Math.max(...data.targetAudience.map(s => s.marketSize || 0));
  const maxGrowthRate = Math.max(...data.targetAudience.map(s => s.growthRate || 0));

  const getQuadrant = (segment: AudienceSegment) => {
    const marketSize = segment.marketSize || 0;
    const growthRate = segment.growthRate || 0;
    const isHighMarket = marketSize > maxMarketSize / 2;
    const isHighGrowth = growthRate > maxGrowthRate / 2;

    if (isHighMarket && isHighGrowth) return 'Stars';
    if (isHighMarket && !isHighGrowth) return 'Cash Cows';
    if (!isHighMarket && isHighGrowth) return 'Question Marks';
    return 'Dogs';
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>Audience Analysis</CardTitle>
        <CardDescription>Analyze your target audience segments based on market size and growth potential.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-[400px] border rounded-lg p-4">
          {/* Y-axis label */}
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 text-sm text-gray-500">
            Growth Rate (%)
          </div>

          {/* X-axis label */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm text-gray-500">
            Market Size
          </div>

          {/* Quadrant labels */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
            <div className="border-r border-b p-2 text-sm text-gray-400">Question Marks</div>
            <div className="border-b p-2 text-sm text-gray-400">Stars</div>
            <div className="border-r p-2 text-sm text-gray-400">Dogs</div>
            <div className="p-2 text-sm text-gray-400">Cash Cows</div>
          </div>

          {/* Plot points */}
          {data.targetAudience.map((segment) => {
            const marketSize = segment.marketSize || 0;
            const growthRate = segment.growthRate || 0;
            const x = (marketSize / maxMarketSize) * 100;
            const y = (growthRate / maxGrowthRate) * 100;
            
            return (
              <div
                key={segment.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-help transition-transform hover:scale-110"
                style={{
                  left: `${x}%`,
                  bottom: `${y}%`
                }}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: segment.color }}
                />
                <div className="absolute left-6 top-0 bg-white p-2 rounded shadow-lg opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  <p className="font-medium">{segment.name}</p>
                  <p className="text-sm text-gray-600">Market Size: {marketSize}</p>
                  <p className="text-sm text-gray-600">Growth Rate: {growthRate}%</p>
                  <p className="text-sm text-gray-600">Category: {getQuadrant(segment)}</p>
                </div>
              </div>
            );
          })}

          {/* Axes */}
          <div className="absolute left-0 bottom-0 w-px h-full bg-gray-300" />
          <div className="absolute left-0 bottom-0 w-full h-px bg-gray-300" />
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {data.targetAudience.map((segment) => (
            <div key={segment.id} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm">{segment.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 