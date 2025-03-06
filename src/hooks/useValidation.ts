import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { ValidationService, ValidationData } from '@/lib/services/features/validation-service';
import type { 
  ValidationExperiment,
  ValidationABTest,
  ValidationUserFeedback,
  ValidationHypothesis
} from '@/store/types';

// Create service instance
const validationService = new ValidationService(createClient());

export interface UseValidationReturn {
  data: ValidationData;
  isLoading: boolean;
  error: Error | null;

  // Experiments
  addExperiment: (experiment: Omit<ValidationExperiment, 'id' | 'created_at' | 'updated_at'>) => void;
  updateExperiment: (params: { id: string; data: Partial<Omit<ValidationExperiment, 'id' | 'created_at' | 'updated_at'>> }) => void;
  deleteExperiment: (id: string) => void;

  // AB Tests
  addABTest: (test: Omit<ValidationABTest, 'id' | 'created_at' | 'updated_at'>) => void;
  updateABTest: (params: { id: string; data: Partial<Omit<ValidationABTest, 'id' | 'created_at' | 'updated_at'>> }) => void;
  deleteABTest: (id: string) => void;

  // User Feedback
  addUserFeedback: (feedback: Omit<ValidationUserFeedback, 'id' | 'created_at' | 'updated_at'>) => void;
  updateUserFeedback: (params: { id: string; data: Partial<Omit<ValidationUserFeedback, 'id' | 'created_at' | 'updated_at'>> }) => void;
  deleteUserFeedback: (id: string) => void;

  // Hypotheses
  addHypothesis: (hypothesis: Omit<ValidationHypothesis, 'id' | 'created_at' | 'updated_at'>) => void;
  updateHypothesis: (params: { id: string; data: Partial<Omit<ValidationHypothesis, 'id' | 'created_at' | 'updated_at'>> }) => void;
  deleteHypothesis: (id: string) => void;
}

/**
 * Hook for managing validation data in a project
 */
export function useValidation(projectId: string | undefined): UseValidationReturn {
  const queryClient = useQueryClient();

  // Query key factory
  const keys = {
    all: ['validation', projectId] as const,
    experiments: ['validation', projectId, 'experiments'] as const,
    abTests: ['validation', projectId, 'abTests'] as const,
    userFeedback: ['validation', projectId, 'userFeedback'] as const,
    hypotheses: ['validation', projectId, 'hypotheses'] as const,
  };

  // Queries
  const experiments = useQuery({
    queryKey: keys.experiments,
    queryFn: () => projectId ? validationService.getExperiments(projectId) : [],
    enabled: !!projectId,
  });

  const abTests = useQuery({
    queryKey: keys.abTests,
    queryFn: () => projectId ? validationService.getABTests(projectId) : [],
    enabled: !!projectId,
  });

  const userFeedback = useQuery({
    queryKey: keys.userFeedback,
    queryFn: () => projectId ? validationService.getUserFeedback(projectId) : [],
    enabled: !!projectId,
  });

  const hypotheses = useQuery({
    queryKey: keys.hypotheses,
    queryFn: () => projectId ? validationService.getHypotheses(projectId) : [],
    enabled: !!projectId,
  });

  // Mutations
  const addExperiment = useMutation({
    mutationFn: (experiment: Omit<ValidationExperiment, 'id' | 'created_at' | 'updated_at'>) => {
      if (!projectId) throw new Error('Project ID is required');
      return validationService.addExperiment(projectId, experiment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.experiments });
    },
  });

  const updateExperiment = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<ValidationExperiment, 'id' | 'created_at' | 'updated_at'>> }) => {
      return validationService.updateExperiment(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.experiments });
    },
  });

  const deleteExperiment = useMutation({
    mutationFn: (id: string) => {
      return validationService.deleteExperiment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.experiments });
    },
  });

  const addABTest = useMutation({
    mutationFn: (test: Omit<ValidationABTest, 'id' | 'created_at' | 'updated_at'>) => {
      if (!projectId) throw new Error('Project ID is required');
      return validationService.addABTest(projectId, test);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.abTests });
    },
  });

  const updateABTest = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<ValidationABTest, 'id' | 'created_at' | 'updated_at'>> }) => {
      return validationService.updateABTest(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.abTests });
    },
  });

  const deleteABTest = useMutation({
    mutationFn: (id: string) => {
      return validationService.deleteABTest(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.abTests });
    },
  });

  const addUserFeedback = useMutation({
    mutationFn: (feedback: Omit<ValidationUserFeedback, 'id' | 'created_at' | 'updated_at'>) => {
      if (!projectId) throw new Error('Project ID is required');
      return validationService.addUserFeedback(projectId, feedback);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.userFeedback });
    },
  });

  const updateUserFeedback = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<ValidationUserFeedback, 'id' | 'created_at' | 'updated_at'>> }) => {
      return validationService.updateUserFeedback(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.userFeedback });
    },
  });

  const deleteUserFeedback = useMutation({
    mutationFn: (id: string) => {
      return validationService.deleteUserFeedback(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.userFeedback });
    },
  });

  const addHypothesis = useMutation({
    mutationFn: (hypothesis: Omit<ValidationHypothesis, 'id' | 'created_at' | 'updated_at'>) => {
      if (!projectId) throw new Error('Project ID is required');
      return validationService.addHypothesis(projectId, hypothesis);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.hypotheses });
    },
  });

  const updateHypothesis = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<ValidationHypothesis, 'id' | 'created_at' | 'updated_at'>> }) => {
      return validationService.updateHypothesis(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.hypotheses });
    },
  });

  const deleteHypothesis = useMutation({
    mutationFn: (id: string) => {
      return validationService.deleteHypothesis(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.hypotheses });
    },
  });

  return {
    // Data queries
    data: {
      experiments: experiments.data || [],
      abTests: abTests.data || [],
      userFeedback: userFeedback.data || [],
      hypotheses: hypotheses.data || [],
    },
    isLoading: experiments.isLoading || abTests.isLoading || userFeedback.isLoading || hypotheses.isLoading,
    error: experiments.error || abTests.error || userFeedback.error || hypotheses.error,

    // Experiments
    addExperiment: addExperiment.mutate,
    updateExperiment: updateExperiment.mutate,
    deleteExperiment: deleteExperiment.mutate,

    // AB Tests
    addABTest: addABTest.mutate,
    updateABTest: updateABTest.mutate,
    deleteABTest: deleteABTest.mutate,

    // User Feedback
    addUserFeedback: addUserFeedback.mutate,
    updateUserFeedback: updateUserFeedback.mutate,
    deleteUserFeedback: deleteUserFeedback.mutate,

    // Hypotheses
    addHypothesis: addHypothesis.mutate,
    updateHypothesis: updateHypothesis.mutate,
    deleteHypothesis: deleteHypothesis.mutate,
  };
} 