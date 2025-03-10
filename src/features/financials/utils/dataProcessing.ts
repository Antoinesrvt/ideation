import { FinancialRevenueStream, FinancialCostStructure, FinancialPricingStrategy, FinancialProjection } from '@/store/types';

interface FinancialsData {
  revenueStreams: FinancialRevenueStream[];
  costStructure: FinancialCostStructure[];
  pricingStrategies: FinancialPricingStrategy[];
  projections: FinancialProjection[];
}

interface ProcessedRevenueForecast {
  id: string;
  name: string;
  amount: number;
  period: string;
  growthRate: number;
}

interface ProcessedCost {
  id: string;
  category: string;
  description: string;
  amount: number;
  frequency: string;
}

interface BreakevenPoint {
  units: number;
  revenue: number;
  data: Array<{
    units: number;
    revenue: number;
    costs: number;
  }>;
}

interface ProcessedProjectionScenario {
  id: string;
  title: string;
  scenario: string;
  timeframe: string;
}

export interface ProcessedFinancialData {
  revenue: {
    forecasts: ProcessedRevenueForecast[];
    total: number;
  };
  costs: {
    fixedCosts: ProcessedCost[];
    variableCosts: ProcessedCost[];
    totalFixed: number;
    totalVariable: number;
    total: number;
  };
  breakeven: BreakevenPoint;
  pricing: {
    strategies: FinancialPricingStrategy[];
  };
  projections: {
    data: any[]; // This can be typed more specifically based on your data structure
    scenarios: ProcessedProjectionScenario[];
  };
}

export const getEmptyProcessedData = (): ProcessedFinancialData => ({
  revenue: { forecasts: [], total: 0 },
  costs: { fixedCosts: [], variableCosts: [], totalFixed: 0, totalVariable: 0, total: 0 },
  breakeven: { units: 0, revenue: 0, data: [] },
  pricing: { strategies: [] },
  projections: { data: [], scenarios: [] }
});

/**
 * Processes raw financial data into a format that's easier to use in components
 */
export const processFinancialData = (
  data: FinancialsData | null | undefined,
  isLoading: boolean
): ProcessedFinancialData => {
  // Return empty data structure if data is not available or still loading
  if (!data || isLoading) {
    return getEmptyProcessedData();
  }
  
  // Process revenue streams
  const revenueForecasts = data.revenueStreams.map((stream) => ({
    id: stream.id,
    name: stream.name,
    amount: (stream.unit_price || 0) * (stream.volume || 0),
    period: stream.frequency || 'monthly',
    growthRate: stream.growth_rate || 0,
  }));
  
  // Process costs
  const fixedCosts = data.costStructure
    .filter(cost => cost.type === 'fixed')
    .map(cost => ({
      id: cost.id,
      category: cost.category || 'other',
      description: cost.description || cost.name,
      amount: cost.amount || 0,
      frequency: cost.frequency || 'monthly',
    }));
    
  const variableCosts = data.costStructure
    .filter(cost => cost.type === 'variable' || cost.type === 'semi-variable')
    .map(cost => ({
      id: cost.id,
      category: cost.category || 'other',
      description: cost.description || cost.name,
      amount: cost.amount || 0,
      frequency: cost.frequency || 'monthly',
    }));
    
  // Calculate totals
  const totalRevenue = revenueForecasts.reduce((sum, forecast) => sum + forecast.amount, 0);
  const totalFixedCosts = fixedCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const totalVariableCosts = variableCosts.reduce((sum, cost) => sum + cost.amount, 0);
  
  // Calculate break-even
  let breakEvenUnits = 0;
  let breakEvenRevenue = 0;
  
  const totalUnits = Math.max(data.revenueStreams.reduce((sum, stream) => sum + (stream.volume || 0), 0), 1);
  
  if (totalRevenue > 0) {
    // Simple break-even calculation
    const averageUnitPrice = totalRevenue / totalUnits;
    const averageVariableCostPerUnit = totalVariableCosts / totalUnits;
    
    if (averageUnitPrice > averageVariableCostPerUnit) {
      breakEvenUnits = totalFixedCosts / (averageUnitPrice - averageVariableCostPerUnit);
      breakEvenRevenue = breakEvenUnits * averageUnitPrice;
    }
  }
  
  // Process projection data
  const projectionData = data.projections.length > 0 && data.projections[0].data 
    ? typeof data.projections[0].data === 'object' && data.projections[0].data !== null
      ? (() => {
          try {
            // Try to access periods property or parse JSON if needed
            const dataObj = data.projections[0].data as any;
            if (dataObj.periods && Array.isArray(dataObj.periods)) {
              return dataObj.periods;
            }
            return [];
          } catch (error) {
            console.error("Error parsing projection data:", error);
            return [];
          }
        })()
      : []
    : Array.from({length: 12}, (_, i) => ({
        period: `Month ${i+1}`,
        revenue: 0,
        costs: 0,
        profit: 0
      }));
  
  // Return the processed data structure
  return {
    revenue: {
      forecasts: revenueForecasts,
      total: totalRevenue,
    },
    costs: {
      fixedCosts,
      variableCosts,
      totalFixed: totalFixedCosts,
      totalVariable: totalVariableCosts,
      total: totalFixedCosts + totalVariableCosts,
    },
    breakeven: {
      units: breakEvenUnits,
      revenue: breakEvenRevenue,
      data: [
        { units: Math.max(0, breakEvenUnits - 100), revenue: 0, costs: totalFixedCosts },
        { 
          units: breakEvenUnits, 
          revenue: breakEvenRevenue, 
          costs: totalFixedCosts + (breakEvenUnits * (totalVariableCosts / totalUnits)) 
        },
        { 
          units: breakEvenUnits + 100, 
          revenue: (breakEvenUnits + 100) * (totalRevenue / totalUnits), 
          costs: totalFixedCosts + ((breakEvenUnits + 100) * (totalVariableCosts / totalUnits)) 
        },
      ]
    },
    pricing: {
      strategies: data.pricingStrategies,
    },
    projections: {
      data: projectionData,
      scenarios: data.projections.map(p => ({
        id: p.id,
        title: p.title,
        scenario: p.scenario || 'base',
        timeframe: p.timeframe || 'monthly',
      }))
    }
  };
};

/**
 * Utility function to format currency values
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate profit margin as a percentage
 */
export const calculateProfitMargin = (totalRevenue: number, totalCosts: number): number => {
  if (totalRevenue === 0) return 0;
  return Math.round(((totalRevenue - totalCosts) / totalRevenue) * 100);
}; 