import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendProps } from './TrendBubble';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, ArrowRight, Filter, TrendingUp, TrendingDown, Lightbulb, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TrendTimelineProps {
  trends: TrendProps[];
  className?: string;
}

export function TrendTimeline({ trends, className }: TrendTimelineProps) {
  const [timeFilter, setTimeFilter] = React.useState<'all' | 'short' | 'medium' | 'long'>('all');
  
  // Filter trends by timeframe
  const filteredTrends = React.useMemo(() => {
    if (timeFilter === 'all') return trends;
    return trends.filter(trend => trend.timeframe === timeFilter);
  }, [trends, timeFilter]);
  
  // Group trends by timeframe for better visualization
  const groupedTrends = React.useMemo(() => {
    const groups: Record<string, TrendProps[]> = {
      short: [],
      medium: [],
      long: []
    };
    
    trends.forEach(trend => {
      if (trend.timeframe) {
        if (!groups[trend.timeframe]) groups[trend.timeframe] = [];
        groups[trend.timeframe].push(trend);
      } else {
        // Default to medium if no timeframe specified
        if (!groups['medium']) groups['medium'] = [];
        groups['medium'].push(trend);
      }
    });
    
    return groups;
  }, [trends]);
  
  // Get icon and color styling based on trend properties
  const getTrendStyles = (trend: TrendProps) => {
    // Direction styling
    const directionIcon = trend.direction === 'upward' 
      ? <TrendingUp className="h-3.5 w-3.5" /> 
      : trend.direction === 'downward' 
        ? <TrendingDown className="h-3.5 w-3.5" />
        : null;
    
    // Type styling
    let typeBg = 'bg-blue-50';
    let typeBorder = 'border-blue-100';
    let typeIcon = null;
    
    switch(trend.trend_type?.toLowerCase()) {
      case 'opportunity':
        typeBg = 'bg-green-50';
        typeBorder = 'border-green-100';
        typeIcon = <Lightbulb className="h-3.5 w-3.5 text-green-500" />;
        break;
      case 'threat':
        typeBg = 'bg-red-50';
        typeBorder = 'border-red-100';
        typeIcon = <AlertTriangle className="h-3.5 w-3.5 text-red-500" />;
        break;
      default:
        typeBg = 'bg-blue-50';
        typeBorder = 'border-blue-100';
        break;
    }
    
    return {
      directionIcon,
      typeBg,
      typeBorder,
      typeIcon
    };
  };
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Trend Timeline</CardTitle>
            <CardDescription>
              Visualize trends by their expected timeframe
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant={timeFilter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeFilter('all')}
            >
              All
            </Button>
            <Button 
              variant={timeFilter === 'short' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeFilter('short')}
            >
              Short-term
            </Button>
            <Button 
              variant={timeFilter === 'medium' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeFilter('medium')}
            >
              Medium
            </Button>
            <Button 
              variant={timeFilter === 'long' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeFilter('long')}
            >
              Long-term
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative py-10 mt-6">
          {/* Timeline axis */}
          <div className="h-1 bg-gray-200 w-full absolute top-0"></div>
          
          {/* Time markers */}
          <div className="absolute -top-8 left-0 text-sm text-gray-500">Now</div>
          <div className="absolute -top-8 left-1/3 text-sm text-gray-500">1 Year</div>
          <div className="absolute -top-8 left-2/3 text-sm text-gray-500">3 Years</div>
          <div className="absolute -top-8 right-0 text-sm text-gray-500">5+ Years</div>
          
          {/* Timeline node markers */}
          <div className="absolute -top-1.5 left-0 w-4 h-4 rounded-full bg-gray-300"></div>
          <div className="absolute -top-1.5 left-1/3 w-4 h-4 rounded-full bg-gray-300"></div>
          <div className="absolute -top-1.5 left-2/3 w-4 h-4 rounded-full bg-gray-300"></div>
          <div className="absolute -top-1.5 right-0 w-4 h-4 rounded-full bg-gray-300"></div>
          
          {/* Timeline sections */}
          <div className="grid grid-cols-3 gap-6 pt-4">
            {/* Short-term trends */}
            <div className={`space-y-3 ${timeFilter !== 'all' && timeFilter !== 'short' ? 'opacity-30' : ''}`}>
              <h3 className="font-medium text-green-600 flex items-center">
                <Badge className="bg-green-100 text-green-800 mr-2">Short-term</Badge>
                <span>{groupedTrends.short.length} trends</span>
              </h3>
              
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                {groupedTrends.short.map((trend, index) => {
                  const styles = getTrendStyles(trend);
                  return (
                    <motion.div 
                      key={trend.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "p-3 rounded-md border shadow-sm",
                        styles.typeBg,
                        styles.typeBorder
                      )}
                    >
                      <div className="font-medium text-sm">{trend.name}</div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1">
                          {styles.typeIcon}
                          {trend.impact_score && (
                            <span className="text-xs bg-white/50 px-1.5 py-0.5 rounded">
                              Impact: {trend.impact_score.toFixed(1)}
                            </span>
                          )}
                        </div>
                        {styles.directionIcon && (
                          <div className="flex items-center">
                            <Badge variant="outline" className={cn(
                              "text-xs",
                              trend.direction === 'upward' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                            )}>
                              {styles.directionIcon}
                              <span className="ml-1">{trend.direction}</span>
                            </Badge>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                {groupedTrends.short.length === 0 && (
                  <div className="p-4 text-center text-gray-500 text-sm bg-gray-50 rounded-md">
                    No short-term trends added
                  </div>
                )}
              </div>
            </div>
            
            {/* Medium-term trends */}
            <div className={`space-y-3 ${timeFilter !== 'all' && timeFilter !== 'medium' ? 'opacity-30' : ''}`}>
              <h3 className="font-medium text-amber-600 flex items-center">
                <Badge className="bg-amber-100 text-amber-800 mr-2">Medium-term</Badge>
                <span>{groupedTrends.medium.length} trends</span>
              </h3>
              
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                {groupedTrends.medium.map((trend, index) => {
                  const styles = getTrendStyles(trend);
                  return (
                    <motion.div 
                      key={trend.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + (index * 0.1) }}
                      className={cn(
                        "p-3 rounded-md border shadow-sm",
                        styles.typeBg,
                        styles.typeBorder
                      )}
                    >
                      <div className="font-medium text-sm">{trend.name}</div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1">
                          {styles.typeIcon}
                          {trend.impact_score && (
                            <span className="text-xs bg-white/50 px-1.5 py-0.5 rounded">
                              Impact: {trend.impact_score.toFixed(1)}
                            </span>
                          )}
                        </div>
                        {styles.directionIcon && (
                          <div className="flex items-center">
                            <Badge variant="outline" className={cn(
                              "text-xs",
                              trend.direction === 'upward' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                            )}>
                              {styles.directionIcon}
                              <span className="ml-1">{trend.direction}</span>
                            </Badge>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                {groupedTrends.medium.length === 0 && (
                  <div className="p-4 text-center text-gray-500 text-sm bg-gray-50 rounded-md">
                    No medium-term trends added
                  </div>
                )}
              </div>
            </div>
            
            {/* Long-term trends */}
            <div className={`space-y-3 ${timeFilter !== 'all' && timeFilter !== 'long' ? 'opacity-30' : ''}`}>
              <h3 className="font-medium text-blue-600 flex items-center">
                <Badge className="bg-blue-100 text-blue-800 mr-2">Long-term</Badge>
                <span>{groupedTrends.long.length} trends</span>
              </h3>
              
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                {groupedTrends.long.map((trend, index) => {
                  const styles = getTrendStyles(trend);
                  return (
                    <motion.div 
                      key={trend.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + (index * 0.1) }}
                      className={cn(
                        "p-3 rounded-md border shadow-sm",
                        styles.typeBg,
                        styles.typeBorder
                      )}
                    >
                      <div className="font-medium text-sm">{trend.name}</div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1">
                          {styles.typeIcon}
                          {trend.impact_score && (
                            <span className="text-xs bg-white/50 px-1.5 py-0.5 rounded">
                              Impact: {trend.impact_score.toFixed(1)}
                            </span>
                          )}
                        </div>
                        {styles.directionIcon && (
                          <div className="flex items-center">
                            <Badge variant="outline" className={cn(
                              "text-xs",
                              trend.direction === 'upward' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                            )}>
                              {styles.directionIcon}
                              <span className="ml-1">{trend.direction}</span>
                            </Badge>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                {groupedTrends.long.length === 0 && (
                  <div className="p-4 text-center text-gray-500 text-sm bg-gray-50 rounded-md">
                    No long-term trends added
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 