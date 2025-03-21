'use client';

import React, { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { JOURNEY_STAGES } from '../constants';
import { NewJourneyOverview } from './NewJourneyOverview';
import { DataOutputPanel } from './DataOutputPanel';
import { StageProgressTracker } from './StageProgressTracker';
import { 
  ChevronRight,
  HomeIcon,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Types for managing focus
export type FocusType = 'overview' | 'stage' | 'tool' | 'output';

export interface Focus {
  type: FocusType;
  stageId?: string;
  toolId?: string;
  outputId?: string;
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
  
  // Get stage information
  const getCurrentStage = () => {
    if (!focus.stageId) return null;
    return JOURNEY_STAGES.find(stage => stage.id === focus.stageId) || null;
  };
  
  // Get tool information
  const getCurrentTool = () => {
    if (!focus.toolId) return null;
    
    // For a real implementation, you would have a mapping of tool IDs to tool info
    // For now, we'll just create a simple representation
    return {
      id: focus.toolId,
      name: focus.toolId.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    };
  };
  
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
          />
        );
        
      case 'stage':
        if (!focus.stageId) return null;
        const stage = JOURNEY_STAGES.find(s => s.id === focus.stageId);
        if (!stage) return null;
        
        return (
          <div className="p-6">
            <Card>
              <CardHeader 
                className="flex-row items-center justify-between p-4 border-b space-y-0"
                style={{ borderColor: `${stage.color}40` }} // Add transparency to color
              >
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
                  
                  <Separator orientation="vertical" className="h-4" />
                  
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: stage.color }}
                    ></div>
                    <CardTitle className="text-base whitespace-nowrap">
                      {stage.title}
                    </CardTitle>
                  </div>
                </div>
                
                {/* Right side with progress */}
                <div className="text-sm font-medium whitespace-nowrap">
                  {stageProgress[stage.id] || 0}% complété
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <p className="text-gray-700 mb-6 animate-slide-right-in" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>{stage.description}</p>
                    
                    <h2 className="text-xl font-medium mb-4 animate-slide-right-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>Outils disponibles</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {stage.tools.map((toolId, index) => {
                        const toolName = toolId.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ');
                        
                        return (
                          <Card 
                            key={toolId}
                            className="cursor-pointer hover:shadow-md transition-shadow animate-slide-right-in"
                            style={{ 
                              animationDelay: `${0.2 + (index * 0.1)}s`,
                              animationFillMode: 'both'
                            }}
                            onClick={() => handleToolSelect(stage.id, toolId)}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <h3 className="font-medium">{toolName}</h3>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    
                    <h2 className="text-xl font-medium mb-4 mt-6 animate-slide-right-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>Critères de validation</h2>
                    <ul className="list-disc pl-5 space-y-2">
                      {stage.validationCriteria.map((criteria, index) => (
                        <li 
                          key={criteria.id} 
                          className="text-gray-700 animate-slide-left-in"
                          style={{ 
                            animationDelay: `${0.3 + (index * 0.1)}s`,
                            animationFillMode: 'both'
                          }}
                        >
                          {criteria.name} (seuil: {criteria.threshold * 100}%)
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <DataOutputPanel 
                      stageId={stage.id}
                      onViewOutput={handleDataOutputView}
                      className="animate-slide-left-in"
                      style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'tool':
        if (!focus.stageId || !focus.toolId) return null;
        const toolStage = JOURNEY_STAGES.find(s => s.id === focus.stageId);
        if (!toolStage) return null;
        
        // This would normally load the actual tool component
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
                  
                  <Separator orientation="vertical" className="h-4" />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToStage}
                    className="h-8 px-2 flex items-center"
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: toolStage.color }}
                    ></div>
                    <span className="truncate max-w-[120px]">{toolStage.title}</span>
                  </Button>
                  
                  <Separator orientation="vertical" className="h-4" />
                  
                  <CardTitle className="text-base whitespace-nowrap">
                    {focus.toolId.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <h2 className="text-xl font-medium mb-2">Outil: {focus.toolId}</h2>
                    <p className="text-gray-500">
                      Cet outil vous aide à compléter l'étape: {toolStage.title}
                    </p>
                    <p className="text-sm text-gray-400 mt-4">
                      Dans une implémentation réelle, le composant de l'outil serait chargé ici.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
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
        
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-gray-50">
      <div className="container mx-auto py-6">
        <div className={`transition-all duration-300 ${
          transitionDirection === 'forward' 
            ? 'animate-slide-left-in' 
            : 'animate-slide-right-in'
        }`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
} 