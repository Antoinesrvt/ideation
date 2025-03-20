import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  HelpCircle,
  Lightbulb,
  Beaker,
  SplitSquareVertical,
  MessageSquare,
  PieChart,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ValidationJourneyMap } from './ValidationJourneyMap';
import { ValidationPhaseContent } from './ValidationPhaseContent';
import { ValidationProgressDashboard } from './ValidationProgressDashboard';
import { ResultsDashboard } from './ResultsDashboard';
import { ValidationGuidance } from './ValidationGuidance';
import { WizardContextPanel } from './WizardContextPanel';
import { ValidationPhase, EnhancedValidationData, ValidationMetrics } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ValidationWizardProps {
  activePhase: string;
  phases: ValidationPhase[];
  data: EnhancedValidationData;
  metrics: ValidationMetrics;
  relationships: any[];
  insights: any[];
  decisions: any[];
  milestones: any[];
  isLoading: boolean;
  onPhaseChange: (phaseId: string) => void;
  onAddItem: (type: string, data: any) => void;
  onUpdateItem: (id: string, data: any) => void;
  onDeleteItem: (type: string, id: string) => void;
  onOpenForm: (type: string) => void;
  projectId: string;
}

export function ValidationWizard({
  activePhase,
  phases,
  data,
  metrics,
  relationships,
  insights,
  decisions,
  milestones,
  isLoading,
  onPhaseChange,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onOpenForm,
  projectId
}: ValidationWizardProps) {
  const [showGuidance, setShowGuidance] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(true);
  
  // Check if this is the first time using validation
  const isFirstTimeUser = 
    data.hypotheses.length === 0 &&
    data.experiments.length === 0 &&
    data.abTests.length === 0 &&
    data.userFeedback.length === 0;
  
  // Show guidance automatically for first-time users
  useEffect(() => {
    if (isFirstTimeUser) {
      setShowGuidance(true);
    }
  }, [isFirstTimeUser]);
  
  // Get the current phase object
  const currentPhase = phases.find(phase => phase.id === activePhase);
  
  // Get the next and previous phases
  const currentPhaseIndex = phases.findIndex(phase => phase.id === activePhase);
  const previousPhase = currentPhaseIndex > 0 ? phases[currentPhaseIndex - 1] : null;
  const nextPhase = currentPhaseIndex < phases.length - 1 ? phases[currentPhaseIndex + 1] : null;
  
  // Handle navigation
  const handleNext = () => {
    if (nextPhase) {
      onPhaseChange(nextPhase.id);
    }
  };
  
  const handlePrevious = () => {
    if (previousPhase) {
      onPhaseChange(previousPhase.id);
    }
  };
  
  // Get context-aware action based on active phase
  const getContextAction = () => {
    switch (activePhase) {
      case 'hypothesize':
        return {
          label: 'Create Experiment from Hypothesis',
          action: () => onOpenForm('experiment')
        };
      case 'experiment':
        return {
          label: 'Create A/B Test from Experiment',
          action: () => onOpenForm('abTest')
        };
      case 'test':
        return {
          label: 'Add User Feedback for Test',
          action: () => onOpenForm('userFeedback')
        };
      case 'feedback':
        return {
          label: 'Add New Feedback',
          action: () => onOpenForm('userFeedback')
        };
      default:
        return null;
    }
  };
  
  const contextAction = getContextAction();
  
  // Calculate overall progress
  const completedPhases = phases.filter(phase => phase.isCompleted).length;
  const totalPhases = phases.length;
  const overallProgress = Math.round((completedPhases / totalPhases) * 100);
  
  // Get phase-specific related items
  const getRelatedItems = () => {
    switch (activePhase) {
      case 'hypothesize':
        return {
          title: 'Related Experiments',
          items: data.experiments.filter(exp => 
            data.hypotheses.some(h => h.id === exp.hypothesis)
          ).slice(0, 3),
          type: 'experiments',
          emptyMessage: 'No experiments linked to hypotheses yet'
        };
      case 'experiment':
        return {
          title: 'Related A/B Tests',
          items: data.abTests.filter(test => 
            data.experiments.some(e => e.id === test.experimentId)
          ).slice(0, 3),
          type: 'abTests',
          emptyMessage: 'No A/B tests linked to experiments yet'
        };
      case 'test':
        return {
          title: 'Related User Feedback',
          items: data.userFeedback.filter(feedback => 
            feedback.entityType === 'abTest' && 
            data.abTests.some(test => test.id === feedback.entityId)
          ).slice(0, 3),
          type: 'feedback',
          emptyMessage: 'No user feedback linked to A/B tests yet'
        };
      case 'feedback':
        return {
          title: 'Supported Hypotheses',
          items: data.hypotheses.filter(hypothesis =>
            data.userFeedback.some(feedback => 
              feedback.entityType === 'hypothesis' && 
              feedback.entityId === hypothesis.id
            )
          ).slice(0, 3),
          type: 'hypotheses',
          emptyMessage: 'No hypotheses linked to feedback yet'
        };
      default:
        return {
          title: 'Related Items',
          items: [],
          type: 'none',
          emptyMessage: 'No related items'
        };
    }
  };
  
  const relatedItems = getRelatedItems();
  
  // Get phase-specific tips
  const getPhaseTips = () => {
    switch (activePhase) {
      case 'hypothesize':
        return [
          'Focus on specific, testable assumptions',
          'Link hypotheses to user problems or needs',
          'Prioritize hypotheses by potential impact'
        ];
      case 'experiment':
        return [
          'Keep experiments simple and focused',
          'Define clear success metrics',
          'Consider both qualitative and quantitative data'
        ];
      case 'test':
        return [
          'Test one variable at a time',
          'Ensure statistical significance',
          'Document all test conditions'
        ];
      case 'feedback':
        return [
          'Ask open-ended questions',
          'Look for patterns across responses',
          'Follow up on unexpected insights'
        ];
      case 'overview':
        return [
          'Review your validation progress',
          'Identify gaps in your validation process',
          'Plan your next validation activities'
        ];
      case 'results':
        return [
          'Look for patterns across all validation data',
          'Identify validated and invalidated hypotheses',
          'Use insights to inform product decisions'
        ];
      default:
        return [];
    }
  };
  
  return (
    <div className="flex flex-col space-y-6 h-full w-full">
      {/* Enhanced journey visualization */}
      <div className="pb-4">
        <ValidationJourneyMap
          currentPhase={activePhase}
          phases={phases}
          onPhaseChange={onPhaseChange}
        /> 
      </div>
      
      {/* Wizard content area with context panel */}
      <div className="flex gap-6 pt-2">
        {/* Main content area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePhase}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activePhase === 'overview' ? (
                <ValidationProgressDashboard
                  metrics={metrics}
                  milestones={milestones}
                  relationships={relationships}
                  insights={insights}
                  decisions={decisions}
                  isLoading={isLoading}
                />
              ) : activePhase === 'results' ? (
                <ResultsDashboard 
                  data={{
                    hypotheses: data.hypotheses,
                    experiments: data.experiments.map(exp => ({
                      ...exp,
                      results: exp.results ? JSON.stringify(exp.results) : null,
                      metrics: exp.metrics ? JSON.stringify(exp.metrics) : null
                    })),
                    abTests: data.abTests.map(test => ({
                      ...test,
                      results: test.results ? JSON.stringify(test.results) : null
                    })),
                    userFeedback: data.userFeedback.map(feedback => ({
                      ...feedback,
                      analysis: feedback.analysis ? JSON.stringify(feedback.analysis) : null
                    }))
                  }}
                  isLoading={isLoading} 
                />
              ) : (
                <ValidationPhaseContent
                  activePhase={activePhase}
                  data={data}
                  onAddItem={onAddItem}
                  onUpdateItem={onUpdateItem}
                  onDeleteItem={onDeleteItem}
                  onOpenForm={onOpenForm}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Context panel */}
        {showContextPanel && (
          <motion.div 
            className="w-80 flex-shrink-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <WizardContextPanel
              activePhase={activePhase}
              phaseTips={getPhaseTips()}
              relatedItems={relatedItems}
              onOpenForm={onOpenForm}
              onPhaseChange={onPhaseChange}
              onToggle={() => setShowContextPanel(!showContextPanel)}
            />
          </motion.div>
        )}
      </div>
      
      {/* Action bar */}
      <Card className="mt-4">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={!previousPhase}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {previousPhase ? previousPhase.name : 'Back'}
            </Button>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowGuidance(true)}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show validation guide</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowContextPanel(!showContextPanel)}
                  >
                    {showContextPanel ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showContextPanel ? 'Hide' : 'Show'} context panel</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex items-center gap-2">
            {contextAction && (
              <Button
                variant="default"
                onClick={contextAction.action}
              >
                {contextAction.label}
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={!nextPhase}
            >
              {nextPhase ? nextPhase.name : 'Finish'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* First-time user empty state */}
      {isFirstTimeUser && activePhase === 'overview' && (
        <div className="bg-muted/30 rounded-lg p-6 text-center mt-4">
          <h3 className="text-lg font-medium mb-2">Welcome to Validation!</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            This is where you'll validate your product ideas through hypotheses,
            experiments, A/B tests, and user feedback.
          </p>
          <Button onClick={() => setShowGuidance(true)}>
            Learn How Validation Works
          </Button>
        </div>
      )}
      
      {/* Guidance modal */}
      <ValidationGuidance
        open={showGuidance}
        onClose={() => setShowGuidance(false)}
      />
    </div>
  );
} 