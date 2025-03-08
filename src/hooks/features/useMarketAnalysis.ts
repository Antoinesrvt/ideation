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
  ChangeType
} from '@/store/types';
import { marketAnalysisService } from '@/lib/services';


export interface UseMarketAnalysisReturn {
  data: MarketAnalysisData;
  isLoading: boolean;
  error: Error | null;

  // Personas
  addPersona: (persona: Omit<MarketPersona, 'id' | 'created_at' | 'updated_at'>) => Promise<MarketPersona | null>;
  updatePersona: (params: { id: string; data: Partial<Omit<MarketPersona, 'id' | 'created_at' | 'updated_at'>> }) => Promise<MarketPersona | null>;
  deletePersona: (id: string) => Promise<boolean>;

  // Interviews
  addInterview: (interview: Omit<MarketInterview, 'id' | 'created_at' | 'updated_at'>) => Promise<MarketInterview | null>;
  updateInterview: (params: { id: string; data: Partial<Omit<MarketInterview, 'id' | 'created_at' | 'updated_at'>> }) => Promise<MarketInterview | null>;
  deleteInterview: (id: string) => Promise<boolean>;

  // Competitors
  addCompetitor: (competitor: Omit<MarketCompetitor, 'id' | 'created_at' | 'updated_at'>) => Promise<MarketCompetitor | null>;
  updateCompetitor: (params: { id: string; data: Partial<Omit<MarketCompetitor, 'id' | 'created_at' | 'updated_at'>> }) => Promise<MarketCompetitor | null>;
  deleteCompetitor: (id: string) => Promise<boolean>;

  // Trends
  addTrend: (trend: Omit<MarketTrend, 'id' | 'created_at' | 'updated_at'>) => Promise<MarketTrend | null>;
  updateTrend: (params: { id: string; data: Partial<Omit<MarketTrend, 'id' | 'created_at' | 'updated_at'>> }) => Promise<MarketTrend | null>;
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

  // Personas operations with optimistic updates
  const addPersona = useCallback(async (persona: Omit<MarketPersona, 'id' | 'created_at' | 'updated_at'>): Promise<MarketPersona | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completePersona: MarketPersona = {
      ...persona,
      id: tempId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalPersonas = [...store.currentData.marketPersonas];
    
    try {
      // 1. Update store optimistically
      store.addMarketPersona(completePersona);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        marketAnalysisService.addPersona(projectId, persona)
      );
      
      // 3. Update store with real ID
      store.updateMarketPersona(tempId, { 
        id: result.id,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.personas });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding persona:', err);
      
      // 5. Revert optimistic update on error
      store.setMarketPersonas(originalPersonas);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys.personas]);

  const updatePersona = useCallback(async ({ id, data: updates }: { id: string; data: Partial<Omit<MarketPersona, 'id' | 'created_at' | 'updated_at'>> }): Promise<MarketPersona | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalPersona = store.currentData.marketPersonas.find(p => p.id === id);
    if (!originalPersona) return null;
    
    // Create updated item
    const updatedPersona = {
      ...originalPersona,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    try {
      // 1. Update store optimistically
      store.updateMarketPersona(id, updates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        marketAnalysisService.updatePersona(id, updates)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.personas });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating persona:', err);
      
      // 4. Revert optimistic update on error
      if (originalPersona) {
        store.updateMarketPersona(id, originalPersona);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys.personas]);

  const deletePersona = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalPersonas = [...store.currentData.marketPersonas];
    const personaToDelete = originalPersonas.find(p => p.id === id);
    if (!personaToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteMarketPersona(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        marketAnalysisService.deletePersona(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.personas });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting persona:', err);
      
      // 4. Revert optimistic update on error
      store.setMarketPersonas(originalPersonas);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys.personas]);

  // Interviews operations with optimistic updates
  const addInterview = useCallback(async (interview: Omit<MarketInterview, 'id' | 'created_at' | 'updated_at'>): Promise<MarketInterview | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completeInterview: MarketInterview = {
      ...interview,
      id: tempId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalInterviews = [...store.currentData.marketInterviews];
    
    try {
      // 1. Update store optimistically
      store.addMarketInterview(completeInterview);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        marketAnalysisService.addInterview(projectId, interview)
      );
      
      // 3. Update store with real ID
      store.updateMarketInterview(tempId, { 
        id: result.id,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding interview:', err);
      
      // 5. Revert optimistic update on error
      store.setMarketInterviews(originalInterviews);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys.interviews]);

  const updateInterview = useCallback(async ({ id, data: updates }: { id: string; data: Partial<Omit<MarketInterview, 'id' | 'created_at' | 'updated_at'>> }): Promise<MarketInterview | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalInterview = store.currentData.marketInterviews.find(i => i.id === id);
    if (!originalInterview) return null;
    
    try {
      // 1. Update store optimistically
      store.updateMarketInterview(id, updates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        marketAnalysisService.updateInterview(id, updates)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating interview:', err);
      
      // 4. Revert optimistic update on error
      if (originalInterview) {
        store.updateMarketInterview(id, originalInterview);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys.interviews]);

  const deleteInterview = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalInterviews = [...store.currentData.marketInterviews];
    const interviewToDelete = originalInterviews.find(i => i.id === id);
    if (!interviewToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteMarketInterview(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        marketAnalysisService.deleteInterview(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting interview:', err);
      
      // 4. Revert optimistic update on error
      store.setMarketInterviews(originalInterviews);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys.interviews]);

  // Competitors operations with optimistic updates
  const addCompetitor = useCallback(async (competitor: Omit<MarketCompetitor, 'id' | 'created_at' | 'updated_at'>): Promise<MarketCompetitor | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completeCompetitor: MarketCompetitor = {
      ...competitor,
      id: tempId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalCompetitors = [...store.currentData.marketCompetitors];
    
    try {
      // 1. Update store optimistically
      store.addMarketCompetitor(completeCompetitor);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        marketAnalysisService.addCompetitor(projectId, competitor)
      );
      
      // 3. Update store with real ID
      store.updateMarketCompetitor(tempId, { 
        id: result.id,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.competitors });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding competitor:', err);
      
      // 5. Revert optimistic update on error
      store.setMarketCompetitors(originalCompetitors);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys.competitors]);

  const updateCompetitor = useCallback(async ({ id, data: updates }: { id: string; data: Partial<Omit<MarketCompetitor, 'id' | 'created_at' | 'updated_at'>> }): Promise<MarketCompetitor | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalCompetitor = store.currentData.marketCompetitors.find(c => c.id === id);
    if (!originalCompetitor) return null;
    
    try {
      // 1. Update store optimistically
      store.updateMarketCompetitor(id, updates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        marketAnalysisService.updateCompetitor(id, updates)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.competitors });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating competitor:', err);
      
      // 4. Revert optimistic update on error
      if (originalCompetitor) {
        store.updateMarketCompetitor(id, originalCompetitor);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys.competitors]);

  const deleteCompetitor = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalCompetitors = [...store.currentData.marketCompetitors];
    const competitorToDelete = originalCompetitors.find(c => c.id === id);
    if (!competitorToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteMarketCompetitor(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        marketAnalysisService.deleteCompetitor(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.competitors });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting competitor:', err);
      
      // 4. Revert optimistic update on error
      store.setMarketCompetitors(originalCompetitors);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys.competitors]);

  // Trends operations with optimistic updates
  const addTrend = useCallback(async (trend: Omit<MarketTrend, 'id' | 'created_at' | 'updated_at'>): Promise<MarketTrend | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completeTrend: MarketTrend = {
      ...trend,
      id: tempId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalTrends = [...store.currentData.marketTrends];
    
    try {
      // 1. Update store optimistically
      store.addMarketTrend(completeTrend);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        marketAnalysisService.addTrend(projectId, trend)
      );
      
      // 3. Update store with real ID
      store.updateMarketTrend(tempId, { 
        id: result.id,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.trends });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding trend:', err);
      
      // 5. Revert optimistic update on error
      store.setMarketTrends(originalTrends);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys.trends]);

  const updateTrend = useCallback(async ({ id, data: updates }: { id: string; data: Partial<Omit<MarketTrend, 'id' | 'created_at' | 'updated_at'>> }): Promise<MarketTrend | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalTrend = store.currentData.marketTrends.find(t => t.id === id);
    if (!originalTrend) return null;
    
    try {
      // 1. Update store optimistically
      store.updateMarketTrend(id, updates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        marketAnalysisService.updateTrend(id, updates)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.trends });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating trend:', err);
      
      // 4. Revert optimistic update on error
      if (originalTrend) {
        store.updateMarketTrend(id, originalTrend);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys.trends]);

  const deleteTrend = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalTrends = [...store.currentData.marketTrends];
    const trendToDelete = originalTrends.find(t => t.id === id);
    if (!trendToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteMarketTrend(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        marketAnalysisService.deleteTrend(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.trends });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting trend:', err);
      
      // 4. Revert optimistic update on error
      store.setMarketTrends(originalTrends);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys.trends]);

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