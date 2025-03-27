import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MarketSegment {
  name: string;
  size: number;
  growth: number;
}

interface SegmentationChartProps {
  segments: MarketSegment[];
  onSegmentClick?: (segment: MarketSegment) => void;
  className?: string;
}

export function SegmentationChart({ 
  segments, 
  onSegmentClick,
  className = '' 
}: SegmentationChartProps) {
  // Calculate the total size to determine proportions
  const totalSize = segments.reduce((sum, segment) => sum + segment.size, 0);
  
  // Calculate the color for growth rate: green for high, amber for moderate, red for negative
  const getGrowthColor = (growth: number) => {
    if (growth >= 20) return '#10b981'; // Green for high growth (20%+)
    if (growth >= 10) return '#60a5fa'; // Blue for good growth (10-20%)
    if (growth >= 0) return '#f59e0b';  // Amber for low/moderate growth (0-10%)
    return '#ef4444';                    // Red for negative growth
  };
  
  // Get growth trend icon based on growth rate
  const getGrowthIcon = (growth: number) => {
    if (growth >= 15) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (growth >= 5) return <ArrowRight className="h-4 w-4 text-blue-500" />;
    if (growth >= -5) return <ArrowRight className="h-4 w-4 text-amber-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };
  
  // Calculate maximum growth for scaling
  const maxGrowth = Math.max(...segments.map(s => Math.abs(s.growth)), 10);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  const segmentVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {segments.length === 0 ? (
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-md p-6">
          <div className="text-center text-gray-400">
            <p>Add market segments to visualize</p>
          </div>
        </div>
      ) : (
        <motion.div 
          className="w-full h-full flex flex-wrap items-center justify-center p-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {segments.map((segment, index) => {
            // Calculate size as a proportion of total (min 10% for visibility)
            const sizePercentage = Math.max(10, (segment.size / totalSize) * 100);
            // Size of the bubble (sqrt to make area proportional)
            const bubbleSize = 30 + Math.sqrt(sizePercentage) * 5;
            // Growth indicator (scaled for visualization)
            const growthSize = 5 + (Math.abs(segment.growth) / maxGrowth) * 15;
            const growthColor = getGrowthColor(segment.growth);
            
            return (
              <motion.div
                key={segment.name}
                className="relative m-2 cursor-pointer group"
                variants={segmentVariants}
                whileHover={{ scale: 1.05 }}
                onClick={() => onSegmentClick && onSegmentClick(segment)}
              >
                {/* Main segment bubble */}
                <div 
                  className="rounded-full flex items-center justify-center shadow-sm relative"
                  style={{ 
                    width: `${bubbleSize}px`, 
                    height: `${bubbleSize}px`,
                    background: `rgba(99, 102, 241, ${0.3 + (sizePercentage / 150)})`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-indigo-100 mix-blend-overlay transition-opacity duration-200" />
                  
                  <div className="text-center p-1">
                    <p className="font-medium text-xs text-indigo-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                      {segment.name}
                    </p>
                    <p className="text-xs text-indigo-700">{segment.size}%</p>
                  </div>
                  
                  {/* Growth indicator */}
                  <div 
                    className="absolute -top-1 -right-1 rounded-full flex items-center justify-center shadow-sm border-2 border-white"
                    style={{ 
                      width: `${growthSize}px`, 
                      height: `${growthSize}px`,
                      backgroundColor: growthColor,
                    }}
                  >
                    {growthSize > 15 && (
                      <span className="text-white text-[8px] font-bold">
                        {segment.growth > 0 ? '+' : ''}{segment.growth}%
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Hover information */}
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white shadow-lg rounded-md p-2 left-1/2 -translate-x-1/2 top-full mt-1 min-w-max z-10">
                  <div className="text-xs font-medium">{segment.name}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">Market share: {segment.size}%</span>
                    <Badge className="ml-2 text-[9px] flex items-center" variant={segment.growth >= 0 ? 'default' : 'destructive'}>
                      {getGrowthIcon(segment.growth)}
                      <span className="ml-1">{segment.growth}% growth</span>
                    </Badge>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

// Also export a simplified segment card component for the sidebar
export function SegmentCard({ 
  name, 
  size, 
  growth,
  onEdit,
  onDelete
}: MarketSegment & { 
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const growthColor = growth >= 10 ? 'text-green-600' : 
                      growth >= 0 ? 'text-amber-600' : 
                      'text-red-600';
  
  return (
    <div className="bg-white border rounded-md p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-sm">{name}</h4>
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-500">Size: {size}%</span>
            <span className={`text-xs ml-3 flex items-center ${growthColor}`}>
              {growth >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {growth}% growth
            </span>
          </div>
        </div>
        
        {(onEdit || onDelete) && (
          <div className="flex space-x-1">
            {onEdit && (
              <button 
                onClick={onEdit} 
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button 
                onClick={onDelete} 
                className="text-xs text-red-600 hover:text-red-800 ml-2"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Visual progress bar for size */}
      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-500"
          style={{ width: `${Math.min(100, size)}%` }}
        />
      </div>
    </div>
  );
} 