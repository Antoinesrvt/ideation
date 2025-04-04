import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Building, Award, Users, Zap, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Competitor } from './CompetitorAnalysis';

// CompetitorProps kept for backward compatibility if needed
export interface CompetitorProps {
  id: string;
  name: string;
  market_share?: string;
  positioning?: string;
  customer_sentiment?: number;
  differentiators?: string[];
  strengths?: string[];
  weaknesses?: string[];
  website?: string;
  founded_year?: string;
  revenue_range?: string;
  growth_rate?: string;
  funding_status?: string;
}

interface CompetitorBubbleProps {
  competitor: Competitor;
  isDragging?: boolean;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isYourCompany?: boolean;
}

export function CompetitorBubble({
  competitor,
  isDragging = false,
  showDetails = true,
  size = 'md',
  className,
  isYourCompany = false
}: CompetitorBubbleProps) {
  // Determine competitor positioning style
  const getPositioningStyles = () => {
    if (isYourCompany) {
      return {
        bgColor: 'bg-primary/20',
        textColor: 'text-primary',
        borderColor: 'border-primary',
        icon: <Building className="h-3.5 w-3.5" />
      };
    }
    
    switch(competitor.positioning?.toLowerCase()) {
      case 'premium':
        return {
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200',
          icon: <Award className="h-3.5 w-3.5" />
        };
      case 'mid-market':
        return {
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          icon: <Building className="h-3.5 w-3.5" />
        };
      case 'budget':
        return {
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          icon: <Users className="h-3.5 w-3.5" />
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          icon: <Building className="h-3.5 w-3.5" />
        };
    }
  };

  // Size mapping
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-32 h-32"
  };

  // Calculate additional size based on market share if available
  const getMarketShareSize = () => {
    if (!competitor.market_share) return size;
    
    const shareValue = parseFloat(competitor.market_share);
    if (isNaN(shareValue)) return size;
    
    if (shareValue > 30) return 'lg';
    if (shareValue > 15) return 'md';
    return 'sm';
  };

  // Get customer sentiment color
  const getSentimentColor = () => {
    if (!competitor.customer_sentiment) return 'text-gray-600';
    
    const sentiment = competitor.customer_sentiment;
    if (sentiment >= 4) return 'text-green-600';
    if (sentiment >= 3) return 'text-amber-600';
    return 'text-red-600';
  };

  // Get styles based on positioning
  const styles = getPositioningStyles();
  
  // Calculate dynamic size based on market share
  const dynamicSize = getMarketShareSize();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              "flex flex-col items-center justify-center rounded-full shadow-sm relative transition-all",
              styles.bgColor,
              `border-2 ${styles.borderColor}`,
              isDragging ? "shadow-md" : "hover:shadow-md",
              sizeClasses[size],
              isYourCompany ? "ring-2 ring-primary/50" : "",
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
            {/* Market share badge if available */}
            {competitor.market_share && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-100 text-blue-800 flex items-center gap-0.5 px-1.5 py-0">
                  <Users className="h-3 w-3" />
                  <span className="text-[10px]">{competitor.market_share}%</span>
                </Badge>
              </div>
            )}

            {/* Competitor icon */}
            <div className={`mb-1 mt-1 ${styles.textColor}`}>
              {styles.icon}
            </div>

            {/* Competitor name */}
            <div className="text-xs font-medium text-center px-1 line-clamp-2">
              {competitor.name}
            </div>

            {/* Positioning if available */}
            {competitor.positioning && showDetails && (
              <div className={`text-[10px] font-medium mt-1 ${styles.textColor}`}>
                {competitor.positioning}
              </div>
            )}

            {/* Customer sentiment indicator if available */}
            {competitor.customer_sentiment && showDetails && (
              <div className="mt-1 flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-2.5 w-2.5 ${i < competitor.customer_sentiment! ? getSentimentColor() : 'text-gray-300'}`} 
                    fill={i < competitor.customer_sentiment! ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
            )}

            {/* Growth indicator if available */}
            {competitor.growth_rate && showDetails && size !== 'sm' && (
              <Badge 
                variant="outline" 
                className="text-[9px] mt-1 px-1.5 py-0 flex items-center gap-0.5 bg-green-50 text-green-700 border-green-200"
              >
                <Zap className="h-2 w-2" />
                {competitor.growth_rate}
              </Badge>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="right" align="center" className="p-2 max-w-xs z-50">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${styles.bgColor} ${styles.borderColor} border`}></div>
              <span className="font-medium">{competitor.name}</span>
              {isYourCompany && (
                <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1">Your Company</Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              {competitor.positioning && (
                <>
                  <span className="text-muted-foreground">Positioning:</span>
                  <span>{competitor.positioning}</span>
                </>
              )}
              
              {competitor.market_share && (
                <>
                  <span className="text-muted-foreground">Market Share:</span>
                  <span>{competitor.market_share}%</span>
                </>
              )}
              
              {competitor.customer_sentiment && (
                <>
                  <span className="text-muted-foreground">Customer Sentiment:</span>
                  <span className={getSentimentColor()}>{competitor.customer_sentiment}/5</span>
                </>
              )}
              
              {competitor.revenue_range && (
                <>
                  <span className="text-muted-foreground">Revenue:</span>
                  <span>{competitor.revenue_range}</span>
                </>
              )}
              
              {competitor.founded_year && (
                <>
                  <span className="text-muted-foreground">Founded:</span>
                  <span>{competitor.founded_year}</span>
                </>
              )}
              
              {competitor.growth_rate && (
                <>
                  <span className="text-muted-foreground">Growth Rate:</span>
                  <span className="text-green-600">{competitor.growth_rate}</span>
                </>
              )}
              
              {competitor.website && (
                <>
                  <span className="text-muted-foreground">Website:</span>
                  <span className="text-blue-600 truncate">{competitor.website}</span>
                </>
              )}
            </div>
            
            {competitor.differentiators && competitor.differentiators.length > 0 && (
              <div className="mt-1">
                <div className="text-xs text-muted-foreground mb-1">Key Differentiators:</div>
                <div className="flex flex-wrap gap-1">
                  {competitor.differentiators.map((diff: string, index: number) => (
                    <Badge key={index} variant="secondary" className="px-1.5 py-0 text-[10px]">
                      {diff}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {competitor.strengths && competitor.strengths.length > 0 && (
              <div className="mt-1">
                <div className="text-xs text-muted-foreground mb-1">Strengths:</div>
                <div className="text-xs">{competitor.strengths.join(', ')}</div>
              </div>
            )}
            
            {competitor.weaknesses && competitor.weaknesses.length > 0 && (
              <div className="mt-1">
                <div className="text-xs text-muted-foreground mb-1">Weaknesses:</div>
                <div className="text-xs">{competitor.weaknesses.join(', ')}</div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 