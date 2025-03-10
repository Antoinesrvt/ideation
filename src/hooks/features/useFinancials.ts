import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { FinancialsData } from '@/lib/services/features/financials-service';
import { useProjectStore } from '@/store';
import type { 
  FinancialRevenueStream,
  FinancialCostStructure,
  FinancialPricingStrategy,
  FinancialProjection,
  ChangeType,
  Insert,
  Update
} from '@/store/types';
import { financialsService } from '@/lib/services';
import { useOptimisticCreate, useOptimisticUpdate, useOptimisticDelete } from '../utils/optimistic-helpers';

export interface UseFinancialsReturn {
  data: FinancialsData;
  isLoading: boolean;
  error: Error | null;
  submitting: boolean;

  // Revenue Streams operations
  addRevenueStream: (stream: Insert<'financial_revenue_streams'>) => Promise<FinancialRevenueStream | null>;
  updateRevenueStream: (params: { id: string; data: Update<'financial_revenue_streams'> }) => Promise<FinancialRevenueStream | null>;
  deleteRevenueStream: (id: string) => Promise<boolean>;

  // Cost Structure operations
  addCostStructure: (cost: Insert<'financial_cost_structure'>) => Promise<FinancialCostStructure | null>;
  updateCostStructure: (params: { id: string; data: Update<'financial_cost_structure'> }) => Promise<FinancialCostStructure | null>;
  deleteCostStructure: (id: string) => Promise<boolean>;

  // Pricing Strategies operations
  addPricingStrategy: (strategy: Insert<'financial_pricing_strategies'>) => Promise<FinancialPricingStrategy | null>;
  updatePricingStrategy: (params: { id: string; data: Update<'financial_pricing_strategies'> }) => Promise<FinancialPricingStrategy | null>;
  deletePricingStrategy: (id: string) => Promise<boolean>;

  // Financial Projections operations
  addProjection: (projection: Insert<'financial_projections'>) => Promise<FinancialProjection | null>;
  updateProjection: (params: { id: string; data: Update<'financial_projections'> }) => Promise<FinancialProjection | null>;
  deleteProjection: (id: string) => Promise<boolean>;
  
  // Diff mode flag
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
  }, [revenueStreamsData]);

  useEffect(() => {
    if (costStructureData) {
      store.setFinancialCostStructure(costStructureData);
    }
  }, [costStructureData]);

  useEffect(() => {
    if (pricingStrategiesData) {
      store.setFinancialPricingStrategies(pricingStrategiesData);
    }
  }, [pricingStrategiesData]);

  useEffect(() => {
    if (projectionsData) {
      store.setFinancialProjections(projectionsData);
    }
  }, [projectionsData]);

  // Extract values from store to avoid depending on the entire store object
  const comparisonMode = store.comparisonMode;
  const currentData = store.currentData;
  const stagedData = store.stagedData;

  // Get data from the store for comparison mode
  const storeData = useMemo(() => {
    const source = comparisonMode && stagedData ? stagedData : currentData;
    return {
      financialRevenueStreams: source.financialRevenueStreams || [],
      financialCostStructure: source.financialCostStructure || [],
      financialPricingStrategies: source.financialPricingStrategies || [],
      financialProjections: source.financialProjections || []
    };
  }, [comparisonMode, currentData, stagedData]);

  // Use either store data or query data based on comparison mode
  const data = useMemo((): FinancialsData => {
    if (comparisonMode) {
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
    comparisonMode, 
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
  // Use our optimistic helper hooks
  const addRevenueStreamOptimistic = useOptimisticCreate<'financial_revenue_streams'>({
    projectId,
    tableName: 'financial_revenue_streams',
    store,
    service: financialsService,
    queryClient,
    queryKey: [...queryKeys.revenueStreams],
    setSubmitting,
    methods: {
      add: 'addRevenueStream'
    }
  });

  const updateRevenueStreamOptimistic = useOptimisticUpdate<'financial_revenue_streams'>({
    tableName: 'financial_revenue_streams',
    store,
    service: financialsService,
    queryClient,
    queryKey: [...queryKeys.revenueStreams],
    setSubmitting,
    methods: {
      update: 'updateRevenueStream'
    }
  });

  const deleteRevenueStreamOptimistic = useOptimisticDelete({
    tableName: 'financial_revenue_streams',
    store,
    service: financialsService,
    queryClient,
    queryKey: [...queryKeys.revenueStreams],
    setSubmitting,
    methods: {
      delete: 'deleteRevenueStream'
    }
  });

  // Exposed revenue stream operations with proper typing
  const addRevenueStream = useCallback(async (stream: Insert<'financial_revenue_streams'>): Promise<FinancialRevenueStream | null> => {
    return addRevenueStreamOptimistic(stream);
  }, [addRevenueStreamOptimistic]);

  const updateRevenueStream = useCallback(async (params: { id: string; data: Update<'financial_revenue_streams'> }): Promise<FinancialRevenueStream | null> => {
    return updateRevenueStreamOptimistic(params.id, params.data);
  }, [updateRevenueStreamOptimistic]);

  const deleteRevenueStream = useCallback(async (id: string): Promise<boolean> => {
    return deleteRevenueStreamOptimistic(id);
  }, [deleteRevenueStreamOptimistic]);

  // === Cost Structure Operations ===
  // Use our optimistic helper hooks
  const addCostStructureOptimistic = useOptimisticCreate<'financial_cost_structure'>({
    projectId,
    tableName: 'financial_cost_structure',
    store,
    service: financialsService,
    queryClient,
    queryKey: [...queryKeys.costStructure],
      setSubmitting,
    methods: {
      add: 'addCostStructure'
    }
  });

  const updateCostStructureOptimistic = useOptimisticUpdate<'financial_cost_structure'>({
    tableName: 'financial_cost_structure',
    store,
    service: financialsService,
    queryClient,
    queryKey: [...queryKeys.costStructure],
    setSubmitting,
    methods: {
      update: 'updateCostStructure'
    }
  });

  const deleteCostStructureOptimistic = useOptimisticDelete({
    tableName: 'financial_cost_structure',
    store,
    service: financialsService,
    queryClient,
    queryKey: [...queryKeys.costStructure],
    setSubmitting,
    methods: {
      delete: 'deleteCostStructure'
    }
  });

  // Exposed cost structure operations with proper typing
  const addCostStructure = useCallback(async (cost: Insert<'financial_cost_structure'>): Promise<FinancialCostStructure | null> => {
    return addCostStructureOptimistic(cost);
  }, [addCostStructureOptimistic]);

  const updateCostStructure = useCallback(async (params: { id: string; data: Update<'financial_cost_structure'> }): Promise<FinancialCostStructure | null> => {
    return updateCostStructureOptimistic(params.id, params.data);
  }, [updateCostStructureOptimistic]);

  const deleteCostStructure = useCallback(async (id: string): Promise<boolean> => {
    return deleteCostStructureOptimistic(id);
  }, [deleteCostStructureOptimistic]);

  // === Pricing Strategies Operations ===
  // Use our optimistic helper hooks
  const addPricingStrategyOptimistic = useOptimisticCreate<'financial_pricing_strategies'>({
    projectId,
    tableName: 'financial_pricing_strategies',
    store,
    service: financialsService,
    queryClient,
    queryKey: [...queryKeys.pricingStrategies],
    setSubmitting,
    methods: {
      add: 'addPricingStrategy'
    }
  });

  const updatePricingStrategyOptimistic = useOptimisticUpdate<'financial_pricing_strategies'>({
    tableName: 'financial_pricing_strategies',
    store,
    service: financialsService,
    queryClient,
    queryKey: [...queryKeys.pricingStrategies],
    setSubmitting,
    methods: {
      update: 'updatePricingStrategy'
    }
  });

  const deletePricingStrategyOptimistic = useOptimisticDelete({
    tableName: 'financial_pricing_strategies',
    store,
    service: financialsService,
    queryClient,
    queryKey: [...queryKeys.pricingStrategies],
    setSubmitting,
    methods: {
      delete: 'deletePricingStrategy'
    }
  });

  // Exposed pricing strategy operations with proper typing
  const addPricingStrategy = useCallback(async (strategy: Insert<'financial_pricing_strategies'>): Promise<FinancialPricingStrategy | null> => {
    return addPricingStrategyOptimistic(strategy);
  }, [addPricingStrategyOptimistic]);

  const updatePricingStrategy = useCallback(async (params: { id: string; data: Update<'financial_pricing_strategies'> }): Promise<FinancialPricingStrategy | null> => {
    return updatePricingStrategyOptimistic(params.id, params.data);
  }, [updatePricingStrategyOptimistic]);

  const deletePricingStrategy = useCallback(async (id: string): Promise<boolean> => {
    return deletePricingStrategyOptimistic(id);
  }, [deletePricingStrategyOptimistic]);

  // === Financial Projections Operations ===
  // Use our optimistic helper hooks
  const addProjectionOptimistic = useOptimisticCreate<'financial_projections'>({
    projectId,
    tableName: 'financial_projections',
    store,
    service: financialsService,
    queryClient,
    queryKey: [...queryKeys.projections],
    setSubmitting,
    methods: {
      add: 'addProjection'
    }
  });

  const updateProjectionOptimistic = useOptimisticUpdate<'financial_projections'>({
    tableName: 'financial_projections',
    store,
    service: financialsService,
    queryClient,
    queryKey: [...queryKeys.projections],
    setSubmitting,
    methods: {
      update: 'updateProjection'
    }
  });

  const deleteProjectionOptimistic = useOptimisticDelete({
    tableName: 'financial_projections',
    store,
    service: financialsService,
    queryClient,
    queryKey: [...queryKeys.projections],
    setSubmitting,
    methods: {
      delete: 'deleteProjection'
    }
  });

  // Exposed financial projection operations with proper typing
  const addProjection = useCallback(async (projection: Insert<'financial_projections'>): Promise<FinancialProjection | null> => {
    return addProjectionOptimistic(projection);
  }, [addProjectionOptimistic]);

  const updateProjection = useCallback(async (params: { id: string; data: Update<'financial_projections'> }): Promise<FinancialProjection | null> => {
    return updateProjectionOptimistic(params.id, params.data);
  }, [updateProjectionOptimistic]);

  const deleteProjection = useCallback(async (id: string): Promise<boolean> => {
    return deleteProjectionOptimistic(id);
  }, [deleteProjectionOptimistic]);
  
  // Diff mode
  const isDiffMode = comparisonMode;

  // Return the final data and operations
  return {
    data,
    isLoading,
    error: error || queryError,
    submitting,
    
    // Revenue Streams operations
    addRevenueStream,
    updateRevenueStream,
    deleteRevenueStream,
    
    // Cost Structure operations
    addCostStructure,
    updateCostStructure,
    deleteCostStructure,
    
    // Pricing Strategies operations
    addPricingStrategy,
    updatePricingStrategy,
    deletePricingStrategy,
    
    // Financial Projections operations
    addProjection,
    updateProjection,
    deleteProjection,
    
    // Diff mode
    isDiffMode
  };
} 