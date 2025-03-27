import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart2, 
  PieChart, 
  TrendingUp, 
  Users, 
  Building2, 
  Target, 
  DollarSign,
  Activity,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MetricItem {
  id: string;
  title: string;
  value: string;
  description: string;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  percent?: number;
  percentLabel?: string;
  threshold?: number;
  thresholdLabel?: string;
  section: string;
  category: string;
}

export interface SectionInfo {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

export interface MetricsPanelProps {
  currentSection: string;
  projectId: string;
  metrics: MetricItem[];
  sectionInfo: SectionInfo;
  className?: string;
}

export function MetricsPanel({
  currentSection,
  projectId,
  metrics,
  sectionInfo,
  className
}: MetricsPanelProps) {
  // Filter metrics based on current section
  const filteredMetrics = React.useMemo(() => {
    return metrics.filter(metric => metric.section === currentSection);
  }, [metrics, currentSection]);

  // Group metrics by category
  const groupedMetrics = React.useMemo(() => {
    const grouped: Record<string, MetricItem[]> = {};
    
    filteredMetrics.forEach(metric => {
      if (!grouped[metric.category]) {
        grouped[metric.category] = [];
      }
      grouped[metric.category].push(metric);
    });
    
    return grouped;
  }, [filteredMetrics]);

  // Render metric card
  const MetricCard = ({ 
    title, 
    value, 
    description, 
    icon, 
    trend, 
    trendLabel, 
    percent, 
    percentLabel,
    threshold,
    thresholdLabel
  }: Omit<MetricItem, 'id' | 'section' | 'category'>) => {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">{title}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{value}</span>
                {trend !== undefined && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "ml-2 text-xs font-normal",
                      trend > 0 ? "bg-green-50 text-green-700 border-green-200" : 
                      trend < 0 ? "bg-red-50 text-red-700 border-red-200" : 
                      "bg-gray-50 text-gray-700 border-gray-200"
                    )}
                  >
                    {trend > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                     trend < 0 ? <ArrowDownRight className="h-3 w-3 mr-1" /> : null}
                    {trend > 0 ? '+' : ''}{trend}%
                    {trendLabel && <span className="ml-1 opacity-70">{trendLabel}</span>}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            {icon && (
              <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
                {icon}
              </div>
            )}
          </div>
          
          {percent !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between items-center text-xs mb-1">
                <span>{percentLabel || 'Progress'}</span>
                <span>{percent}%</span>
              </div>
              <Progress value={percent} className="h-1.5" />
            </div>
          )}
          
          {threshold !== undefined && (
            <div className="mt-3 flex items-center gap-1.5 text-xs">
              {threshold >= 100 ? (
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              ) : threshold >= 75 ? (
                <Info className="h-3.5 w-3.5 text-blue-500" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
              )}
              <span className="text-muted-foreground">
                {thresholdLabel || `${threshold}% of threshold`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render no metrics message
  const renderEmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 px-4 text-center">
        <div className={cn(
          "rounded-full p-4 mb-4",
          "bg-muted text-muted-foreground"
        )}>
          {sectionInfo.icon && React.cloneElement(sectionInfo.icon as React.ReactElement, { className: "h-8 w-8 opacity-40" })}
        </div>
        <p className="text-muted-foreground text-sm font-medium">No metrics available</p>
        <p className="text-muted-foreground text-xs mt-2 max-w-xs">
          No metrics are available for {sectionInfo.name} at this time.
        </p>
      </div>
    );
  };

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Metrics & Insights</CardTitle>
          <Badge variant="outline" className="ml-2 flex items-center gap-1.5">
            <span className={sectionInfo.color}>{sectionInfo.icon}</span>
            <span>{sectionInfo.name}</span>
          </Badge>
        </div>
        <CardDescription>
          Key metrics and performance indicators
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full pr-4">
          {Object.keys(groupedMetrics).length > 0 ? (
            <div className="space-y-6 p-4">
              {Object.entries(groupedMetrics).map(([category, items]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map(metric => (
                      <MetricCard 
                        key={metric.id}
                        title={metric.title}
                        value={metric.value}
                        description={metric.description}
                        icon={metric.icon}
                        trend={metric.trend}
                        trendLabel={metric.trendLabel}
                        percent={metric.percent}
                        percentLabel={metric.percentLabel}
                        threshold={metric.threshold}
                        thresholdLabel={metric.thresholdLabel}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : renderEmptyState()}
        </ScrollArea>
      </CardContent>
    </div>
  );
} 