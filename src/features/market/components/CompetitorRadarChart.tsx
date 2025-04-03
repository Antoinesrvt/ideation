import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Sliders, Check, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

// Re-using the Competitor interface
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

// Rating data structure
export interface CompetitorRating {
  competitorId: string;
  dimensionId: string;
  rating: number; // 1-10 scale
  notes?: string;
}

// Dimension configuration
export interface Dimension {
  id: string;
  label: string;
  description?: string;
  weight?: number; // For weighted scoring
}

// Component props
interface CompetitorRadarChartProps {
  competitors: Competitor[];
  dimensions: Dimension[];
  ratings: CompetitorRating[];
  onRatingChange?: (rating: CompetitorRating) => Promise<void>;
  yourCompanyId?: string;
  className?: string;
  readOnly?: boolean;
  title?: string;
  description?: string;
}

// Helper function to get competitor color
const getCompetitorColor = (competitor: Competitor, index: number, isYourCompany: boolean): { stroke: string; fill: string } => {
  if (isYourCompany) {
    return {
      stroke: 'hsl(var(--primary))',
      fill: 'hsla(var(--primary), 0.2)'
    };
  }
  
  // Predefined colors for competitors
  const colors = [
    { stroke: '#ec4899', fill: 'rgba(236, 72, 153, 0.2)' },  // Pink
    { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.2)' },  // Blue
    { stroke: '#22c55e', fill: 'rgba(34, 197, 94, 0.2)' },   // Green
    { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.2)' },  // Amber
    { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.2)' },  // Purple
    { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.2)' },   // Red
    { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.2)' },   // Cyan
  ];
  
  const colorIndex = index % colors.length;
  return colors[colorIndex];
};

// Calculate polygon points for the radar chart
const calculatePolygonPoints = (
  center: { x: number, y: number },
  radius: number,
  dimensions: Dimension[],
  ratings: number[],
): string => {
  if (!dimensions.length || !ratings.length) return '';
  
  const angleBetweenDimensions = (2 * Math.PI) / dimensions.length;
  
  return dimensions
    .map((_, index) => {
      const angle = index * angleBetweenDimensions - Math.PI / 2; // Start from top
      const rating = ratings[index] || 0;
      const distance = (rating / 10) * radius; // Scale rating to fit within radius
      
      const x = center.x + distance * Math.cos(angle);
      const y = center.y + distance * Math.sin(angle);
      
      return `${x},${y}`;
    })
    .join(' ');
};

// Main component
export function CompetitorRadarChart({
  competitors,
  dimensions,
  ratings,
  onRatingChange,
  yourCompanyId,
  className,
  readOnly = false,
  title = 'Competitive Analysis',
  description = 'Compare competitors across key dimensions'
}: CompetitorRadarChartProps) {
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgSize, setSvgSize] = useState({ width: 500, height: 500 });
  const [hoveredCompetitor, setHoveredCompetitor] = useState<string | null>(null);
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null);
  
  // Calculate center and radius for the chart
  const center = { x: svgSize.width / 2, y: svgSize.height / 2 };
  const radius = Math.min(svgSize.width, svgSize.height) * 0.4; // 40% of the smallest dimension
  
  // Observe size changes and update the SVG dimensions
  useEffect(() => {
    if (!svgRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setSvgSize({ width, height });
    });
    
    resizeObserver.observe(svgRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  // Initialize with your company and first few competitors selected
  useEffect(() => {
    const initialSelected = [];
    
    // Always include your company if provided
    if (yourCompanyId) {
      initialSelected.push(yourCompanyId);
    }
    
    // Add up to 3 competitors (or all if less than 3)
    competitors
      .filter(comp => comp.id !== yourCompanyId)
      .slice(0, 3)
      .forEach(comp => {
        initialSelected.push(comp.id);
      });
    
    setSelectedCompetitors(initialSelected);
  }, [competitors, yourCompanyId]);
  
  // Get rating for a competitor and dimension
  const getRating = (competitorId: string, dimensionId: string): number => {
    const rating = ratings.find(
      r => r.competitorId === competitorId && r.dimensionId === dimensionId
    );
    
    return rating?.rating || 0;
  };
  
  // Calculate average rating across all dimensions for a competitor
  const getAverageRating = (competitorId: string): number => {
    const competitorRatings = ratings.filter(r => r.competitorId === competitorId);
    if (!competitorRatings.length) return 0;
    
    const sum = competitorRatings.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / competitorRatings.length;
  };
  
  // Toggle competitor selection
  const toggleCompetitor = (competitorId: string) => {
    if (selectedCompetitors.includes(competitorId)) {
      setSelectedCompetitors(prev => prev.filter(id => id !== competitorId));
    } else {
      setSelectedCompetitors(prev => [...prev, competitorId]);
    }
  };
  
  // Handle rating change in edit mode
  const handleRatingChange = async (dimensionId: string, newRating: number) => {
    if (!editingCompetitor || !onRatingChange) return;
    
    try {
      await onRatingChange({
        competitorId: editingCompetitor.id,
        dimensionId,
        rating: newRating
      });
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };
  
  // Filter competitors to only show selected ones
  const filteredCompetitors = competitors.filter(
    comp => selectedCompetitors.includes(comp.id)
  );
  
  // Sort competitors to ensure your company is first
  const sortedCompetitors = [...filteredCompetitors].sort((a, b) => {
    if (a.id === yourCompanyId) return -1;
    if (b.id === yourCompanyId) return 1;
    return 0;
  });
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </div>
        
        <div className="flex items-center space-x-2">
          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(!editMode)}
            >
              <Sliders className="h-4 w-4 mr-1" />
              {editMode ? 'View Mode' : 'Edit Ratings'}
            </Button>
          )}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Competitors
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4">
              <div className="space-y-4">
                <h4 className="font-medium">Select Competitors</h4>
                <div className="space-y-2">
                  {competitors.map(competitor => (
                    <div key={competitor.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`competitor-${competitor.id}`}
                        checked={selectedCompetitors.includes(competitor.id)}
                        onCheckedChange={() => toggleCompetitor(competitor.id)}
                        disabled={competitor.id === yourCompanyId} // Always keep your company selected
                      />
                      <Label 
                        htmlFor={`competitor-${competitor.id}`}
                        className={
                          competitor.id === yourCompanyId 
                            ? 'font-medium text-primary'
                            : ''
                        }
                      >
                        {competitor.name}
                        {competitor.id === yourCompanyId && " (You)"}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium mb-1">Radar Chart</p>
                <p className="text-xs text-muted-foreground">
                  This chart visualizes how competitors compare across key dimensions.
                  {!readOnly && " Use 'Edit Ratings' to update your assessments."}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {editMode ? (
          <div className="p-4 border-t">
            <div className="mb-4">
              <Select
                value={editingCompetitor?.id || ''}
                onValueChange={(value) => {
                  const competitor = competitors.find(c => c.id === value);
                  setEditingCompetitor(competitor || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select competitor to rate" />
                </SelectTrigger>
                <SelectContent>
                  {competitors.map(competitor => (
                    <SelectItem key={competitor.id} value={competitor.id}>
                      {competitor.name}
                      {competitor.id === yourCompanyId && " (You)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {editingCompetitor && (
              <div className="space-y-6">
                <h3 className="text-base font-medium">
                  Rating {editingCompetitor.name}
                </h3>
                
                {dimensions.map(dimension => {
                  const currentRating = getRating(editingCompetitor.id, dimension.id);
                  
                  return (
                    <div key={dimension.id} className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor={`rating-${dimension.id}`}>
                          {dimension.label}
                          {dimension.description && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="inline-flex">
                                  <HelpCircle className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-sm">{dimension.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </Label>
                        <span className="text-sm font-medium">{currentRating}/10</span>
                      </div>
                      
                      <Slider
                        id={`rating-${dimension.id}`}
                        min={0}
                        max={10}
                        step={1}
                        value={[currentRating]}
                        onValueChange={(value) => handleRatingChange(dimension.id, value[0])}
                      />
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Poor</span>
                        <span>Average</span>
                        <span>Excellent</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 relative">
            <div className="relative" style={{ minHeight: '400px' }}>
              <svg 
                ref={svgRef}
                width="100%" 
                height="100%" 
                viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
                style={{ minHeight: '400px' }}
              >
                {/* Background circles */}
                {[...Array(5)].map((_, i) => (
                  <circle
                    key={`circle-${i}`}
                    cx={center.x}
                    cy={center.y}
                    r={radius * ((i + 1) / 5)}
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                    strokeDasharray={i < 4 ? "2 2" : ""}
                    className="opacity-60"
                  />
                ))}
                
                {/* Dimension axes */}
                {dimensions.map((dimension, i) => {
                  const angle = (i * 2 * Math.PI) / dimensions.length - Math.PI / 2;
                  const x2 = center.x + radius * Math.cos(angle);
                  const y2 = center.y + radius * Math.sin(angle);
                  
                  return (
                    <g key={`axis-${dimension.id}`}>
                      <line
                        x1={center.x}
                        y1={center.y}
                        x2={x2}
                        y2={y2}
                        stroke="hsl(var(--border))"
                        strokeWidth="1"
                      />
                      
                      {/* Dimension labels */}
                      <g
                        transform={`translate(${
                          center.x + (radius + 20) * Math.cos(angle)
                        },${
                          center.y + (radius + 20) * Math.sin(angle)
                        })`}
                        textAnchor={
                          angle === -Math.PI / 2
                            ? 'middle'
                            : angle > -Math.PI / 2 && angle < Math.PI / 2
                            ? 'start'
                            : 'end'
                        }
                        alignmentBaseline={
                          angle === Math.PI / 2
                            ? 'hanging'
                            : angle > 0
                            ? 'hanging'
                            : 'baseline'
                        }
                        className={cn(
                          "text-xs cursor-pointer",
                          hoveredDimension === dimension.id ? "font-bold" : ""
                        )}
                        onMouseEnter={() => setHoveredDimension(dimension.id)}
                        onMouseLeave={() => setHoveredDimension(null)}
                      >
                        <text
                          dy={angle > 0 ? "0.5em" : angle < 0 ? "-0.5em" : "0"}
                          style={{
                            fontSize: '12px',
                            fontWeight: hoveredDimension === dimension.id ? 'bold' : 'normal',
                            fill: 'currentColor'
                          }}
                        >
                          {dimension.label}
                        </text>
                      </g>
                    </g>
                  );
                })}
                
                {/* Competitor polygons */}
                {sortedCompetitors.map((competitor, index) => {
                  const competitorRatings = dimensions.map(dim => 
                    getRating(competitor.id, dim.id)
                  );
                  
                  const points = calculatePolygonPoints(
                    center,
                    radius,
                    dimensions,
                    competitorRatings
                  );
                  
                  const isYourCompany = competitor.id === yourCompanyId;
                  const { stroke, fill } = getCompetitorColor(competitor, index, isYourCompany);
                  const isHovered = hoveredCompetitor === competitor.id;
                  
                  return (
                    <g 
                      key={`polygon-${competitor.id}`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredCompetitor(competitor.id)}
                      onMouseLeave={() => setHoveredCompetitor(null)}
                    >
                      <motion.polygon
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: 1, 
                          opacity: hoveredCompetitor === null || isHovered ? 1 : 0.4 
                        }}
                        transition={{ 
                          duration: 0.5,
                          delay: index * 0.15
                        }}
                        points={points}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={isHovered ? "2.5" : "2"}
                        strokeLinejoin="round"
                      />
                      
                      {/* Data points */}
                      {dimensions.map((dimension, i) => {
                        const rating = getRating(competitor.id, dimension.id);
                        const angle = (i * 2 * Math.PI) / dimensions.length - Math.PI / 2;
                        const distance = (rating / 10) * radius;
                        const x = center.x + distance * Math.cos(angle);
                        const y = center.y + distance * Math.sin(angle);
                        
                        return (
                          <motion.circle
                            key={`point-${competitor.id}-${dimension.id}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ 
                              scale: 1, 
                              opacity: hoveredCompetitor === null || isHovered || hoveredDimension === dimension.id ? 1 : 0.4 
                            }}
                            transition={{ 
                              duration: 0.5,
                              delay: index * 0.15 + 0.2
                            }}
                            cx={x}
                            cy={y}
                            r={isHovered || hoveredDimension === dimension.id ? 5 : 4}
                            fill={stroke}
                            stroke="#fff"
                            strokeWidth="1.5"
                          />
                        );
                      })}
                    </g>
                  );
                })}
              </svg>
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 justify-center">
              {sortedCompetitors.map((competitor, index) => {
                const isYourCompany = competitor.id === yourCompanyId;
                const { stroke } = getCompetitorColor(competitor, index, isYourCompany);
                const avgRating = getAverageRating(competitor.id);
                
                return (
                  <div
                    key={`legend-${competitor.id}`}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors",
                      hoveredCompetitor === competitor.id
                        ? "bg-secondary"
                        : "bg-transparent hover:bg-secondary/40",
                      isYourCompany && "font-medium"
                    )}
                    style={{ borderColor: stroke }}
                    onMouseEnter={() => setHoveredCompetitor(competitor.id)}
                    onMouseLeave={() => setHoveredCompetitor(null)}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stroke }}
                    ></div>
                    <span>{competitor.name}</span>
                    <Badge variant="outline" className="ml-1 text-xs">
                      {avgRating.toFixed(1)}/10
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 