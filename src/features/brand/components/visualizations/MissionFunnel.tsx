import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrandEssentialsData } from '../../types/brand-essentials.types';
import { cn } from '@/lib/utils';

interface MissionFunnelProps {
  data: BrandEssentialsData;
  className?: string;
}

export function MissionFunnel({ data, className }: MissionFunnelProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>Mission Funnel</CardTitle>
        <CardDescription>Visualize how your mission flows down to your values and target audience.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Mission Section */}
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Mission</h3>
            <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-primary-900">{data.mission}</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] border-gray-200" />
          </div>

          {/* Vision Section */}
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Vision</h3>
            <div className="p-4 bg-secondary-50 border border-secondary-200 rounded-lg">
              <p className="text-secondary-900">{data.vision}</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] border-gray-200" />
          </div>

          {/* Values Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2 text-center">Values</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.values.map((value) => (
                <div
                  key={value.id}
                  className="p-3 rounded-lg border bg-white shadow-sm text-center"
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: value.impact === 'high' ? '#10B981' : 
                                   value.impact === 'medium' ? '#F59E0B' : '#6B7280'
                  }}
                >
                  <h4 className="font-medium">{value.title}</h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] border-gray-200" />
          </div>

          {/* Target Audience Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2 text-center">Target Audience</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.targetAudience.map((segment) => (
                <div
                  key={segment.id}
                  className="p-3 rounded-lg border bg-white shadow-sm text-center"
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: segment.color
                  }}
                >
                  <h4 className="font-medium">{segment.name}</h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{segment.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] border-gray-200" />
          </div>

          {/* Unique Value Proposition */}
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Unique Value Proposition</h3>
            <div className="p-4 bg-accent-50 border border-accent-200 rounded-lg">
              <p className="text-accent-900">{data.uniqueValueProposition}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 