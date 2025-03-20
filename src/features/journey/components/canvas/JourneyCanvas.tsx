'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { JOURNEY_STAGES } from '../../constants';
import { useAnimatedTransition, TransitionType } from './animationUtils';
import { JourneyTimeline } from './JourneyTimeline';
import { JourneyOverview } from './JourneyOverview';
import { StageCanvas } from './StageCanvas';
import { ContextualWidgets } from './ContextualWidgets';
import { 
  getAdaptedJourneyStages,
  getStageWithExpandedTools,
  formatIdToDisplay,
  findStageForTool
} from '../../services/journeyAdapter';
import { 
  ChevronRight,
  HomeIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Types for managing focus
export type FocusType = 'overview' | 'stage' | 'tool';

export interface Focus {
  type: FocusType;
  stageId?: string;
  toolId?: string;
}

export interface JourneyCanvasProps {
  projectId: string;
  initialFocus?: Focus;
}

export default function JourneyCanvas({ projectId, initialFocus }: JourneyCanvasProps) {
  // State for managing the current focus
  const [focus, setFocus, transitionState] = useAnimatedTransition<Focus>(
    initialFocus || { type: 'overview' },
    'fade'
  );
  
  // Get adapted journey stages with proper structure
  const adaptedStages = getAdaptedJourneyStages();
  
  // Transition type for different focus changes
  const [transitionType, setTransitionType] = useState<TransitionType>('fade');
  
  // Always show connections in overview mode (for JourneyOverview's canvas)
  const [showConnections, setShowConnections] = useState(true);
  
  // State for section expansion in the overview
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    insights: true,
    challenges: true,
    progress: true,
    decision: false
  });
  
  // State for active tab in the Action Center
  const [activeTab, setActiveTab] = useState<string>("current");
  
  // Map stage IDs to the proper format for mock data
  const getProgressKey = (stageId: string) => {
    const stageMap: Record<string, string> = {
      'propose': 'propose-product',
      'validity': 'check-validity',
      'viability': 'check-viability',
      'create': 'create-product'
    };
    return stageMap[stageId] || stageId;
  };
  
  // Mock progress data for stages
  const [progress, setProgress] = useState<Record<string, number>>({
    'propose-product': 75,
    'check-validity': 40,
    'check-viability': 15,
    'create-product': 0
  });
  
  // Get progress for a specific stage
  const getStageProgress = useCallback((stageId: string) => {
    return progress[getProgressKey(stageId)] || 0;
  }, [progress]);
  
  // Mock progress data for tools
  const [toolProgress, setToolProgress] = useState<Record<string, number>>({
    'dependency_matrix': 100,
    'venture_viability_radar': 60,
    'go_no_go_framework': 30,
    'decision_journal': 0,
    'business-model': 80,
    'product-design': 70,
    'market': 40,
    'validation': 20,
    'financials': 30,
    'team': 10,
    'brand': 0,
    'documents': 0
  });
  
  // Handle stage selection
  const handleStageSelect = useCallback((stageId: string) => {
    setTransitionType('slide-left');
    setFocus({
      type: 'stage',
      stageId
    });
  }, [setFocus]);
  
  // Handle tool selection
  const handleToolSelect = useCallback((stageId: string, toolId: string) => {
    setTransitionType('slide-left');
    setFocus({
      type: 'tool',
      stageId,
      toolId
    });
  }, [setFocus]);
  
  // Return to journey overview
  const handleBackToJourney = useCallback(() => {
    setTransitionType('slide-right');
    setFocus({
      type: 'overview'
    });
  }, [setFocus]);
  
  // Return to stage from tool
  const handleBackToStage = useCallback(() => {
    setTransitionType('slide-right');
    setFocus({
      type: 'stage',
      stageId: focus.stageId
    });
  }, [focus.stageId, setFocus]);
  
  // Toggle section expansion in the overview
  const handleToggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);
  
  // Check stage dependency status
  const getStageStatus = useCallback((stageId: string): 'available' | 'locked' | 'completed' => {
    const stage = JOURNEY_STAGES.find((s: any) => s.id === stageId);
    if (!stage) return 'locked';
    
    // If stage is completed
    if (getStageProgress(stageId) >= 100) return 'completed';
    
    // If all dependencies are completed, the stage is available
    if (stage.dependencies.length === 0) return 'available';
    
    const dependenciesMet = stage.dependencies.every((depId: string) => {
      return getStageProgress(depId) > 0;
    });
    
    if (dependenciesMet) return 'available';
    
    // If dependencies are not met, it's locked
    return 'locked';
  }, [getStageProgress]);
  
  // Check the status of a dependency between two stages
  const getDependencyStatus = useCallback((fromStage: string, toStage: string): 'fulfilled' | 'pending' | 'none' => {
    // Check if fromStage is a dependency of toStage
    const stage = JOURNEY_STAGES.find((s: any) => s.id === toStage);
    if (!stage || !stage.dependencies.includes(fromStage)) return 'none';
    
    const fromProgress = getStageProgress(fromStage);
    
    if (fromProgress >= 100) return 'fulfilled';
    if (fromProgress > 0) return 'pending';
    return 'pending';
  }, [getStageProgress]);

  // Main content based on focus
  const renderContent = () => {
    const transitionClasses = `transition-all duration-300 ${
      transitionState === 'entering' ? 'opacity-0 opacity-100' : 
      transitionState === 'exiting' ? 'opacity-100 opacity-0' : ''
    }`;
    
    // Main content based on focus type
    switch (focus.type) {
      case 'overview':
        return (
          <div className={`${transitionClasses} space-y-6`}>
            {/* Use the enhanced JourneyOverview component */}
            <JourneyOverview 
              stages={adaptedStages}
              progress={progress}
              toolProgress={toolProgress}
              onStageSelect={handleStageSelect}
              onToolSelect={handleToolSelect}
              showConnections={showConnections}
            />
          </div>
        );
        
      case 'stage':
        const stageWithTools = focus.stageId 
          ? getStageWithExpandedTools(focus.stageId)
          : null;
        
        if (!stageWithTools) return <div>Stage not found</div>;
        
        return (
          <div className={transitionClasses}>
            <StageCanvas 
              stage={stageWithTools}
              progress={progress}
              toolProgress={toolProgress}
              onBack={handleBackToJourney}
              onToolSelect={(toolId: string) => handleToolSelect(stageWithTools.id, toolId)}
            />
          </div>
        );
        
      case 'tool':
        // In a real implementation, this would render the specific tool component
        // based on the toolId, either directly or via a dynamic import
        return (
          <div className={transitionClasses}>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-blue-100 rounded-full">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold mb-2">
                  {formatIdToDisplay(focus.toolId || '')}
                </h2>
                <p className="text-gray-500 mb-8">
                  This tool would be loaded dynamically based on the toolId.
                </p>
                
                <div className="flex justify-center">
                  <Button
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      // Simulate progress update when using the tool
                      setToolProgress(prev => ({
                        ...prev,
                        [focus.toolId!]: Math.min(100, (prev[focus.toolId!] || 0) + 20)
                      }));
                      
                      // Update stage progress
                      if (focus.stageId) {
                        setProgress(prev => {
                          const key = getProgressKey(focus.stageId!);
                          return {
                            ...prev,
                            [key]: Math.min(100, (prev[key] || 0) + 10)
                          };
                        });
                      }
                      
                      handleBackToStage();
                    }}
                  >
                    Complete Task & Return
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Invalid focus state</div>;
    }
  };
  
  // Render enhanced breadcrumb navigation
  const renderBreadcrumb = () => {
    if (focus.type === 'overview') return null;
    
    return (
      <nav className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToJourney}
            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            <HomeIcon className="h-4 w-4" />
            <span>Journey Overview</span>
          </Button>
          
          {focus.type === 'tool' && focus.stageId && (
            <>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToStage}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span>{adaptedStages.find(s => s.id === focus.stageId)?.title}</span>
              </Button>
              
              <ChevronRight className="h-4 w-4 text-gray-400" />
              
              <span className="text-gray-900 font-medium">
                {formatIdToDisplay(focus.toolId || '')}
              </span>
            </>
          )}
          
          {focus.type === 'stage' && focus.stageId && (
            <>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              
              <span className="text-gray-900 font-medium">
                {adaptedStages.find(s => s.id === focus.stageId)?.title}
              </span>
            </>
          )}
        </div>
      </nav>
    );
  };
  
  return (
    <div className="flex h-full overflow-hidden">
      {/* Main content area with flexible layout */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Enhanced breadcrumb navigation */}
        {renderBreadcrumb()}
        
        {/* Main content with optimized padding */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          {renderContent()}
        </div>
      </div>
      
      {/* Contextual widgets sidebar */}
      <ContextualWidgets 
        focus={focus}
        stageProgress={progress}
        toolProgress={toolProgress}
      />
    </div>
  );
} 