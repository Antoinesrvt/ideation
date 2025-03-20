import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ValidationMetrics, 
  ValidationMilestone,
  ValidationRelationship,
  ValidationInsight,
  ValidationDecision
} from '../types';
import { formatDate } from '@/lib/utils';
import { 
  Award, 
  TrendingUp, 
  Target, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface ValidationProgressDashboardProps {
  metrics: ValidationMetrics;
  milestones: ValidationMilestone[];
  relationships: ValidationRelationship[];
  insights: ValidationInsight[];
  decisions: ValidationDecision[];
  isLoading?: boolean;
}

export function ValidationProgressDashboard({
  metrics,
  milestones,
  relationships,
  insights,
  decisions,
  isLoading = false
}: ValidationProgressDashboardProps) {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [showAllMilestones, setShowAllMilestones] = useState(false);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  // Calculate overall progress
  const totalHypotheses = metrics.hypotheses.total;
  const validatedHypotheses = metrics.hypotheses.validated + metrics.hypotheses.invalidated;
  const hypothesesProgress = totalHypotheses > 0 ? Math.round((validatedHypotheses / totalHypotheses) * 100) : 0;
  
  const totalExperiments = metrics.experiments.total;
  const completedExperiments = metrics.experiments.completed;
  const experimentsProgress = totalExperiments > 0 ? Math.round((completedExperiments / totalExperiments) * 100) : 0;
  
  const totalTests = metrics.abTests.total;
  const completedTests = metrics.abTests.completed;
  const testsProgress = totalTests > 0 ? Math.round((completedTests / totalTests) * 100) : 0;
  
  const overallProgress = Math.round((hypothesesProgress + experimentsProgress + testsProgress) / 3);
  
  // Prepare data for charts
  const statusData = [
    { name: 'Hypotheses', validated: metrics.hypotheses.validated, invalidated: metrics.hypotheses.invalidated, pending: metrics.hypotheses.total - metrics.hypotheses.validated - metrics.hypotheses.invalidated },
    { name: 'Experiments', completed: metrics.experiments.completed, running: metrics.experiments.inProgress, planned: metrics.experiments.total - metrics.experiments.completed - metrics.experiments.inProgress },
    { name: 'A/B Tests', completed: metrics.abTests.completed, running: metrics.abTests.running, planned: metrics.abTests.total - metrics.abTests.completed - metrics.abTests.running },
  ];
  
  const confidenceData = [
    { name: 'High', value: insights.filter(i => i.confidence && i.confidence >= 80).length },
    { name: 'Medium', value: insights.filter(i => i.confidence && i.confidence >= 50 && i.confidence < 80).length },
    { name: 'Low', value: insights.filter(i => i.confidence && i.confidence < 50).length },
  ];
  
  const COLORS = ['#4CAF50', '#FFC107', '#F44336'];
  
  // Sort milestones by date
  const sortedMilestones = [...milestones].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  // Get milestone display count
  const milestonesToShow = showAllMilestones ? sortedMilestones : sortedMilestones.slice(0, 3);
  
  // Calculate achievement badges
  const achievements = [
    {
      id: 'first-hypothesis',
      title: 'First Hypothesis',
      description: 'Created your first hypothesis',
      icon: <Target className="h-5 w-5 text-blue-500" />,
      unlocked: totalHypotheses > 0
    },
    {
      id: 'first-validation',
      title: 'First Validation',
      description: 'Validated your first hypothesis',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      unlocked: metrics.hypotheses.validated > 0
    },
    {
      id: 'experiment-master',
      title: 'Experiment Master',
      description: 'Completed 5 or more experiments',
      icon: <Award className="h-5 w-5 text-amber-500" />,
      unlocked: completedExperiments >= 5
    },
    {
      id: 'data-driven',
      title: 'Data Driven',
      description: 'Completed 3 or more A/B tests',
      icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
      unlocked: completedTests >= 3
    }
  ];
  
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <div className="space-y-6">
      {/* Achievement Badges */}
      {/* {unlockedAchievements.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Your Achievements</h3>
          <div className="flex flex-wrap gap-3">
            {unlockedAchievements.map(achievement => (
              <HoverCard key={achievement.id}>
                <HoverCardTrigger asChild>
                  <motion.div 
                    className="flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1.5 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {achievement.icon}
                    <span className="text-sm font-medium">{achievement.title}</span>
                  </motion.div>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <Badge variant="outline" className="bg-primary/5">Unlocked</Badge>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
            
            {lockedAchievements.length > 0 && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="flex items-center gap-2 bg-muted text-muted-foreground rounded-full px-3 py-1.5 cursor-pointer">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">{lockedAchievements.length} Locked</span>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <h4 className="font-semibold mb-2">Locked Achievements</h4>
                  <ul className="space-y-2">
                    {lockedAchievements.map(achievement => (
                      <li key={achievement.id} className="flex items-start gap-2">
                        <div className="text-muted-foreground mt-0.5">{achievement.icon}</div>
                        <div>
                          <p className="text-sm font-medium">{achievement.title}</p>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </HoverCardContent>
              </HoverCard>
            )}
          </div>
        </div>
      )} */}
      
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Overall Validation Progress
            {overallProgress >= 75 && (
              <Badge variant="success" className="ml-2">
                Advanced
              </Badge>
            )}
            {overallProgress >= 25 && overallProgress < 75 && (
              <Badge variant="warning" className="ml-2">
                In Progress
              </Badge>
            )}
            {overallProgress < 25 && (
              <Badge variant="default" className="ml-2">
                Just Started
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-medium">{overallProgress}%</span>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Progress value={overallProgress} className="h-2" />
              </motion.div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm flex items-center">
                  <Target className="h-4 w-4 mr-1 text-blue-500" />
                  Hypotheses Validated
                </span>
                <span className="text-sm">{validatedHypotheses}/{totalHypotheses}</span>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${hypothesesProgress}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              >
                <Progress value={hypothesesProgress} className="h-2" />
              </motion.div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                  Experiments Completed
                </span>
                <span className="text-sm">{completedExperiments}/{totalExperiments}</span>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${experimentsProgress}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
              >
                <Progress value={experimentsProgress} className="h-2" />
              </motion.div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1 text-purple-500" />
                  A/B Tests Completed
                </span>
                <span className="text-sm">{completedTests}/{totalTests}</span>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${testsProgress}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
              >
                <Progress value={testsProgress} className="h-2" />
              </motion.div>
            </div>
            
            {/* Next steps suggestion */}
            {overallProgress < 100 && (
              <div className="mt-4 p-3 bg-muted/50 rounded-md">
                <h4 className="text-sm font-medium mb-1 flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Suggested Next Steps
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {hypothesesProgress < 50 && (
                    <li className="flex items-center">
                      <div className="w-1 h-1 rounded-full bg-blue-500 mr-2"></div>
                      Create and validate more hypotheses
                    </li>
                  )}
                  {experimentsProgress < 50 && (
                    <li className="flex items-center">
                      <div className="w-1 h-1 rounded-full bg-green-500 mr-2"></div>
                      Design and run more experiments
                    </li>
                  )}
                  {testsProgress < 50 && (
                    <li className="flex items-center">
                      <div className="w-1 h-1 rounded-full bg-purple-500 mr-2"></div>
                      Set up and complete more A/B tests
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Key Metrics & Charts */}
      <Tabs defaultValue="status">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="status">Validation Status</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Validation Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statusData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="validated" stackId="a" fill="#4CAF50" name="Validated" />
                    <Bar dataKey="completed" stackId="a" fill="#4CAF50" name="Completed" />
                    <Bar dataKey="invalidated" stackId="a" fill="#F44336" name="Invalidated" />
                    <Bar dataKey="running" stackId="a" fill="#2196F3" name="Running" />
                    <Bar dataKey="pending" stackId="a" fill="#9E9E9E" name="Pending" />
                    <Bar dataKey="planned" stackId="a" fill="#9E9E9E" name="Planned" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Insights Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                {insights.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={confidenceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {confidenceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No insights recorded yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Validation Timeline</CardTitle>
              {sortedMilestones.length > 3 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAllMilestones(!showAllMilestones)}
                  className="flex items-center"
                >
                  {showAllMilestones ? (
                    <>Show Less <ChevronUp className="ml-1 h-4 w-4" /></>
                  ) : (
                    <>Show All <ChevronDown className="ml-1 h-4 w-4" /></>
                  )}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {milestonesToShow.length > 0 ? (
                <div className="relative pl-6 border-l border-border">
                  {milestonesToShow.map((milestone, index) => (
                    <Collapsible 
                      key={milestone.id} 
                      open={expandedMilestone === milestone.id}
                      onOpenChange={(open) => setExpandedMilestone(open ? milestone.id : null)}
                    >
                      <div className="mb-6 relative">
                        <motion.div 
                          className="absolute -left-9 w-4 h-4 rounded-full bg-primary"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                        />
                        <div className="text-sm text-muted-foreground mb-1 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {milestone.date ? formatDate(milestone.date) : 'No date'}
                          <Badge 
                            variant={
                              milestone.status === 'completed' ? 'success' : 
                              milestone.status === 'in-progress' ? 'warning' : 
                              'outline'
                            } 
                            className="ml-2 text-xs"
                          >
                            {milestone.status}
                          </Badge>
                        </div>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between cursor-pointer">
                            <h4 className="text-base font-medium">{milestone.title}</h4>
                            <Button variant="ghost" size="sm">
                              {expandedMilestone === milestone.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                          <div className="mt-2 flex items-center text-xs text-muted-foreground">
                            <Badge variant="outline" className="mr-2">
                              {milestone.type}
                            </Badge>
                            {milestone.entityId && (
                              <span>ID: {milestone.entityId.substring(0, 8)}...</span>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No milestones recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 