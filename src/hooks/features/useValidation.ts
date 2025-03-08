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
  ChangeType
} from '@/store/types';
import { validationService } from '@/lib/services';

export interface UseValidationReturn {
  data: ValidationData;
  isLoading: boolean;
  error: Error | null;

  // Experiments
  addExperiment: (experiment: Omit<ValidationExperiment, 'id' | 'created_at' | 'updated_at'>) => Promise<ValidationExperiment | null>;
  updateExperiment: (params: { id: string; data: Partial<Omit<ValidationExperiment, 'id' | 'created_at' | 'updated_at'>> }) => Promise<ValidationExperiment | null>;
  deleteExperiment: (id: string) => Promise<boolean>;

  // AB Tests
  addABTest: (test: Omit<ValidationABTest, 'id' | 'created_at' | 'updated_at'>) => Promise<ValidationABTest | null>;
  updateABTest: (params: { id: string; data: Partial<Omit<ValidationABTest, 'id' | 'created_at' | 'updated_at'>> }) => Promise<ValidationABTest | null>;
  deleteABTest: (id: string) => Promise<boolean>;

  // User Feedback
  addUserFeedback: (feedback: Omit<ValidationUserFeedback, 'id' | 'created_at' | 'updated_at'>) => Promise<ValidationUserFeedback | null>;
  updateUserFeedback: (params: { id: string; data: Partial<Omit<ValidationUserFeedback, 'id' | 'created_at' | 'updated_at'>> }) => Promise<ValidationUserFeedback | null>;
  deleteUserFeedback: (id: string) => Promise<boolean>;

  // Hypotheses
  addHypothesis: (hypothesis: Omit<ValidationHypothesis, 'id' | 'created_at' | 'updated_at'>) => Promise<ValidationHypothesis | null>;
  updateHypothesis: (params: { id: string; data: Partial<Omit<ValidationHypothesis, 'id' | 'created_at' | 'updated_at'>> }) => Promise<ValidationHypothesis | null>;
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
      store.setValidationExperiments(experimentsData);
    }
  }, [experimentsData, store]);

  useEffect(() => {
    if (abTestsData) {
      store.setValidationABTests(abTestsData);
    }
  }, [abTestsData, store]);

  useEffect(() => {
    if (userFeedbackData) {
      store.setValidationUserFeedback(userFeedbackData);
    }
  }, [userFeedbackData, store]);

  useEffect(() => {
    if (hypothesesData) {
      store.setValidationHypotheses(hypothesesData);
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
    storeData,
    experimentsData,
    abTestsData,
    userFeedbackData,
    hypothesesData
  ]);

  // Compute loading and error states
  const isLoading = experimentsLoading || abTestsLoading || userFeedbackLoading || hypothesesLoading;
  const queryError = experimentsError || abTestsError || userFeedbackError || hypothesesError;

  // === Experiments Operations ===
  const addExperiment = useCallback(async (experiment: Omit<ValidationExperiment, 'id' | 'created_at' | 'updated_at'>): Promise<ValidationExperiment | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completeExperiment: ValidationExperiment = {
      ...experiment,
      id: tempId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalExperiments = [...store.currentData.validationExperiments];
    
    try {
      // 1. Update store optimistically
      store.addValidationExperiment(completeExperiment);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        validationService.addExperiment(projectId, experiment)
      );
      
      // 3. Update store with real ID
      store.updateValidationExperiment(tempId, { 
        id: result.id,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.experiments });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding experiment:', err);
      
      // 5. Revert optimistic update on error
      store.setValidationExperiments(originalExperiments);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const updateExperiment = useCallback(async ({ id, data: updates }: { id: string; data: Partial<Omit<ValidationExperiment, 'id' | 'created_at' | 'updated_at'>> }): Promise<ValidationExperiment | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalExperiment = store.currentData.validationExperiments.find(e => e.id === id);
    if (!originalExperiment) return null;
    
    try {
      // 1. Update store optimistically
      store.updateValidationExperiment(id, updates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        validationService.updateExperiment(id, updates)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.experiments });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating experiment:', err);
      
      // 4. Revert optimistic update on error
      if (originalExperiment) {
        store.updateValidationExperiment(id, originalExperiment);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const deleteExperiment = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalExperiments = [...store.currentData.validationExperiments];
    const experimentToDelete = originalExperiments.find(e => e.id === id);
    if (!experimentToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteValidationExperiment(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        validationService.deleteExperiment(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.experiments });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting experiment:', err);
      
      // 4. Revert optimistic update on error
      store.setValidationExperiments(originalExperiments);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  // === AB Tests Operations ===
  const addABTest = useCallback(async (test: Omit<ValidationABTest, 'id' | 'created_at' | 'updated_at'>): Promise<ValidationABTest | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completeTest: ValidationABTest = {
      ...test,
      id: tempId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalTests = [...store.currentData.validationABTests];
    
    try {
      // 1. Update store optimistically
      store.addValidationABTest(completeTest);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        validationService.addABTest(projectId, test)
      );
      
      // 3. Update store with real ID
      store.updateValidationABTest(tempId, { 
        id: result.id,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.abTests });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding AB test:', err);
      
      // 5. Revert optimistic update on error
      store.setValidationABTests(originalTests);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const updateABTest = useCallback(async ({ id, data: updates }: { id: string; data: Partial<Omit<ValidationABTest, 'id' | 'created_at' | 'updated_at'>> }): Promise<ValidationABTest | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalTest = store.currentData.validationABTests.find(t => t.id === id);
    if (!originalTest) return null;
    
    try {
      // 1. Update store optimistically
      store.updateValidationABTest(id, updates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        validationService.updateABTest(id, updates)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.abTests });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating AB test:', err);
      
      // 4. Revert optimistic update on error
      if (originalTest) {
        store.updateValidationABTest(id, originalTest);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const deleteABTest = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalTests = [...store.currentData.validationABTests];
    const testToDelete = originalTests.find(t => t.id === id);
    if (!testToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteValidationABTest(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        validationService.deleteABTest(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.abTests });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting AB test:', err);
      
      // 4. Revert optimistic update on error
      store.setValidationABTests(originalTests);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  // === User Feedback Operations ===
  const addUserFeedback = useCallback(async (feedback: Omit<ValidationUserFeedback, 'id' | 'created_at' | 'updated_at'>): Promise<ValidationUserFeedback | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completeFeedback: ValidationUserFeedback = {
      ...feedback,
      id: tempId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalFeedback = [...store.currentData.validationUserFeedback];
    
    try {
      // 1. Update store optimistically
      store.addValidationUserFeedback(completeFeedback);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        validationService.addUserFeedback(projectId, feedback)
      );
      
      // 3. Update store with real ID
      store.updateValidationUserFeedback(tempId, { 
        id: result.id,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.userFeedback });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding user feedback:', err);
      
      // 5. Revert optimistic update on error
      store.setValidationUserFeedback(originalFeedback);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const updateUserFeedback = useCallback(async ({ id, data: updates }: { id: string; data: Partial<Omit<ValidationUserFeedback, 'id' | 'created_at' | 'updated_at'>> }): Promise<ValidationUserFeedback | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalFeedback = store.currentData.validationUserFeedback.find(f => f.id === id);
    if (!originalFeedback) return null;
    
    try {
      // 1. Update store optimistically
      store.updateValidationUserFeedback(id, updates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        validationService.updateUserFeedback(id, updates)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.userFeedback });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating user feedback:', err);
      
      // 4. Revert optimistic update on error
      if (originalFeedback) {
        store.updateValidationUserFeedback(id, originalFeedback);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const deleteUserFeedback = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalFeedback = [...store.currentData.validationUserFeedback];
    const feedbackToDelete = originalFeedback.find(f => f.id === id);
    if (!feedbackToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteValidationUserFeedback(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        validationService.deleteUserFeedback(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.userFeedback });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting user feedback:', err);
      
      // 4. Revert optimistic update on error
      store.setValidationUserFeedback(originalFeedback);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  // === Hypotheses Operations ===
  const addHypothesis = useCallback(async (hypothesis: Omit<ValidationHypothesis, 'id' | 'created_at' | 'updated_at'>): Promise<ValidationHypothesis | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completeHypothesis: ValidationHypothesis = {
      ...hypothesis,
      id: tempId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalHypotheses = [...store.currentData.validationHypotheses];
    
    try {
      // 1. Update store optimistically
      store.addValidationHypothesis(completeHypothesis);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        validationService.addHypothesis(projectId, hypothesis)
      );
      
      // 3. Update store with real ID
      store.updateValidationHypothesis(tempId, { 
        id: result.id,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.hypotheses });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding hypothesis:', err);
      
      // 5. Revert optimistic update on error
      store.setValidationHypotheses(originalHypotheses);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const updateHypothesis = useCallback(async ({ id, data: updates }: { id: string; data: Partial<Omit<ValidationHypothesis, 'id' | 'created_at' | 'updated_at'>> }): Promise<ValidationHypothesis | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalHypothesis = store.currentData.validationHypotheses.find(h => h.id === id);
    if (!originalHypothesis) return null;
    
    try {
      // 1. Update store optimistically
      store.updateValidationHypothesis(id, updates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        validationService.updateHypothesis(id, updates)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.hypotheses });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating hypothesis:', err);
      
      // 4. Revert optimistic update on error
      if (originalHypothesis) {
        store.updateValidationHypothesis(id, originalHypothesis);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const deleteHypothesis = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalHypotheses = [...store.currentData.validationHypotheses];
    const hypothesisToDelete = originalHypotheses.find(h => h.id === id);
    if (!hypothesisToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteValidationHypothesis(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        validationService.deleteHypothesis(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.hypotheses });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting hypothesis:', err);
      
      // 4. Revert optimistic update on error
      store.setValidationHypotheses(originalHypotheses);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

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
    error,

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