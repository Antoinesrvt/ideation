import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { MarketAnalysisService, MarketAnalysisData } from '@/lib/services/features/market-analysis-service';
import { useProjectStore } from '@/store';
import type { 
  MarketPersona,
  MarketInterview,
  MarketCompetitor,
  MarketTrend,
  ChangeType,
  Insert,
  Update
} from '@/store/types';
import { marketAnalysisService } from '@/lib/services';
import { useOptimisticCreate, useOptimisticUpdate, useOptimisticDelete } from '../utils/optimistic-helpers';

export interface UseMarketAnalysisReturn {
  data: MarketAnalysisData;
  isLoading: boolean;
  error: Error | null;

  // Personas
  addPersona: (persona: Insert<'market_personas'>) => Promise<MarketPersona | null>;
  updatePersona: (params: { id: string; data: Update<'market_personas'> }) => Promise<MarketPersona | null>;
  deletePersona: (id: string) => Promise<boolean>;

  // Interviews
  addInterview: (interview: Insert<'market_interviews'>) => Promise<MarketInterview | null>;
  updateInterview: (params: { id: string; data: Update<'market_interviews'> }) => Promise<MarketInterview | null>;
  deleteInterview: (id: string) => Promise<boolean>;

  // Competitors
  addCompetitor: (competitor: Insert<'market_competitors'>) => Promise<MarketCompetitor | null>;
  updateCompetitor: (params: { id: string; data: Update<'market_competitors'> }) => Promise<MarketCompetitor | null>;
  deleteCompetitor: (id: string) => Promise<boolean>;

  // Trends
  addTrend: (trend: Insert<'market_trends'>) => Promise<MarketTrend | null>;
  updateTrend: (params: { id: string; data: Update<'market_trends'> }) => Promise<MarketTrend | null>;
  deleteTrend: (id: string) => Promise<boolean>;

  // Diff helpers
  getPersonaChangeType: (id: string) => ChangeType;
  getInterviewChangeType: (id: string) => ChangeType;
  getCompetitorChangeType: (id: string) => ChangeType;
  getTrendChangeType: (id: string) => ChangeType;
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

// Helper function to check array equality
function arraysEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  
  // Check if arrays have same items (not concerned with order for this use case)
  const sortedA = [...a].sort((x, y) => 
    (x.id && y.id) ? x.id.localeCompare(y.id) : 0
  );
  const sortedB = [...b].sort((x, y) => 
    (x.id && y.id) ? x.id.localeCompare(y.id) : 0
  );
  
  // Simple comparison of stringified arrays (works for our case of objects with IDs)
  return JSON.stringify(sortedA) === JSON.stringify(sortedB);
}

export function useMarketAnalysis(projectId: string | undefined): UseMarketAnalysisReturn {
  const queryClient = useQueryClient();
  const store = useProjectStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create stable, memoized query keys
  const queryKeys = useMemo(() => ({
    all: ['marketAnalysis', projectId] as const,
    personas: ['marketAnalysis', projectId, 'personas'] as const,
    interviews: ['marketAnalysis', projectId, 'interviews'] as const,
    competitors: ['marketAnalysis', projectId, 'competitors'] as const,
    trends: ['marketAnalysis', projectId, 'trends'] as const,
  }), [projectId]);

  // Use React Query to fetch data
  const { 
    data: personasData, 
    isLoading: personasLoading, 
    error: personasError 
  } = useQuery({
    queryKey: queryKeys.personas,
    queryFn: () => marketAnalysisService.getPersonas(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: interviewsData, 
    isLoading: interviewsLoading, 
    error: interviewsError 
  } = useQuery({
    queryKey: queryKeys.interviews,
    queryFn: () => marketAnalysisService.getInterviews(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: competitorsData, 
    isLoading: competitorsLoading, 
    error: competitorsError 
  } = useQuery({
    queryKey: queryKeys.competitors,
    queryFn: () => marketAnalysisService.getCompetitors(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: trendsData, 
    isLoading: trendsLoading, 
    error: trendsError 
  } = useQuery({
    queryKey: queryKeys.trends,
    queryFn: () => marketAnalysisService.getTrends(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update store when data changes, but only if data has actually changed
  useEffect(() => {
    if (personasData && !arraysEqual(personasData, store.currentData.marketPersonas)) {
      store.setMarketPersonas(personasData);
    }
  }, [personasData, store]);

  useEffect(() => {
    if (interviewsData && !arraysEqual(interviewsData, store.currentData.marketInterviews)) {
      store.setMarketInterviews(interviewsData);
    }
  }, [interviewsData, store]);

  useEffect(() => {
    if (competitorsData && !arraysEqual(competitorsData, store.currentData.marketCompetitors)) {
      store.setMarketCompetitors(competitorsData);
    }
  }, [competitorsData, store]);

  useEffect(() => {
    if (trendsData && !arraysEqual(trendsData, store.currentData.marketTrends)) {
      store.setMarketTrends(trendsData);
    }
  }, [trendsData, store]);

  // Get data from the store for comparison mode
  const storeData = useMemo(() => {
    const source = store.comparisonMode && store.stagedData ? store.stagedData : store.currentData;
    return {
      marketPersonas: source.marketPersonas || [],
      marketInterviews: source.marketInterviews || [],
      marketCompetitors: source.marketCompetitors || [],
      marketTrends: source.marketTrends || []
    };
  }, [store.currentData, store.stagedData, store.comparisonMode]);

  // Use either store data or query data based on comparison mode
  const data = useMemo((): MarketAnalysisData => {
    if (store.comparisonMode) {
      return {
        personas: storeData.marketPersonas,
        interviews: storeData.marketInterviews,
        competitors: storeData.marketCompetitors,
        trends: storeData.marketTrends
      };
    } else {
      return {
        personas: personasData || [],
        interviews: interviewsData || [],
        competitors: competitorsData || [],
        trends: trendsData || []
      };
    }
  }, [
    store.comparisonMode, 
    storeData,
    personasData,
    interviewsData,
    competitorsData,
    trendsData
  ]);

  // Compute loading and error states
  const isLoading = personasLoading || interviewsLoading || competitorsLoading || trendsLoading;
  const queryError = personasError || interviewsError || competitorsError || trendsError;

  // === Persona Operations ===
  // Use our optimistic helper hooks
  const addPersonaOptimistic = useOptimisticCreate<'market_personas'>({
    projectId,
    tableName: 'market_personas',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.personas],
    setSubmitting,
    methods: {
      add: 'addPersona'
    }
  });

  const updatePersonaOptimistic = useOptimisticUpdate<'market_personas'>({
    tableName: 'market_personas',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.personas],
    setSubmitting,
    methods: {
      update: 'updatePersona'
    }
  });

  const deletePersonaOptimistic = useOptimisticDelete({
    tableName: 'market_personas',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.personas],
    setSubmitting,
    methods: {
      delete: 'deletePersona'
    }
  });

  // Exposed persona operations with proper typing
  const addPersona = useCallback(async (persona: Insert<'market_personas'>): Promise<MarketPersona | null> => {
    return addPersonaOptimistic(persona);
  }, [addPersonaOptimistic]);

  const updatePersona = useCallback(async (params: { id: string; data: Update<'market_personas'> }): Promise<MarketPersona | null> => {
    return updatePersonaOptimistic(params.id, params.data);
  }, [updatePersonaOptimistic]);

  const deletePersona = useCallback(async (id: string): Promise<boolean> => {
    return deletePersonaOptimistic(id);
  }, [deletePersonaOptimistic]);

  // === Interview Operations ===
  // Use our optimistic helper hooks
  const addInterviewOptimistic = useOptimisticCreate<'market_interviews'>({
    projectId,
    tableName: 'market_interviews',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.interviews],
    setSubmitting,
    methods: {
      add: 'addInterview'
    }
  });

  const updateInterviewOptimistic = useOptimisticUpdate<'market_interviews'>({
    tableName: 'market_interviews',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.interviews],
    setSubmitting,
    methods: {
      update: 'updateInterview'
    }
  });

  const deleteInterviewOptimistic = useOptimisticDelete({
    tableName: 'market_interviews',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.interviews],
    setSubmitting,
    methods: {
      delete: 'deleteInterview'
    }
  });

  // Exposed interview operations with proper typing
  const addInterview = useCallback(async (interview: Insert<'market_interviews'>): Promise<MarketInterview | null> => {
    return addInterviewOptimistic(interview);
  }, [addInterviewOptimistic]);

  const updateInterview = useCallback(async (params: { id: string; data: Update<'market_interviews'> }): Promise<MarketInterview | null> => {
    return updateInterviewOptimistic(params.id, params.data);
  }, [updateInterviewOptimistic]);

  const deleteInterview = useCallback(async (id: string): Promise<boolean> => {
    return deleteInterviewOptimistic(id);
  }, [deleteInterviewOptimistic]);

  // === Competitor Operations ===
  // Use our optimistic helper hooks
  const addCompetitorOptimistic = useOptimisticCreate<'market_competitors'>({
    projectId,
    tableName: 'market_competitors',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.competitors],
    setSubmitting,
    methods: {
      add: 'addCompetitor'
    }
  });

  const updateCompetitorOptimistic = useOptimisticUpdate<'market_competitors'>({
    tableName: 'market_competitors',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.competitors],
    setSubmitting,
    methods: {
      update: 'updateCompetitor'
    }
  });

  const deleteCompetitorOptimistic = useOptimisticDelete({
    tableName: 'market_competitors',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.competitors],
    setSubmitting,
    methods: {
      delete: 'deleteCompetitor'
    }
  });

  // Exposed competitor operations with proper typing
  const addCompetitor = useCallback(async (competitor: Insert<'market_competitors'>): Promise<MarketCompetitor | null> => {
    return addCompetitorOptimistic(competitor);
  }, [addCompetitorOptimistic]);

  const updateCompetitor = useCallback(async (params: { id: string; data: Update<'market_competitors'> }): Promise<MarketCompetitor | null> => {
    return updateCompetitorOptimistic(params.id, params.data);
  }, [updateCompetitorOptimistic]);

  const deleteCompetitor = useCallback(async (id: string): Promise<boolean> => {
    return deleteCompetitorOptimistic(id);
  }, [deleteCompetitorOptimistic]);

  // === Trend Operations ===
  // Use our optimistic helper hooks
  const addTrendOptimistic = useOptimisticCreate<'market_trends'>({
    projectId,
    tableName: 'market_trends',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.trends],
    setSubmitting,
    methods: {
      add: 'addTrend'
    }
  });

  const updateTrendOptimistic = useOptimisticUpdate<'market_trends'>({
    tableName: 'market_trends',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.trends],
    setSubmitting,
    methods: {
      update: 'updateTrend'
    }
  });

  const deleteTrendOptimistic = useOptimisticDelete({
    tableName: 'market_trends',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.trends],
    setSubmitting,
    methods: {
      delete: 'deleteTrend'
    }
  });

  // Exposed trend operations with proper typing
  const addTrend = useCallback(async (trend: Insert<'market_trends'>): Promise<MarketTrend | null> => {
    return addTrendOptimistic(trend);
  }, [addTrendOptimistic]);

  const updateTrend = useCallback(async (params: { id: string; data: Update<'market_trends'> }): Promise<MarketTrend | null> => {
    return updateTrendOptimistic(params.id, params.data);
  }, [updateTrendOptimistic]);

  const deleteTrend = useCallback(async (id: string): Promise<boolean> => {
    return deleteTrendOptimistic(id);
  }, [deleteTrendOptimistic]);

  // Diff helpers
  const getPersonaChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('marketPersonas', id), [store]);

  const getInterviewChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('marketInterviews', id), [store]);

  const getCompetitorChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('marketCompetitors', id), [store]);

  const getTrendChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('marketTrends', id), [store]);

  return {
    data,
    isLoading,
    error: queryError,

    // Personas
    addPersona,
    updatePersona,
    deletePersona,

    // Interviews
    addInterview,
    updateInterview,
    deleteInterview,

    // Competitors
    addCompetitor,
    updateCompetitor,
    deleteCompetitor,

    // Trends
    addTrend,
    updateTrend,
    deleteTrend,

    // Diff helpers
    getPersonaChangeType,
    getInterviewChangeType,
    getCompetitorChangeType,
    getTrendChangeType,
    isDiffMode: store.comparisonMode
  };
}