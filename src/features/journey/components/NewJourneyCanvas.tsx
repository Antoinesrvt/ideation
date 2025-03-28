'use client';

import React, { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { JOURNEY_STAGES } from '../constants';
import { NewJourneyOverview } from './NewJourneyOverview';
import { DataOutputPanel } from './DataOutputPanel';
import { DecisionSupportHub } from './DecisionSupportHub';
import { 
  ChevronRight,
  HomeIcon,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import StageComponent from './StageComponent';
import MarketTool from './market/MarketTool';
import ToolComponent from './ToolComponent';
import ValidationTool from './validation/ValidationTool';
import { PanelType } from '@/features/common/components/CyclingSidebar';

// Types for managing focus
export type FocusType = 'overview' | 'stage' | 'tool' | 'output' | 'decision-support';

export interface Focus {
  type: FocusType;
  stageId?: string;
  toolId?: string;
  outputId?: string;
  decisionToolId?: string; // New property for decision tools
}

export interface NewJourneyCanvasProps {
  projectId: string;
  initialFocus?: Focus;
}

export function NewJourneyCanvas({ projectId, initialFocus }: NewJourneyCanvasProps) {
  // State for managing the current focus
  const [focus, setFocus] = useState<Focus>(
    initialFocus || { type: 'overview' }
  );
  
  // State for transition animation direction
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  
  // Mock progress data - in a real app, this would come from API/store
  const [stageProgress, setStageProgress] = useState<Record<string, number>>({
    'validate-idea': 40,
    'define-mission': 10,
    'validate-product': 0,
    'generate-docs': 0
  });
  
  // Calculate overall journey progress
  const overallProgress = 
    JOURNEY_STAGES.reduce((acc, stage) => acc + (stageProgress[stage.id] || 0), 0) / 
    (JOURNEY_STAGES.length * 100);
  
  // Handle stage selection
  const handleStageSelect = useCallback((stageId: string) => {
    setTransitionDirection('forward');
    setFocus({
      type: 'stage',
      stageId
    });
  }, []);
  
  // Handle tool selection
  const handleToolSelect = useCallback((stageId: string, toolId: string) => {
    setTransitionDirection('forward');
    setFocus({
      type: 'tool',
      stageId,
      toolId
    });
  }, []);
  
  // Handle data output view
  const handleDataOutputView = useCallback((outputId: string) => {
    setTransitionDirection('forward');
    setFocus({
      type: 'output',
      outputId
    });
  }, []);
  
  // Handle decision support hub open
  const handleDecisionSupportOpen = useCallback((decisionToolId?: string) => {
    setTransitionDirection('forward');
    setFocus({
      type: 'decision-support',
      decisionToolId
    });
  }, []);
  
  // Handle back to overview
  const handleBackToOverview = useCallback(() => {
    setTransitionDirection('backward');
    setFocus({
      type: 'overview'
    });
  }, []);
  
  // Handle back to stage from tool
  const handleBackToStage = useCallback(() => {
    setTransitionDirection('backward');
    setFocus({
      type: 'stage',
      stageId: focus.stageId
    });
  }, [focus.stageId]);
  
  
  // Render content based on current focus
  const renderContent = () => {
    switch (focus.type) {
      case 'overview':
        return (
          <NewJourneyOverview
            projectId={projectId}
            onStageSelect={handleStageSelect}
            onToolSelect={handleToolSelect}
            onDataOutputView={handleDataOutputView}
            onDecisionSupportOpen={handleDecisionSupportOpen}
          />
        );
        
      case 'stage':
        if (!focus.stageId) return null;
        const stage = JOURNEY_STAGES.find(s => s.id === focus.stageId);
        if (!stage) return null;
        
        return (
          <StageComponent
            stage={stage}
            handleToolSelect={handleToolSelect}
            handleDataOutputView={handleDataOutputView}
            handleBackToOverview={handleBackToOverview}
            stageProgress={stageProgress}
          />
        );
        
      case 'tool':
        if (!focus.stageId || !focus.toolId) return null;
        
        // Dummy functions for side panel functionality
        const handleToggleSidePanel = () => console.log('Toggle side panel');
        const handleSidePanelOpen = (panelId: PanelType) => console.log('Open side panel', panelId);
        
        // Render the appropriate tool based on toolId
        switch (focus.toolId) {
          case 'market':
            return (
              <MarketTool
                stageId={focus.stageId}
                toolId={focus.toolId}
                title="Market Analysis"
                onBackToOverview={handleBackToOverview}
                onBackToStage={handleBackToStage}
                onBackToDashboard={handleBackToOverview}
                projectId={projectId}
              />
            );
            
          case 'validation':
            return (
              <ValidationTool
                stageId={focus.stageId}
                toolId={focus.toolId}
                onBackToOverview={handleBackToOverview}
                onBackToStage={handleBackToStage}
                projectId={projectId}
              />
            );
          
          default:
            const toolStage = JOURNEY_STAGES.find(s => s.id === focus.stageId);
            if (!toolStage) return null;
            
            // Default tool rendering using ToolComponent
            return (
              <ToolComponent
                stageId={focus.stageId}
                toolId={focus.toolId}
                title={focus.toolId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                onBackToOverview={handleBackToOverview}
                onBackToStage={handleBackToStage}
              />
            );
        }
        
      case 'output':
        if (!focus.outputId) return null;
        
        // Find the stage that contains this output
        const outputStageId = JOURNEY_STAGES.find(stage => 
          stage.dataOutputs?.some(output => output.id === focus.outputId)
        )?.id;
        
        const outputStage = outputStageId 
          ? JOURNEY_STAGES.find(s => s.id === outputStageId) 
          : null;
        
        // Find the output details
        const outputDetails = outputStage?.dataOutputs?.find(output => 
          output.id === focus.outputId
        );
        
        // This would normally load the actual output data
        // For now, we'll just render a placeholder
        return (
          <div className="p-6">
            <Card>
              <CardHeader className="flex-row items-center justify-between p-4 border-b space-y-0">
                {/* Left side with breadcrumb */}
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleBackToOverview}
                    className="flex-shrink-0"
                    title="Retour au parcours"
                  >
                    <HomeIcon className="h-4 w-4" />
                  </Button>
                  
                  {outputStage && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStageSelect(outputStage.id)}
                        className="h-8 px-2 flex items-center"
                      >
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: outputStage.color }}
                        ></div>
                        <span className="truncate max-w-[120px]">{outputStage.title}</span>
                      </Button>
                    </>
                  )}
                  
                  <Separator orientation="vertical" className="h-4" />
                  
                  <CardTitle className="text-base whitespace-nowrap">
                    {outputDetails?.name || focus.outputId.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <h2 className="text-xl font-medium mb-2">
                      Visualisation des données: {outputDetails?.name || focus.outputId.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </h2>
                    <p className="text-gray-500">
                      Ces données sont le résultat de votre travail sur le parcours entrepreneurial.
                    </p>
                    <p className="text-sm text-gray-400 mt-4">
                      Dans une implémentation réelle, les données seraient affichées ici.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'decision-support':
        return (
          <DecisionSupportHub
            projectId={projectId}
            onBackToOverview={handleBackToOverview}
            initialToolId={focus.decisionToolId}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <ScrollArea className="w-full h-full bg-gray-50">
      <div className="container mx-auto py-6">
        <div className={`transition-all duration-300 ${
          transitionDirection === 'forward' 
            ? 'animate-slide-left-in' 
            : 'animate-slide-right-in'
        }`}>
          {renderContent()}
        </div>
      </div>
    </ScrollArea>
  );
} 