import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  Beaker,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Minus,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Lightbulb,
  SplitSquareVertical,
  Sparkles,
  Zap,
  Filter,
} from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ValidationData } from '@/lib/services/features/validation-service';
import { 
  ValidationMetrics, 
  EnhancedValidationData, 
  EnhancedValidationExperiment,
  EnhancedValidationABTest,
  EnhancedValidationUserFeedback,
  ValidationStatus,
  statusTheme,
  StatusBadgeVariant,
} from '../types';
import { transformValidationData, calculateValidationMetrics } from '../utils';

// Custom PieChart component
interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  colors: string[];
  className?: string;
}

function PieChart({ data, colors, className = '' }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  const paths = data.map((item, index) => {
    if (item.value === 0) return null;
    
    const angle = (item.value / total) * 360;
    const x1 = Math.cos((currentAngle * Math.PI) / 180);
    const y1 = Math.sin((currentAngle * Math.PI) / 180);
    const x2 = Math.cos(((currentAngle + angle) * Math.PI) / 180);
    const y2 = Math.sin(((currentAngle + angle) * Math.PI) / 180);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    const pathData = `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    
    const path = (
      <path
        key={item.name}
        d={pathData}
        fill={colors[index]}
        transform="translate(100, 100) scale(80)"
        className="transition-all duration-300 hover:opacity-80"
      />
    );
    
    currentAngle += angle;
    return path;
  });

  return (
    <div className={className}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {paths}
        {/* Add a subtle inner shadow for depth */}
        <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
          <feOffset dx="0" dy="0" />
          <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff" />
          <feFlood floodColor="#000000" floodOpacity="0.2" />
          <feComposite in2="shadowDiff" operator="in" />
          <feComposite in2="SourceGraphic" operator="over" />
        </filter>
        <circle cx="100" cy="100" r="80" fill="none" filter="url(#innerShadow)" />
      </svg>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center text-sm">
            <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: colors[index] }} />
            <span>{item.name}: {((item.value / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Key insights component
interface KeyInsightProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

function KeyInsight({ title, description, icon }: KeyInsightProps) {
  return (
    <motion.div 
      className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
      whileHover={{ scale: 1.02 }}
      variants={itemVariants}
    >
      <div className="mt-1 bg-primary/10 p-2 rounded-full">
        {icon}
      </div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

interface ResultsDashboardProps {
  data: ValidationData;
  isLoading?: boolean;
}

export function ResultsDashboard({ data, isLoading = false }: ResultsDashboardProps) {
  const [expandedSummary, setExpandedSummary] = useState(false);
  const enhancedData = useMemo(() => transformValidationData(data), [data]);
  const metrics = useMemo(() => calculateValidationMetrics(enhancedData), [enhancedData]);

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatDuration = (days: number) => `${days.toFixed(1)} days`;

  const renderTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (value < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const renderMetricCard = (
    title: string,
    value: string | number,
    description: string,
    icon: React.ReactNode,
    trend?: number,
    variant: StatusBadgeVariant = 'default'
  ) => (
    <motion.div variants={itemVariants}>
      <Card className="overflow-hidden">
        <div className={`h-1 bg-${variant}`} />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {trend !== undefined && (
            <div className="flex items-center space-x-1">
              {renderTrendIcon(trend)}
              <span className={trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500'}>
                {formatPercentage(Math.abs(trend))}
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{value}</div>
            <div className="bg-primary/10 p-2 rounded-full">
              {icon}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Generate key insights based on metrics
  const keyInsights = useMemo(() => {
    const insights = [];
    
    // Hypothesis insights
    if (metrics.hypotheses.validationRate > 70) {
      insights.push({
        title: 'Strong Hypothesis Validation',
        description: 'Your hypotheses have a high validation rate, indicating solid product-market fit assumptions.',
        icon: <Lightbulb className="h-4 w-4 text-primary" />
      });
    } else if (metrics.hypotheses.validationRate < 30) {
      insights.push({
        title: 'Hypothesis Refinement Needed',
        description: 'Low validation rate suggests a need to revisit and refine your core assumptions.',
        icon: <Lightbulb className="h-4 w-4 text-primary" />
      });
    }
    
    // Experiment insights
    if (metrics.experiments.successRate > 60) {
      insights.push({
        title: 'Effective Experimentation',
        description: 'Your experiments are yielding valuable results with a high success rate.',
        icon: <Beaker className="h-4 w-4 text-primary" />
      });
    }
    
    // A/B Test insights
    if (metrics.abTests.avgImprovement > 15) {
      insights.push({
        title: 'Significant A/B Test Improvements',
        description: `Your A/B tests are showing an average improvement of ${formatPercentage(metrics.abTests.avgImprovement)}.`,
        icon: <SplitSquareVertical className="h-4 w-4 text-primary" />
      });
    }
    
    // User feedback insights
    if (metrics.userFeedback.positive > metrics.userFeedback.negative * 2) {
      insights.push({
        title: 'Positive User Sentiment',
        description: 'Users are responding positively to your product, with feedback being predominantly favorable.',
        icon: <MessageSquare className="h-4 w-4 text-primary" />
      });
    }
    
    // Overall progress insight
    const completedExperiments = metrics.experiments.completed || 0;
    const completedTests = metrics.abTests.completed || 0;
    const totalCompletedItems = completedExperiments + completedTests + metrics.hypotheses.validated;
    
    if (totalCompletedItems >= 5) {
      insights.push({
        title: 'Comprehensive Validation Approach',
        description: 'You\'re using multiple validation methods, creating a robust validation strategy.',
        icon: <CheckCircle2 className="h-4 w-4 text-primary" />
      });
    }
    
    return insights;
  }, [metrics]);

  const hypothesesChartData = useMemo(() => [
    { name: 'Validated', value: metrics.hypotheses.validated },
    { name: 'Invalidated', value: metrics.hypotheses.invalidated },
    { name: 'In Progress', value: metrics.hypotheses.total - metrics.hypotheses.validated - metrics.hypotheses.invalidated }
  ], [metrics.hypotheses]);

  const experimentChartData = useMemo(() => [
    { name: 'Completed', value: metrics.experiments.completed },
    { name: 'In Progress', value: metrics.experiments.inProgress },
    { name: 'Planned', value: metrics.experiments.total - metrics.experiments.completed - metrics.experiments.inProgress }
  ], [metrics.experiments]);

  const feedbackSentimentData = useMemo(() => [
    { name: 'Positive', value: metrics.userFeedback.positive },
    { name: 'Neutral', value: metrics.userFeedback.neutral },
    { name: 'Negative', value: metrics.userFeedback.negative }
  ], [metrics.userFeedback]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Summary Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Validation Summary</CardTitle>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export report</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share results</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <CardDescription>
            Overall validation progress and key metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Validation Progress</span>
              <span className="font-medium">
                {Math.round((
                  (metrics.hypotheses.validationRate / 100) +
                  (metrics.experiments.successRate / 100) +
                  (metrics.abTests.avgConfidence / 100) +
                  ((metrics.userFeedback.positive / Math.max(1, metrics.userFeedback.total)) || 0)
                ) / 4 * 100)}%
              </span>
            </div>
            <Progress 
              value={Math.round((
                (metrics.hypotheses.validationRate / 100) +
                (metrics.experiments.successRate / 100) +
                (metrics.abTests.avgConfidence / 100) +
                ((metrics.userFeedback.positive / Math.max(1, metrics.userFeedback.total)) || 0)
              ) / 4 * 100)} 
              className="h-2"
            />
          </div>
          
          {/* Key insights */}
          <div className="pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Key Insights</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setExpandedSummary(!expandedSummary)}
                className="h-8 text-xs"
              >
                {expandedSummary ? (
                  <>Show Less <ChevronUp className="ml-1 h-3 w-3" /></>
                ) : (
                  <>Show All <ChevronDown className="ml-1 h-3 w-3" /></>
                )}
              </Button>
            </div>
            
            <div className="grid gap-3">
              <AnimatePresence>
                {keyInsights.slice(0, expandedSummary ? keyInsights.length : 3).map((insight, index) => (
                  <KeyInsight 
                    key={index}
                    title={insight.title}
                    description={insight.description}
                    icon={insight.icon}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderMetricCard(
          'Hypothesis Validation Rate',
          formatPercentage(metrics.hypotheses.validationRate),
          `${metrics.hypotheses.validated} out of ${metrics.hypotheses.total} hypotheses validated`,
          <Lightbulb className="h-5 w-5 text-primary" />,
          metrics.hypotheses.validationRate - 50, // Compare against 50% baseline
          'success'
        )}
        {renderMetricCard(
          'Experiment Success Rate',
          formatPercentage(metrics.experiments.successRate),
          `${metrics.experiments.completed} completed experiments`,
          <Beaker className="h-5 w-5 text-primary" />,
          metrics.experiments.successRate - 70, // Compare against 70% baseline
          'success'
        )}
        {renderMetricCard(
          'A/B Test Improvement',
          formatPercentage(metrics.abTests.avgImprovement),
          `${metrics.abTests.completed} completed tests`,
          <SplitSquareVertical className="h-5 w-5 text-primary" />,
          metrics.abTests.avgImprovement,
          'success'
        )}
        {renderMetricCard(
          'Feedback Sentiment',
          formatPercentage(metrics.userFeedback.positive / Math.max(1, metrics.userFeedback.total) * 100),
          `${metrics.userFeedback.total} pieces of feedback`,
          <MessageSquare className="h-5 w-5 text-primary" />,
          (metrics.userFeedback.positive / Math.max(1, metrics.userFeedback.total) * 100) - 50,
          'success'
        )}
      </div>

      {/* Detailed Analysis Tabs */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center">
            <CardTitle>Detailed Analysis</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                <DropdownMenuItem>Last 30 days</DropdownMenuItem>
                <DropdownMenuItem>Last 90 days</DropdownMenuItem>
                <DropdownMenuItem>All time</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="hypotheses" className="space-y-4">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="hypotheses">Hypotheses</TabsTrigger>
              <TabsTrigger value="experiments">Experiments</TabsTrigger>
              <TabsTrigger value="feedback">User Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="hypotheses" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Hypothesis Status Distribution</CardTitle>
                    <CardDescription>Current state of hypothesis validation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PieChart
                      data={hypothesesChartData}
                      colors={['#10b981', '#f43f5e', '#f59e0b']}
                      className="h-80"
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Validation Progress</CardTitle>
                    <CardDescription>Overall hypothesis validation progress</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Validation Rate</span>
                        <span className="text-sm font-medium">{formatPercentage(metrics.hypotheses.validationRate)}</span>
                      </div>
                      <Progress value={metrics.hypotheses.validationRate} className="h-2" />
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Top Validated Hypotheses</h4>
                      {enhancedData.hypotheses.filter(h => h.status === 'validated').slice(0, 3).map((hypothesis, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">{hypothesis.statement}</p>
                            <p className="text-xs text-muted-foreground">
                              Confidence: {hypothesis.confidence || 0}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="experiments" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Experiment Status Distribution</CardTitle>
                    <CardDescription>Current state of experiments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PieChart
                      data={experimentChartData}
                      colors={['#10b981', '#f59e0b', '#94a3b8']}
                      className="h-80"
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Experiment Metrics</CardTitle>
                    <CardDescription>Key performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Success Rate</span>
                        <span className="text-sm font-medium">{formatPercentage(metrics.experiments.successRate)}</span>
                      </div>
                      <Progress value={metrics.experiments.successRate} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Average Duration</span>
                        <span className="text-sm font-medium">{formatDuration(metrics.experiments.avgDuration)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${Math.min(100, (metrics.experiments.avgDuration / 30) * 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Recent Experiment Results</h4>
                      {enhancedData.experiments.slice(0, 3).map((experiment, index) => (
                        <div key={index} className="flex items-start gap-2">
                          {experiment.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                          ) : (
                            <Beaker className="h-4 w-4 text-amber-500 mt-0.5" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{experiment.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {experiment.status === 'completed' 
                                ? 'Completed' 
                                : experiment.status === 'in-progress' 
                                  ? 'In Progress' 
                                  : 'Planned'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Feedback Sentiment Distribution</CardTitle>
                    <CardDescription>User feedback sentiment analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PieChart
                      data={feedbackSentimentData}
                      colors={['#10b981', '#94a3b8', '#f43f5e']}
                      className="h-80"
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Feedback Analysis</CardTitle>
                    <CardDescription>Key insights from user feedback</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Positive Sentiment</span>
                        <span className="text-sm font-medium">
                          {formatPercentage(metrics.userFeedback.positive / Math.max(1, metrics.userFeedback.total) * 100)}
                        </span>
                      </div>
                      <Progress 
                        value={metrics.userFeedback.positive / Math.max(1, metrics.userFeedback.total) * 100} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Recent User Feedback</h4>
                      {enhancedData.userFeedback.slice(0, 3).map((feedback, index) => (
                        <div key={index} className="flex items-start gap-2">
                          {feedback.sentiment === 'positive' ? (
                            <ThumbsUp className="h-4 w-4 text-green-500 mt-0.5" />
                          ) : feedback.sentiment === 'negative' ? (
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                          ) : (
                            <Minus className="h-4 w-4 text-gray-500 mt-0.5" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{feedback.content.substring(0, 50)}...</p>
                            <p className="text-xs text-muted-foreground">
                              Source: {feedback.source}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <Button variant="outline">
            View Full Report
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// Helper functions with proper typing
function calculateAverageDuration(experiments: EnhancedValidationExperiment[]): number {
  const completedExperiments = experiments.filter(e => 
    e.status === 'completed' && e.start_date && e.end_date
  );
  if (completedExperiments.length === 0) return 0;

  const totalDays = completedExperiments.reduce((sum, exp) => {
    const start = new Date(exp.start_date ?? 0);
    const end = new Date(exp.end_date ?? 0);
    return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }, 0);

  return Math.round(totalDays / completedExperiments.length);
}

function calculateAverageImprovement(abTests: EnhancedValidationABTest[]): number {
  const completedTests = abTests.filter(t => 
    t.status === 'completed' && t.results?.improvement !== undefined
  );
  if (completedTests.length === 0) return 0;

  const totalImprovement = completedTests.reduce((sum, test) => 
    sum + (test.results?.improvement || 0), 0
  );
  return totalImprovement / completedTests.length;
}
