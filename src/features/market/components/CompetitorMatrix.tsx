import React, { useState, useMemo } from 'react';
import { PositioningMatrix, PositionData, MatrixQuadrant } from '@/features/common/components/PositioningMatrix';
import { CompetitorBubble } from './CompetitorBubble';
import { Competitor } from './CompetitorAnalysis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Save, Settings } from 'lucide-react';

// The dimension options for the matrix axes
const DIMENSION_OPTIONS = [
  {
    id: 'price',
    label: 'Price Point',
    low: 'Budget',
    high: 'Premium',
  },
  {
    id: 'features',
    label: 'Feature Richness',
    low: 'Basic',
    high: 'Advanced',
  },
  {
    id: 'marketShare',
    label: 'Market Share',
    low: 'Smaller',
    high: 'Larger',
  },
  {
    id: 'customerSentiment',
    label: 'Customer Satisfaction',
    low: 'Lower',
    high: 'Higher',
  },
  {
    id: 'innovation',
    label: 'Innovation',
    low: 'Conservative',
    high: 'Disruptive',
  },
];

interface CompetitorMatrixProps {
  competitors: Competitor[];
  onPositionChange?: (competitorId: string, x: number, y: number) => void;
  onSavePositions?: (positions: PositionData, dimensions: { x: string, y: string }) => void;
  className?: string;
  yourCompanyId?: string;
  initialPositions?: PositionData;
  initialDimensions?: { x: string, y: string };
  readOnly?: boolean;
}

export function CompetitorMatrix({
  competitors,
  onPositionChange,
  onSavePositions,
  className,
  yourCompanyId,
  initialPositions = {},
  initialDimensions = { x: 'price', y: 'features' },
  readOnly = false
}: CompetitorMatrixProps) {
  const { toast } = useToast();
  
  // State for dimensions
  const [xDimension, setXDimension] = useState(initialDimensions.x);
  const [yDimension, setYDimension] = useState(initialDimensions.y);
  
  // State for editing
  const [isEditing, setIsEditing] = useState(!readOnly && Object.keys(initialPositions).length === 0);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Calculate initial positions based on competitor data and selected dimensions
  const getInitialPositions = (): PositionData => {
    if (Object.keys(initialPositions).length > 0) {
      return initialPositions;
    }
    
    const positions: PositionData = {};
    
    competitors.forEach(competitor => {
      // Default position (center)
      let x = 0.5;
      let y = 0.5;
      
      // X-axis position based on selected dimension
      if (xDimension === 'price' && competitor.positioning) {
        // Position based on pricing strategy
        x = competitor.positioning === 'Premium' ? 0.8 : 
             competitor.positioning === 'Mid-market' ? 0.5 :
             competitor.positioning === 'Budget' ? 0.2 : 0.5;
      } else if (xDimension === 'marketShare' && competitor.market_share) {
        // Position based on market share
        const share = parseFloat(competitor.market_share);
        if (!isNaN(share)) {
          x = Math.min(share / 50, 0.9); // Max out at 90% for visibility
        }
      } else if (xDimension === 'customerSentiment' && competitor.customer_sentiment) {
        // Position based on customer sentiment (1-5 scale)
        x = competitor.customer_sentiment / 5;
      } else if (xDimension === 'innovation') {
        // For innovation, use some heuristics based on available data
        if (competitor.differentiators?.length) {
          // More differentiators might indicate more innovation
          x = Math.min(0.3 + (competitor.differentiators.length * 0.1), 0.9);
        }
      }
      
      // Y-axis position based on selected dimension
      if (yDimension === 'features' && competitor.differentiators) {
        // Position based on number of features/differentiators
        y = competitor.differentiators.length > 0 
          ? Math.min(0.3 + (competitor.differentiators.length * 0.1), 0.9)
          : 0.3;
      } else if (yDimension === 'customerSentiment' && competitor.customer_sentiment) {
        // Position based on customer sentiment (1-5 scale)
        y = competitor.customer_sentiment / 5;
      } else if (yDimension === 'price' && competitor.positioning) {
        // Position based on pricing strategy
        y = competitor.positioning === 'Premium' ? 0.8 : 
             competitor.positioning === 'Mid-market' ? 0.5 :
             competitor.positioning === 'Budget' ? 0.2 : 0.5;
      } else if (yDimension === 'marketShare' && competitor.market_share) {
        // Position based on market share
        const share = parseFloat(competitor.market_share);
        if (!isNaN(share)) {
          y = Math.min(share / 50, 0.9); // Max out at 90% for visibility
        }
      }
      
      // Ensure positions are within bounds
      x = Math.max(0.05, Math.min(0.95, x));
      y = Math.max(0.05, Math.min(0.95, y));
      
      positions[competitor.id] = { x, y };
    });
    
    return positions;
  };
  
  // Handle position change
  const handlePositionChange = (competitorId: string, x: number, y: number) => {
    setHasChanges(true);
    
    if (onPositionChange) {
      onPositionChange(competitorId, x, y);
    }
  };
  
  // Handle quadrant change
  const handleQuadrantChange = (competitorId: string, quadrant: MatrixQuadrant) => {
    console.log(`Competitor ${competitorId} moved to ${quadrant} quadrant`);
  };
  
  // Handle save positions
  const handleSavePositions = () => {
    if (onSavePositions) {
      // Get current positions from the matrix
      const currentPositions = getInitialPositions();
      
      onSavePositions(currentPositions, { x: xDimension, y: yDimension });
      
      toast({
        title: "Positions saved",
        description: "Competitor positions have been saved successfully.",
      });
      
      setHasChanges(false);
      setIsEditing(false);
    }
  };
  
  // Handle dimension change
  const handleDimensionChange = (axis: 'x' | 'y', value: string) => {
    if (axis === 'x') {
      setXDimension(value);
    } else {
      setYDimension(value);
    }
    setHasChanges(true);
  };
  
  // Get axis configuration based on dimension
  const getAxisConfig = (dimensionId: string) => {
    const dimension = DIMENSION_OPTIONS.find(d => d.id === dimensionId);
    return {
      label: dimension?.label || dimensionId,
      min: 0,
      max: 100,
      lowLabel: dimension?.low || 'Low',
      highLabel: dimension?.high || 'High'
    };
  };
  
  // Determine quadrant labels based on dimensions
  const quadrantLabels = useMemo(() => {
    const xDim = DIMENSION_OPTIONS.find(d => d.id === xDimension);
    const yDim = DIMENSION_OPTIONS.find(d => d.id === yDimension);
    
    return {
      topRight: `${yDim?.high || 'High'} ${yDim?.label || ''}, ${xDim?.high || 'High'} ${xDim?.label || ''}`,
      topLeft: `${yDim?.high || 'High'} ${yDim?.label || ''}, ${xDim?.low || 'Low'} ${xDim?.label || ''}`,
      bottomRight: `${yDim?.low || 'Low'} ${yDim?.label || ''}, ${xDim?.high || 'High'} ${xDim?.label || ''}`,
      bottomLeft: `${yDim?.low || 'Low'} ${yDim?.label || ''}, ${xDim?.low || 'Low'} ${xDim?.label || ''}`
    };
  }, [xDimension, yDimension]);
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Competitor Positioning Matrix</CardTitle>
            <CardDescription>
              Position competitors based on {getAxisConfig(xDimension).label} and {getAxisConfig(yDimension).label}
            </CardDescription>
          </div>
          
          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="ml-auto"
            >
              <Settings className="h-4 w-4 mr-1" />
              {isEditing ? 'Done' : 'Configure'}
            </Button>
          )}
        </div>
        
        {isEditing && (
          <div className="flex flex-col sm:flex-row gap-2 mt-2 bg-muted/50 p-2 rounded-md">
            <div className="grid grid-cols-2 gap-2 flex-1">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">X-Axis</label>
                <Select value={xDimension} onValueChange={(value) => handleDimensionChange('x', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select dimension" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIMENSION_OPTIONS.map(dimension => (
                      <SelectItem key={dimension.id} value={dimension.id}>
                        {dimension.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Y-Axis</label>
                <Select value={yDimension} onValueChange={(value) => handleDimensionChange('y', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select dimension" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIMENSION_OPTIONS.map(dimension => (
                      <SelectItem key={dimension.id} value={dimension.id}>
                        {dimension.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="h-[500px]">
          <PositioningMatrix
            items={competitors}
            initialPositions={getInitialPositions()}
            xAxis={getAxisConfig(xDimension)}
            yAxis={getAxisConfig(yDimension)}
            quadrantLabels={quadrantLabels}
            onPositionChange={!readOnly ? handlePositionChange : undefined}
            onQuadrantChange={!readOnly ? handleQuadrantChange : undefined}
            itemsLabel="Competitors"
            renderItem={({ item, isDragging }) => {
              const competitor = item as Competitor;
              return (
                <CompetitorBubble
                  competitor={competitor}
                  isDragging={isDragging}
                  isYourCompany={competitor.id === yourCompanyId}
                  size={
                    competitor.market_share
                      ? parseFloat(competitor.market_share) > 20
                        ? 'lg'
                        : parseFloat(competitor.market_share) > 10
                        ? 'md'
                        : 'sm'
                      : 'md'
                  }
                />
              );
            }}
          />
        </div>
      </CardContent>
      
      {!readOnly && hasChanges && (
        <CardFooter className="pt-0">
          <Button 
            onClick={handleSavePositions} 
            className="ml-auto"
          >
            <Save className="h-4 w-4 mr-1" />
            Save Positions
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 