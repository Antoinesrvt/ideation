import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { ValidationService, ValidationData } from '@/lib/services/features/validation-service';
import { useProjectStore } from '@/store';
import type { 
  ValidationExperiment,
  ValidationABTest,
  ValidationUserFeedback,
  ValidationHypothesis,
  ChangeType,
  Insert,
  Update,
  ValidationDecision,
  ValidationInsight,
  ValidationMilestone,
  ValidationRelationship
} from '@/store/types';
import { validationService } from '@/lib/services';
import { useOptimisticCreate, useOptimisticUpdate, useOptimisticDelete } from '../utils/optimistic-helpers';

export interface UseValidationReturn {
  data: ValidationData;
  isLoading: boolean;
  error: Error | null;

  // Experiments
  addExperiment: (
    experiment: Insert<"validation_experiments">
  ) => Promise<ValidationExperiment | null>;
  updateExperiment: (params: {
    id: string;
    data: Update<"validation_experiments">;
  }) => Promise<ValidationExperiment | null>;
  deleteExperiment: (id: string) => Promise<boolean>;

  // AB Tests
  addABTest: (
    abTest: Insert<"validation_ab_tests">
  ) => Promise<ValidationABTest | null>;
  updateABTest: (params: {
    id: string;
    data: Update<"validation_ab_tests">;
  }) => Promise<ValidationABTest | null>;
  deleteABTest: (id: string) => Promise<boolean>;

  // User Feedback
  addUserFeedback: (
    feedback: Insert<"validation_user_feedback">
  ) => Promise<ValidationUserFeedback | null>;
  updateUserFeedback: (params: {
    id: string;
    data: Update<"validation_user_feedback">;
  }) => Promise<ValidationUserFeedback | null>;
  deleteUserFeedback: (id: string) => Promise<boolean>;

  // Hypotheses
  addHypothesis: (
    hypothesis: Insert<"validation_hypotheses">
  ) => Promise<ValidationHypothesis | null>;
  updateHypothesis: (params: {
    id: string;
    data: Update<"validation_hypotheses">;
  }) => Promise<ValidationHypothesis | null>;
  deleteHypothesis: (id: string) => Promise<boolean>;

  // New methods for product development integration
  linkHypothesisToEntity: (params: {
    hypothesisId: string;
    entityType: "problem" | "solution" | "feature" | "journey_pain_point";
    entityId: string;
  }) => Promise<boolean>;

  linkExperimentToEntities: (params: {
    experimentId: string;
    problemId?: string;
    solutionId?: string;
    featureId?: string;
  }) => Promise<boolean>;

  getHypothesesForEntity: (
    entityType: string,
    entityId: string
  ) => ValidationHypothesis[];
  getExperimentsForEntity: (
    entityType: string,
    entityId: string
  ) => ValidationExperiment[];

  // Relationships
  getRelationships: () => ValidationRelationship[];
  addRelationship: (
    relationship: Insert<"validation_relationships">
  ) => Promise<ValidationRelationship | null>;
  updateRelationship: (params: {
    id: string;
    data: Update<"validation_relationships">;
  }) => Promise<ValidationRelationship | null>;
  deleteRelationship: (id: string) => Promise<boolean>;

  // Insights
  getInsights: () => ValidationInsight[];
  addInsight: (
    insight: Insert<"validation_insights">
  ) => Promise<ValidationInsight | null>;
  updateInsight: (params: {
    id: string;
    data: Update<"validation_insights">;
  }) => Promise<ValidationInsight | null>;
  deleteInsight: (id: string) => Promise<boolean>;

  // Decisions
  getDecisions: () => ValidationDecision[];
  addDecision: (
    decision: Insert<"validation_decisions">
  ) => Promise<ValidationDecision | null>;
  updateDecision: (params: {
    id: string;
    data: Update<"validation_decisions">;
  }) => Promise<ValidationDecision | null>;
  deleteDecision: (id: string) => Promise<boolean>;

  // Milestones
  getMilestones: () => ValidationMilestone[];
  addMilestone: (
    milestone: Insert<"validation_milestones">
  ) => Promise<ValidationMilestone | null>;
  updateMilestone: (params: {
    id: string;
    data: Update<"validation_milestones">;
  }) => Promise<ValidationMilestone | null>;
  deleteMilestone: (id: string) => Promise<boolean>;

  // Insight-Decision relationships
  linkInsightToDecision: (
    insightId: string,
    decisionId: string
  ) => Promise<boolean>;
  unlinkInsightFromDecision: (
    insightId: string,
    decisionId: string
  ) => Promise<boolean>;
  getInsightsForDecision: (decisionId: string) => Promise<ValidationInsight[]>;
  getDecisionsForInsight: (insightId: string) => Promise<ValidationDecision[]>;

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
  const queryKeys = useMemo(
    () => ({
      all: ["validation", projectId] as const,
      experiments: ["validation", projectId, "experiments"] as const,
      abTests: ["validation", projectId, "abTests"] as const,
      userFeedback: ["validation", projectId, "userFeedback"] as const,
      hypotheses: ["validation", projectId, "hypotheses"] as const,
      relationships: ["validation", projectId, "relationships"] as const,
      insights: ["validation", projectId, "insights"] as const,
      decisions: ["validation", projectId, "decisions"] as const,
      milestones: ["validation", projectId, "milestones"] as const,
      insightDecisions: ["validation", projectId, "insightDecisions"] as const,
    }),
    [projectId]
  );

  // Use React Query to fetch data
  const {
    data: experimentsData,
    isLoading: experimentsLoading,
    error: experimentsError,
  } = useQuery({
    queryKey: queryKeys.experiments,
    queryFn: () => validationService.getExperiments(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: abTestsData,
    isLoading: abTestsLoading,
    error: abTestsError,
  } = useQuery({
    queryKey: queryKeys.abTests,
    queryFn: () => validationService.getABTests(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: userFeedbackData,
    isLoading: userFeedbackLoading,
    error: userFeedbackError,
  } = useQuery({
    queryKey: queryKeys.userFeedback,
    queryFn: () => validationService.getUserFeedback(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: hypothesesData,
    isLoading: hypothesesLoading,
    error: hypothesesError,
  } = useQuery({
    queryKey: queryKeys.hypotheses,
    queryFn: () => validationService.getHypotheses(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: relationshipsData,
    isLoading: relationshipsLoading,
    error: relationshipsError,
  } = useQuery({
    queryKey: queryKeys.relationships,
    queryFn: () => validationService.getRelationships(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: insightsData,
    isLoading: insightsLoading,
    error: insightsError,
  } = useQuery({
    queryKey: queryKeys.insights,
    queryFn: () => validationService.getInsights(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: decisionsData,
    isLoading: decisionsLoading,
    error: decisionsError,
  } = useQuery({
    queryKey: queryKeys.decisions,
    queryFn: () => validationService.getDecisions(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: milestonesData,
    isLoading: milestonesLoading,
    error: milestonesError,
  } = useQuery({
    queryKey: queryKeys.milestones,
    queryFn: () => validationService.getMilestones(projectId!),
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
      const currentUserFeedback =
        store.currentData.validationUserFeedback || [];
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

  // Add new useEffect hooks for store updates
  useEffect(() => {
    if (relationshipsData) {
      const currentRelationships =
        store.currentData.validationRelationships || [];
      if (compareArrays(currentRelationships, relationshipsData)) {
        store.setValidationRelationships(relationshipsData);
      }
    }
  }, [relationshipsData, store]);

  useEffect(() => {
    if (insightsData) {
      const currentInsights = store.currentData.validationInsights || [];
      if (compareArrays(currentInsights, insightsData)) {
        store.setValidationInsights(insightsData);
      }
    }
  }, [insightsData, store]);

  useEffect(() => {
    if (decisionsData) {
      const currentDecisions = store.currentData.validationDecisions || [];
      if (compareArrays(currentDecisions, decisionsData)) {
        store.setValidationDecisions(decisionsData);
      }
    }
  }, [decisionsData, store]);

  useEffect(() => {
    if (milestonesData) {
      const currentMilestones = store.currentData.validationMilestones || [];
      if (compareArrays(currentMilestones, milestonesData)) {
        store.setValidationMilestones(milestonesData);
      }
    }
  }, [milestonesData, store]);

  // Get data from the store for comparison mode
  const storeData = useMemo(() => {
    const source =
      store.comparisonMode && store.stagedData
        ? store.stagedData
        : store.currentData;
    return {
      validationExperiments: source.validationExperiments || [],
      validationABTests: source.validationABTests || [],
      validationUserFeedback: source.validationUserFeedback || [],
      validationHypotheses: source.validationHypotheses || [],
      validationRelationships: source.validationRelationships || [],
      validationInsights: source.validationInsights || [],
      validationDecisions: source.validationDecisions || [],
      validationMilestones: source.validationMilestones || [],
    };
  }, [store.currentData, store.stagedData, store.comparisonMode]);

  // Use either store data or query data based on comparison mode
  const data: ValidationData = useMemo(() => {
    if (store.comparisonMode) {
      return {
        experiments: storeData.validationExperiments,
        abTests: storeData.validationABTests,
        userFeedback: storeData.validationUserFeedback,
        hypotheses: storeData.validationHypotheses,
        relationships: storeData.validationRelationships,
        insights: storeData.validationInsights,
        decisions: storeData.validationDecisions,
        milestones: storeData.validationMilestones,
      };
    } else {
      return {
        experiments: experimentsData || [],
        abTests: abTestsData || [],
        userFeedback: userFeedbackData || [],
        hypotheses: hypothesesData || [],
        relationships: relationshipsData || [],
        insights: insightsData || [],
        decisions: decisionsData || [],
        milestones: milestonesData || [],
      };
    }
  }, [
    store.comparisonMode,
    // Only include storeData in dependencies when in comparison mode
    ...(store.comparisonMode ? [storeData] : []),
    // Only depend on query data when not in comparison mode
    ...(store.comparisonMode
      ? []
      : [
          experimentsData,
          abTestsData,
          userFeedbackData,
          hypothesesData,
          relationshipsData,
          insightsData,
          decisionsData,
          milestonesData,
        ]),
  ]);

  // Compute loading and error states
  const isLoading =
    experimentsLoading ||
    abTestsLoading ||
    userFeedbackLoading ||
    hypothesesLoading ||
    relationshipsLoading ||
    insightsLoading ||
    decisionsLoading ||
    milestonesLoading;
  const queryError =
    experimentsError ||
    abTestsError ||
    userFeedbackError ||
    hypothesesError ||
    relationshipsError ||
    insightsError ||
    decisionsError ||
    milestonesError;

  // === Experiments Operations ===
  // Use our optimistic helper hooks
  const addExperimentOptimistic = useOptimisticCreate<"validation_experiments">(
    {
      projectId,
      tableName: "validation_experiments",
      store,
      service: validationService,
      queryClient,
      queryKey: [...queryKeys.experiments],
      setSubmitting,
      methods: {
        add: "addExperiment",
      },
    }
  );

  const updateExperimentOptimistic =
    useOptimisticUpdate<"validation_experiments">({
      tableName: "validation_experiments",
      store,
      service: validationService,
      queryClient,
      queryKey: [...queryKeys.experiments],
      setSubmitting,
      methods: {
        update: "updateExperiment",
      },
    });

  const deleteExperimentOptimistic = useOptimisticDelete({
    tableName: "validation_experiments",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.experiments],
    setSubmitting,
    methods: {
      delete: "deleteExperiment",
    },
  });

  // Exposed experiment operations with proper typing
  const addExperiment = useCallback(
    async (
      experiment: Insert<"validation_experiments">
    ): Promise<ValidationExperiment | null> => {
      return addExperimentOptimistic(experiment);
    },
    [addExperimentOptimistic]
  );

  const updateExperiment = useCallback(
    async (params: {
      id: string;
      data: Update<"validation_experiments">;
    }): Promise<ValidationExperiment | null> => {
      return updateExperimentOptimistic(params.id, params.data);
    },
    [updateExperimentOptimistic]
  );

  const deleteExperiment = useCallback(
    async (id: string): Promise<boolean> => {
      return deleteExperimentOptimistic(id);
    },
    [deleteExperimentOptimistic]
  );

  // === AB Tests Operations ===
  // Use our optimistic helper hooks
  const addABTestOptimistic = useOptimisticCreate<"validation_ab_tests">({
    projectId,
    tableName: "validation_ab_tests",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.abTests],
    setSubmitting,
    methods: {
      add: "addABTest",
    },
  });

  const updateABTestOptimistic = useOptimisticUpdate<"validation_ab_tests">({
    tableName: "validation_ab_tests",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.abTests],
    setSubmitting,
    methods: {
      update: "updateABTest",
    },
  });

  const deleteABTestOptimistic = useOptimisticDelete({
    tableName: "validation_ab_tests",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.abTests],
    setSubmitting,
    methods: {
      delete: "deleteABTest",
    },
  });

  // Exposed AB Test operations with proper typing
  const addABTest = useCallback(
    async (
      abTest: Insert<"validation_ab_tests">
    ): Promise<ValidationABTest | null> => {
      return addABTestOptimistic(abTest);
    },
    [addABTestOptimistic]
  );

  const updateABTest = useCallback(
    async (params: {
      id: string;
      data: Update<"validation_ab_tests">;
    }): Promise<ValidationABTest | null> => {
      return updateABTestOptimistic(params.id, params.data);
    },
    [updateABTestOptimistic]
  );

  const deleteABTest = useCallback(
    async (id: string): Promise<boolean> => {
      return deleteABTestOptimistic(id);
    },
    [deleteABTestOptimistic]
  );

  // === User Feedback Operations ===
  // Use our optimistic helper hooks
  const addUserFeedbackOptimistic = useOptimisticCreate<"validation_user_feedback">({
    projectId,
    tableName: "validation_user_feedback",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.userFeedback],
    setSubmitting,
    methods: {
      add: "addUserFeedback",
    },
  });

  const updateUserFeedbackOptimistic = useOptimisticUpdate<"validation_user_feedback">({
    tableName: "validation_user_feedback",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.userFeedback],
    setSubmitting,
    methods: {
      update: "updateUserFeedback",
    },
  });

  const deleteUserFeedbackOptimistic = useOptimisticDelete({
    tableName: "validation_user_feedback",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.userFeedback],
    setSubmitting,
    methods: {
      delete: "deleteUserFeedback",
    },
  });

  // Exposed User Feedback operations with proper typing
  const addUserFeedback = useCallback(
    async (
      feedback: Insert<"validation_user_feedback">
    ): Promise<ValidationUserFeedback | null> => {
      return addUserFeedbackOptimistic(feedback);
    },
    [addUserFeedbackOptimistic]
  );

  const updateUserFeedback = useCallback(
    async (params: {
      id: string;
      data: Update<"validation_user_feedback">;
    }): Promise<ValidationUserFeedback | null> => {
      return updateUserFeedbackOptimistic(params.id, params.data);
    },
    [updateUserFeedbackOptimistic]
  );

  const deleteUserFeedback = useCallback(
    async (id: string): Promise<boolean> => {
      return deleteUserFeedbackOptimistic(id);
    },
    [deleteUserFeedbackOptimistic]
  );

  // === Hypotheses Operations ===
  // Use our optimistic helper hooks
  const addHypothesisOptimistic = useOptimisticCreate<"validation_hypotheses">({
    projectId,
    tableName: "validation_hypotheses",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.hypotheses],
    setSubmitting,
    methods: {
      add: "addHypothesis",
    },
  });

  const updateHypothesisOptimistic = useOptimisticUpdate<"validation_hypotheses">({
    tableName: "validation_hypotheses",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.hypotheses],
    setSubmitting,
    methods: {
      update: "updateHypothesis",
    },
  });

  const deleteHypothesisOptimistic = useOptimisticDelete({
    tableName: "validation_hypotheses",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.hypotheses],
    setSubmitting,
    methods: {
      delete: "deleteHypothesis",
    },
  });

  // Exposed Hypothesis operations with proper typing
  const addHypothesis = useCallback(
    async (
      hypothesis: Insert<"validation_hypotheses">
    ): Promise<ValidationHypothesis | null> => {
      return addHypothesisOptimistic(hypothesis);
    },
    [addHypothesisOptimistic]
  );

  const updateHypothesis = useCallback(
    async (params: {
      id: string;
      data: Update<"validation_hypotheses">;
    }): Promise<ValidationHypothesis | null> => {
      return updateHypothesisOptimistic(params.id, params.data);
    },
    [updateHypothesisOptimistic]
  );

  const deleteHypothesis = useCallback(
    async (id: string): Promise<boolean> => {
      return deleteHypothesisOptimistic(id);
    },
    [deleteHypothesisOptimistic]
  );

  // Add optimistic update hooks for relationships
  const addRelationshipOptimistic = useOptimisticCreate<"validation_relationships">({
    projectId,
    tableName: "validation_relationships",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.relationships],
    setSubmitting,
    methods: {
      add: "addRelationship",
    },
  });

  const updateRelationshipOptimistic = useOptimisticUpdate<"validation_relationships">({
    tableName: "validation_relationships",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.relationships],
    setSubmitting,
    methods: {
      update: "updateRelationship",
    },
  });

  const deleteRelationshipOptimistic = useOptimisticDelete({
    tableName: "validation_relationships",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.relationships],
    setSubmitting,
    methods: {
      delete: "deleteRelationship",
    },
  });

  // Add callback functions for relationships
  const addRelationshipCallback = useCallback(
    async (
      relationship: Insert<"validation_relationships">
    ): Promise<ValidationRelationship | null> => {
      return addRelationshipOptimistic(relationship);
    },
    [addRelationshipOptimistic]
  );

  const updateRelationshipCallback = useCallback(
    async (params: {
      id: string;
      data: Update<"validation_relationships">;
    }): Promise<ValidationRelationship | null> => {
      return updateRelationshipOptimistic(params.id, params.data);
    },
    [updateRelationshipOptimistic]
  );

  const deleteRelationshipCallback = useCallback(
    async (id: string): Promise<boolean> => {
      return deleteRelationshipOptimistic(id);
    },
    [deleteRelationshipOptimistic]
  );

  // Add insight operations
  const addInsightOptimistic = useOptimisticCreate<"validation_insights">({
    projectId,
    tableName: "validation_insights",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.insights],
    setSubmitting,
    methods: {
      add: "addInsight",
    },
  });

  const updateInsightOptimistic = useOptimisticUpdate<"validation_insights">({
    tableName: "validation_insights",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.insights],
    setSubmitting,
    methods: {
      update: "updateInsight",
    },
  });

  const deleteInsightOptimistic = useOptimisticDelete({
    tableName: "validation_insights",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.insights],
    setSubmitting,
    methods: {
      delete: "deleteInsight",
    },
  });

  // Add callback functions for insights
  const addInsightCallback = useCallback(
    async (
      insight: Insert<"validation_insights">
    ): Promise<ValidationInsight | null> => {
      return addInsightOptimistic(insight);
    },
    [addInsightOptimistic]
  );

  const updateInsightCallback = useCallback(
    async (params: {
      id: string;
      data: Update<"validation_insights">;
    }): Promise<ValidationInsight | null> => {
      return updateInsightOptimistic(params.id, params.data);
    },
    [updateInsightOptimistic]
  );

  const deleteInsightCallback = useCallback(
    async (id: string): Promise<boolean> => {
      return deleteInsightOptimistic(id);
    },
    [deleteInsightOptimistic]
  );

  // Add decision operations
  const addDecisionOptimistic = useOptimisticCreate<"validation_decisions">({
    projectId,
    tableName: "validation_decisions",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.decisions],
    setSubmitting,
    methods: {
      add: "addDecision",
    },
  });

  const updateDecisionOptimistic = useOptimisticUpdate<"validation_decisions">({
    tableName: "validation_decisions",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.decisions],
    setSubmitting,
    methods: {
      update: "updateDecision",
    },
  });

  const deleteDecisionOptimistic = useOptimisticDelete({
    tableName: "validation_decisions",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.decisions],
    setSubmitting,
    methods: {
      delete: "deleteDecision",
    },
  });

  // Add callback functions for decisions
  const addDecisionCallback = useCallback(
    async (
      decision: Insert<"validation_decisions">
    ): Promise<ValidationDecision | null> => {
      return addDecisionOptimistic(decision);
    },
    [addDecisionOptimistic]
  );

  const updateDecisionCallback = useCallback(
    async (params: {
      id: string;
      data: Update<"validation_decisions">;
    }): Promise<ValidationDecision | null> => {
      return updateDecisionOptimistic(params.id, params.data);
    },
    [updateDecisionOptimistic]
  );

  const deleteDecisionCallback = useCallback(
    async (id: string): Promise<boolean> => {
      return deleteDecisionOptimistic(id);
    },
    [deleteDecisionOptimistic]
  );

  // Add milestone operations
  const addMilestoneOptimistic = useOptimisticCreate<"validation_milestones">({
    projectId,
    tableName: "validation_milestones",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.milestones],
    setSubmitting,
    methods: {
      add: "addMilestone",
    },
  });

  const updateMilestoneOptimistic = useOptimisticUpdate<"validation_milestones">({
    tableName: "validation_milestones",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.milestones],
    setSubmitting,
    methods: {
      update: "updateMilestone",
    },
  });

  const deleteMilestoneOptimistic = useOptimisticDelete({
    tableName: "validation_milestones",
    store,
    service: validationService,
    queryClient,
    queryKey: [...queryKeys.milestones],
    setSubmitting,
    methods: {
      delete: "deleteMilestone",
    },
  });

  // Add callback functions for milestones
  const addMilestoneCallback = useCallback(
    async (
      milestone: Insert<"validation_milestones">
    ): Promise<ValidationMilestone | null> => {
      return addMilestoneOptimistic(milestone);
    },
    [addMilestoneOptimistic]
  );

  const updateMilestoneCallback = useCallback(
    async (params: {
      id: string;
      data: Update<"validation_milestones">;
    }): Promise<ValidationMilestone | null> => {
      return updateMilestoneOptimistic(params.id, params.data);
    },
    [updateMilestoneOptimistic]
  );

  const deleteMilestoneCallback = useCallback(
    async (id: string): Promise<boolean> => {
      return deleteMilestoneOptimistic(id);
    },
    [deleteMilestoneOptimistic]
  );

  // Add getter functions for the new entities
  const getRelationshipsCallback = useCallback(
    (): ValidationRelationship[] => {
      return data.relationships || [];
    },
    [data.relationships]
  );

  const getInsightsCallback = useCallback(
    (): ValidationInsight[] => {
      return data.insights || [];
    },
    [data.insights]
  );

  const getDecisionsCallback = useCallback(
    (): ValidationDecision[] => {
      return data.decisions || [];
    },
    [data.decisions]
  );

  const getMilestonesCallback = useCallback(
    (): ValidationMilestone[] => {
      return data.milestones || [];
    },
    [data.milestones]
  );

  // Diff helpers
  const getExperimentChangeType = useCallback(
    (id: string): ChangeType =>
      store.getItemChangeType("validationExperiments", id),
    [store]
  );

  const getABTestChangeType = useCallback(
    (id: string): ChangeType =>
      store.getItemChangeType("validationABTests", id),
    [store]
  );

  const getUserFeedbackChangeType = useCallback(
    (id: string): ChangeType =>
      store.getItemChangeType("validationUserFeedback", id),
    [store]
  );

  const getHypothesisChangeType = useCallback(
    (id: string): ChangeType =>
      store.getItemChangeType("validationHypotheses", id),
    [store]
  );

  // Link a hypothesis to a product entity
  const linkHypothesisToEntity = useCallback(
    async (params: {
      hypothesisId: string;
      entityType: "problem" | "solution" | "feature" | "journey_pain_point";
      entityId: string;
    }): Promise<boolean> => {
      try {
        return await validationService.linkHypothesisToEntity(params);
      } catch (error) {
        console.error("Error linking hypothesis to entity:", error);
        return false;
      }
    },
    []
  );

  // Add insight-decision relationship methods
  const linkInsightToDecision = useCallback(
    async (insightId: string, decisionId: string): Promise<boolean> => {
      try {
        await validationService.linkInsightToDecision(insightId, decisionId);
        // Invalidate both insights and decisions queries to refresh data
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.insights, insightId],
        });
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.decisions, decisionId],
        });
        return true;
      } catch (error) {
        console.error("Error linking insight to decision:", error);
        return false;
      }
    },
    [queryClient, queryKeys.insights, queryKeys.decisions]
  );

  const unlinkInsightFromDecision = useCallback(
    async (insightId: string, decisionId: string): Promise<boolean> => {
      try {
        await validationService.unlinkInsightFromDecision(
          insightId,
          decisionId
        );
        // Invalidate both insights and decisions queries to refresh data
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.insights, insightId],
        });
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.decisions, decisionId],
        });
        return true;
      } catch (error) {
        console.error("Error unlinking insight from decision:", error);
        return false;
      }
    },
    [queryClient, queryKeys.insights, queryKeys.decisions]
  );

  const getInsightsForDecision = useCallback(
    (decisionId: string): Promise<ValidationInsight[]> => {
      return validationService.getInsightsForDecision(decisionId);
    },
    []
  );

  const getDecisionsForInsight = useCallback(
    (insightId: string): Promise<ValidationDecision[]> => {
      return validationService.getDecisionsForInsight(insightId);
    },
    []
  );

  // Link an experiment to product entities
  const linkExperimentToEntities = useCallback(
    async (params: {
      experimentId: string;
      problemId?: string;
      solutionId?: string;
      featureId?: string;
    }): Promise<boolean> => {
      try {
        return await validationService.linkExperimentToEntities(params);
      } catch (error) {
        console.error("Error linking experiment to entities:", error);
        return false;
      }
    },
    []
  );

  // Get hypotheses for a specific entity
  const getHypothesesForEntity = useCallback(
    (entityType: string, entityId: string): ValidationHypothesis[] => {
      return validationService.getHypothesesForEntity(
        data.hypotheses,
        entityType,
        entityId
      );
    },
    [data.hypotheses]
  );

  // Get experiments for a specific entity
  const getExperimentsForEntity = useCallback(
    (entityType: string, entityId: string): ValidationExperiment[] => {
      return validationService.getExperimentsForEntity(
        data.experiments,
        entityType,
        entityId
      );
    },
    [data.experiments]
  );

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

    // Relationships
    getRelationships: getRelationshipsCallback,
    addRelationship: addRelationshipCallback,
    updateRelationship: updateRelationshipCallback,
    deleteRelationship: deleteRelationshipCallback,

    // Insights
    getInsights: getInsightsCallback,
    addInsight: addInsightCallback,
    updateInsight: updateInsightCallback,
    deleteInsight: deleteInsightCallback,

    // Decisions
    getDecisions: getDecisionsCallback,
    addDecision: addDecisionCallback,
    updateDecision: updateDecisionCallback,
    deleteDecision: deleteDecisionCallback,

    // Milestones
    getMilestones: getMilestonesCallback,
    addMilestone: addMilestoneCallback,
    updateMilestone: updateMilestoneCallback,
    deleteMilestone: deleteMilestoneCallback,

    // Insight-Decision relationships
    linkInsightToDecision,
    unlinkInsightFromDecision,
    getInsightsForDecision,
    getDecisionsForInsight,

    // Diff helpers
    getExperimentChangeType,
    getABTestChangeType,
    getUserFeedbackChangeType,
    getHypothesisChangeType,
    isDiffMode: store.comparisonMode,

    // Add new methods
    linkHypothesisToEntity,
    linkExperimentToEntities,
    getHypothesesForEntity,
    getExperimentsForEntity,
  };
} 