import React from 'react';
import { ArrowDown, ArrowUp, ArrowRight, TrendingUp, Edit, Info, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MarketTrendCardProps } from '../types';

export function MarketTrendCard({ 
  trend,
  onEdit,
  onUpdate,
  onDelete,
  readOnly = false
}: MarketTrendCardProps) {
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
  
  const getTypeVariant = (type: 'opportunity' | 'threat' | 'neutral') => {
    switch (type) {
      case 'opportunity':
        return 'outline-primary';
      case 'threat':
        return 'outline-accent';
      default:
        return 'outline';
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
  
  // Ensure direction and type are valid values
  const direction: 'upward' | 'downward' | 'stable' = 
    trend.direction === 'upward' ? 'upward' :
    trend.direction === 'downward' ? 'downward' : 
    'stable';
    
  const type: 'opportunity' | 'threat' | 'neutral' = 
    trend.trend_type === 'opportunity' ? 'opportunity' :
    trend.trend_type === 'threat' ? 'threat' : 
    'neutral';
  
  const cardVariant = 
    trend.status === 'new' ? 'gradient' :
    trend.status === 'modified' ? 'elevated' :
    trend.status === 'removed' ? 'outline' :
    'default';
    
  const customClasses = 
    trend.status === 'new' ? 'border-green-300 from-green-50 to-white' :
    trend.status === 'modified' ? 'border-yellow-300 shadow-yellow-100/50' :
    trend.status === 'removed' ? 'border-red-300 text-red-800' :
    '';
  
  return (
    <Card
      variant={cardVariant}
      animation="hover"
      className={customClasses}
    >
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 shadow-sm ${
              type === 'opportunity' ? 'bg-primary-100 text-primary-700' : 
              type === 'threat' ? 'bg-accent-100 text-accent-700' : 'bg-gray-100 text-gray-600'
            }`}>
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-primary-800">{trend.name || 'Unnamed Trend'}</h3>
              <div className="flex items-center text-sm text-dark-500">
                {getDirectionIcon(direction)}
                <span className="ml-1">{getDirectionText(direction)}</span>
              </div>
            </div>
          </div>
          <Badge 
            variant={getTypeVariant(type) as any} 
            rounded="sm"
            className="px-3 py-0.5"
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        </div>
        
        <div className="space-y-4 mt-4">
          <div>
            <div className="flex items-center mb-1.5">
              <p className="text-sm font-medium text-primary-800">Impact Analysis</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 ml-1 text-primary-400" />
                  </TooltipTrigger>
                  <TooltipContent 
                    className="bg-white/90 backdrop-blur-sm shadow-lg border border-primary-100"
                  >
                    <p>The potential impact of this trend on your business based on its type and direction.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-sm text-dark-600 bg-white/50 p-3 rounded-lg border border-gray-100 backdrop-blur-sm">
              {getTrendImpact(type, direction)}
            </div>
          </div>
          
          <div>
            <div className="flex items-center mb-1.5">
              <p className="text-sm font-medium text-primary-800">Description</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 ml-1 text-primary-400" />
                  </TooltipTrigger>
                  <TooltipContent 
                    className="bg-white/90 backdrop-blur-sm shadow-lg border border-primary-100"
                  >
                    <p>Explain the trend, its causes, and potential consequences for your market.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-dark-600 p-2">
              {trend.description || 'No description provided.'}
            </p>
          </div>
          
          {trend.tags && trend.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium text-primary-800 mb-1.5">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {trend.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant={type === 'opportunity' ? 'subtle-primary' : 
                             type === 'threat' ? 'subtle-accent' : 
                             'subtle'} 
                    size="sm"
                    rounded="full"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {trend.sources && trend.sources.length > 0 && (
            <div>
              <p className="text-sm font-medium text-primary-800 mb-1.5">Sources</p>
              <div className="flex flex-wrap gap-1.5">
                {trend.sources.map((source, index) => (
                  <Badge 
                    key={index} 
                    variant="ghost" 
                    size="sm"
                    rounded="sm"
                  >
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {!readOnly && (
          <>
            <Separator className="my-4" variant="ghost" />
            <div className="flex justify-between">
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-primary-700 hover:bg-primary-50"
                  onClick={() => onEdit(trend.id)}
                >
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  Edit Trend
                </Button>
              )}
              
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-accent-700 hover:bg-accent-50"
                  onClick={() => onDelete(trend.id)}
                >
                  <Trash className="h-3.5 w-3.5 mr-1.5" />
                  Delete
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}