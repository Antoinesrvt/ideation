import { useFeatureData } from './use-feature-data';
import { Experiment, ABTest, UserFeedback, Hypothesis, ValidationData } from '@/types';
import { useCallback } from 'react';

/**
 * Hook for managing validation data in a project
 * @param projectId - The ID of the current project
 */
export function useValidation(projectId: string | undefined) {
  // Use the enhanced useFeatureData hook with proper typing
  const featureData = useFeatureData<ValidationData, 
    Experiment | ABTest | UserFeedback | Hypothesis>(
    projectId,
    'validation',
    {
      defaultData: {
        experiments: [],
        abTests: [],
        userFeedback: [],
        hypotheses: []
      }
    }
  );

  // Helper to determine the type of an item
  const getItemType = (item: any): 'experiment' | 'abTest' | 'userFeedback' | 'hypothesis' => {
    if ('hypothesis' in item) return 'experiment';
    if ('variantA' in item) return 'abTest';
    if ('sentiment' in item) return 'userFeedback';
    return 'hypothesis';
  };

  // ===== Experiments =====
  const addExperiment = useCallback((experiment: Omit<Experiment, 'id'>) => {
    return featureData.addItem(experiment, 'experiments');
  }, [featureData]);

  const updateExperiment = useCallback((id: string, data: Partial<Experiment>) => {
    return featureData.updateItem(id, data, 'experiments');
  }, [featureData]);

  const deleteExperiment = useCallback((id: string) => {
    return featureData.deleteItem(id, 'experiments');
  }, [featureData]);

  // ===== A/B Tests =====
  const addABTest = useCallback((abTest: Omit<ABTest, 'id'>) => {
    return featureData.addItem(abTest, 'abTests');
  }, [featureData]);

  const updateABTest = useCallback((id: string, data: Partial<ABTest>) => {
    return featureData.updateItem(id, data, 'abTests');
  }, [featureData]);

  const deleteABTest = useCallback((id: string) => {
    return featureData.deleteItem(id, 'abTests');
  }, [featureData]);

  // ===== User Feedback =====
  const addUserFeedback = useCallback((feedback: Omit<UserFeedback, 'id'>) => {
    return featureData.addItem(feedback, 'userFeedback');
  }, [featureData]);

  const updateUserFeedback = useCallback((id: string, data: Partial<UserFeedback>) => {
    return featureData.updateItem(id, data, 'userFeedback');
  }, [featureData]);

  const deleteUserFeedback = useCallback((id: string) => {
    return featureData.deleteItem(id, 'userFeedback');
  }, [featureData]);

  // ===== Hypotheses =====
  const addHypothesis = useCallback((hypothesis: Omit<Hypothesis, 'id'>) => {
    return featureData.addItem(hypothesis, 'hypotheses');
  }, [featureData]);

  const updateHypothesis = useCallback((id: string, data: Partial<Hypothesis>) => {
    return featureData.updateItem(id, data, 'hypotheses');
  }, [featureData]);

  const deleteHypothesis = useCallback((id: string) => {
    return featureData.deleteItem(id, 'hypotheses');
  }, [featureData]);

  // Advanced operations
  const getRelatedExperiments = useCallback((hypothesisId: string) => {
    const { experiments } = featureData.data || { experiments: [] };
    return experiments.filter(exp => exp.hypothesis === hypothesisId);
  }, [featureData.data]);

  const getExperimentMetrics = useCallback(() => {
    const { experiments } = featureData.data || { experiments: [] };
    // Extract unique metrics from all experiments
    const metrics = new Set<string>();
    experiments.forEach(exp => {
      if (exp.metrics) {
        (Array.isArray(exp.metrics) ? exp.metrics : [exp.metrics]).forEach(metric => {
          if (typeof metric === 'string') {
            metrics.add(metric);
          }
        });
      }
    });
    return Array.from(metrics);
  }, [featureData.data]);

  const getValidationStats = useCallback(() => {
    const { experiments, abTests, userFeedback, hypotheses } = featureData.data || { 
      experiments: [], abTests: [], userFeedback: [], hypotheses: [] 
    };
    
    return {
      totalExperiments: experiments.length,
      totalABTests: abTests.length,
      totalFeedback: userFeedback.length,
      totalHypotheses: hypotheses.length,
      
      activeExperiments: experiments.filter(e => e.status === 'in-progress').length,
      completedExperiments: experiments.filter(e => e.status === 'completed').length,
      
      validatedHypotheses: hypotheses.filter(h => h.status === 'validated').length,
      invalidatedHypotheses: hypotheses.filter(h => h.status === 'invalidated').length,
      
      positiveFeedback: userFeedback.filter(f => f.sentiment === 'positive').length,
      negativeFeedback: userFeedback.filter(f => f.sentiment === 'negative').length,
      neutralFeedback: userFeedback.filter(f => f.sentiment === 'neutral').length,
    };
  }, [featureData.data]);

  return {
    // Raw data
    data: featureData.data,
    isLoading: featureData.isLoading,
    error: featureData.error,
    
    // Experiments
    experiments: featureData.data?.experiments || [],
    addExperiment,
    updateExperiment,
    deleteExperiment,
    
    // A/B Tests
    abTests: featureData.data?.abTests || [],
    addABTest,
    updateABTest,
    deleteABTest,
    
    // User Feedback
    userFeedback: featureData.data?.userFeedback || [],
    addUserFeedback,
    updateUserFeedback,
    deleteUserFeedback,
    
    // Hypotheses
    hypotheses: featureData.data?.hypotheses || [],
    addHypothesis,
    updateHypothesis,
    deleteHypothesis,
    
    // Advanced operations
    getRelatedExperiments,
    getExperimentMetrics,
    getValidationStats,
  };
} 