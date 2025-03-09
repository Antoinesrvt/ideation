import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { ValidationService, ValidationData } from '@/lib/services/features/validation-service';
import { useProjectStore } from '@/store';
import type { 
  ValidationExperiment,
  ValidationABTest,
  ValidationUserFeedback,
  ValidationHypothesis,
  ChangeType,
  Insert,
  Update
} from '@/store/types';
import { validationService } from '@/lib/services';
import { useOptimisticCreate, useOptimisticUpdate, useOptimisticDelete } from '../utils/optimistic-helpers';



export interface UseValidationReturn {
  data: ValidationData;
  isLoading: boolean;
  error: Error | null;

  // Experiments
  addExperiment: (experiment: Insert<'validation_experiments'>) => Promise<ValidationExperiment | null>;
  updateExperiment: (params: { id: string; data: Update<'validation_experiments'> }) => Promise<ValidationExperiment | null>;
  deleteExperiment: (id: string) => Promise<boolean>;

  // AB Tests
  addABTest: (abTest: Insert<'validation_ab_tests'>) => Promise<ValidationABTest | null>;
  updateABTest: (params: { id: string; data: Update<'validation_ab_tests'> }) => Promise<ValidationABTest | null>;
  deleteABTest: (id: string) => Promise<boolean>;

  // User Feedback
  addUserFeedback: (feedback: Insert<'validation_user_feedback'>) => Promise<ValidationUserFeedback | null>;
  updateUserFeedback: (params: { id: string; data: Update<'validation_user_feedback'> }) => Promise<ValidationUserFeedback | null>;
  deleteUserFeedback: (id: string) => Promise<boolean>;

  // Hypotheses
  addHypothesis: (hypothesis: Insert<'validation_hypotheses'>) => Promise<ValidationHypothesis | null>;
  updateHypothesis: (params: { id: string; data: Update<'validation_hypotheses'> }) => Promise<ValidationHypothesis | null>;
  deleteHypothesis: (id: string) => Promise<boolean>;

  // Diff helpers
  getExperimentChangeType: (id: string) => ChangeType;
  getABTestChangeType: (id: string) => ChangeType;
  getUserFeedbackChangeType: (id: string) => ChangeType;
  getHypothesisChangeType: (id: string) => ChangeType;
  isDiffMode: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Helper function outside of React component (no hooks)
function compareArrays<T extends { id: string }>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return true;
  
  // Sort both arrays by ID for consistent comparison
  const sorted1 = [...arr1].sort((a, b) => a.id.localeCompare(b.id));
  const sorted2 = [...arr2].sort((a, b) => a.id.localeCompare(b.id));
  
  // Compare the stringified versions
  return JSON.stringify(sorted1) !== JSON.stringify(sorted2);
}

/**
 * Executes a function with retry logic
 */
async function executeWithRetry<T>(fn: () => Promise<T>, maxRetries = MAX_RETRIES, delay = RETRY_DELAY): Promise<T> {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;
      // Exponential backoff
      await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw new Error('Max retries exceeded');
}

export function useValidation(projectId: string | undefined): UseValidationReturn {
  const queryClient = useQueryClient();
  const store = useProjectStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create stable, memoized query keys
  const queryKeys = useMemo(() => ({
    all: ['validation', projectId] as const,
    experiments: ['validation', projectId, 'experiments'] as const,
    abTests: ['validation', projectId, 'abTests'] as const,
    userFeedback: ['validation', projectId, 'userFeedback'] as const,
    hypotheses: ['validation', projectId, 'hypotheses'] as const,
  }), [projectId]);

  // Use React Query to fetch data
  const { 
    data: experimentsData, 
    isLoading: experimentsLoading, 
    error: experimentsError 
  } = useQuery({
    queryKey: queryKeys.experiments,
    queryFn: () => validationService.getExperiments(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: abTestsData, 
    isLoading: abTestsLoading, 
    error: abTestsError 
  } = useQuery({
    queryKey: queryKeys.abTests,
    queryFn: () => validationService.getABTests(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: userFeedbackData, 
    isLoading: userFeedbackLoading, 
    error: userFeedbackError 
  } = useQuery({
    queryKey: queryKeys.userFeedback,
    queryFn: () => validationService.getUserFeedback(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: hypothesesData, 
    isLoading: hypothesesLoading, 
    error: hypothesesError 
  } = useQuery({
    queryKey: queryKeys.hypotheses,
    queryFn: () => validationService.getHypotheses(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update store when data changes
  useEffect(() => {
    if (experimentsData) {
      // Only update store if the data is different to prevent infinite loops
      const currentExperiments = store.currentData.validationExperiments || [];
      if (compareArrays(currentExperiments, experimentsData)) {
        store.setValidationExperiments(experimentsData);
      }
    }
  }, [experimentsData, store]);

  useEffect(() => {
    if (abTestsData) {
      // Only update store if the data is different to prevent infinite loops
      const currentABTests = store.currentData.validationABTests || [];
      if (compareArrays(currentABTests, abTestsData)) {
        store.setValidationABTests(abTestsData);
      }
    }
  }, [abTestsData, store]);

  useEffect(() => {
    if (userFeedbackData) {
      // Only update store if the data is different to prevent infinite loops
      const currentUserFeedback = store.currentData.validationUserFeedback || [];
      if (compareArrays(currentUserFeedback, userFeedbackData)) {
        store.setValidationUserFeedback(userFeedbackData);
      }
    }
  }, [userFeedbackData, store]);

  useEffect(() => {
    if (hypothesesData) {
      // Only update store if the data is different to prevent infinite loops
      const currentHypotheses = store.currentData.validationHypotheses || [];
      if (compareArrays(currentHypotheses, hypothesesData)) {
        store.setValidationHypotheses(hypothesesData);
      }
    }
  }, [hypothesesData, store]);

  // Get data from the store for comparison mode
  const storeData = useMemo(() => {
    const source = store.comparisonMode && store.stagedData ? store.stagedData : store.currentData;
    return {
      validationExperiments: source.validationExperiments || [],
      validationABTests: source.validationABTests || [],
      validationUserFeedback: source.validationUserFeedback || [],
      validationHypotheses: source.validationHypotheses || []
    };
  }, [store.currentData, store.stagedData, store.comparisonMode]);

  // Use either store data or query data based on comparison mode
  const data: ValidationData = useMemo(() => {
    if (store.comparisonMode) {
      return {
        experiments: storeData.validationExperiments,
        abTests: storeData.validationABTests,
        userFeedback: storeData.validationUserFeedback,
        hypotheses: storeData.validationHypotheses
      };
    } else {
      return {
        experiments: experimentsData || [],
        abTests: abTestsData || [],
        userFeedback: userFeedbackData || [],
        hypotheses: hypothesesData || []
      };
    }
  }, [
    store.comparisonMode,
    // Only include storeData in dependencies when in comparison mode
    ...(store.comparisonMode ? [storeData] : []),
    // Only depend on query data when not in comparison mode
    ...(store.comparisonMode ? [] : [
      experimentsData,
      abTestsData,
      userFeedbackData,
      hypothesesData
    ])
  ]);

  // Compute loading and error states
  const isLoading = experimentsLoading || abTestsLoading || userFeedbackLoading || hypothesesLoading;
  const queryError = experimentsError || abTestsError || userFeedbackError || hypothesesError;

  // === Experiments Operations ===
  // Use our optimistic helper hooks
  const addExperimentOptimistic = useOptimisticCreate<'validation_experiments'>({
    projectId,
    tableName: 'validation_experiments',
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.experiments],
    setSubmitting,
    methods: {
      add: 'addExperiment'
    }
  });

  const updateExperimentOptimistic = useOptimisticUpdate<'validation_experiments'>({
    tableName: 'validation_experiments',
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.experiments],
    setSubmitting,
    methods: {
      update: 'updateExperiment'
    }
  });

  const deleteExperimentOptimistic = useOptimisticDelete({
    tableName: 'validation_experiments',
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.experiments],
    setSubmitting,
    methods: {
      delete: 'deleteExperiment'
    }
  });

  // Exposed experiment operations with proper typing
  const addExperiment = useCallback(async (experiment: Insert<'validation_experiments'>): Promise<ValidationExperiment | null> => {
    return addExperimentOptimistic(experiment);
  }, [addExperimentOptimistic]);

  const updateExperiment = useCallback(async (params: { id: string; data: Update<'validation_experiments'> }): Promise<ValidationExperiment | null> => {
    return updateExperimentOptimistic(params.id, params.data);
  }, [updateExperimentOptimistic]);

  const deleteExperiment = useCallback(async (id: string): Promise<boolean> => {
    return deleteExperimentOptimistic(id);
  }, [deleteExperimentOptimistic]);

  // === AB Tests Operations ===
  // Use our optimistic helper hooks
  const addABTestOptimistic = useOptimisticCreate<'validation_ab_tests'>({
    projectId,
    tableName: 'validation_ab_tests',
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.abTests],
    setSubmitting,
    methods: {
      add: 'addABTest'
    }
  });

  const updateABTestOptimistic = useOptimisticUpdate<'validation_ab_tests'>({
    tableName: 'validation_ab_tests',
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.abTests],
    setSubmitting,
    methods: {
      update: 'updateABTest'
    }
  });

  const deleteABTestOptimistic = useOptimisticDelete({
    tableName: 'validation_ab_tests',
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.abTests],
    setSubmitting,
    methods: {
      delete: 'deleteABTest'
    }
  });

  // Exposed AB Test operations with proper typing
  const addABTest = useCallback(async (abTest: Insert<'validation_ab_tests'>): Promise<ValidationABTest | null> => {
    return addABTestOptimistic(abTest);
  }, [addABTestOptimistic]);

  const updateABTest = useCallback(async (params: { id: string; data: Update<'validation_ab_tests'> }): Promise<ValidationABTest | null> => {
    return updateABTestOptimistic(params.id, params.data);
  }, [updateABTestOptimistic]);

  const deleteABTest = useCallback(async (id: string): Promise<boolean> => {
    return deleteABTestOptimistic(id);
  }, [deleteABTestOptimistic]);

  // === User Feedback Operations ===
  // Use our optimistic helper hooks
  const addUserFeedbackOptimistic = useOptimisticCreate<'validation_user_feedback'>({
    projectId,
    tableName: 'validation_user_feedback',
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.userFeedback],
    setSubmitting,
    methods: {
      add: 'addUserFeedback'
    }
  });

  const updateUserFeedbackOptimistic = useOptimisticUpdate<'validation_user_feedback'>({
    tableName: 'validation_user_feedback',
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.userFeedback],
    setSubmitting,
    methods: {
      update: 'updateUserFeedback'
    }
  });

  const deleteUserFeedbackOptimistic = useOptimisticDelete({
    tableName: 'validation_user_feedback',
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.userFeedback],
    setSubmitting,
    methods: {
      delete: 'deleteUserFeedback'
    }
  });

  // Exposed User Feedback operations with proper typing
  const addUserFeedback = useCallback(async (feedback: Insert<'validation_user_feedback'>): Promise<ValidationUserFeedback | null> => {
    return addUserFeedbackOptimistic(feedback);
  }, [addUserFeedbackOptimistic]);

  const updateUserFeedback = useCallback(async (params: { id: string; data: Update<'validation_user_feedback'> }): Promise<ValidationUserFeedback | null> => {
    return updateUserFeedbackOptimistic(params.id, params.data);
  }, [updateUserFeedbackOptimistic]);

  const deleteUserFeedback = useCallback(async (id: string): Promise<boolean> => {
    return deleteUserFeedbackOptimistic(id);
  }, [deleteUserFeedbackOptimistic]);

  // === Hypotheses Operations ===
  // Use our optimistic helper hooks
  const addHypothesisOptimistic = useOptimisticCreate<'validation_hypotheses'>({
    projectId,
    tableName: 'validation_hypotheses',
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.hypotheses],
    setSubmitting,
    methods: {
      add: 'addHypothesis'
    }
  });

  const updateHypothesisOptimistic = useOptimisticUpdate<'validation_hypotheses'>({
    tableName: 'validation_hypotheses',
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.hypotheses],
    setSubmitting,
    methods: {
      update: 'updateHypothesis'
    }
  });

  const deleteHypothesisOptimistic = useOptimisticDelete({
    tableName: 'validation_hypotheses',
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.hypotheses],
    setSubmitting,
    methods: {
      delete: 'deleteHypothesis'
    }
  });

  // Exposed Hypothesis operations with proper typing
  const addHypothesis = useCallback(async (hypothesis: Insert<'validation_hypotheses'>): Promise<ValidationHypothesis | null> => {
    return addHypothesisOptimistic(hypothesis);
  }, [addHypothesisOptimistic]);

  const updateHypothesis = useCallback(async (params: { id: string; data: Update<'validation_hypotheses'> }): Promise<ValidationHypothesis | null> => {
    return updateHypothesisOptimistic(params.id, params.data);
  }, [updateHypothesisOptimistic]);

  const deleteHypothesis = useCallback(async (id: string): Promise<boolean> => {
    return deleteHypothesisOptimistic(id);
  }, [deleteHypothesisOptimistic]);

  // Diff helpers
  const getExperimentChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('validationExperiments', id), [store]);

  const getABTestChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('validationABTests', id), [store]);

  const getUserFeedbackChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('validationUserFeedback', id), [store]);

  const getHypothesisChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('validationHypotheses', id), [store]);

  return {
    // Data queries
    data,
    isLoading,
    error: error || queryError,

    // Experiments
    addExperiment,
    updateExperiment,
    deleteExperiment,

    // AB Tests
    addABTest,
    updateABTest,
    deleteABTest,

    // User Feedback
    addUserFeedback,
    updateUserFeedback,
    deleteUserFeedback,

    // Hypotheses
    addHypothesis,
    updateHypothesis,
    deleteHypothesis,

    // Diff helpers
    getExperimentChangeType,
    getABTestChangeType,
    getUserFeedbackChangeType,
    getHypothesisChangeType,
    isDiffMode: store.comparisonMode
  };
} 