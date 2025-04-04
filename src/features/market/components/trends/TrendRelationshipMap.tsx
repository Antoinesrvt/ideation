import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendProps } from './TrendBubble';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Network, 
  Circle, 
  Grid3X3, 
  Plus, 
  Minus, 
  Filter as FilterIcon,
  TrendingUp,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TrendNode extends TrendProps {
  x?: number;
  y?: number;
  radius?: number;
  color?: string;
  group?: string;
}

interface TrendLink {
  source: string;
  target: string;
  strength?: number;
  color?: string;
}

interface TrendRelationshipMapProps {
  trends: TrendProps[];
  className?: string;
}

export function TrendRelationshipMap({ trends, className }: TrendRelationshipMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<TrendNode[]>([]);
  const [links, setLinks] = useState<TrendLink[]>([]);
  const [zoom, setZoom] = useState(1);
  const [layout, setLayout] = useState<'force' | 'grid' | 'cluster'>('force');
  const [filter, setFilter] = useState<'all' | 'opportunity' | 'threat' | null>('all');
  
  // Generate initial nodes from trends
  useEffect(() => {
    const filteredTrends = filter === 'all' 
      ? trends 
      : trends.filter(t => t.trend_type === filter);
    
    // Create nodes from trends
    const newNodes: TrendNode[] = filteredTrends.map(trend => {
      // Determine color based on trend type
      let color = '#3b82f6'; // Default blue
      if (trend.trend_type === 'opportunity') color = '#22c55e'; // Green
      if (trend.trend_type === 'threat') color = '#ef4444'; // Red
      
      // Determine radius based on impact
      const radius = trend.impact_score 
        ? 20 + (trend.impact_score / 10 * 20) 
        : 30;
      
      // Group by timeframe or confidence
      const group = trend.timeframe || 'medium';
      
      return {
        ...trend,
        radius,
        color,
        group,
        // Random initial position
        x: Math.random() * 800,
        y: Math.random() * 500
      };
    });
    
    setNodes(newNodes);
    
    // Create links between related trends
    // For this demo, we'll create links between:
    // 1. Trends with similar timeframes
    // 2. Opportunities and threats (opposing forces)
    
    const newLinks: TrendLink[] = [];
    
    // Link similar timeframes
    const timeframeGroups: Record<string, string[]> = {};
    newNodes.forEach(node => {
      const timeframe = node.timeframe || 'medium';
      if (!timeframeGroups[timeframe]) timeframeGroups[timeframe] = [];
      timeframeGroups[timeframe].push(node.id);
    });
    
    // Create links within timeframe groups
    Object.values(timeframeGroups).forEach(group => {
      if (group.length >= 2) {
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            newLinks.push({
              source: group[i],
              target: group[j],
              strength: 0.5,
              color: 'rgba(0, 0, 0, 0.1)'
            });
          }
        }
      }
    });
    
    // Link opportunities and threats (conceptual relationships)
    const opportunities = newNodes.filter(n => n.trend_type === 'opportunity');
    const threats = newNodes.filter(n => n.trend_type === 'threat');
    
    // Create some connections between opportunities and threats
    opportunities.forEach((opp, i) => {
      if (threats.length > 0) {
        // Link each opportunity to at least one threat
        const threatIndex = i % threats.length;
        newLinks.push({
          source: opp.id,
          target: threats[threatIndex].id,
          strength: 0.3,
          color: 'rgba(0, 0, 0, 0.2)'
        });
      }
    });
    
    setLinks(newLinks);
  }, [trends, filter]);
  
  // Layout calculation effect
  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    // Different layout algorithms
    if (layout === 'grid') {
      // Simple grid layout
      const cols = Math.ceil(Math.sqrt(nodes.length));
      const gridSize = Math.min(width, height) / cols;
      
      const updatedNodes = [...nodes];
      updatedNodes.forEach((node, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        node.x = (col + 0.5) * gridSize;
        node.y = (row + 0.5) * gridSize;
      });
      
      setNodes(updatedNodes);
    } 
    else if (layout === 'cluster') {
      // Cluster by group (timeframe)
      const groups: Record<string, TrendNode[]> = {};
      nodes.forEach(node => {
        if (!groups[node.group || 'unknown']) groups[node.group || 'unknown'] = [];
        groups[node.group || 'unknown'].push(node);
      });
      
      // Position by groups
      const groupCount = Object.keys(groups).length;
      const angleStep = (2 * Math.PI) / groupCount;
      
      const updatedNodes = [...nodes];
      
      Object.entries(groups).forEach(([groupName, groupNodes], groupIndex) => {
        const angle = groupIndex * angleStep;
        const groupX = width / 2 + Math.cos(angle) * (width / 4);
        const groupY = height / 2 + Math.sin(angle) * (height / 4);
        
        // Arrange nodes in a circle within their group
        const nodeCount = groupNodes.length;
        const radius = Math.min(100, 30 * nodeCount);
        
        groupNodes.forEach((node, i) => {
          const nodeIndex = updatedNodes.findIndex(n => n.id === node.id);
          if (nodeIndex >= 0) {
            const nodeAngle = (i / nodeCount) * 2 * Math.PI;
            updatedNodes[nodeIndex].x = groupX + Math.cos(nodeAngle) * radius;
            updatedNodes[nodeIndex].y = groupY + Math.sin(nodeAngle) * radius;
          }
        });
      });
      
      setNodes(updatedNodes);
    }
    else {
      // Force-directed layout (simplified)
      // In a real implementation, you would use d3-force or a similar library
      // This is a very simplified version that just repels nodes from each other
      
      const simulation = () => {
        const updatedNodes = [...nodes];
        
        // Repulsive forces between nodes
        for (let i = 0; i < updatedNodes.length; i++) {
          for (let j = i + 1; j < updatedNodes.length; j++) {
            const nodeA = updatedNodes[i];
            const nodeB = updatedNodes[j];
            
            if (nodeA.x === undefined || nodeA.y === undefined || 
                nodeB.x === undefined || nodeB.y === undefined) continue;
            
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance === 0) continue;
            
            // Minimum distance to keep nodes from overlapping
            const minDistance = (nodeA.radius || 30) + (nodeB.radius || 30);
            
            // Apply repulsive force if too close
            if (distance < minDistance) {
              const force = (minDistance - distance) / distance * 0.1;
              const moveX = dx * force;
              const moveY = dy * force;
              
              nodeA.x -= moveX;
              nodeA.y -= moveY;
              nodeB.x += moveX;
              nodeB.y += moveY;
            }
          }
        }
        
        // Center and contain nodes within the container
        updatedNodes.forEach(node => {
          if (node.x === undefined || node.y === undefined) return;
          
          // Add a weak force toward the center
          node.x += (width / 2 - node.x) * 0.01;
          node.y += (height / 2 - node.y) * 0.01;
          
          // Keep nodes within bounds
          const radius = node.radius || 30;
          node.x = Math.max(radius, Math.min(width - radius, node.x));
          node.y = Math.max(radius, Math.min(height - radius, node.y));
        });
        
        setNodes(updatedNodes);
      };
      
      // Run a few iterations of the simulation
      for (let i = 0; i < 50; i++) {
        simulation();
      }
    }
  }, [layout, nodes.length]);
  
  const renderTrendIcon = (trend: TrendProps) => {
    if (trend.trend_type === 'opportunity') {
      return <Lightbulb className="h-4 w-4 text-green-500" />;
    } else if (trend.trend_type === 'threat') {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    } else {
      return <TrendingUp className="h-4 w-4 text-blue-500" />;
    }
  };
  
  // Handle layout change
  const handleLayoutChange = (value: string) => {
    if (value === 'force' || value === 'grid' || value === 'cluster') {
      setLayout(value);
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Trend Relationship Map</CardTitle>
            <CardDescription>
              Visualize connections between market trends
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {/* Layout options using Radio buttons with icons */}
            <div className="flex bg-slate-100 p-1 rounded-md">
              <Button
                variant={layout === 'force' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayout('force')}
                className="h-8 px-2"
              >
                <Network className="h-4 w-4" />
              </Button>
              <Button
                variant={layout === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayout('grid')}
                className="h-8 px-2"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={layout === 'cluster' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayout('cluster')}
                className="h-8 px-2"
              >
                <Circle className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setFilter(filter === 'all' ? 'opportunity' : 
                               filter === 'opportunity' ? 'threat' : 'all')}
              title={`Current filter: ${filter || 'none'}`}
            >
              <FilterIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
              <Minus className="h-4 w-4" />
            </Button>
            <Slider
              value={[zoom]} 
              min={0.5} 
              max={2} 
              step={0.1}
              onValueChange={(value) => setZoom(value[0])}
              className="w-32"
            />
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Legend */}
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span>Opportunity</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <span>Threat</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
              <span>Neutral</span>
            </div>
          </div>
        </div>
        
        {/* Visualization container */}
        <div 
          ref={containerRef} 
          className="relative w-full h-[500px] border rounded-md overflow-hidden bg-slate-50"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          {/* Render links first (underneath nodes) */}
          <svg className="absolute inset-0 w-full h-full">
            {links.map((link, i) => {
              const source = nodes.find(n => n.id === link.source);
              const target = nodes.find(n => n.id === link.target);
              
              if (!source?.x || !source?.y || !target?.x || !target?.y) return null;
              
              return (
                <line
                  key={`${link.source}-${link.target}`}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={link.color || 'rgba(0, 0, 0, 0.1)'}
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
              );
            })}
          </svg>
          
          {/* Render nodes on top */}
          {nodes.map((node) => {
            if (node.x === undefined || node.y === undefined) return null;
            
            return (
              <motion.div
                key={node.id}
                className="absolute flex items-center justify-center rounded-full shadow-sm cursor-pointer"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: node.x - (node.radius || 30),
                  y: node.y - (node.radius || 30),
                }}
                transition={{ type: 'spring', damping: 20 }}
                style={{ 
                  width: (node.radius || 30) * 2, 
                  height: (node.radius || 30) * 2,
                  backgroundColor: `${node.color}20`, // Very light version of the color
                  border: `2px solid ${node.color}80` // Semi-transparent version
                }}
                whileHover={{ scale: 1.1, backgroundColor: `${node.color}30` }}
              >
                <div className="flex flex-col items-center">
                  <div className="flex justify-center mb-1">
                    {renderTrendIcon(node)}
                  </div>
                  <div className="text-xs font-medium text-center max-w-[70px] line-clamp-2">
                    {node.name}
                  </div>
                  {node.impact_score && (
                    <div className="text-[10px] mt-1 bg-white/50 px-1.5 rounded">
                      Impact: {node.impact_score.toFixed(1)}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Help text at the bottom */}
        <div className="mt-3 text-xs text-center text-muted-foreground">
          {layout === 'force' && "Force-directed layout: Trends naturally position based on relationships"}
          {layout === 'grid' && "Grid layout: Trends organized in a grid pattern"}
          {layout === 'cluster' && "Cluster layout: Trends grouped by timeframe"}
        </div>
      </CardContent>
    </Card>
  );
} 