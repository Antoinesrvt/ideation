import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { FinancialsData } from '@/lib/services/features/financials-service';
import { useProjectStore } from '@/store';
import type { 
  FinancialRevenueStream,
  FinancialCostStructure,
  FinancialPricingStrategy,
  FinancialProjection,
  ChangeType
} from '@/store/types';
import { financialsService } from '@/lib/services';

export interface UseFinancialsReturn {
  data: FinancialsData;
  isLoading: boolean;
  error: Error | null;

  // Revenue Streams
  addRevenueStream: (stream: Omit<FinancialRevenueStream, 'id' | 'created_at' | 'updated_at'>) => Promise<FinancialRevenueStream | null>;
  updateRevenueStream: (params: { id: string; data: Partial<Omit<FinancialRevenueStream, 'id' | 'created_at' | 'updated_at'>> }) => Promise<FinancialRevenueStream | null>;
  deleteRevenueStream: (id: string) => Promise<boolean>;

  // Cost Structure
  addCostStructure: (cost: Omit<FinancialCostStructure, 'id' | 'created_at' | 'updated_at'>) => Promise<FinancialCostStructure | null>;
  updateCostStructure: (params: { id: string; data: Partial<Omit<FinancialCostStructure, 'id' | 'created_at' | 'updated_at'>> }) => Promise<FinancialCostStructure | null>;
  deleteCostStructure: (id: string) => Promise<boolean>;

  // Pricing Strategies
  addPricingStrategy: (strategy: Omit<FinancialPricingStrategy, 'id' | 'created_at' | 'updated_at'>) => Promise<FinancialPricingStrategy | null>;
  updatePricingStrategy: (params: { id: string; data: Partial<Omit<FinancialPricingStrategy, 'id' | 'created_at' | 'updated_at'>> }) => Promise<FinancialPricingStrategy | null>;
  deletePricingStrategy: (id: string) => Promise<boolean>;

  // Financial Projections
  addProjection: (projection: Omit<FinancialProjection, 'id' | 'created_at' | 'updated_at'>) => Promise<FinancialProjection | null>;
  updateProjection: (params: { id: string; data: Partial<Omit<FinancialProjection, 'id' | 'created_at' | 'updated_at'>> }) => Promise<FinancialProjection | null>;
  deleteProjection: (id: string) => Promise<boolean>;
  
  // Diff helpers
  getRevenueStreamChangeType: (id: string) => ChangeType;
  getCostStructureChangeType: (id: string) => ChangeType;
  getPricingStrategyChangeType: (id: string) => ChangeType;
  getProjectionChangeType: (id: string) => ChangeType;
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

export function useFinancials(projectId: string | undefined): UseFinancialsReturn {
  const queryClient = useQueryClient();
  const store = useProjectStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create stable, memoized query keys
  const queryKeys = useMemo(() => ({
    all: ['financials', projectId] as const,
    revenueStreams: ['financials', projectId, 'revenueStreams'] as const,
    costStructure: ['financials', projectId, 'costStructure'] as const,
    pricingStrategies: ['financials', projectId, 'pricingStrategies'] as const,
    projections: ['financials', projectId, 'projections'] as const,
  }), [projectId]);

  // Use React Query to fetch data
  const { 
    data: revenueStreamsData, 
    isLoading: revenueStreamsLoading, 
    error: revenueStreamsError 
  } = useQuery({
    queryKey: queryKeys.revenueStreams,
    queryFn: () => financialsService.getRevenueStreams(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: costStructureData, 
    isLoading: costStructureLoading, 
    error: costStructureError 
  } = useQuery({
    queryKey: queryKeys.costStructure,
    queryFn: () => financialsService.getCostStructure(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: pricingStrategiesData, 
    isLoading: pricingStrategiesLoading, 
    error: pricingStrategiesError 
  } = useQuery({
    queryKey: queryKeys.pricingStrategies,
    queryFn: () => financialsService.getPricingStrategies(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: projectionsData, 
    isLoading: projectionsLoading, 
    error: projectionsError 
  } = useQuery({
    queryKey: queryKeys.projections,
    queryFn: () => financialsService.getProjections(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update store when data changes
  useEffect(() => {
    if (revenueStreamsData) {
      store.setFinancialRevenueStreams(revenueStreamsData);
    }
  }, [revenueStreamsData, store]);

  useEffect(() => {
    if (costStructureData) {
      store.setFinancialCostStructure(costStructureData);
    }
  }, [costStructureData, store]);

  useEffect(() => {
    if (pricingStrategiesData) {
      store.setFinancialPricingStrategies(pricingStrategiesData);
    }
  }, [pricingStrategiesData, store]);

  useEffect(() => {
    if (projectionsData) {
      store.setFinancialProjections(projectionsData);
    }
  }, [projectionsData, store]);

  // Get data from the store for comparison mode
  const storeData = useMemo(() => {
    const source = store.comparisonMode && store.stagedData ? store.stagedData : store.currentData;
    return {
      financialRevenueStreams: source.financialRevenueStreams || [],
      financialCostStructure: source.financialCostStructure || [],
      financialPricingStrategies: source.financialPricingStrategies || [],
      financialProjections: source.financialProjections || []
    };
  }, [store.currentData, store.stagedData, store.comparisonMode]);

  // Use either store data or query data based on comparison mode
  const data = useMemo((): FinancialsData => {
    if (store.comparisonMode) {
      return {
        revenueStreams: storeData.financialRevenueStreams,
        costStructure: storeData.financialCostStructure,
        pricingStrategies: storeData.financialPricingStrategies,
        projections: storeData.financialProjections
      };
    } else {
      return {
        revenueStreams: revenueStreamsData || [],
        costStructure: costStructureData || [],
        pricingStrategies: pricingStrategiesData || [],
        projections: projectionsData || []
      };
    }
  }, [
    store.comparisonMode, 
    storeData,
    revenueStreamsData,
    costStructureData,
    pricingStrategiesData,
    projectionsData
  ]);

  // Compute loading and error states
  const isLoading = revenueStreamsLoading || costStructureLoading || pricingStrategiesLoading || projectionsLoading;
  const queryError = revenueStreamsError || costStructureError || pricingStrategiesError || projectionsError;

  // === Revenue Streams Operations ===
  const addRevenueStream = useCallback(async (stream: Omit<FinancialRevenueStream, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialRevenueStream | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completeStream: FinancialRevenueStream = {
      ...stream,
      id: tempId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalStreams = [...store.currentData.financialRevenueStreams];
    
    try {
      // 1. Update store optimistically
      store.addFinancialRevenueStream(completeStream);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        financialsService.addRevenueStream(projectId, stream)
      );
      
      // 3. Update store with real ID
      store.updateFinancialRevenueStream(tempId, { 
        id: result.id,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.revenueStreams });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding revenue stream:', err);
      
      // 5. Revert optimistic update on error
      store.setFinancialRevenueStreams(originalStreams);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const updateRevenueStream = useCallback(async ({ id, data: updates }: { id: string; data: Partial<Omit<FinancialRevenueStream, 'id' | 'created_at' | 'updated_at'>> }): Promise<FinancialRevenueStream | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalStream = store.currentData.financialRevenueStreams.find(s => s.id === id);
    if (!originalStream) return null;
    
    try {
      // 1. Update store optimistically
      store.updateFinancialRevenueStream(id, updates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        financialsService.updateRevenueStream(id, updates)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.revenueStreams });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating revenue stream:', err);
      
      // 4. Revert optimistic update on error
      if (originalStream) {
        store.updateFinancialRevenueStream(id, originalStream);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const deleteRevenueStream = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalStreams = [...store.currentData.financialRevenueStreams];
    const streamToDelete = originalStreams.find(s => s.id === id);
    if (!streamToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteFinancialRevenueStream(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        financialsService.deleteRevenueStream(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.revenueStreams });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting revenue stream:', err);
      
      // 4. Revert optimistic update on error
      store.setFinancialRevenueStreams(originalStreams);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  // === Cost Structure Operations ===
  const addCostStructure = useCallback(async (cost: Omit<FinancialCostStructure, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialCostStructure | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completeCost: FinancialCostStructure = {
      ...cost,
      id: tempId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalCosts = [...store.currentData.financialCostStructure];
    
    try {
      // 1. Update store optimistically
      store.addFinancialCostStructure(completeCost);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        financialsService.addCostStructure(projectId, cost)
      );
      
      // 3. Update store with real ID
      store.updateFinancialCostStructure(tempId, { 
        id: result.id,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.costStructure });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding cost structure:', err);
      
      // 5. Revert optimistic update on error
      store.setFinancialCostStructure(originalCosts);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const updateCostStructure = useCallback(async ({ id, data: updates }: { id: string; data: Partial<Omit<FinancialCostStructure, 'id' | 'created_at' | 'updated_at'>> }): Promise<FinancialCostStructure | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalCost = store.currentData.financialCostStructure.find(c => c.id === id);
    if (!originalCost) return null;
    
    try {
      // 1. Update store optimistically
      store.updateFinancialCostStructure(id, updates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        financialsService.updateCostStructure(id, updates)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.costStructure });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating cost structure:', err);
      
      // 4. Revert optimistic update on error
      if (originalCost) {
        store.updateFinancialCostStructure(id, originalCost);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const deleteCostStructure = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalCosts = [...store.currentData.financialCostStructure];
    const costToDelete = originalCosts.find(c => c.id === id);
    if (!costToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteFinancialCostStructure(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        financialsService.deleteCostStructure(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.costStructure });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting cost structure:', err);
      
      // 4. Revert optimistic update on error
      store.setFinancialCostStructure(originalCosts);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  // === Pricing Strategies Operations ===
  const addPricingStrategy = useCallback(async (strategy: Omit<FinancialPricingStrategy, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialPricingStrategy | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completeStrategy: FinancialPricingStrategy = {
      ...strategy,
      id: tempId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalStrategies = [...store.currentData.financialPricingStrategies];
    
    try {
      // 1. Update store optimistically
      store.addFinancialPricingStrategy(completeStrategy);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        financialsService.addPricingStrategy(projectId, strategy)
      );
      
      // 3. Update store with real ID
      store.updateFinancialPricingStrategy(tempId, { 
        id: result.id,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.pricingStrategies });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding pricing strategy:', err);
      
      // 5. Revert optimistic update on error
      store.setFinancialPricingStrategies(originalStrategies);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const updatePricingStrategy = useCallback(async ({ id, data: updates }: { id: string; data: Partial<Omit<FinancialPricingStrategy, 'id' | 'created_at' | 'updated_at'>> }): Promise<FinancialPricingStrategy | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalStrategy = store.currentData.financialPricingStrategies.find(s => s.id === id);
    if (!originalStrategy) return null;
    
    try {
      // 1. Update store optimistically
      store.updateFinancialPricingStrategy(id, updates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        financialsService.updatePricingStrategy(id, updates)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.pricingStrategies });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating pricing strategy:', err);
      
      // 4. Revert optimistic update on error
      if (originalStrategy) {
        store.updateFinancialPricingStrategy(id, originalStrategy);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const deletePricingStrategy = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalStrategies = [...store.currentData.financialPricingStrategies];
    const strategyToDelete = originalStrategies.find(s => s.id === id);
    if (!strategyToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteFinancialPricingStrategy(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        financialsService.deletePricingStrategy(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.pricingStrategies });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting pricing strategy:', err);
      
      // 4. Revert optimistic update on error
      store.setFinancialPricingStrategies(originalStrategies);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  // === Financial Projections Operations ===
  const addProjection = useCallback(async (projection: Omit<FinancialProjection, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialProjection | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completeProjection: FinancialProjection = {
      ...projection,
      id: tempId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalProjections = [...store.currentData.financialProjections];
    
    try {
      // 1. Update store optimistically
      store.addFinancialProjection(completeProjection);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        financialsService.addProjection(projectId, projection)
      );
      
      // 3. Update store with real ID
      const projectionData = result.data as FinancialProjection;
      store.updateFinancialProjection(tempId, { 
        id: projectionData.id,
        created_at: projectionData.created_at,
        updated_at: projectionData.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.projections });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return projectionData;
    } catch (err) {
      console.error('Error adding projection:', err);
      
      // 5. Revert optimistic update on error
      store.setFinancialProjections(originalProjections);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const updateProjection = useCallback(async ({ id, data: updates }: { id: string; data: Partial<Omit<FinancialProjection, 'id' | 'created_at' | 'updated_at'>> }): Promise<FinancialProjection | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalProjection = store.currentData.financialProjections.find(p => p.id === id);
    if (!originalProjection) return null;
    
    try {
      // 1. Update store optimistically
      store.updateFinancialProjection(id, updates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        financialsService.updateProjection(id, updates)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.projections });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result.data as FinancialProjection;
    } catch (err) {
      console.error('Error updating projection:', err);
      
      // 4. Revert optimistic update on error
      if (originalProjection) {
        store.updateFinancialProjection(id, originalProjection);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const deleteProjection = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalProjections = [...store.currentData.financialProjections];
    const projectionToDelete = originalProjections.find(p => p.id === id);
    if (!projectionToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteFinancialProjection(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        financialsService.deleteProjection(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.projections });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting projection:', err);
      
      // 4. Revert optimistic update on error
      store.setFinancialProjections(originalProjections);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);
  
  // Diff helpers
  const getRevenueStreamChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('financialRevenueStreams', id), [store]);
  
  const getCostStructureChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('financialCostStructure', id), [store]);
  
  const getPricingStrategyChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('financialPricingStrategies', id), [store]);
  
  const getProjectionChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('financialProjections', id), [store]);

  return {
    data,
    isLoading,
    error,

    // Revenue Streams
    addRevenueStream,
    updateRevenueStream,
    deleteRevenueStream,

    // Cost Structure
    addCostStructure,
    updateCostStructure,
    deleteCostStructure,

    // Pricing Strategies
    addPricingStrategy,
    updatePricingStrategy,
    deletePricingStrategy,

    // Financial Projections
    addProjection,
    updateProjection,
    deleteProjection,
    
    // Diff helpers
    getRevenueStreamChangeType,
    getCostStructureChangeType,
    getPricingStrategyChangeType,
    getProjectionChangeType,
    isDiffMode: store.comparisonMode,
  };
} 