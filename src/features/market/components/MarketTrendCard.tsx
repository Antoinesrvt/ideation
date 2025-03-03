import React from 'react';
import { MarketTrend } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, ArrowRight, TrendingUp, Edit, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MarketTrendCardProps {
  trend: MarketTrend;
  onEdit?: (id: string) => void;
}

export const MarketTrendCard: React.FC<MarketTrendCardProps> = ({ 
  trend,
  onEdit 
}) => {
  const getDirectionIcon = (direction: 'upward' | 'downward' | 'stable') => {
    switch (direction) {
      case 'upward':
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'downward':
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      default:
        return <ArrowRight className="h-4 w-4 text-gray-600" />;
    }
  };
  
  const getDirectionText = (direction: 'upward' | 'downward' | 'stable') => {
    switch (direction) {
      case 'upward':
        return 'Trending Upward';
      case 'downward':
        return 'Trending Downward';
      default:
        return 'Stable Trend';
    }
  };
  
  const getTypeColor = (type: 'opportunity' | 'threat' | 'neutral') => {
    switch (type) {
      case 'opportunity':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'threat':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getTrendImpact = (type: 'opportunity' | 'threat' | 'neutral', direction: 'upward' | 'downward' | 'stable') => {
    if (type === 'opportunity' && direction === 'upward') return 'High positive impact';
    if (type === 'opportunity' && direction === 'stable') return 'Moderate positive impact';
    if (type === 'threat' && direction === 'upward') return 'High negative impact';
    if (type === 'threat' && direction === 'downward') return 'Decreasing threat';
    if (type === 'neutral' && direction !== 'stable') return 'Monitor closely';
    return 'Low impact';
  };
  
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      onClick={() => onEdit && onEdit(trend.id)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
            <TrendingUp className={`h-5 w-5 ${
              trend.type === 'opportunity' ? 'text-blue-600' : 
              trend.type === 'threat' ? 'text-red-600' : 'text-gray-600'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold">{trend.name || 'Unnamed Trend'}</h3>
            <div className="flex items-center text-sm text-gray-500">
              {getDirectionIcon(trend.direction)}
              <span className="ml-1">{getDirectionText(trend.direction)}</span>
            </div>
          </div>
        </div>
        <Badge variant="outline" className={`${getTypeColor(trend.type)}`}>
          {trend.type.charAt(0).toUpperCase() + trend.type.slice(1)}
        </Badge>
      </div>
      
      <div className="mb-3">
        <div className="flex items-center mb-1">
          <p className="text-sm font-medium text-gray-700">Impact Analysis</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>The potential impact of this trend on your business based on its type and direction.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          {getTrendImpact(trend.type, trend.direction)}
        </p>
      </div>
      
      <div className="mb-3">
        <div className="flex items-center mb-1">
          <p className="text-sm font-medium text-gray-700">Description</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Explain the trend, its causes, and potential consequences for your market.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-gray-600">
          {trend.description || 'No description provided.'}
        </p>
      </div>
      
      {trend.tags && trend.tags.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-1">Tags</p>
          <div className="flex flex-wrap gap-1">
            {trend.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <Button 
        variant="ghost" 
        size="sm"
        className="text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2.5 py-1.5"
      >
        <Edit className="h-3.5 w-3.5" />
        Edit Trend
      </Button>
    </div>
  );
};