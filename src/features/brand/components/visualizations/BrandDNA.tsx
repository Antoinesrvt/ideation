import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrandEssentialsData } from '../../types/brand-essentials.types';
import { cn } from '@/lib/utils';

interface BrandDNAProps {
  data: BrandEssentialsData;
  className?: string;
}

export function BrandDNA({ data, className }: BrandDNAProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Find all connections for a given ID (either value or audience)
  const getConnections = (id: string) => {
    const isValue = data.values.some(v => v.id === id);
    if (isValue) {
      const value = data.values.find(v => v.id === id);
      if (!value) return [];

      // For values, find connected audience segments based on matching keywords
      return data.targetAudience.filter(segment => {
        const valueKeywords = [
          value.title.toLowerCase(),
          value.description.toLowerCase(),
          ...value.examples.map(e => e.toLowerCase())
        ];
        
        const segmentKeywords = [
          ...segment.needs.map(n => n.toLowerCase()),
          ...segment.painPoints.map(p => p.toLowerCase()),
          segment.description.toLowerCase()
        ];

        // Check if any keywords match or are contained within each other
        return valueKeywords.some(vk => 
          segmentKeywords.some(sk => 
            sk.includes(vk) || vk.includes(sk)
          )
        );
      }).map(s => s.id);
    } else {
      // For audience, find connected values based on matching keywords
      const segment = data.targetAudience.find(s => s.id === id);
      if (!segment) return [];

      const segmentKeywords = [
        ...segment.needs.map(n => n.toLowerCase()),
        ...segment.painPoints.map(p => p.toLowerCase()),
        segment.description.toLowerCase()
      ];

      return data.values.filter(value => {
        const valueKeywords = [
          value.title.toLowerCase(),
          value.description.toLowerCase(),
          ...value.examples.map(e => e.toLowerCase())
        ];

        return valueKeywords.some(vk => 
          segmentKeywords.some(sk => 
            sk.includes(vk) || vk.includes(sk)
          )
        );
      }).map(v => v.id);
    }
  };

  // Calculate if an item should be highlighted
  const isHighlighted = (id: string) => {
    if (!activeId) return true;
    return activeId === id || getConnections(activeId).includes(id);
  };

  // Calculate connection paths
  const getConnectionPath = (valueIndex: number, audienceIndex: number) => {
    const startY = valueIndex * 84 + 42; // 84px per card, center at 42
    const endY = audienceIndex * 84 + 42;
    const startX = 0;
    const endX = 300;
    const controlPoint1X = 100;
    const controlPoint2X = 200;

    return `M ${startX} ${startY} C ${controlPoint1X} ${startY}, ${controlPoint2X} ${endY}, ${endX} ${endY}`;
  };

  // Pre-calculate all connections for better performance
  const connections = data.values.flatMap(value => 
    data.targetAudience.map(audience => ({
      valueId: value.id,
      audienceId: audience.id,
      isConnected: getConnections(value.id).includes(audience.id)
    }))
  ).filter(c => c.isConnected);

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>Brand DNA</CardTitle>
        <CardDescription>Visualize how your brand values connect with your target audience.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6 relative min-h-[400px]">
          {/* Values Column */}
          <div className="space-y-4 relative z-10">
            <h3 className="font-semibold text-sm text-gray-500">Brand Values</h3>
            <div className="space-y-2 relative">
              {data.values.map((value, index) => (
                <div
                  key={value.id}
                  className={cn(
                    "p-3 rounded-lg border bg-white shadow-sm transition-all duration-300 cursor-pointer transform hover:scale-105",
                    !isHighlighted(value.id) && activeId && "opacity-30"
                  )}
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: value.impact === 'high' ? '#10B981' : 
                                   value.impact === 'medium' ? '#F59E0B' : '#6B7280',
                    position: 'absolute',
                    top: `${index * 84}px`,
                    width: 'calc(100% - 8px)'
                  }}
                  onMouseEnter={() => setActiveId(value.id)}
                  onMouseLeave={() => setActiveId(null)}
                >
                  <h4 className="font-medium">{value.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Connections Column */}
          <div className="relative">
            <h3 className="font-semibold text-sm text-gray-500 mb-4">Connections</h3>
            <div className="absolute inset-0 mt-10">
              <svg className="w-full h-full">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {connections.map(({ valueId, audienceId }) => {
                  const valueIndex = data.values.findIndex(v => v.id === valueId);
                  const audienceIndex = data.targetAudience.findIndex(a => a.id === audienceId);
                  const audience = data.targetAudience[audienceIndex];
                  const shouldHighlight = !activeId || 
                    activeId === valueId || 
                    activeId === audienceId;
                  
                  return (
                    <path
                      key={`${valueId}-${audienceId}`}
                      d={getConnectionPath(valueIndex, audienceIndex)}
                      stroke={audience.color}
                      strokeWidth={shouldHighlight ? "3" : "2"}
                      fill="none"
                      opacity={shouldHighlight ? "0.8" : "0.2"}
                      filter={shouldHighlight ? "url(#glow)" : "none"}
                      className="transition-all duration-300"
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Audience Column */}
          <div className="space-y-4 relative z-10">
            <h3 className="font-semibold text-sm text-gray-500">Target Audience</h3>
            <div className="space-y-2 relative">
              {data.targetAudience.map((segment, index) => (
                <div
                  key={segment.id}
                  className={cn(
                    "p-3 rounded-lg border bg-white shadow-sm transition-all duration-300 cursor-pointer transform hover:scale-105",
                    !isHighlighted(segment.id) && activeId && "opacity-30"
                  )}
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: segment.color,
                    position: 'absolute',
                    top: `${index * 84}px`,
                    width: 'calc(100% - 8px)'
                  }}
                  onMouseEnter={() => setActiveId(segment.id)}
                  onMouseLeave={() => setActiveId(null)}
                >
                  <h4 className="font-medium">{segment.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{segment.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}