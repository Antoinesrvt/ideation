'use client';

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
  CheckCircle, 
  Clock, 
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
  ChevronDown,
  FileText,
  PieChart,
  Grid,
  Database,
  Palette,
  FileCode,
  UserPlus,
  BookOpen,
  GitFork,
  Network
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { JOURNEY_STAGES } from '../constants';
import { DataOutputPanel } from './DataOutputPanel';
import { StageProgressTracker } from './StageProgressTracker';
import { DECISION_TOOLS } from './DecisionSupportHub';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NewJourneyOverviewProps {
  onStageSelect: (stageId: string) => void;
  onToolSelect: (stageId: string, toolId: string) => void;
  onDataOutputView: (outputId: string) => void;
  onDecisionSupportOpen: (toolId?: string) => void;
  projectId: string;
}

export function NewJourneyOverview({
  onStageSelect,
  onToolSelect,
  onDataOutputView,
  onDecisionSupportOpen,
  projectId
}: NewJourneyOverviewProps) {
  // Mock progress data - in a real app, this would come from API/store
  const [stageProgress, setStageProgress] = useState<Record<string, number>>({
    'validate-idea': 40,
    'define-mission': 10,
    'validate-product': 0,
    'generate-docs': 0
  });
  
  const [toolProgress, setToolProgress] = useState<Record<string, number>>({
    'market': 60,
    'validation': 20,
    'business-model': 30,
    'brand': 10,
    'product-design': 0,
    'documents': 0,
    'financials': 0,
    'team': 0
  });
  
  // Current selected stage
  const [activeStage, setActiveStage] = useState<string>(JOURNEY_STAGES[0].id);
  
  // Toggle for expanded sections
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    journey: true,
    outputs: true,
    tools: true,
    next: true,
    decision: true
  });
  
  // Calculate overall journey progress
  const overallProgress = 
    JOURNEY_STAGES.reduce((acc, stage) => acc + (stageProgress[stage.id] || 0), 0) / 
    (JOURNEY_STAGES.length * 100);
  
  // Helper function to toggle section expansion
  const toggleSection = (section: string) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Handle stage selection
  const handleStageSelect = (stageId: string) => {
    setActiveStage(stageId);
    onStageSelect(stageId);
  };
  
  // Get tool icon based on tool ID
  const getToolIcon = (toolId: string) => {
    const toolIcons: Record<string, JSX.Element> = {
      'market': <PieChart className="h-4 w-4" />,
      'validation': <CheckCircle className="h-4 w-4" />,
      'business-model': <Grid className="h-4 w-4" />,
      'brand': <Palette className="h-4 w-4" />,
      'product-design': <FileCode className="h-4 w-4" />,
      'documents': <FileText className="h-4 w-4" />,
      'financials': <BarChart2 className="h-4 w-4" />,
      'team': <UserPlus className="h-4 w-4" />
    };
    
    return toolIcons[toolId] || <ChevronRight className="h-4 w-4" />;
  };
  
  // Get next recommended stage and tool
  const getNextRecommendations = () => {
    // Find first incomplete stage
    const incompleteStage = JOURNEY_STAGES.find(
      stage => (stageProgress[stage.id] || 0) < 100
    );
    
    if (!incompleteStage) return null;
    
    // Find tool with lowest progress in that stage
    const stageTool = incompleteStage.tools.find(
      toolId => (toolProgress[toolId] || 0) < 100
    );
    
    if (!stageTool) return null;
    
    return {
      stageId: incompleteStage.id,
      stage: incompleteStage,
      toolId: stageTool
    };
  };
  
  const nextRecommendation = getNextRecommendations();

  return (
    <div className="grid grid-cols-3 gap-6 h-full">
      {/* Left Column: Progress and Journey Overview */}
      <div className="col-span-2 space-y-6">
        {/* Journey Progress Section */}
        <Card>
          <CardHeader className="pb-2 border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-semibold">Parcours Entrepreneurial</CardTitle>
                <CardDescription>
                  Progression globale: {Math.round(overallProgress * 100)}%
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => toggleSection('journey')}
                className="h-8 px-2"
              >
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${expanded.journey ? '' : 'transform rotate-180'}`} 
                />
              </Button>
            </div>
          </CardHeader>
          
          {expanded.journey && (
            <CardContent className="pt-4">
              <StageProgressTracker 
                stageProgress={stageProgress} 
                currentStageId={activeStage}
                onStageClick={handleStageSelect}
              />
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                {JOURNEY_STAGES.map((stage, index) => {
                  const stageComplete = (stageProgress[stage.id] || 0) === 100;
                  const isActiveStage = activeStage === stage.id;
                  
                  return (
                    <Card
                      key={stage.id}
                      className={cn(
                        "cursor-pointer border overflow-hidden transition-all duration-200 animate-slide-left-in",
                        isActiveStage
                          ? "shadow-md ring-1 ring-offset-2 transform scale-[1.02]"
                          : "hover:shadow-md hover:translate-y-[-2px]",
                        stageComplete && "bg-green-50/30"
                      )}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        animationFillMode: "both",
                        borderLeftWidth: "4px",
                        ...(isActiveStage
                          ? {
                              ringColor: stage.color,
                              borderLeftColor: stage.color,
                            }
                          : {}),
                      }}
                      onClick={() => onStageSelect(stage.id)}
                    >
                      <div className="relative">
                        {/* Stage number badge */}
                        <div
                          className="absolute top-3 right-3 h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold"
                          style={{
                            backgroundColor: `${stage.color}15`,
                            color: stage.color,
                          }}
                        >
                          {index + 1}
                        </div>

                        {/* Stage content */}
                        <CardHeader className="pt-5 pb-2">
                          <div className="flex items-start gap-3">
                            {/* Color indicator and icon */}
                            <div className="mt-0.5 flex-shrink-0">
                              <div
                                className={cn(
                                  "h-5 w-1 rounded-full",
                                  stageComplete ? "bg-green-500" : ""
                                )}
                                style={{
                                  backgroundColor: stageComplete
                                    ? undefined
                                    : stage.color,
                                }}
                              />
                            </div>

                            {/* Title and description */}
                            <div className="space-y-1 flex-1">
                              <h3
                                className={cn(
                                  "font-medium text-base transition-colors",
                                  isActiveStage
                                    ? "text-gray-900"
                                    : "text-gray-700"
                                )}
                              >
                                {stage.title}
                              </h3>
                              {/* <p className="text-sm text-gray-500 line-clamp-2">
                                {stage.description}
                              </p> */}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0 pb-4">
                          <div className="mt-2">
                            <div className="flex justify-between items-center mb-1.5 text-xs">
                              <div className="flex items-center mt-3 text-xs text-gray-500">
                                <div className="flex -space-x-1.5 mr-2">
                                  {stage.tools.slice(0, 3).map((tool, idx) => (
                                    <div
                                      key={tool}
                                      className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center bg-gray-100"
                                      style={{ zIndex: 3 - idx }}
                                    >
                                      {getToolIcon(tool)}
                                    </div>
                                  ))}
                                </div>
                                <span>
                                  {stage.tools.length} outil
                                  {stage.tools.length > 1 ? "s" : ""}
                                </span>
                              </div>
                              <span
                                className={cn(
                                  "font-bold",
                                  stageComplete
                                    ? "text-green-600"
                                    : isActiveStage
                                    ? "text-black"
                                    : "text-gray-600"
                                )}
                              >
                                {stageProgress[stage.id] || 0}%
                              </span>
                            </div>

                            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="absolute left-0 top-0 h-full transition-all duration-700 ease-out rounded-full"
                                style={{
                                  width: `${stageProgress[stage.id] || 0}%`,
                                  backgroundColor: stageComplete
                                    ? "#10b981"
                                    : stage.color,
                                }}
                              />
                            </div>

                            {/* Tool count indicator */}
                          
                          </div>
                        </CardContent>

                        {/* Status indicator */}
                        {stageComplete && (
                          <div className="absolute top-0 right-0 p-1.5 bg-green-500 transform rotate-45 translate-x-[18px] translate-y-[-18px]">
                            <CheckCircle className="h-3 w-3 text-white transform -rotate-45" />
                          </div>
                        )}

                        {/* Next active indicator */}
                        {!stageComplete && isActiveStage && (
                          <div className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
        
        {/* Tools for Current Stage */}
        <Card>
          <CardHeader className="pb-2 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold">
                Outils pour {JOURNEY_STAGES.find(s => s.id === activeStage)?.title}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => toggleSection('tools')}
                className="h-8 px-2"
              >
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${expanded.tools ? '' : 'transform rotate-180'}`} 
                />
              </Button>
            </div>
          </CardHeader>
          
          {expanded.tools && (
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                {JOURNEY_STAGES.find(s => s.id === activeStage)?.tools.map((toolId, index) => {
                  const toolName = toolId.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ');
                  
                  const toolComplete = (toolProgress[toolId] || 0) === 100;
                  
                  return (
                    <Card 
                      key={toolId}
                      className={cn(
                        "overflow-hidden hover:bg-gray-50 transition-colors cursor-pointer animate-slide-right-in",
                        toolComplete && "bg-green-50 hover:bg-green-50"
                      )}
                      style={{ 
                        animationDelay: `${index * 0.1}s`,
                        animationFillMode: 'both'
                      }}
                      onClick={() => onToolSelect(activeStage, toolId)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <div className="mr-3 p-2 bg-gray-100 rounded-md">
                              {getToolIcon(toolId)}
                            </div>
                            <div>
                              <h3 className="font-medium">{toolName}</h3>
                              <Progress 
                                value={toolProgress[toolId] || 0} 
                                className="h-1 mt-2 w-24"
                              />
                            </div>
                          </div>
                          <ArrowUpRight 
                            className={cn(
                              "h-5 w-5 text-gray-400",
                              toolComplete && "text-green-500"
                            )} 
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
      
      {/* Right Column: Data Outputs and Next Steps */}
      <div className="space-y-6">
        {/* Data Outputs Panel */}
        {/* <Card>
          <CardHeader className="pb-2 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold">Données du projet</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => toggleSection('outputs')}
                className="h-8 px-2"
              >
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${expanded.outputs ? '' : 'transform rotate-180'}`} 
                />
              </Button>
            </div>
          </CardHeader>
          
          {expanded.outputs && (
            <CardContent className="p-0 pt-4">
              <DataOutputPanel 
                stageId={activeStage}
                onViewOutput={onDataOutputView}
                className="border-0 shadow-none"
              />
            </CardContent>
          )}
        </Card> */}
        
        {/* Decision Support Tools */}
        <Card className="animate-slide-right-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <CardHeader className="pb-2 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold">Outils d'aide à la décision</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => toggleSection('decision')}
                className="h-8 px-2"
              >
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${expanded.decision ? '' : 'transform rotate-180'}`} 
                />
              </Button>
            </div>
          </CardHeader>
          
          {expanded.decision && (
            <CardContent className="pt-4">
              <div className="text-gray-600 mb-3 text-sm">
                Des outils puissants pour guider vos décisions stratégiques à chaque étape de votre parcours.
              </div>
              <div className="space-y-3">
                {DECISION_TOOLS.slice(0, 3).map((tool, index) => (
                  <div 
                    key={tool.id}
                    className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-between animate-slide-right-in"
                    style={{ 
                      animationDelay: `${0.4 + index * 0.1}s`,
                      animationFillMode: 'both'
                    }}
                    onClick={() => onDecisionSupportOpen(tool.id)}
                  >
                    <div className="flex items-center">
                      <div className="p-2 rounded-md mr-3" style={{ backgroundColor: tool.colorLight, color: tool.color }}>
                        {tool.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{tool.name}</h3>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-3 animate-slide-right-in"
                style={{ 
                  animationDelay: '0.7s',
                  animationFillMode: 'both'
                }}
                onClick={() => onDecisionSupportOpen()}
              >
                Voir tous les outils d'aide à la décision
              </Button>
            </CardContent>
          )}
        </Card>
        
        {/* Next Recommended Steps */}
        {nextRecommendation && (
          <Card>
            <CardHeader className="pb-2 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-semibold">Prochaines étapes</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleSection('next')}
                  className="h-8 px-2"
                >
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform ${expanded.next ? '' : 'transform rotate-180'}`} 
                  />
                </Button>
              </div>
            </CardHeader>
            
            {expanded.next && (
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 animate-slide-right-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                    <div className="p-2 bg-blue-50 text-blue-500 rounded-md">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Concentration actuelle</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Votre priorité est de progresser dans {nextRecommendation.stage.title}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg animate-slide-right-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                    <h3 className="font-medium mb-2">Action recommandée</h3>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: nextRecommendation.stage.color }}
                      ></div>
                      <p className="text-sm">{nextRecommendation.stage.title}</p>
                    </div>
                    <div className="pl-5 mt-2">
                      <div className="flex items-center gap-2 mt-1">
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                        <p className="text-sm">
                          Utiliser l'outil {nextRecommendation.toolId.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      className="mt-3 w-full"
                      onClick={() => onToolSelect(nextRecommendation.stageId, nextRecommendation.toolId)}
                    >
                      Continuer <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>
    </div>
  );
} 