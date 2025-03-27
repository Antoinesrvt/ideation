'use client';

import { useState, useEffect } from 'react';
import { useProjectStore } from '@/store';
import { useProject } from '@/hooks/useProject';
import { JourneyStageCard } from './JourneyStageCard';
import { JourneyHeader } from './JourneyHeader';
import { ProjectInsights } from './ProjectInsights';
import { RecommendedSteps } from './RecommendedSteps';
import { GoNoGoFramework } from './decision-support/GoNoGoFramework';
import { VentureViabilityRadar } from './decision-support/VentureViabilityRadar';
import { DecisionJournal } from './decision-support/DecisionJournal';
import { RiskAssessmentDashboard } from './decision-support/RiskAssessmentDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowRight, 
  RotateCcw, 
  LineChart, 
  Zap, 
  ArrowRightLeft,
  AlertTriangle,
  Network,
  BookOpen,
  BarChart4,
  ArrowLeftRight
} from 'lucide-react';

// Journey stages constants
export const JOURNEY_STAGES = [
  {
    id: 'propose',
    title: 'Propose a Product',
    description: 'Define your initial idea and value proposition',
    tools: ['business-model', 'product-design'],
    recommendedFirst: 'business-model',
    color: '#7209B7',
    dependencies: [], // No dependencies for first stage
    unlocks: ['validity'],
    validationCriteria: [
      { id: 'problem-defined', name: 'Problem clearly defined', threshold: 0.7 },
      { id: 'solution-articulated', name: 'Solution articulated', threshold: 0.6 },
      { id: 'value-proposition', name: 'Value proposition defined', threshold: 0.8 }
    ]
  },
  {
    id: 'validity',
    title: 'Check Validity',
    description: 'Validate your idea with market and user research',
    tools: ['market', 'validation'],
    recommendedFirst: 'market',
    color: '#4361EE',
    dependencies: ['propose'], // Depends on propose stage
    unlocks: ['viability'],
    validationCriteria: [
      { id: 'market-size', name: 'Sufficient market size', threshold: 0.7 },
      { id: 'customer-interviews', name: 'Customer interviews conducted', threshold: 0.8 },
      { id: 'problem-validated', name: 'Problem validated with users', threshold: 0.9 }
    ]
  },
  {
    id: 'viability',
    title: 'Check Viability',
    description: 'Plan your business strategy and financials',
    tools: ['financials', 'team'],
    recommendedFirst: 'financials',
    color: '#4CC9F0',
    dependencies: ['validity'], // Depends on validity stage
    unlocks: ['create'],
    validationCriteria: [
      { id: 'business-model', name: 'Viable business model', threshold: 0.7 },
      { id: 'unit-economics', name: 'Positive unit economics', threshold: 0.6 },
      { id: 'resource-plan', name: 'Resource plan in place', threshold: 0.5 }
    ]
  },
  {
    id: 'create',
    title: 'Create First Product',
    description: 'Develop your MVP and brand identity',
    tools: ['brand', 'documents'],
    recommendedFirst: 'brand',
    color: '#F72585',
    dependencies: ['viability'], // Depends on viability stage
    unlocks: [],
    validationCriteria: [
      { id: 'mvp-defined', name: 'MVP scope defined', threshold: 0.8 },
      { id: 'brand-identity', name: 'Brand identity established', threshold: 0.6 },
      { id: 'dev-plan', name: 'Development plan in place', threshold: 0.7 }
    ]
  },
];

interface JourneyDashboardProps {
  projectId: string;
}

export function JourneyDashboard({ projectId }: JourneyDashboardProps) {
  const { project } = useProject(projectId);
  const {
    currentData,
    isLoading: storeLoading,
    error: storeError,
    setProject,
  } = useProjectStore();

  // State for active stage & tool
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  // State for dependency visualization mode
  const [showDependencies, setShowDependencies] = useState(false);
  
  // State for decision support view
  const [activeDecisionView, setActiveDecisionView] = useState<string | null>(null);
  
  // State for highlighted dependencies
  const [highlightedStage, setHighlightedStage] = useState<string | null>(null);
  
  // Calculate completion for each stage (mock data for now)
  const stageCompletion: Record<string, number> = {
    propose: 75,
    validity: 40,
    viability: 15,
    create: 5,
  };

  // Set the current project in the store when it loads
  useEffect(() => {
    if (project.data && project.data.id) {
      setProject({
        id: project.data.id,
        title: project.data.title,
        description: project.data.description || '',
        owner_id: project.data.owner_id || '',
        created_at: project.data.created_at,
        updated_at: project.data.updated_at,
        is_archived: project.data.is_archived || false,
        industry: project.data.industry || null,
        stage: project.data.stage || null,
        metadata: project.data.metadata || {},
        created_by: project.data.created_by || null
      });
    }
  }, [project.data, setProject]);

  // Handle opening a tool
  const handleOpenTool = (stageId: string, toolId: string) => {
    setActiveStage(stageId);
    setActiveTool(toolId);
    // In a real implementation, would navigate to or open the tool
    console.log(`Opening tool ${toolId} in stage ${stageId}`);
  };

  // Navigate back to journey view
  const handleBackToJourney = () => {
    setActiveStage(null);
    setActiveTool(null);
    setActiveDecisionView(null);
  };
  
  // Toggle dependency visualization
  const toggleDependencies = () => {
    setShowDependencies(!showDependencies);
  };
  
  // Handle stage hover for dependency highlighting
  const handleStageHover = (stageId: string | null) => {
    setHighlightedStage(stageId);
  };
  
  // Open decision support view
  const openDecisionView = (viewId: string) => {
    setActiveDecisionView(viewId);
  };
  
  // Check if a stage should be highlighted based on dependencies
  const shouldHighlightStage = (stageId: string) => {
    if (!highlightedStage) return false;
    
    const highlightedStageObj = JOURNEY_STAGES.find(s => s.id === highlightedStage);
    const currentStageObj = JOURNEY_STAGES.find(s => s.id === stageId);
    
    if (!highlightedStageObj || !currentStageObj) return false;
    
    // Highlight if this stage depends on the highlighted stage
    if (currentStageObj.dependencies.includes(highlightedStage)) return true;
    
    // Highlight if the highlighted stage depends on this stage
    if (highlightedStageObj.dependencies.includes(stageId)) return true;
    
    return false;
  };
  
  // Get dependency status between stages
  const getDependencyStatus = (fromStage: string, toStage: string) => {
    const toStageObj = JOURNEY_STAGES.find(s => s.id === toStage);
    if (!toStageObj) return 'none';
    
    if (toStageObj.dependencies.includes(fromStage)) {
      return stageCompletion[fromStage] >= 70 ? 'fulfilled' : 'pending';
    }
    
    return 'none';
  };
  
  // Check stage dependency status
  const getStageStatus = (stageId: string) => {
    const stage = JOURNEY_STAGES.find(s => s.id === stageId);
    if (!stage) return 'locked';
    
    // If it has no dependencies, it's always available
    if (stage.dependencies.length === 0) return 'available';
    
    // Check if all dependencies are sufficiently completed
    const allDependenciesMet = stage.dependencies.every(
      depId => stageCompletion[depId] >= 50
    );
    
    return allDependenciesMet ? 'available' : 'locked';
  };
  
  // Render decision support content
  const renderDecisionSupport = () => {
    switch (activeDecisionView) {
      case 'go-no-go':
        return <GoNoGoFramework stageId="validity" projectId={projectId} />;
      case 'risk-assessment':
        return <RiskAssessmentDashboard projectId={projectId} />;
      case 'viability-radar':
        return <VentureViabilityRadar projectId={projectId} />;
      case 'decision-journal':
        return <DecisionJournal projectId={projectId} />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => openDecisionView('go-no-go')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Zap className="h-5 w-5 text-amber-500 mr-2" />
                  Go/No-Go Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Evaluate whether your project meets key criteria to proceed to the next phase.
                </p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => openDecisionView('risk-assessment')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Identify and mitigate key risks to your startup success.
                </p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => openDecisionView('viability-radar')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChart4 className="h-5 w-5 text-blue-500 mr-2" />
                  Venture Viability Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Visualize your startup's viability across critical dimensions.
                </p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => openDecisionView('decision-journal')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BookOpen className="h-5 w-5 text-green-500 mr-2" />
                  Decision Journal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Track key decisions and their outcomes over time.
                </p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => openDecisionView('dependency-matrix')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Network className="h-5 w-5 text-purple-500 mr-2" />
                  Dependency Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Visualize how different aspects of your project depend on each other.
                </p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  // Show loading state
  if (project.isLoading || storeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">Loading project journey...</h1>
        </div>
      </div>
    );
  }

  // Show error state
  if (project.error || storeError) {
    const errorMessage = project.error?.toString() || storeError?.toString() || 'Unknown error';
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            <h1 className="text-xl font-bold">Error loading project</h1>
            <p className="mt-2">{errorMessage}</p>
            <Button 
              variant="default" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Make sure we have project data
  if (!project.data || !currentData.project) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
        <div className="text-center">
          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg">
            <h1 className="text-xl font-bold">Project not found</h1>
            <p className="mt-2">The requested project could not be found.</p>
            <Button 
              variant="default" 
              className="mt-4"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get project information from our store
  const projectDetails = currentData.project;

  // Calculate overall progress
  const overallProgress = Object.values(stageCompletion).reduce((sum, val) => sum + val, 0) / 4;
  
  // If decision support view is active
  if (activeDecisionView) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl overflow-y-auto">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <LineChart className="h-5 w-5 mr-2 text-blue-600" />
            Decision Support
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleBackToJourney}
          >
            Back to Journey
          </Button>
        </div>
        
        {renderDecisionSupport()}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl overflow-y-auto">
      <JourneyHeader 
        projectName={projectDetails.title || "Untitled Project"}
        lastEdited={projectDetails.updated_at || ""}
        progress={Math.round(overallProgress)}
      />

      {/* Tab Navigation */}
      <Tabs defaultValue="journey" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="journey">Journey Map</TabsTrigger>
          <TabsTrigger value="decision-support">Decision Support</TabsTrigger>
        </TabsList>
        
        {/* Journey Map Tab */}
        <TabsContent value="journey">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Your Startup Journey</h2>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleDependencies}
                className="gap-2"
              >
                <ArrowLeftRight className="h-4 w-4" />
                {showDependencies ? 'Hide Dependencies' : 'Show Dependencies'}
              </Button>
            </div>
          </div>
          
          {/* Journey Progress Timeline with Dependencies */}
          <div className="relative">
            {/* Dependency Lines (only shown when dependencies are visible) */}
            {showDependencies && (
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full" style={{ position: 'absolute', zIndex: 1 }}>
                  {JOURNEY_STAGES.map((stage, index) => {
                    if (index < JOURNEY_STAGES.length - 1) {
                      const status = getDependencyStatus(stage.id, JOURNEY_STAGES[index + 1].id);
                      if (status !== 'none') {
                        return (
                          <line 
                            key={`${stage.id}-${JOURNEY_STAGES[index + 1].id}`}
                            x1="25%" 
                            y1="50" 
                            x2="75%" 
                            y2="50"
                            stroke={status === 'fulfilled' ? '#10B981' : '#F59E0B'}
                            strokeWidth="2"
                            strokeDasharray={status === 'pending' ? "5,5" : "none"}
                            transform={`translate(${index * 25}%, 0)`}
                          />
                        );
                      }
                    }
                    return null;
                  })}
                </svg>
              </div>
            )}
            
            {/* Stage Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 relative z-10">
              {JOURNEY_STAGES.map((stage, index) => {
                const stageStatus = getStageStatus(stage.id);
                const isHighlighted = highlightedStage === stage.id || 
                                     (showDependencies && highlightedStage && shouldHighlightStage(stage.id));
                
                return (
                  <JourneyStageCard
                    key={stage.id}
                    title={stage.title}
                    description={stage.description}
                    progress={stageCompletion[stage.id]}
                    tools={stage.tools}
                    stageIndex={index + 1}
                    accentColor={stage.color}
                    onToolSelect={(toolId) => handleOpenTool(stage.id, toolId)}
                    recommendedFirst={stage.recommendedFirst}
                    status={stageStatus}
                    isHighlighted={isHighlighted != true ? false : true}
                    onHover={(hovered) => handleStageHover(hovered ? stage.id : null)}
                    dependencies={showDependencies ? stage.dependencies : []}
                    unlocks={showDependencies ? stage.unlocks : []}
                    allStages={JOURNEY_STAGES}
                  />
                );
              })}
            </div>

            {/* Journey Iteration Path */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2">
              <div className="flex-1 mb-3 sm:mb-0">
                <h3 className="font-medium text-gray-800">Iterative Development</h3>
                <p className="text-sm text-gray-600">
                  Startup development is iterative. After creating your first product, you may need to revisit validation as you learn.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="sm:ml-4 gap-2 w-full sm:w-auto"
                onClick={() => console.log('Start iteration')}
              >
                <RotateCcw className="h-4 w-4" />
                Start Iteration
              </Button>
            </div>
          </div>
          
          {/* Insights and Recommended Next Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8 mt-8">
            <div className="lg:col-span-2">
              <ProjectInsights projectId={projectId} />
            </div>
            <div>
              <RecommendedSteps 
                projectId={projectId} 
                stages={JOURNEY_STAGES}
                onStepSelect={handleOpenTool}
              />
            </div>
          </div>
        </TabsContent>
        
        {/* Decision Support Tab */}
        <TabsContent value="decision-support">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center mb-2">
              <LineChart className="h-5 w-5 mr-2 text-blue-600" />
              Decision Support Tools
            </h2>
            <p className="text-gray-600">
              Tools to help you make data-driven decisions throughout your startup journey.
            </p>
          </div>
          
          {renderDecisionSupport()}
        </TabsContent>
      </Tabs>
    </div>
  );
} 