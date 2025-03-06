import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { FinancialsService, FinancialsData } from '@/lib/services/features/financials-service';
import { useProjectStore, ChangeType } from '@/store';
import type { 
  FinancialRevenueStream,
  FinancialCostStructure,
  FinancialPricingStrategy,
  FinancialProjection
} from '@/store/types';

// Create service instance
const financialsService = new FinancialsService(createClient());

export interface UseFinancialsReturn {
  data: FinancialsData;
  isLoading: boolean;
  error: Error | null;

  // Revenue Streams
  addRevenueStream: (stream: Omit<FinancialRevenueStream, 'id' | 'created_at' | 'updated_at'>) => void;
  updateRevenueStream: (params: { id: string; data: Partial<Omit<FinancialRevenueStream, 'id' | 'created_at' | 'updated_at'>> }) => void;
  deleteRevenueStream: (id: string) => void;

  // Cost Structure
  addCostStructure: (cost: Omit<FinancialCostStructure, 'id' | 'created_at' | 'updated_at'>) => void;
  updateCostStructure: (params: { id: string; data: Partial<Omit<FinancialCostStructure, 'id' | 'created_at' | 'updated_at'>> }) => void;
  deleteCostStructure: (id: string) => void;

  // Pricing Strategies
  addPricingStrategy: (strategy: Omit<FinancialPricingStrategy, 'id' | 'created_at' | 'updated_at'>) => void;
  updatePricingStrategy: (params: { id: string; data: Partial<Omit<FinancialPricingStrategy, 'id' | 'created_at' | 'updated_at'>> }) => void;
  deletePricingStrategy: (id: string) => void;

  // Financial Projections
  addProjection: (projection: Omit<FinancialProjection, 'id' | 'created_at' | 'updated_at'>) => void;
  updateProjection: (params: { id: string; data: Partial<Omit<FinancialProjection, 'id' | 'created_at' | 'updated_at'>> }) => void;
  deleteProjection: (id: string) => void;
  
  // Diff helpers
  getRevenueStreamChangeType: (id: string) => ChangeType;
  getCostStructureChangeType: (id: string) => ChangeType;
  getPricingStrategyChangeType: (id: string) => ChangeType;
  getProjectionChangeType: (id: string) => ChangeType;
  isDiffMode: boolean;
}

// Helper interface for service responses
interface FinancialItemResponse {
  id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export function useFinancials(projectId: string | undefined): UseFinancialsReturn {
  const queryClient = useQueryClient();
  const store = useProjectStore();
  const { comparisonMode } = store;

  // Query keys for different data types
  const queryKeys = {
    all: ['financials', projectId] as const,
    revenueStreams: ['financials', projectId, 'revenueStreams'] as const,
    costStructure: ['financials', projectId, 'costStructure'] as const,
    pricingStrategies: ['financials', projectId, 'pricingStrategies'] as const,
    projections: ['financials', projectId, 'projections'] as const,
  };

  // Main query to fetch all financials data
  const { data: queryData, isLoading, error } = useQuery({
    queryKey: queryKeys.all,
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const result = await financialsService.getAllFinancialsData(projectId);
      
      // Update store with fetched data
      if (result) {
        store.setFinancialRevenueStreams(result.revenueStreams);
        store.setFinancialCostStructure(result.costStructure);
        store.setFinancialPricingStrategies(result.pricingStrategies);
        store.setFinancialProjections(result.projections);
      }
      
      return result;
    },
    enabled: !!projectId
  });

  // Get data from store (current or staged based on comparison mode)
  const storeData = comparisonMode && store.stagedData
    ? {
        financialRevenueStreams: store.stagedData.financialRevenueStreams,
        financialCostStructure: store.stagedData.financialCostStructure,
        financialPricingStrategies: store.stagedData.financialPricingStrategies,
        financialProjections: store.stagedData.financialProjections
      }
    : {
        financialRevenueStreams: store.currentData.financialRevenueStreams,
        financialCostStructure: store.currentData.financialCostStructure,
        financialPricingStrategies: store.currentData.financialPricingStrategies,
        financialProjections: store.currentData.financialProjections
      };

  // Transform store data to the expected format
  const transformedData: FinancialsData = {
    revenueStreams: storeData.financialRevenueStreams,
    costStructure: storeData.financialCostStructure,
    pricingStrategies: storeData.financialPricingStrategies,
    projections: storeData.financialProjections
  };

  // === Revenue Streams Mutations ===
  const addRevenueStreamMutation = useMutation({
    mutationFn: async (stream: Omit<FinancialRevenueStream, 'id' | 'created_at' | 'updated_at'>) => {
      if (!projectId) throw new Error('Project ID is required');
      
      // Create a temporary item for optimistic updates
      const tempStream: FinancialRevenueStream = {
        id: `temp-${Date.now()}`,
        // project_id: projectId,
        ...stream,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Optimistic update in the store
      store.addFinancialRevenueStream(tempStream);
      
      // Then update Supabase
      const result = await financialsService.addRevenueStream(projectId, stream);
      
      // Update store with real ID from Supabase
      if (result) {
        store.deleteFinancialRevenueStream(tempStream.id);
        store.addFinancialRevenueStream(result);
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to add revenue stream:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const updateRevenueStreamMutation = useMutation({
    mutationFn: async (params: { id: string; data: Partial<Omit<FinancialRevenueStream, 'id' | 'created_at' | 'updated_at'>> }) => {
      // Optimistic update in store
      store.updateFinancialRevenueStream(params.id, params.data);
      
      // Then update Supabase
      return financialsService.updateRevenueStream(params.id, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to update revenue stream:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const deleteRevenueStreamMutation = useMutation({
    mutationFn: async (id: string) => {
      // Optimistic update in store
      store.deleteFinancialRevenueStream(id);
      
      // Then update Supabase
      return financialsService.deleteRevenueStream(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to delete revenue stream:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  // === Cost Structure Mutations ===
  const addCostStructureMutation = useMutation({
    mutationFn: async (cost: Omit<FinancialCostStructure, 'id' | 'created_at' | 'updated_at'>) => {
      if (!projectId) throw new Error('Project ID is required');
      
      // Create a temporary item for optimistic updates
      const tempCost: FinancialCostStructure = {
        id: `temp-${Date.now()}`,
        // project_id: projectId,
        ...cost,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Optimistic update in the store
      store.addFinancialCostStructure(tempCost);
      
      // Then update Supabase
      const result = await financialsService.addCostStructure(projectId, cost);
      
      // Update store with real ID from Supabase
      if (result) {
        store.deleteFinancialCostStructure(tempCost.id);
        store.addFinancialCostStructure(result);
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to add cost structure:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const updateCostStructureMutation = useMutation({
    mutationFn: async (params: { id: string; data: Partial<Omit<FinancialCostStructure, 'id' | 'created_at' | 'updated_at'>> }) => {
      // Optimistic update in store
      store.updateFinancialCostStructure(params.id, params.data);
      
      // Then update Supabase
      return financialsService.updateCostStructure(params.id, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to update cost structure:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const deleteCostStructureMutation = useMutation({
    mutationFn: async (id: string) => {
      // Optimistic update in store
      store.deleteFinancialCostStructure(id);
      
      // Then update Supabase
      return financialsService.deleteCostStructure(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to delete cost structure:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  // === Pricing Strategies Mutations ===
  const addPricingStrategyMutation = useMutation({
    mutationFn: async (strategy: Omit<FinancialPricingStrategy, 'id' | 'created_at' | 'updated_at'>) => {
      if (!projectId) throw new Error('Project ID is required');
      
      // Create a temporary item for optimistic updates
      const tempStrategy: FinancialPricingStrategy = {
        id: `temp-${Date.now()}`,
        // project_id: projectId,
        ...strategy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Optimistic update in the store
      store.addFinancialPricingStrategy(tempStrategy);
      
      // Then update Supabase
      const result = await financialsService.addPricingStrategy(projectId, strategy);
      
      // Update store with real ID from Supabase
      if (result) {
        store.deleteFinancialPricingStrategy(tempStrategy.id);
        store.addFinancialPricingStrategy(result);
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to add pricing strategy:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const updatePricingStrategyMutation = useMutation({
    mutationFn: async (params: { id: string; data: Partial<Omit<FinancialPricingStrategy, 'id' | 'created_at' | 'updated_at'>> }) => {
      // Optimistic update in store
      store.updateFinancialPricingStrategy(params.id, params.data);
      
      // Then update Supabase
      return financialsService.updatePricingStrategy(params.id, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to update pricing strategy:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const deletePricingStrategyMutation = useMutation({
    mutationFn: async (id: string) => {
      // Optimistic update in store
      store.deleteFinancialPricingStrategy(id);
      
      // Then update Supabase
      return financialsService.deletePricingStrategy(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to delete pricing strategy:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  // === Financial Projections Mutations ===
  const addProjectionMutation = useMutation({
    mutationFn: async (projection: Omit<FinancialProjection, 'id' | 'created_at' | 'updated_at'>) => {
      if (!projectId) throw new Error('Project ID is required');
      
      // Create a temporary item for optimistic updates
      const tempProjection: FinancialProjection = {
        id: `temp-${Date.now()}`,
        // project_id: projectId,  
        ...projection,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Optimistic update in the store
      store.addFinancialProjection(tempProjection);
      
      // Then update Supabase
      const result = await financialsService.addProjection(projectId, projection);
      
      // Update store with real ID from Supabase
      if (result.data) {
        store.deleteFinancialProjection(tempProjection.id);
        store.addFinancialProjection(result.data as FinancialProjection);
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to add projection:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const updateProjectionMutation = useMutation({
    mutationFn: async (params: { id: string; data: Partial<Omit<FinancialProjection, 'id' | 'created_at' | 'updated_at'>> }) => {
      // Optimistic update in store
      store.updateFinancialProjection(params.id, params.data);
      
      // Then update Supabase
      return financialsService.updateProjection(params.id, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to update projection:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const deleteProjectionMutation = useMutation({
    mutationFn: async (id: string) => {
      // Optimistic update in store
      store.deleteFinancialProjection(id);
      
      // Then update Supabase
      return financialsService.deleteProjection(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to delete projection:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });
  
  // Diff helpers
  const getRevenueStreamChangeType = (id: string): ChangeType => 
    store.getItemChangeType('financialRevenueStreams', id);
  
  const getCostStructureChangeType = (id: string): ChangeType => 
    store.getItemChangeType('financialCostStructure', id);
  
  const getPricingStrategyChangeType = (id: string): ChangeType => 
    store.getItemChangeType('financialPricingStrategies', id);
  
  const getProjectionChangeType = (id: string): ChangeType => 
    store.getItemChangeType('financialProjections', id);

  return {
    data: transformedData || queryData || {
      revenueStreams: [],
      costStructure: [],
      pricingStrategies: [],
      projections: []
    },
    isLoading,
    error: error as Error | null,

    // Revenue Streams
    addRevenueStream: addRevenueStreamMutation.mutate,
    updateRevenueStream: updateRevenueStreamMutation.mutate,
    deleteRevenueStream: deleteRevenueStreamMutation.mutate,

    // Cost Structure
    addCostStructure: addCostStructureMutation.mutate,
    updateCostStructure: updateCostStructureMutation.mutate,
    deleteCostStructure: deleteCostStructureMutation.mutate,

    // Pricing Strategies
    addPricingStrategy: addPricingStrategyMutation.mutate,
    updatePricingStrategy: updatePricingStrategyMutation.mutate,
    deletePricingStrategy: deletePricingStrategyMutation.mutate,

    // Financial Projections
    addProjection: addProjectionMutation.mutate,
    updateProjection: updateProjectionMutation.mutate,
    deleteProjection: deleteProjectionMutation.mutate,
    
    // Diff helpers
    getRevenueStreamChangeType,
    getCostStructureChangeType,
    getPricingStrategyChangeType,
    getProjectionChangeType,
    isDiffMode: comparisonMode,
  };
} 