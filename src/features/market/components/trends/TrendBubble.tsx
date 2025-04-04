import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Lightbulb, AlertTriangle, Target, Calendar } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface TrendProps {
  id: string;
  name: string;
  direction?: string | null;
  trend_type?: string | null;
  timeframe?: string | null;
  impact_score?: number | null;
  confidence?: number | null;
  status?: string | null;
  tags?: string[] | null;
}

interface TrendBubbleProps {
  trend: TrendProps;
  isDragging?: boolean;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TrendBubble({
  trend,
  isDragging = false,
  showDetails = true,
  size = 'md',
  className
}: TrendBubbleProps) {
  // Determine trend direction
  const isUpward = trend.direction === 'upward';
  const isDownward = trend.direction === 'downward';
  const isNeutral = !isUpward && !isDownward;
  
  // Determine trend type color and icon
  const getTrendTypeStyles = () => {
    switch(trend.trend_type?.toLowerCase()) {
      case 'opportunity':
        return {
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: <Lightbulb className="h-3.5 w-3.5" />
        };
      case 'threat':
        return {
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <AlertTriangle className="h-3.5 w-3.5" />
        };
      default:
        return {
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: <Target className="h-3.5 w-3.5" />
        };
    }
  };

  // Determine timeframe badge style
  const getTimeframeStyles = () => {
    switch(trend.timeframe?.toLowerCase()) {
      case 'short':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      case 'medium':
        return {
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-800'
        };
      case 'long':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800'
        };
    }
  };

  // Determine impact score color
  const getImpactColor = () => {
    if (!trend.impact_score) return 'text-gray-600';
    if (trend.impact_score >= 8) return 'text-red-600';
    if (trend.impact_score >= 6) return 'text-amber-600';
    if (trend.impact_score >= 4) return 'text-blue-600';
    return 'text-gray-600';
  };

  // Size mapping
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36"
  };

  // Get type styles
  const typeStyles = getTrendTypeStyles();
  const timeframeStyles = getTimeframeStyles();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              "flex flex-col items-center justify-center rounded-lg shadow-sm relative transition-all",
              typeStyles.bgColor,
              `border-2 ${typeStyles.borderColor}`,
              isDragging ? "shadow-md" : "hover:shadow-md",
              sizeClasses[size],
              className
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              boxShadow: isDragging 
                ? "0 4px 12px rgba(0, 0, 0, 0.1)" 
                : "0 2px 4px rgba(0, 0, 0, 0.05)" 
            }}
          >
            {/* Direction indicator at top */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              {isUpward && (
                <Badge className="bg-green-100 text-green-800 flex items-center gap-0.5 px-1.5 py-0">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-[10px]">Up</span>
                </Badge>
              )}
              {isDownward && (
                <Badge className="bg-red-100 text-red-800 flex items-center gap-0.5 px-1.5 py-0">
                  <TrendingDown className="h-3 w-3" />
                  <span className="text-[10px]">Down</span>
                </Badge>
              )}
            </div>

            {/* Timeframe indicator if available */}
            {trend.timeframe && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <Badge className={`${timeframeStyles.bgColor} ${timeframeStyles.textColor} flex items-center gap-0.5 px-1.5 py-0`}>
                  <Calendar className="h-3 w-3" />
                  <span className="text-[10px]">{trend.timeframe}</span>
                </Badge>
              </div>
            )}

            {/* Trend icon */}
            <div className={`mb-1 mt-1 ${typeStyles.iconColor}`}>
              {typeStyles.icon}
            </div>

            {/* Trend name */}
            <div className="text-xs font-medium text-center px-1 line-clamp-2">
              {trend.name}
            </div>

            {/* Impact score if available */}
            {trend.impact_score && (
              <div className={`text-[10px] font-bold mt-1 ${getImpactColor()}`}>
                Impact: {trend.impact_score.toFixed(1)}
              </div>
            )}

            {/* Confidence indicator if available */}
            {trend.confidence && (
              <div className="mt-1 flex items-center">
                <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${(trend.confidence / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Status badge for emerging/established/declining if available */}
            {trend.status && showDetails && size !== 'sm' && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[9px] mt-1 px-1.5 py-0",
                  trend.status === 'emerging' ? "bg-green-50 text-green-700 border-green-200" :
                  trend.status === 'established' ? "bg-blue-50 text-blue-700 border-blue-200" :
                  "bg-amber-50 text-amber-700 border-amber-200"
                )}
              >
                {trend.status}
              </Badge>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="right" align="center" className="p-2 max-w-xs z-50">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${typeStyles.bgColor} ${typeStyles.borderColor} border`}></div>
              <span className="font-medium">{trend.name}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              {trend.trend_type && (
                <>
                  <span className="text-muted-foreground">Type:</span>
                  <span>{trend.trend_type}</span>
                </>
              )}
              
              {trend.direction && (
                <>
                  <span className="text-muted-foreground">Direction:</span>
                  <span className={isUpward ? 'text-green-600' : isDownward ? 'text-red-600' : ''}>
                    {trend.direction}
                  </span>
                </>
              )}
              
              {trend.timeframe && (
                <>
                  <span className="text-muted-foreground">Timeframe:</span>
                  <span>{trend.timeframe}</span>
                </>
              )}
              
              {trend.impact_score && (
                <>
                  <span className="text-muted-foreground">Impact:</span>
                  <span className={getImpactColor()}>{trend.impact_score.toFixed(1)}/10</span>
                </>
              )}
              
              {trend.confidence && (
                <>
                  <span className="text-muted-foreground">Confidence:</span>
                  <span>{trend.confidence.toFixed(1)}/5</span>
                </>
              )}
              
              {trend.status && (
                <>
                  <span className="text-muted-foreground">Status:</span>
                  <span>{trend.status}</span>
                </>
              )}
            </div>
            
            {trend.tags && trend.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {trend.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="px-1.5 py-0 text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 