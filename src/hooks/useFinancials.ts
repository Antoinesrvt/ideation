import { useFeatureData } from './use-feature-data';
import { useCallback } from 'react';
import { Database } from '@/types/database';

// Database types for financial tables
type RevenueStream = Database['public']['Tables']['financial_revenue_streams']['Row'];
type CostStructure = Database['public']['Tables']['financial_cost_structure']['Row'];
type PricingStrategy = Database['public']['Tables']['financial_pricing_strategies']['Row'];
type FinancialProjection = Database['public']['Tables']['financial_projections']['Row'];

// Combined type for all financial data
type FinancialData = {
  revenueStreams: RevenueStream[];
  costStructure: CostStructure[];
  pricingStrategies: PricingStrategy[];
  projections: FinancialProjection[];
};

// Base type for any financial item
type BaseItem = {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  project_id: string | null;
  created_by: string | null;
};

// Type for any financial item
type FinancialItem = BaseItem & (
  | Omit<RevenueStream, keyof BaseItem>
  | Omit<CostStructure, keyof BaseItem>
  | Omit<PricingStrategy, keyof BaseItem>
  | Omit<FinancialProjection, keyof BaseItem>
);

/**
 * Hook for managing financial data in a project
 * @param projectId - The ID of the current project
 */
export function useFinancials(projectId: string | undefined) {
  const featureData = useFeatureData<FinancialData, FinancialItem>(
    projectId,
    'financialProjections',
    {
      defaultData: {
        revenueStreams: [],
        costStructure: [],
        pricingStrategies: [],
        projections: []
      }
    }
  );

  // ===== Revenue Streams =====
  const addRevenueStream = useCallback(async (stream: Omit<RevenueStream, 'id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) throw new Error('Project ID is required');
    return featureData.addItem({
      ...stream,
      project_id: projectId,
      created_at: null,
      updated_at: null
    } as FinancialItem, 'revenueStreams');
  }, [featureData, projectId]);

  const updateRevenueStream = useCallback((id: string, data: Partial<Omit<RevenueStream, 'id' | 'created_at' | 'updated_at'>>) => {
    return featureData.updateItem(id, data as Partial<FinancialItem>, 'revenueStreams');
  }, [featureData]);

  const deleteRevenueStream = useCallback((id: string) => {
    return featureData.deleteItem(id, 'revenueStreams');
  }, [featureData]);

  // ===== Cost Structure =====
  const addCostStructure = useCallback(async (cost: Omit<CostStructure, 'id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) throw new Error('Project ID is required');
    return featureData.addItem({
      ...cost,
      project_id: projectId,
      created_at: null,
      updated_at: null
    } as FinancialItem, 'costStructure');
  }, [featureData, projectId]);

  const updateCostStructure = useCallback((id: string, data: Partial<Omit<CostStructure, 'id' | 'created_at' | 'updated_at'>>) => {
    return featureData.updateItem(id, data as Partial<FinancialItem>, 'costStructure');
  }, [featureData]);

  const deleteCostStructure = useCallback((id: string) => {
    return featureData.deleteItem(id, 'costStructure');
  }, [featureData]);

  // ===== Pricing Strategies =====
  const addPricingStrategy = useCallback(async (strategy: Omit<PricingStrategy, 'id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) throw new Error('Project ID is required');
    return featureData.addItem({
      ...strategy,
      project_id: projectId,
      created_at: null,
      updated_at: null
    } as FinancialItem, 'pricingStrategies');
  }, [featureData, projectId]);

  const updatePricingStrategy = useCallback((id: string, data: Partial<Omit<PricingStrategy, 'id' | 'created_at' | 'updated_at'>>) => {
    return featureData.updateItem(id, data as Partial<FinancialItem>, 'pricingStrategies');
  }, [featureData]);

  const deletePricingStrategy = useCallback((id: string) => {
    return featureData.deleteItem(id, 'pricingStrategies');
  }, [featureData]);

  // ===== Financial Projections =====
  const addProjection = useCallback(async (projection: Omit<FinancialProjection, 'id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) throw new Error('Project ID is required');
    return featureData.addItem({
      ...projection,
      project_id: projectId,
      created_at: null,
      updated_at: null
    } as FinancialItem, 'projections');
  }, [featureData, projectId]);

  const updateProjection = useCallback((id: string, data: Partial<Omit<FinancialProjection, 'id' | 'created_at' | 'updated_at'>>) => {
    return featureData.updateItem(id, data as Partial<FinancialItem>, 'projections');
  }, [featureData]);

  const deleteProjection = useCallback((id: string) => {
    return featureData.deleteItem(id, 'projections');
  }, [featureData]);

  // Advanced operations
  const calculateTotalRevenue = useCallback(() => {
    const { revenueStreams } = featureData.data || { revenueStreams: [] };
    return revenueStreams.reduce((total, stream) => {
      const volume = stream.volume || 0;
      const unitPrice = stream.unit_price || 0;
      const growthRate = stream.growth_rate || 0;
      return total + (volume * unitPrice * (1 + growthRate / 100));
    }, 0);
  }, [featureData.data]);

  const calculateTotalCosts = useCallback(() => {
    const { costStructure } = featureData.data || { costStructure: [] };
    return costStructure.reduce((total, cost) => {
      const amount = cost.amount || 0;
      const growthRate = cost.growth_rate || 0;
      return total + (amount * (1 + growthRate / 100));
    }, 0);
  }, [featureData.data]);

  const getFinancialMetrics = useCallback(() => {
    const totalRevenue = calculateTotalRevenue();
    const totalCosts = calculateTotalCosts();
    
    return {
      totalRevenue,
      totalCosts,
      grossProfit: totalRevenue - totalCosts,
      grossMargin: totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0
    };
  }, [calculateTotalRevenue, calculateTotalCosts]);

  return {
    // Raw data
    data: featureData.data,
    isLoading: featureData.isLoading,
    error: featureData.error,
    
    // Revenue Streams
    revenueStreams: featureData.data?.revenueStreams || [],
    addRevenueStream,
    updateRevenueStream,
    deleteRevenueStream,
    
    // Cost Structure
    costStructure: featureData.data?.costStructure || [],
    addCostStructure,
    updateCostStructure,
    deleteCostStructure,
    
    // Pricing Strategies
    pricingStrategies: featureData.data?.pricingStrategies || [],
    addPricingStrategy,
    updatePricingStrategy,
    deletePricingStrategy,
    
    // Financial Projections
    projections: featureData.data?.projections || [],
    addProjection,
    updateProjection,
    deleteProjection,
    
    // Metrics
    calculateTotalRevenue,
    calculateTotalCosts,
    getFinancialMetrics,
  };
} 