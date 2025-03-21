import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ExternalLink, 
  ChevronRight, 
  Lightbulb, 
  ArrowRight, 
  LightbulbIcon, 
  PanelTop, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Trophy,
  AlertTriangle,
  ArrowUpRight,
  Users,
  BarChart2,
  Target,
  MapPin,
  Flag,
  Flame,
  TrendingUp,
  Zap,
  Info,
  PlusCircle,
  ChevronDown
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { JourneyTimeline } from './JourneyTimeline';
import { Badge } from '@/components/ui/badge';

interface JourneyOverviewProps {
  stages: Array<{
    id: string;
    title: string;
    description: string;
    color: string;
    dependencies: string[];
    unlocks: string[];
    tools: Array<{
      id: string; 
      title: string;
      description: string;
    }>;
    recommendedFirst?: boolean;
  }>;
  progress: Record<string, number>;
  toolProgress: Record<string, number>;
  onStageSelect: (stageId: string) => void;
  onToolSelect: (stageId: string, toolId: string) => void;
  showConnections: boolean;
}

// Define types for challenges and milestones
interface Challenge {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface Milestone {
  title: string;
  description: string;
  icon: React.ReactNode;
  date: string;
}

interface BusinessInsight {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function JourneyOverview({
  stages,
  progress,
  toolProgress,
  onStageSelect,
  onToolSelect,
  showConnections
}: JourneyOverviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeStage, setActiveStage] = useState<string | undefined>(undefined);
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    insights: true,
    challenges: true,
    progress: true,
    decision: false
  });
  const [activeTab, setActiveTab] = useState<string>("current");
  
  // Helper function to toggle section expansion
  const toggleSection = (section: string) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Get recommended starting point
  const recommendedStage = stages.find(stage => stage.recommendedFirst) || stages[0];

  // Calculate overall journey progress
  const overallProgress = 
    stages.reduce((acc, stage) => acc + (progress[stage.id] || 0), 0) / 
    (stages.length || 1);
  
  // Determine next actions based on progress
  const incompleteStages = stages.filter(
    stage => (progress[stage.id] || 0) < 100
  ).sort((a, b) => (progress[b.id] || 0) - (progress[a.id] || 0));
  
  const nextStage = incompleteStages[0];
  
  // Find a tool that's not complete
  const getNextRecommendedTool = () => {
    if (!nextStage) return null;
    
    for (const tool of nextStage.tools) {
      if ((toolProgress[tool.id] || 0) < 100) {
        return {
          stageId: nextStage.id,
          tool
        };
      }
    }
    
    return null;
  };
  
  const nextTool = getNextRecommendedTool();
  
  // Get the stage with the highest progress as "current focus"
  const getCurrentFocusStage = () => {
    let highestProgressStage = stages[0];
    let highestProgress = progress[highestProgressStage.id] || 0;
    
    for (const stage of stages) {
      const stageProgress = progress[stage.id] || 0;
      if (stageProgress > 0 && stageProgress > highestProgress && stageProgress < 100) {
        highestProgress = stageProgress;
        highestProgressStage = stage;
      }
    }
    
    return highestProgressStage;
  };
  
  // Helper to get stage status based on progress
  const getStageStatus = (stageId: string): 'available' | 'locked' | 'completed' => {
    const stageProgress = progress[stageId] || 0;
    
    if (stageProgress >= 100) return 'completed';
    
    // Check if dependencies are met
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return 'locked';
    
    const dependenciesMet = stage.dependencies.every(depId => 
      (progress[depId] || 0) > 0
    );
    
    // If dependencies are met and there's some progress, or dependencies are met and it's the next stage to work on
    return dependenciesMet ? 'available' : 'locked';
  };
  
  // Dependency status check
  const getDependencyStatus = (fromStage: string, toStage: string): 'fulfilled' | 'pending' | 'none' => {
    // Check if fromStage is a dependency of toStage
    const stage = stages.find((s) => s.id === toStage);
    if (!stage || !stage.dependencies.includes(fromStage)) return 'none';
    
    const fromProgress = progress[fromStage] || 0;
    
    if (fromProgress >= 100) return 'fulfilled';
    if (fromProgress > 0) return 'pending';
    return 'pending';
  };
  
  // Return an array of milestone achievements
  const getMilestones = (): Milestone[] => {
    const milestones: Milestone[] = [];
    
    // Add a milestone for completing the first stage
    if ((progress[stages[0]?.id] || 0) >= 100) {
      milestones.push({
        title: "First Stage Completed",
        description: `You've completed the '${stages[0]?.title}' stage!`,
        icon: <Trophy className="h-5 w-5 text-amber-500" />,
        date: "2 days ago"
      });
    }
    
    // Add a milestone for reaching 50% overall progress
    if (overallProgress >= 0.5) {
      milestones.push({
        title: "Halfway There!",
        description: "You're halfway through your entrepreneurial journey",
        icon: <Trophy className="h-5 w-5 text-amber-500" />,
        date: "1 week ago"
      });
    }
    
    // Add stage-specific milestones
    stages.forEach(stage => {
      const stageProgress = progress[stage.id] || 0;
      if (stageProgress >= 100) {
        milestones.push({
          title: `${stage.title} Completed`,
          description: `You've completed all tasks in this stage`,
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          date: "Recently"
        });
      }
    });
    
    return milestones.slice(0, 3); // Limit to 3 milestones
  };
  
  // Get potential challenges or bottlenecks
  const getChallenges = (): Challenge[] => {
    const challenges: Challenge[] = [];
    
    // Check for stages with dependencies that are not progressing
    stages.forEach(stage => {
      const stageProgress = progress[stage.id] || 0;
      
      // If this stage has minimal progress but its dependents need it
      if (stageProgress < 30 && stage.unlocks.length > 0) {
        // Check if any dependent stage has started
        const dependentStages = stages.filter(s => s.dependencies.includes(stage.id));
        if (dependentStages.some(s => (progress[s.id] || 0) > 0)) {
          challenges.push({
            title: `${stage.title} Bottleneck`,
            description: `Low progress is blocking dependent stages`,
            icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
            action: {
              label: "Focus Here",
              onClick: () => onStageSelect(stage.id)
            }
          });
        }
      }
    });
    
    // Check for uneven progress across stage tools
    stages.forEach(stage => {
      const stageProgress = progress[stage.id] || 0;
      
      if (stageProgress > 0 && stageProgress < 100) {
        // Get tool progress for this stage
        const toolProgressValues = stage.tools.map(tool => ({
          tool,
          progress: toolProgress[tool.id] || 0
        }));
        
        // Check for imbalanced tool progress
        const maxToolProgress = Math.max(...toolProgressValues.map(t => t.progress));
        const minToolProgress = Math.min(...toolProgressValues.map(t => t.progress));
        
        if (maxToolProgress > 50 && minToolProgress < 20 && toolProgressValues.length > 1) {
          // There's an imbalance - find the lagging tool
          const laggingTool = toolProgressValues.find(t => t.progress === minToolProgress)?.tool;
          
          if (laggingTool) {
            challenges.push({
              title: `Uneven Progress in ${stage.title}`,
              description: `${laggingTool.title} needs attention`,
              icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
              action: {
                label: "Work on This",
                onClick: () => onToolSelect(stage.id, laggingTool.id)
              }
            });
          }
        }
      }
    });
    
    return challenges.slice(0, 2); // Limit to 2 challenges
  };
  
  // Get business insights based on progress
  const getBusinessInsights = (): BusinessInsight[] => {
    if (overallProgress < 0.2) {
      // Early stages - focus on idea validation
      return [
        {
          title: "Focus on Problem Validation",
          description: "Ensure you're solving a real problem before building a solution",
          icon: <Target className="h-10 w-10 text-purple-500" />
        },
        {
          title: "Talk to Potential Customers",
          description: "Conduct at least 10 interviews to validate your assumptions",
          icon: <Users className="h-10 w-10 text-blue-500" />
        }
      ];
    } else if (overallProgress < 0.5) {
      // Mid stages - focus on market and validation
      return [
        {
          title: "Define Your Target Market",
          description: "Narrow down your customer segments for better focus",
          icon: <Target className="h-10 w-10 text-blue-500" />
        },
        {
          title: "Test Your Value Proposition",
          description: "Ensure your solution delivers clear value to customers",
          icon: <CheckCircle className="h-10 w-10 text-green-500" />
        }
      ];
    } else if (overallProgress < 0.8) {
      // Later stages - focus on business model and scaling
      return [
        {
          title: "Refine Your Business Model",
          description: "Ensure you have sustainable revenue streams and unit economics",
          icon: <BarChart2 className="h-10 w-10 text-amber-500" />
        },
        {
          title: "Prepare for Launch",
          description: "Focus on go-to-market strategy and launch planning",
          icon: <Flame className="h-10 w-10 text-orange-500" />
        }
      ];
    } else {
      // Final stages - focus on growth and scaling
      return [
        {
          title: "Plan for Growth",
          description: "Develop strategies for customer acquisition and retention",
          icon: <TrendingUp className="h-10 w-10 text-green-500" />
        },
        {
          title: "Secure Resources",
          description: "Ensure you have the team and funding needed for growth",
          icon: <Users className="h-10 w-10 text-purple-500" />
        }
      ];
    }
  };
  
  // Toggle connections visibility
  const toggleConnections = () => {
    // This is just a placeholder since showConnections is now always true
    // and controlled by the parent
  };
  
  // New function to calculate estimated time to complete a stage or tool
  const getEstimatedTime = (stageId: string, toolId?: string): string => {
    // In a real implementation, this would be based on historical data
    // For now, we'll use simple logic based on progress
    
    if (toolId) {
      const toolProgressValue = toolProgress[toolId] || 0;
      if (toolProgressValue >= 80) return "~10-15 min";
      if (toolProgressValue >= 50) return "~30-45 min";
      if (toolProgressValue >= 20) return "~1-2 hours";
      return "~2-3 hours";
    }
    
    const stageProgressValue = progress[stageId] || 0;
    if (stageProgressValue >= 80) return "~1-2 hours";
    if (stageProgressValue >= 50) return "~3-5 hours";
    if (stageProgressValue >= 20) return "~5-8 hours";
    return "~8-10 hours";
  };
  
  // Enhanced JourneyInsights component with progressive disclosure
  const JourneyInsights = () => {
    const insights = getBusinessInsights();
    
    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-amber-500">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <Lightbulb className="h-5 w-5 text-amber-500 mr-2" />
              Entrepreneurial Insights
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => toggleSection('insights')}
            >
              {expanded.insights ? <ChevronDown className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
            </Button>
          </div>
          <CardDescription>
            Strategic guidance tailored to your current position
          </CardDescription>
        </CardHeader>
        
        {expanded.insights && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 p-4 rounded-lg flex items-start space-x-4 transform transition-all hover:scale-[1.02] hover:shadow-sm cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    {insight.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-base mb-1">{insight.title}</h3>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };
  
  // Enhanced component to consolidate current focus and recommended actions
  const ActionCenter = () => {
    const currentFocusStage = getCurrentFocusStage();
    const recommendedTool = getNextRecommendedTool();
    const milestones: Milestone[] = getMilestones();
    const challenges: Challenge[] = getChallenges();
    
    // Calculate progress metrics for better reporting
    const stagesStarted = stages.filter(stage => (progress[stage.id] || 0) > 0).length;
    const stagesCompleted = stages.filter(stage => (progress[stage.id] || 0) >= 100).length;
    const totalTools = stages.reduce((acc, stage) => acc + stage.tools.length, 0);
    const toolsStarted = Object.keys(toolProgress).filter(key => toolProgress[key] > 0).length;
    
    return (
      <>
        {/* Action Center with tabs for context switching */}
        <Card className="shadow-md border-t-4 border-t-[#7209B7]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <Zap className="h-5 w-5 text-[#7209B7] mr-2" />
                Action Center
              </CardTitle>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">The Action Center shows your most important tasks and suggestions based on your current progress.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="current" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full mb-4" variant="pills">
                <TabsTrigger value="current">Current Focus</TabsTrigger>
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
                <TabsTrigger value="challenges" className="relative">
                  Challenges
                  {challenges.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      {challenges.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            
              <TabsContent value="current" className="mt-0 space-y-4 animate-fadeIn">
                <div className="flex items-start gap-4">
                  {/* Stage info */}
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${currentFocusStage.color}30` }}
                  >
                    <span className="text-xl font-bold" style={{ color: currentFocusStage.color }}>
                      {stages.findIndex(s => s.id === currentFocusStage.id) + 1}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{currentFocusStage.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{currentFocusStage.description}</p>
                    
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm font-medium">{progress[currentFocusStage.id] || 0}%</span>
                      </div>
                      <Progress 
                        value={progress[currentFocusStage.id] || 0} 
                        className="h-2" 
                        indicatorClassName="bg-gradient-to-r"
                        style={{ 
                          '--tw-gradient-from': `${currentFocusStage.color}80`,
                          '--tw-gradient-to': currentFocusStage.color
                        } as React.CSSProperties}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Tools in the current stage */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Tools & Activities</h4>
                  <div className="space-y-2">
                    {currentFocusStage.tools.map(tool => (
                      <div 
                        key={tool.id}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => onToolSelect(currentFocusStage.id, tool.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div 
                              className="w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: currentFocusStage.color }}
                            />
                            <span className="font-medium">{tool.title}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {toolProgress[tool.id] || 0}%
                          </span>
                        </div>
                        <div className="mt-1 flex justify-between items-center">
                          <p className="text-xs text-gray-500">{tool.description}</p>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Clock className="h-4 w-4 text-gray-400 ml-2" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Estimated time: {getEstimatedTime(currentFocusStage.id, tool.id)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button 
                    className="flex-1" 
                    onClick={() => onStageSelect(currentFocusStage.id)}
                    style={{ 
                      backgroundColor: currentFocusStage.color,
                      color: 'white'
                    }}
                  >
                    Continue Working
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="recommended" className="mt-0 space-y-4 animate-fadeIn">
                {recommendedTool ? (
                  <>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Next Best Action</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Based on your progress, we recommend focusing on:
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${nextStage.color}20` }}
                          >
                            <span className="text-base font-bold" style={{ color: nextStage.color }}>
                              {stages.findIndex(s => s.id === nextStage.id) + 1}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="font-medium text-lg">{recommendedTool.tool.title}</h4>
                            <Badge 
                              variant="outline" 
                              className="ml-2 text-xs"
                              style={{ 
                                borderColor: nextStage.color,
                                color: nextStage.color
                              }}
                            >
                              {nextStage.title}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1">{recommendedTool.tool.description}</p>
                          
                          <div className="mt-3 mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-500">Current progress</span>
                              <span className="text-xs font-medium">{toolProgress[recommendedTool.tool.id] || 0}%</span>
                            </div>
                            <Progress 
                              value={toolProgress[recommendedTool.tool.id] || 0} 
                              className="h-1.5" 
                              indicatorClassName="bg-gradient-to-r"
                              style={{ 
                                '--tw-gradient-from': `${nextStage.color}80`,
                                '--tw-gradient-to': nextStage.color
                              } as React.CSSProperties}
                            />
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 mt-2">
                            <Clock className="h-4 w-4 mr-1.5" />
                            <span>Estimated time: {getEstimatedTime(nextStage.id, recommendedTool.tool.id)}</span>
                          </div>
                          
                          {/* Context-aware tips */}
                          {(recommendedTool.tool.id === 'business-model' || 
                            recommendedTool.tool.id === 'market' || 
                            recommendedTool.tool.id === 'validation') && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-md">
                              <div className="flex items-start">
                                <LightbulbIcon className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                                <div className="text-sm text-blue-800">
                                  {recommendedTool.tool.id === 'business-model' && (
                                    <>Focus on clearly defining your unique value proposition and target customer segments.</>
                                  )}
                                  {recommendedTool.tool.id === 'market' && (
                                    <>Conduct thorough market research to validate your assumptions about market size and competition.</>
                                  )}
                                  {recommendedTool.tool.id === 'validation' && (
                                    <>Create a simple MVP to test with real customers before investing in full development.</>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Button 
                          className="w-full" 
                          onClick={() => onToolSelect(recommendedTool.stageId, recommendedTool.tool.id)}
                        >
                          Start Working on This
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <CheckCircle className="h-12 w-12 mb-3 text-green-500" />
                    <h3 className="text-xl font-medium text-gray-800">Great Work!</h3>
                    <p className="text-gray-600 mt-2">
                      You're making good progress across all your active work. 
                      Choose any incomplete stage to continue your journey.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="challenges" className="mt-0 space-y-4 animate-fadeIn">
                {challenges.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Challenges Detected</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            We've identified some potential issues that might be slowing your progress:
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {challenges.map((challenge, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg border border-amber-200 shadow-sm">
                        <div className="flex items-start gap-3">
                          {challenge.icon}
                          <div className="flex-1">
                            <h4 className="font-medium">{challenge.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {challenge.description}
                            </p>
                            
                            {challenge.action && (
                              <Button 
                                variant="outline"
                                size="sm" 
                                className="mt-3 border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
                                onClick={challenge.action.onClick}
                              >
                                {challenge.action.label}
                                <ArrowRight className="h-3 w-3 ml-1.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <CheckCircle className="h-12 w-12 mb-3 text-green-500" />
                    <h3 className="text-xl font-medium text-gray-800">No Challenges Detected</h3>
                    <p className="text-gray-600 mt-2">
                      Your progress looks balanced with no bottlenecks or issues. 
                      Great work maintaining momentum across all areas!
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Progress Overview with enhanced visualization */}
        <Card className="shadow-sm hover:shadow transition-shadow mt-6 border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                Journey Progress
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => toggleSection("progress")}
              >
                {expanded.progress ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <PlusCircle className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>

          {expanded.progress && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Radar chart style progress visualization */}
                <div className="flex justify-center items-center">
                  <div className="relative w-48 h-48">
                    {/* Circular progress indicator with gradient */}
                    <div className="absolute inset-0 rounded-full bg-blue-50 flex items-center justify-center">
                      <div
                        className="text-center flex flex-col items-center justify-center"
                        style={{ zIndex: 2 }}
                      >
                        <span className="text-3xl font-bold text-blue-600">
                          {Math.round(overallProgress * 100)}%
                        </span>
                        <span className="text-xs text-blue-500 mt-1">
                          Overall progress
                        </span>
                      </div>

                      {/* Progress circle */}
                      <svg className="absolute inset-0" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#e6effd"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="url(#blue-gradient)"
                          strokeWidth="8"
                          strokeDasharray={Math.PI * 90}
                          strokeDashoffset={
                            Math.PI * 90 * (1 - overallProgress)
                          }
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                        <defs>
                          <linearGradient
                            id="blue-gradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                          >
                            <stop offset="0%" stopColor="#4CC9F0" />
                            <stop offset="100%" stopColor="#3A86FF" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* Stage indicators positioned around the circle */}
                    {stages.map((stage, index) => {
                      const angle = (index * 2 * Math.PI) / stages.length;
                      const x = 50 + 62 * Math.cos(angle - Math.PI / 2);
                      const y = 50 + 62 * Math.sin(angle - Math.PI / 2);
                      const stageProgress = progress[stage.id] || 0;

                      return (
                        <div
                          key={stage.id}
                          className="absolute flex items-center justify-center rounded-full border-2 w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            backgroundColor: "white",
                            borderColor: stage.color,
                            color: stage.color,
                          }}
                          onClick={() => onStageSelect(stage.id)}
                        >
                          {stageProgress >= 100 ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <span className="text-xs font-bold">
                              {index + 1}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress details */}
                <div className="flex flex-col justify-center">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Journey Stats
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-gray-50 rounded-md">
                          <div className="text-xl font-bold text-blue-600">
                            {stagesStarted} / {stages.length}
                          </div>
                          <div className="text-xs text-gray-500">
                            Stages started
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <div className="text-xl font-bold text-green-600">
                            {stagesCompleted}
                          </div>
                          <div className="text-xs text-gray-500">
                            Stages completed
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <div className="text-xl font-bold text-purple-600">
                            {toolsStarted} / {totalTools}
                          </div>
                          <div className="text-xs text-gray-500">
                            Tools utilized
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <div className="text-xl font-bold text-amber-600">
                            {challenges.length > 0 ? challenges.length : "0"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Active challenges
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stage progress badges */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Stage Progress
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {stages.map((stage, index) => {
                          const stageProgress = progress[stage.id] || 0;
                          return (
                            <Badge
                              key={stage.id}
                              variant="outline"
                              className="cursor-pointer transition-all hover:shadow-sm"
                              style={{
                                borderColor:
                                  stageProgress > 0
                                    ? stage.color
                                    : "rgba(203, 213, 225, 1)",
                                color:
                                  stageProgress > 0
                                    ? stage.color
                                    : "rgb(100, 116, 139)",
                                backgroundColor:
                                  stageProgress >= 100
                                    ? `${stage.color}10`
                                    : "transparent",
                              }}
                              onClick={() => onStageSelect(stage.id)}
                            >
                              {index + 1}. {stage.title}: {stageProgress}%
                              {stageProgress >= 100 && (
                                <CheckCircle className="h-3 w-3 ml-1 inline-block" />
                              )}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones section */}
              {milestones.length > 0 && (
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-medium mb-3 flex items-center">
                    <Trophy className="h-4 w-4 text-amber-500 mr-1.5" />
                    Recent Achievements
                  </h3>
                  <div className="space-y-2">
                    {milestones.map((milestone, index) => (
                      <div
                        key={index}
                        className="p-3 bg-green-50 border border-green-100 rounded-md"
                      >
                        <div className="flex items-start gap-3">
                          {milestone.icon}
                          <div>
                            <h4 className="font-medium">{milestone.title}</h4>
                            <p className="text-xs text-green-800 mt-0.5">
                              {milestone.description}
                            </p>
                            <div className="text-xs text-gray-500 mt-1">
                              {milestone.date}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Decision Support Panel - conditionally shown when appropriate */}
        {overallProgress > 0.3 && (
          <Card className="shadow-sm hover:shadow transition-shadow mt-6 border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <PanelTop className="h-5 w-5 text-purple-500 mr-2" />
                  Decision Support
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => toggleSection("decision")}
                >
                  {expanded.decision ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <PlusCircle className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <CardDescription>
                Tools to help you make data-driven decisions
              </CardDescription>
            </CardHeader>

            {expanded.decision && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className="p-4 rounded-md cursor-pointer border border-gray-200 hover:border-purple-200 hover:bg-purple-50 transition-colors transform hover:scale-[1.02]"
                    onClick={() =>
                      onToolSelect("viability", "venture_viability_radar")
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Venture Viability Radar</h3>
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-emerald-600"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z" />
                          <path d="M2 12h20" />
                          <path d="M12 2v20" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Assess your venture's viability across key dimensions
                    </p>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="w-full">
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              {(toolProgress["venture_viability_radar"] || 0) >
                              0
                                ? "Last updated 2 days ago"
                                : "Not started yet"}
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-purple-500" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            Best used when evaluating the overall viability of
                            your business idea
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div
                    className="p-4 rounded-md cursor-pointer border border-gray-200 hover:border-purple-200 hover:bg-purple-50 transition-colors"
                    onClick={() =>
                      onToolSelect("validity", "go_no_go_framework")
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Go/No-Go Framework</h3>
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-blue-600"
                        >
                          <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                          <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                          <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                          <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                          <path d="m9 15 3-3 3 3" />
                          <path d="M12 12v6" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Make data-driven decisions at critical points
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {(toolProgress["go_no_go_framework"] || 0) > 0
                          ? "Last updated 5 days ago"
                          : "Not started yet"}
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-purple-500" />
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-md cursor-pointer border border-gray-200 hover:border-purple-200 hover:bg-purple-50 transition-colors"
                    onClick={() => onToolSelect("overview", "decision_journal")}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Decision Journal</h3>
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-purple-600"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <path d="M14 2v6h6" />
                          <path d="M16 13H8" />
                          <path d="M16 17H8" />
                          <path d="M10 9H8" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Document and learn from your key decisions
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {(toolProgress["decision_journal"] || 0) > 0
                          ? "3 decisions recorded"
                          : "Start recording decisions"}
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-purple-500" />
                    </div>
                  </div>
                </div>

                {overallProgress > 0.5 && (
                  <div className="w-full p-3 bg-purple-50 rounded-md text-sm mt-4">
                    <div className="flex items-start gap-3">
                      <LightbulbIcon className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-purple-800 mb-1">
                          Pro Tip: Use decision support tools at major
                          inflection points
                        </p>
                        <p className="text-xs text-purple-700">
                          Consider using the Go/No-Go Framework before
                          committing significant resources to development.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )}
      </>
    );
  };
  
  // Initialize canvas context
  useEffect(() => {
    // Set up canvas dimensions
    const updateDimensions = () => {
      if (typeof window !== 'undefined') {
        setWindowDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  // Use the JourneyTimeline component for visualizing the journey
  return (
    <div className="space-y-6 animate-fadeIn">
      <JourneyTimeline 
        stages={stages}
        activeStage={activeStage}
        onStageSelect={onStageSelect}
        progress={progress}
        showConnections={showConnections}
        toggleConnections={toggleConnections}
        getStageStatus={getStageStatus}
        getDependencyStatus={getDependencyStatus}
      />
      
      <ActionCenter />
      
      <JourneyInsights />
    </div>
  );
} 