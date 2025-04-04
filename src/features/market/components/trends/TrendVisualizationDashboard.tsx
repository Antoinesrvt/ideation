import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TrendProps } from './TrendBubble';
import { TrendImpactMatrix } from './TrendImpactMatrix';
import { TrendTimeline } from './TrendTimeline';
import { TrendRelationshipMap } from './TrendRelationshipMap';
import { PlusCircle, Filter, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TrendVisualizationDashboardProps {
  trends: TrendProps[];
  className?: string;
  onAddTrend?: () => void;
}

export function TrendVisualizationDashboard({ 
  trends, 
  className,
  onAddTrend
}: TrendVisualizationDashboardProps) {
  const [activeTab, setActiveTab] = useState('impact-matrix');
  const [filter, setFilter] = useState<string | null>(null);
  
  const trendTypes = Array.from(new Set(trends.map(t => t.trend_type))).filter(Boolean);
  const trendTimeframes = Array.from(new Set(trends.map(t => t.timeframe))).filter(Boolean);
  
  const filteredTrends = React.useMemo(() => {
    if (!filter) return trends;
    
    // Check if filter is a trend type
    if (trendTypes.includes(filter)) {
      return trends.filter(t => t.trend_type === filter);
    }
    
    // Check if filter is a timeframe
    if (trendTimeframes.includes(filter)) {
      return trends.filter(t => t.timeframe === filter);
    }
    
    return trends;
  }, [trends, filter, trendTypes, trendTimeframes]);
  
  const clearFilter = () => setFilter(null);
  
  const filterBadge = filter && (
    <Badge 
      variant="secondary" 
      className="ml-2 flex items-center gap-1 px-2 py-1"
    >
      {filter}
      <button 
        onClick={clearFilter} 
        className="ml-1 text-sm font-semibold"
      >
        ×
      </button>
    </Badge>
  );
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div>
              <CardTitle>Market Trend Analysis</CardTitle>
              <CardDescription>
                Visualize and analyze market trends {filterBadge}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => {}}>
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
            <Button variant="outline" size="sm" onClick={() => {}}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            {onAddTrend && (
              <Button size="sm" onClick={onAddTrend}>
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Trend
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="impact-matrix"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="impact-matrix">Impact Matrix</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
          </TabsList>
          
          <TabsContent value="impact-matrix" className="mt-0">
            <div className="bg-slate-50 rounded-md p-4">
              <TrendImpactMatrix trends={filteredTrends} className="h-[600px]" />
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-0">
            <div className="bg-slate-50 rounded-md p-4">
              <TrendTimeline trends={filteredTrends} className="h-[600px]" />
            </div>
          </TabsContent>
          
          <TabsContent value="relationships" className="mt-0">
            <div className="bg-slate-50 rounded-md p-4">
              <TrendRelationshipMap trends={filteredTrends} className="h-[600px]" />
            </div>
          </TabsContent>
        </Tabs>
        
      </CardContent>
    </Card>
  );
} 