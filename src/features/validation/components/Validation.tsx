import React, { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useValidation } from '@/hooks/features/useValidation';
import { useProjectStore } from '@/store';
import { useToast } from '@/components/ui/use-toast';
import { ValidationWizard } from './ValidationWizard';
import { ValidationGuidance } from './ValidationGuidance';
import { EnhancedHypothesisForm } from './forms/EnhancedHypothesisForm';
import { EnhancedExperimentForm } from './forms/EnhancedExperimentForm';
import { EnhancedABTestForm } from './forms/EnhancedABTestForm';
import { EnhancedUserFeedbackForm } from './forms/EnhancedUserFeedbackForm';
import { 
  transformValidationData, 
  calculateValidationMetrics, 
  mapDatabaseRelationships,
  mapDatabaseInsights,
  mapDatabaseDecisions,
  mapDatabaseMilestones
} from '../utils';
import { ValidationPhase } from '../types';

export function Validation() {
  const { toast } = useToast();
  const { currentData } = useProjectStore();
  
  // State for project ID
  const [projectId, setProjectId] = useState<string>('');
  
  // Set project ID from currentData or URL
  useEffect(() => {
    // First try to get from context/store
    if (currentData?.project?.id) {
      setProjectId(currentData.project.id);
    } else {
      // Fallback to URL params
      const urlParams = new URLSearchParams(window.location.search);
      const projectIdFromUrl = urlParams.get('projectId');
      
      if (projectIdFromUrl) {
        setProjectId(projectIdFromUrl);
      }
    }
  }, [currentData]);
  
  // State for guidance visibility
  const [showGuidance, setShowGuidance] = useState(false);
  
  // Get validation data
  const {
    data: validationData,
    isLoading,
    error,
    addExperiment,
    updateExperiment,
    deleteExperiment,
    addABTest,
    updateABTest,
    deleteABTest,
    addUserFeedback,
    updateUserFeedback,
    deleteUserFeedback,
    addHypothesis,
    updateHypothesis,
    deleteHypothesis,
    getRelationships,
    addRelationship,
    updateRelationship,
    deleteRelationship,
    getInsights,
    addInsight,
    updateInsight,
    deleteInsight,
    getDecisions,
    addDecision,
    updateDecision,
    deleteDecision,
    getMilestones,
    addMilestone,
    updateMilestone,
    deleteMilestone
  } = useValidation(projectId || undefined);
  
  // State for form visibility
  const [hypothesisFormOpen, setHypothesisFormOpen] = useState(false);
  const [experimentFormOpen, setExperimentFormOpen] = useState(false);
  const [abTestFormOpen, setABTestFormOpen] = useState(false);
  const [userFeedbackFormOpen, setUserFeedbackFormOpen] = useState(false);
  
  // State for active phase
  const [activePhase, setActivePhase] = useState("hypothesize");
  
  // Transform validation data
  const enhancedData = useMemo(() => {
    if (!validationData) return null;
    return transformValidationData(validationData);
  }, [validationData]);
  
  // Get relationships, insights, decisions, and milestones
  const relationships = useMemo(() => {
    if (!projectId) return [];
    const relationshipsData = getRelationships();
    return mapDatabaseRelationships(relationshipsData || []);
  }, [projectId, getRelationships]);
  
  const insights = useMemo(() => {
    if (!projectId) return [];
    const insightsData = getInsights();
    return mapDatabaseInsights(insightsData || []);
  }, [projectId, getInsights]);
  
  const decisions = useMemo(() => {
    if (!projectId) return [];
    const decisionsData = getDecisions();
    return mapDatabaseDecisions(decisionsData || []);
  }, [projectId, getDecisions]);
  
  const milestones = useMemo(() => {
    if (!projectId) return [];
    const milestonesData = getMilestones();
    return mapDatabaseMilestones(milestonesData || []);
  }, [projectId, getMilestones]);
  
  // Calculate metrics
  const metrics = useMemo(() => {
    if (!enhancedData) return null;
    return calculateValidationMetrics(enhancedData);
  }, [enhancedData]);
  
  // Check if this is the first time using validation
  const isFirstTimeUser = useMemo(() => {
    if (!validationData) return false;
    return (
      validationData.hypotheses.length === 0 &&
      validationData.experiments.length === 0 &&
      validationData.abTests.length === 0 &&
      validationData.userFeedback.length === 0
    );
  }, [validationData]);
  
  // Show guidance automatically for first-time users
  useMemo(() => {
    if (isFirstTimeUser) {
      setShowGuidance(true);
    }
  }, [isFirstTimeUser]);
  
  // Define validation phases
  const phases: ValidationPhase[] = useMemo(() => [
    {
      id: 'overview',
      name: 'Overview',
      description: 'See your validation progress and key metrics',
      icon: 'chart',
      order: 0,
      isActive: true,
      isCompleted: false
    },
    {
      id: 'hypothesize',
      name: 'Hypotheses',
      description: 'Define what you believe to be true about your product and market',
      icon: 'lightbulb',
      order: 1,
      isActive: true,
      isCompleted: validationData?.hypotheses.length > 0
    },
    {
      id: 'experiment',
      name: 'Experiments',
      description: 'Design and run experiments to test your hypotheses',
      icon: 'beaker',
      order: 2,
      isActive: validationData?.hypotheses.length > 0,
      isCompleted: validationData?.experiments.length > 0
    },
    {
      id: 'test',
      name: 'A/B Tests',
      description: 'Create variations to optimize your product',
      icon: 'split',
      order: 3,
      isActive: validationData?.experiments.length > 0,
      isCompleted: validationData?.abTests.length > 0
    },
    {
      id: 'feedback',
      name: 'User Feedback',
      description: 'Collect and analyze feedback from real users',
      icon: 'message',
      order: 4,
      isActive: true,
      isCompleted: validationData?.userFeedback.length > 0
    },
    {
      id: 'results',
      name: 'Results',
      description: 'Analyze your validation results',
      icon: 'chart',
      order: 5,
      isActive: true,
      isCompleted: false
    }
  ], [validationData]);
  
  // Handle phase change
  const handlePhaseChange = (phaseId: string) => {
    setActivePhase(phaseId);
  };
  
  // Handle form open
  const handleOpenForm = (formType: string) => {
    switch (formType) {
      case 'hypothesis':
        setHypothesisFormOpen(true);
        break;
      case 'experiment':
        setExperimentFormOpen(true);
        break;
      case 'abTest':
        setABTestFormOpen(true);
        break;
      case 'userFeedback':
        setUserFeedbackFormOpen(true);
        break;
      default:
        break;
    }
  };
  
  // Handle form submissions
  const handleAddItem = async (type: string, item: any) => {
    try {
      let result;
      
      switch (type) {
        case 'hypothesis':
          result = await addHypothesis(item);
      toast({
            title: "Hypothesis added",
            description: "Your hypothesis has been added successfully."
      });
          break;
        case 'experiment':
          result = await addExperiment(item);
      toast({
            title: "Experiment added",
            description: "Your experiment has been added successfully."
          });
          break;
        case 'abTest':
          result = await addABTest(item);
      toast({
            title: "A/B Test added",
            description: "Your A/B test has been added successfully."
      });
          break;
        case 'userFeedback':
          result = await addUserFeedback(item);
      toast({
            title: "User Feedback added",
            description: "Your user feedback has been added successfully."
          });
          break;
        default:
          break;
      }
      
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error adding the item.",
        variant: "destructive"
      });
      return null;
    }
  };
  
  const handleUpdateItem = async (id: string, item: any) => {
    try {
      let result;
      
      switch (activePhase) {
        case 'hypothesize':
          result = await updateHypothesis({ id, data: item });
          toast({
            title: "Hypothesis updated",
            description: "Your hypothesis has been updated successfully."
          });
          break;
        case 'experiment':
          result = await updateExperiment({ id, data: item });
      toast({
            title: "Experiment updated",
            description: "Your experiment has been updated successfully."
      });
          break;
        case 'test':
          result = await updateABTest({ id, data: item });
      toast({
            title: "A/B Test updated",
            description: "Your A/B test has been updated successfully."
          });
          break;
        case 'feedback':
          result = await updateUserFeedback({ id, data: item });
      toast({
        title: "User Feedback updated",
            description: "Your user feedback has been updated successfully."
          });
          break;
        default:
          break;
      }
      
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating the item.",
        variant: "destructive"
      });
      return null;
    }
  };
  
  const handleDeleteItem = async (type: string, id: string): Promise<boolean> => {
    try {
      let result;
      
      switch (type) {
        case 'hypothesis':
          result = await deleteHypothesis(id);
      toast({
            title: "Hypothesis deleted",
            description: "Your hypothesis has been deleted successfully."
      });
          break;
        case 'experiment':
          result = await deleteExperiment(id);
      toast({
            title: "Experiment deleted",
            description: "Your experiment has been deleted successfully."
          });
          break;
        case 'abTest':
          result = await deleteABTest(id);
      toast({
            title: "A/B Test deleted",
            description: "Your A/B test has been deleted successfully."
      });
          break;
        case 'userFeedback':
          result = await deleteUserFeedback(id);
      toast({
            title: "User Feedback deleted",
            description: "Your user feedback has been deleted successfully."
          });
          break;
        default:
          return false;
      }
      
      return result !== undefined ? !!result : false;
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error deleting the item.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }
  
  // Error state
  if (error || !validationData || !enhancedData || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h3 className="text-lg font-medium mb-2">Error Loading Validation Data</h3>
        <p className="text-muted-foreground mb-4">
          {error?.message || "Please select a project to view validation data."}
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8 h-full w-full">
      {isFirstTimeUser && (
        <div className="bg-muted/30 rounded-lg p-6 text-center">
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

      {/* Forms */}
      <EnhancedHypothesisForm
        open={hypothesisFormOpen}
        onOpenChange={setHypothesisFormOpen}
        onSubmit={async (values: any) => {
          await addHypothesis(values);
          setHypothesisFormOpen(false);
        }}
      />

      <EnhancedExperimentForm
        open={experimentFormOpen}
        onOpenChange={setExperimentFormOpen}
        onSubmit={async (values: any) => {
          await addExperiment(values);
          setExperimentFormOpen(false);
        }}
      />

      <EnhancedABTestForm
        open={abTestFormOpen}
        onOpenChange={setABTestFormOpen}
        onSubmit={async (values: any) => {
          await addABTest(values);
          setABTestFormOpen(false);
        }}
      />

      <EnhancedUserFeedbackForm
        open={userFeedbackFormOpen}
        onOpenChange={setUserFeedbackFormOpen}
        onSubmit={async (values: any) => {
          await addUserFeedback(values);
          setUserFeedbackFormOpen(false);
        }}
      />

      <ValidationGuidance
        open={showGuidance}
        onClose={() => setShowGuidance(false)}
      />

      {/* Main Validation Interface */}
      <ValidationWizard
        activePhase={activePhase}
        phases={phases}
        data={enhancedData}
        metrics={metrics}
        relationships={relationships}
        insights={insights}
        decisions={decisions}
        milestones={milestones}
        isLoading={isLoading}
        onPhaseChange={handlePhaseChange}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onOpenForm={handleOpenForm}
        projectId={projectId}
      />
    </div>
  );
} 
