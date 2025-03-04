import { useFeatureData } from './use-feature-data';
import { useProject } from './useProject';
import { FinancialData } from '@/features/financials/components/FinancialProjections';
import { useCallback } from 'react';

/**
 * Hook for managing financial projection data in a project
 * @param projectId - The ID of the current project
 */
export function useFinancials(projectId: string | undefined) {
  // Use the enhanced useFeatureData hook with proper typing
  const featureData = useFeatureData<FinancialData, 
    { id: string } & Record<string, any>>(
    projectId,
    'financialProjections',
    {
      defaultData: {
        revenue: {
          forecasts: [],
          assumptions: []
        },
        costs: {
          fixedCosts: [],
          variableCosts: []
        },
        pricing: {
          strategies: [],
          competitorPrices: []
        },
        breakeven: {
          unitSellingPrice: 0,
          unitVariableCost: 0,
          fixedCosts: 0
        }
      },
      // Optional related data for financial context
      relatedData: [
        {
          name: 'customerSegments',
          feature: 'canvas',
          property: 'customerSegments'
        },
        {
          name: 'revenueStreams',
          feature: 'canvas',
          property: 'revenueStreams'
        }
      ]
    }
  );

  // Revenue operations
  const addRevenueForecast = useCallback((forecast: Omit<any, 'id'>) => {
    return featureData.addItem(forecast, 'revenue.forecasts');
  }, [featureData]);

  const updateRevenueForecast = useCallback((id: string, data: Partial<any>) => {
    return featureData.updateItem(id, data, 'revenue.forecasts');
  }, [featureData]);

  const deleteRevenueForecast = useCallback((id: string) => {
    return featureData.deleteItem(id, 'revenue.forecasts');
  }, [featureData]);

  const addRevenueAssumption = useCallback((assumption: Omit<any, 'id'>) => {
    return featureData.addItem(assumption, 'revenue.assumptions');
  }, [featureData]);

  // Cost operations
  const addFixedCost = useCallback((cost: Omit<any, 'id'>) => {
    return featureData.addItem(cost, 'costs.fixedCosts');
  }, [featureData]);

  const updateFixedCost = useCallback((id: string, data: Partial<any>) => {
    return featureData.updateItem(id, data, 'costs.fixedCosts');
  }, [featureData]);

  const deleteFixedCost = useCallback((id: string) => {
    return featureData.deleteItem(id, 'costs.fixedCosts');
  }, [featureData]);

  const addVariableCost = useCallback((cost: Omit<any, 'id'>) => {
    return featureData.addItem(cost, 'costs.variableCosts');
  }, [featureData]);

  // Pricing operations
  const addPricingStrategy = useCallback((strategy: Omit<any, 'id'>) => {
    return featureData.addItem(strategy, 'pricing.strategies');
  }, [featureData]);

  const updatePricingStrategy = useCallback((id: string, data: Partial<any>) => {
    return featureData.updateItem(id, data, 'pricing.strategies');
  }, [featureData]);

  const deletePricingStrategy = useCallback((id: string) => {
    return featureData.deleteItem(id, 'pricing.strategies');
  }, [featureData]);

  const addCompetitorPrice = useCallback((competitor: Omit<any, 'id'>) => {
    return featureData.addItem(competitor, 'pricing.competitorPrices');
  }, [featureData]);

  // Break-even analysis
  const updateBreakeven = useCallback(async (breakeven: Partial<any>) => {
    if (!projectId || !featureData.data) return null;
    
    const updatedFinancials = {
      ...featureData.data,
      breakeven: {
        ...featureData.data.breakeven,
        ...breakeven
      }
    };
    
    // Use the project's updateFeatureData for nested updates
    const { updateFeatureData } = useProject(projectId);
    
    await updateFeatureData({
      id: projectId,
      feature: 'financialProjections',
      data: updatedFinancials
    });
    
    return updatedFinancials.breakeven;
  }, [projectId, featureData.data, useProject]);

  // Calculate metrics based on current financial data
  const calculateMetrics = useCallback(() => {
    if (!featureData.data) return null;
    
    const financials = featureData.data;
    
    // Get total projected revenue
    const totalProjectedRevenue = financials.revenue.forecasts.reduce(
      (sum: number, forecast: any) => sum + (parseFloat(forecast.amount) || 0), 
      0
    );
    
    // Get total fixed costs
    const totalFixedCosts = financials.costs.fixedCosts.reduce(
      (sum: number, cost: any) => sum + (parseFloat(cost.amount) || 0), 
      0
    );
    
    // Get total variable costs (might require more complex calculation)
    const totalVariableCosts = financials.costs.variableCosts.reduce(
      (sum: number, cost: any) => sum + (parseFloat(cost.amount) || 0), 
      0
    );
    
    // Calculate profit margin
    const totalCosts = totalFixedCosts + totalVariableCosts;
    const projectedProfit = totalProjectedRevenue - totalCosts;
    const profitMargin = totalProjectedRevenue > 0 
      ? (projectedProfit / totalProjectedRevenue) * 100 
      : 0;
    
    // Calculate breakeven units
    const { unitSellingPrice, unitVariableCost, fixedCosts } = financials.breakeven;
    const contributionMargin = unitSellingPrice - unitVariableCost;
    const breakEvenUnits = contributionMargin > 0 
      ? fixedCosts / contributionMargin 
      : 0;
    const breakEvenRevenue = breakEvenUnits * unitSellingPrice;
    
    return {
      totalProjectedRevenue,
      totalFixedCosts,
      totalVariableCosts,
      totalCosts,
      projectedProfit,
      profitMargin,
      contributionMargin,
      breakEvenUnits,
      breakEvenRevenue
    };
  }, [featureData.data]);

  return {
    // Raw data
    financials: featureData.data,
    isLoading: featureData.isLoading,
    error: featureData.error,
    
    // Related data
    customerSegments: featureData.relatedData?.customerSegments || [],
    revenueStreams: featureData.relatedData?.revenueStreams || [],
    
    // Revenue methods
    addRevenueForecast,
    updateRevenueForecast,
    deleteRevenueForecast,
    addRevenueAssumption,
    
    // Cost methods
    addFixedCost,
    updateFixedCost,
    deleteFixedCost,
    addVariableCost,
    
    // Pricing methods
    addPricingStrategy,
    updatePricingStrategy,
    deletePricingStrategy,
    addCompetitorPrice,
    
    // Break-even methods
    updateBreakeven,
    
    // Analytics
    calculateMetrics,
    
    // Raw data access
    revenueForecasts: featureData.data?.revenue.forecasts || [],
    revenueAssumptions: featureData.data?.revenue.assumptions || [],
    fixedCosts: featureData.data?.costs.fixedCosts || [],
    variableCosts: featureData.data?.costs.variableCosts || [],
    pricingStrategies: featureData.data?.pricing.strategies || [],
    competitorPrices: featureData.data?.pricing.competitorPrices || [],
    breakeven: featureData.data?.breakeven || {}
  };
} 