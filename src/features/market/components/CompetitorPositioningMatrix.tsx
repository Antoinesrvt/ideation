import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Info, MoveIcon, XCircle, Save } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

// Dimension options for the matrix axes
const DIMENSION_OPTIONS = [
  { id: 'price', label: 'Price', description: 'Relative pricing level', low: 'Low cost', high: 'Premium price' },
  { id: 'features', label: 'Features', description: 'Feature completeness', low: 'Basic features', high: 'Feature-rich' },
  { id: 'ux', label: 'User Experience', description: 'Quality of user interface', low: 'Basic UX', high: 'Exceptional UX' },
  { id: 'innovation', label: 'Innovation', description: 'Level of innovation', low: 'Conventional', high: 'Disruptive' },
  { id: 'marketShare', label: 'Market Share', description: 'Relative market presence', low: 'Niche player', high: 'Market leader' },
  { id: 'customerSentiment', label: 'Customer Sentiment', description: 'Customer satisfaction', low: 'Low satisfaction', high: 'High satisfaction' }
];

export interface Competitor {
  id: string;
  name: string;
  website?: string | null;
  market_share?: string | null;
  customer_sentiment?: number | null;
  positioning?: string | null;
  // Include all the fields from our enhanced schema
  [key: string]: any;
}

interface CompetitorPositionData {
  id: string;
  x: number;
  y: number;
  marketShare?: number;
}

interface CompetitorPositioningMatrixProps {
  competitors: Competitor[];
  onPositionChange?: (competitorId: string, position: { x: number, y: number }, dimensions: { x: string, y: string }) => void;
  onSavePositions?: (positions: Record<string, CompetitorPositionData>, dimensions: { x: string, y: string }) => void;
  className?: string;
  yourCompanyId?: string; // To highlight your own company
  initialPositions?: Record<string, CompetitorPositionData>;
  initialDimensions?: { x: string, y: string };
  readOnly?: boolean;
}

export function CompetitorPositioningMatrix({
  competitors,
  onPositionChange,
  onSavePositions,
  className,
  yourCompanyId,
  initialPositions = {},
  initialDimensions = { x: 'price', y: 'features' },
  readOnly = false
}: CompetitorPositioningMatrixProps) {
  const { toast } = useToast();
  
  // Track the selected dimensions for X and Y axes
  const [xAxis, setXAxis] = useState(initialDimensions.x);
  const [yAxis, setYAxis] = useState(initialDimensions.y);
  
  // Ref for the matrix container to get dimensions
  const matrixRef = useRef<HTMLDivElement>(null);
  
  // State to track competitor positions
  const [positions, setPositions] = useState<Record<string, CompetitorPositionData>>(initialPositions);
  
  // Track if positions have changed from initial state
  const [hasChanges, setHasChanges] = useState(false);
  
  // Track if in edit mode
  const [editMode, setEditMode] = useState(!readOnly && Object.keys(initialPositions).length === 0);
  
  // Initialize competitor positions when competitors change or axes change
  useEffect(() => {
    // Only auto-position if we don't have initial positions or we're changing axes
    if (Object.keys(initialPositions).length > 0 && !hasChanges) {
      setPositions(initialPositions);
      return;
    }
    
    // Skip re-initializing if we already have positions for all competitors
    if (competitors.every(competitor => positions[competitor.id] !== undefined)) {
      return;
    }
    
    const newPositions: Record<string, CompetitorPositionData> = { ...positions };
    
    competitors.forEach(competitor => {
      // If we already have a position for this competitor, keep it
      if (positions[competitor.id]) {
        newPositions[competitor.id] = positions[competitor.id];
        return;
      }
      
      // Otherwise, calculate initial position based on competitor data
      let x = 50; // Default to center
      let y = 50; // Default to center
      
      // Use competitor data to determine position if available
      if (xAxis === 'price' && competitor.positioning) {
        // If pricing is premium, place more to the right (higher price)
        x = competitor.positioning === 'Premium' ? 75 : 
             competitor.positioning === 'Budget' ? 25 : 50;
      } else if (xAxis === 'marketShare' && competitor.market_share) {
        const shareValue = parseFloat(competitor.market_share);
        if (!isNaN(shareValue)) {
          x = Math.min(shareValue * 5, 90); // Scale market share to position (max 90%)
        }
      }
      
      if (yAxis === 'features' && competitor.differentiators) {
        // More differentiators means more features, place higher
        y = Array.isArray(competitor.differentiators) && competitor.differentiators.length > 3 ? 75 : 
            Array.isArray(competitor.differentiators) && competitor.differentiators.length > 0 ? 50 : 25;
      } else if (yAxis === 'customerSentiment' && competitor.customer_sentiment) {
        // Higher sentiment means higher position
        y = 100 - (competitor.customer_sentiment * 20); // 1-5 scale to 0-100 position (inverted for Y)
      }
      
      // Calculate market share as a number for sizing (default to 1)
      const marketShare = 
        competitor.market_share && !isNaN(parseFloat(competitor.market_share))
          ? parseFloat(competitor.market_share)
          : 1;
      
      newPositions[competitor.id] = {
        id: competitor.id,
        x,
        y,
        marketShare
      };
    });
    
    // Use a callback to avoid stale dependencies
    setPositions(newPositions);
  }, [competitors, xAxis, yAxis, initialPositions, hasChanges]);
  
  // Update hasChanges when positions change - add appropriate dependency checks
  useEffect(() => {
    // Only check for changes if we have initial positions
    if (Object.keys(initialPositions).length === 0) return;
    
    // Check if any positions have changed
    let changed = false;
    for (const compId in positions) {
      if (
        !initialPositions[compId] || 
        Math.abs(positions[compId].x - initialPositions[compId].x) > 1 ||
        Math.abs(positions[compId].y - initialPositions[compId].y) > 1
      ) {
        changed = true;
        break;
      }
    }
    
    // Check if dimensions have changed
    if (
      xAxis !== initialDimensions.x || 
      yAxis !== initialDimensions.y
    ) {
      changed = true;
    }
    
    if (changed !== hasChanges) {
      setHasChanges(changed);
    }
  }, [positions, initialPositions, xAxis, yAxis, initialDimensions, hasChanges]);
  
  // Handle drag end to update position
  const handleDragEnd = (competitorId: string, info: any) => {
    if (!matrixRef.current) return;
    
    const matrixRect = matrixRef.current.getBoundingClientRect();
    
    // Calculate position as percentage of matrix width/height
    const x = ((info.point.x - matrixRect.left) / matrixRect.width) * 100;
    const y = ((info.point.y - matrixRect.top) / matrixRect.height) * 100;
    
    // Constrain to the matrix bounds (0-100%)
    const constrainedX = Math.max(0, Math.min(100, x));
    const constrainedY = Math.max(0, Math.min(100, y));
    
    // Update position state
    setPositions(prev => ({
      ...prev,
      [competitorId]: {
        ...prev[competitorId],
        x: constrainedX,
        y: constrainedY
      }
    }));
    
    // Notify parent component
    if (onPositionChange) {
      onPositionChange(competitorId, { x: constrainedX, y: constrainedY }, { x: xAxis, y: yAxis });
    }
  };
  
  // Handle save positions
  const handleSavePositions = () => {
    if (onSavePositions) {
      onSavePositions(positions, { x: xAxis, y: yAxis });
      
      toast({
        title: "Positions saved",
        description: "Competitor positions have been saved successfully.",
      });
      
      setHasChanges(false);
      setEditMode(false);
    }
  };
  
  // Handle dimension change
  const handleDimensionChange = (axis: 'x' | 'y', value: string) => {
    if (axis === 'x') {
      setXAxis(value);
    } else {
      setYAxis(value);
    }
    // This will trigger a re-position in the useEffect
  };
  
  // Get dimension label from id
  const getDimensionLabel = (dimensionId: string) => {
    return DIMENSION_OPTIONS.find(d => d.id === dimensionId)?.label || dimensionId;
  };
  
  // Get dimension description
  const getDimensionDescription = (dimensionId: string, end: 'low' | 'high') => {
    const dimension = DIMENSION_OPTIONS.find(d => d.id === dimensionId);
    return end === 'low' ? dimension?.low : dimension?.high;
  };
  
  // Get color based on competitor
  const getCompetitorColor = (competitor: Competitor) => {
    if (competitor.id === yourCompanyId) {
      return 'bg-primary text-primary-foreground border-primary-foreground/20 shadow-md';
    }
    
    // Assign colors based on positioning if available
    if (competitor.positioning === 'Premium') {
      return 'bg-purple-100 text-purple-800 border-purple-300';
    }
    if (competitor.positioning === 'Mid-market') {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    if (competitor.positioning === 'Budget') {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    
    // Default color
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };
  
  // Calculate node size based on market share
  const getNodeSize = (competitorId: string) => {
    const position = positions[competitorId];
    if (!position || !position.marketShare) return 'h-12 w-12';
    
    const marketShare = position.marketShare;
    if (marketShare > 30) return 'h-16 w-16';
    if (marketShare > 15) return 'h-14 w-14';
    if (marketShare > 5) return 'h-12 w-12';
    return 'h-10 w-10';
  };
  
  // Render the matrix
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-lg font-medium">Competitor Positioning</CardTitle>
          <CardDescription>
            Map competitors based on key dimensions
          </CardDescription>
        </div>
        
        <div className="flex items-center space-x-2">
          {!readOnly && (
            editMode ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Reset to initial state if available
                    if (Object.keys(initialPositions).length > 0) {
                      setPositions(initialPositions);
                      setXAxis(initialDimensions.x);
                      setYAxis(initialDimensions.y);
                      setHasChanges(false);
                    }
                    setEditMode(false);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  variant={hasChanges ? "default" : "outline"}
                  size="sm"
                  onClick={handleSavePositions}
                  disabled={!hasChanges}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Positions
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(true)}
              >
                <MoveIcon className="h-4 w-4 mr-1" />
                Edit Positions
              </Button>
            )
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium mb-1">Positioning Matrix</p>
                <p className="text-xs text-muted-foreground">
                  This matrix visualizes your competitors based on selected dimensions. 
                  {!readOnly && " You can drag competitors to reposition them and change the axes to analyze different dimensions."}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        {editMode && (
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">X-Axis Dimension</label>
              <Select
                value={xAxis}
                onValueChange={(value) => handleDimensionChange('x', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dimension" />
                </SelectTrigger>
                <SelectContent>
                  {DIMENSION_OPTIONS.filter(d => d.id !== yAxis).map(dimension => (
                    <SelectItem key={dimension.id} value={dimension.id}>
                      {dimension.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">Y-Axis Dimension</label>
              <Select
                value={yAxis}
                onValueChange={(value) => handleDimensionChange('y', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dimension" />
                </SelectTrigger>
                <SelectContent>
                  {DIMENSION_OPTIONS.filter(d => d.id !== xAxis).map(dimension => (
                    <SelectItem key={dimension.id} value={dimension.id}>
                      {dimension.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        <div className="relative h-[500px] border rounded-md bg-slate-50/50" ref={matrixRef}>
          {/* The matrix grid */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="border-b border-r border-dashed border-gray-300"></div>
            <div className="border-b border-dashed border-gray-300"></div>
            <div className="border-r border-dashed border-gray-300"></div>
            <div></div>
          </div>
          
          {/* X axis labels */}
          <div className="absolute inset-x-0 top-2 flex justify-between px-4">
            <div className="text-sm text-muted-foreground">
              {getDimensionDescription(xAxis, 'low')}
            </div>
            <div className="text-sm text-muted-foreground">
              {getDimensionDescription(xAxis, 'high')}
            </div>
          </div>
          
          {/* Y axis labels */}
          <div className="absolute inset-y-0 left-2 flex flex-col justify-between py-4">
            <div className="text-sm text-muted-foreground">
              {getDimensionDescription(yAxis, 'high')}
            </div>
            <div className="text-sm text-muted-foreground">
              {getDimensionDescription(yAxis, 'low')}
            </div>
          </div>
          
          {/* Axis titles */}
          <div className="absolute left-1/2 bottom-2 transform -translate-x-1/2">
            <Badge variant="outline" className="bg-white">
              {getDimensionLabel(xAxis)}
            </Badge>
          </div>
          <div className="absolute top-1/2 left-2 transform -translate-y-1/2 -rotate-90 origin-center">
            <Badge variant="outline" className="bg-white">
              {getDimensionLabel(yAxis)}
            </Badge>
          </div>
          
          {/* Competitor nodes */}
          {competitors.map(competitor => {
            const position = positions[competitor.id] || { x: 50, y: 50 };
            return (
              <motion.div
                key={competitor.id}
                className={cn(
                  "absolute rounded-full border flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md transition-shadow",
                  getNodeSize(competitor.id),
                  getCompetitorColor(competitor),
                  editMode ? "cursor-move" : "cursor-pointer"
                )}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                drag={editMode}
                dragConstraints={matrixRef}
                dragElastic={0}
                dragMomentum={false}
                onDragEnd={(_, info) => handleDragEnd(competitor.id, info)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="w-full h-full flex items-center justify-center">
                      <div className="text-xs font-medium truncate max-w-[80%]">
                        {competitor.name.length > 10 
                          ? competitor.name.slice(0, 10) + '...' 
                          : competitor.name}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="p-3">
                      <p className="font-medium mb-1">{competitor.name}</p>
                      {competitor.positioning && (
                        <p className="text-xs mb-1">
                          <span className="text-muted-foreground">Positioning:</span> {competitor.positioning}
                        </p>
                      )}
                      {competitor.market_share && (
                        <p className="text-xs mb-1">
                          <span className="text-muted-foreground">Market Share:</span> {competitor.market_share}%
                        </p>
                      )}
                      {competitor.differentiators && Array.isArray(competitor.differentiators) && competitor.differentiators.length > 0 && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Key Differentiators:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {competitor.differentiators.slice(0, 3).map((diff, i) => (
                              <Badge key={i} variant="outline" className="text-[10px]">
                                {diff}
                              </Badge>
                            ))}
                            {competitor.differentiators.length > 3 && (
                              <Badge variant="outline" className="text-[10px]">
                                +{competitor.differentiators.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            );
          })}
          
          {/* Quadrant labels */}
          <div className="absolute top-6 right-6 text-xs font-medium bg-white/80 rounded px-1.5 py-0.5 shadow-sm border">
            {getDimensionLabel(xAxis)} ↑ / {getDimensionLabel(yAxis)} ↑
          </div>
          <div className="absolute top-6 left-6 text-xs font-medium bg-white/80 rounded px-1.5 py-0.5 shadow-sm border">
            {getDimensionLabel(xAxis)} ↓ / {getDimensionLabel(yAxis)} ↑
          </div>
          <div className="absolute bottom-6 right-6 text-xs font-medium bg-white/80 rounded px-1.5 py-0.5 shadow-sm border">
            {getDimensionLabel(xAxis)} ↑ / {getDimensionLabel(yAxis)} ↓
          </div>
          <div className="absolute bottom-6 left-6 text-xs font-medium bg-white/80 rounded px-1.5 py-0.5 shadow-sm border">
            {getDimensionLabel(xAxis)} ↓ / {getDimensionLabel(yAxis)} ↓
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span>Your company</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-purple-100 border border-purple-300"></div>
            <span>Premium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300"></div>
            <span>Mid-market</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300"></div>
            <span>Budget</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"></div>
            <span>Small market share</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0"></div>
            <span>Medium market share</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0"></div>
            <span>Large market share</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 