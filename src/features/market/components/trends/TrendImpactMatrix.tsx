import React, { useState } from 'react';
import { PositioningMatrix, PositionData, MatrixQuadrant } from '@/features/common/components/PositioningMatrix';
import { TrendBubble, TrendProps } from './TrendBubble';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';
import { SlidersHorizontal, BarChart3 } from 'lucide-react';

interface TrendImpactMatrixProps {
  trends: TrendProps[];
  onPositionChange?: (trendId: string, x: number, y: number) => void;
  className?: string;
}

export function TrendImpactMatrix({ trends, onPositionChange, className }: TrendImpactMatrixProps) {
  const [showConfidence, setShowConfidence] = useState(false);
  
  // Calculate initial positions based on impact_score and confidence
  const getInitialPositions = (): PositionData => {
    const positions: PositionData = {};
    
    trends.forEach(trend => {
      // Default position to center if no scores available
      let x = 0.5;
      let y = 0.5;
      
      // If we have impact score, use it for y-axis (0-10 scale converted to 0-1)
      if (typeof trend.impact_score === 'number') {
        y = trend.impact_score / 10;
      }
      
      // If we have confidence, use it for x-axis (1-5 scale converted to 0-1)
      if (typeof trend.confidence === 'number') {
        x = trend.confidence / 5;
      }
      
      // Ensure values are within 0-1 range
      x = Math.max(0.05, Math.min(0.95, x));
      y = Math.max(0.05, Math.min(0.95, y));
      
      positions[trend.id] = { x, y };
    });
    
    return positions;
  };
  
  // Determine quadrant descriptions based on impact vs. likelihood
  const quadrantLabels = {
    topRight: 'High Impact, High Confidence',
    topLeft: 'High Impact, Low Confidence',
    bottomRight: 'Low Impact, High Confidence',
    bottomLeft: 'Low Impact, Low Confidence'
  };
  
  // Handle quadrant change
  const handleQuadrantChange = (trendId: string, quadrant: MatrixQuadrant) => {
    // You could add special handling when a trend moves to a new quadrant
    console.log(`Trend ${trendId} moved to ${quadrant} quadrant`);
  };
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Impact vs. Confidence Matrix</CardTitle>
            <CardDescription>
              Position trends based on their impact potential and your confidence level
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Toggle
              variant="outline"
              aria-label="Toggle trend sizing by impact"
              pressed={!showConfidence}
              onPressedChange={(pressed) => setShowConfidence(!pressed)}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Size by Impact
            </Toggle>
            <Toggle
              variant="outline"
              aria-label="Toggle trend sizing by confidence"
              pressed={showConfidence}
              onPressedChange={setShowConfidence}
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              Size by Confidence
            </Toggle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[500px]">
          <PositioningMatrix
            items={trends}
            initialPositions={getInitialPositions()}
            xAxis={{
              label: 'Confidence',
              min: 1,
              max: 5,
              lowLabel: 'Low Confidence',
              highLabel: 'High Confidence'
            }}
            yAxis={{
              label: 'Impact',
              min: 1,
              max: 10,
              lowLabel: 'Low Impact',
              highLabel: 'High Impact'
            }}
            quadrantLabels={quadrantLabels}
            onPositionChange={onPositionChange}
            onQuadrantChange={handleQuadrantChange}
            itemsLabel="Trends"
            renderItem={({ item, isDragging, position }) => {
              const trend = item as TrendProps;
              
              // Determine size based on toggle setting
              let size: 'sm' | 'md' | 'lg' = 'md';
              
              if (showConfidence && trend.confidence) {
                // Size based on confidence
                if (trend.confidence >= 4) size = 'lg';
                else if (trend.confidence >= 2.5) size = 'md';
                else size = 'sm';
              } else if (trend.impact_score) {
                // Size based on impact
                if (trend.impact_score >= 7) size = 'lg';
                else if (trend.impact_score >= 4) size = 'md';
                else size = 'sm';
              }
              
              return (
                <TrendBubble
                  trend={trend}
                  isDragging={isDragging}
                  size={size}
                />
              );
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
} 