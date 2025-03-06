import { useFeatureData } from './use-feature-data';
import { useCallback } from 'react';
import { Database } from '@/types/database';

// Database types for validation tables
type ValidationExperiment = Database['public']['Tables']['validation_experiments']['Row'];
type ValidationABTest = Database['public']['Tables']['validation_ab_tests']['Row'];
type ValidationUserFeedback = Database['public']['Tables']['validation_user_feedback']['Row'];
type ValidationHypothesis = Database['public']['Tables']['validation_hypotheses']['Row'];


// Combined type for all validation data
type ValidationData = {
  experiments: ValidationExperiment[];
  abTests: ValidationABTest[];
  userFeedback: ValidationUserFeedback[];
  hypotheses: ValidationHypothesis[];
};

// Type for any validation item
type ValidationItem = ValidationExperiment | ValidationABTest | ValidationUserFeedback | ValidationHypothesis;

/**
 * Hook for managing validation data in a project
 * @param projectId - The ID of the current project
 */
export function useValidation(projectId: string | undefined) {
  // Use the enhanced useFeatureData hook with proper typing
  const featureData = useFeatureData<ValidationData, ValidationItem>(
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

  // ===== Experiments =====
  const addExperiment = useCallback(async (experiment: Omit<ValidationExperiment, 'id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) throw new Error('Project ID is required');
    return featureData.addItem({
      ...experiment,
      project_id: projectId,
      status: experiment.status || null,
      created_at: null,
      updated_at: null
    }, 'experiments');
  }, [featureData, projectId]);

  const updateExperiment = useCallback((id: string, data: Partial<Omit<ValidationExperiment, 'id' | 'created_at' | 'updated_at'>>) => {
    return featureData.updateItem(id, data, 'experiments');
  }, [featureData]);

  const deleteExperiment = useCallback((id: string) => {
    return featureData.deleteItem(id, 'experiments');
  }, [featureData]);

  // ===== A/B Tests =====
  const addABTest = useCallback(async (abTest: Omit<ValidationABTest, 'id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) throw new Error('Project ID is required');
    return featureData.addItem({
      ...abTest,
      project_id: projectId,
      status: abTest.status || null,
      created_at: null,
      updated_at: null
    }, 'abTests');
  }, [featureData, projectId]);

  const updateABTest = useCallback((id: string, data: Partial<Omit<ValidationABTest, 'id' | 'created_at' | 'updated_at'>>) => {
    return featureData.updateItem(id, data, 'abTests');
  }, [featureData]);

  const deleteABTest = useCallback((id: string) => {
    return featureData.deleteItem(id, 'abTests');
  }, [featureData]);

  // ===== User Feedback =====
  const addUserFeedback = useCallback(async (feedback: Omit<ValidationUserFeedback, 'id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) throw new Error('Project ID is required');
    return featureData.addItem({
      ...feedback,
      project_id: projectId,
      status: feedback.status || null,
      created_at: null,
      updated_at: null
    }, 'userFeedback');
  }, [featureData, projectId]);

  const updateUserFeedback = useCallback((id: string, data: Partial<Omit<ValidationUserFeedback, 'id' | 'created_at' | 'updated_at'>>) => {
    return featureData.updateItem(id, data, 'userFeedback');
  }, [featureData]);

  const deleteUserFeedback = useCallback((id: string) => {
    return featureData.deleteItem(id, 'userFeedback');
  }, [featureData]);

  // ===== Hypotheses =====
  const addHypothesis = useCallback(async (hypothesis: Omit<ValidationHypothesis, 'id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) throw new Error('Project ID is required');
    return featureData.addItem({
      ...hypothesis,
      project_id: projectId,
      status: hypothesis.status || null,
      created_at: null,
      updated_at: null
    }, 'hypotheses');
  }, [featureData, projectId]);

  const updateHypothesis = useCallback((id: string, data: Partial<Omit<ValidationHypothesis, 'id' | 'created_at' | 'updated_at'>>) => {
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
        const metricsArray = typeof exp.metrics === 'string' 
          ? JSON.parse(exp.metrics) 
          : exp.metrics;
        (Array.isArray(metricsArray) ? metricsArray : [metricsArray]).forEach(metric => {
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