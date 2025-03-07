import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import TabList from "@/features/common/components/TabList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";
import {
  DollarSign,
  Percent,
  TrendingUp,
  Calculator,
  CreditCard,
  Target,
  Activity,
} from "lucide-react";
import RevenueCharts from "./RevenueChart";
import { Badge } from "@/components/ui/badge";
import { useProjectStore } from "@/store";
import { useAIStore } from "@/hooks/useAIStore";
import { useParams } from "next/navigation";
import { generateId } from "@/lib/utils";
import { 
  FinancialRevenueStream, 
  FinancialCostStructure, 
  FinancialPricingStrategy, 
  FinancialProjection 
} from "@/store/types";
import { AIComparisonControls } from "@/components/ai/AIComparisonControls";
import CostStructure from "./CostStructure";
import BreakevenAnalysis from "./BreakevenAnalysis";
import PricingStrategy from "./PricingStrategy";
import { BreakevenData } from "./BreakevenAnalysis";

// Types for financial data in the UI
export interface FinancialData {
  revenue: RevenueData;
  costs: CostData;
  breakeven: BreakevenData;
  pricing: PricingData;
}

interface RevenueData {
  forecasts: RevenueForecast[];
  assumptions: RevenueAssumption[];
}

interface RevenueForecast {
  id: string;
  period: string;
  amount: number;
  growthRate?: number;
}

interface RevenueAssumption {
  id: string;
  description: string;
  impact: number;
}

interface CostData {
  fixedCosts: CostItem[];
  variableCosts: CostItem[];
}

interface CostItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "annually" | "one-time";
}



interface PricingData {
  strategies: PricingStrategy[];
  competitorPrices: CompetitorPrice[];
}

interface PricingStrategy {
  id: string;
  name: string;
  description: string;
  pricePoint: number;
  targetMarket: string;
}

interface CompetitorPrice {
  id: string;
  competitor: string;
  price: number;
  notes: string;
}

const financialTabs = [
  {
    id: "revenue",
    label: "Revenue Forcasting",
    icon: <DollarSign className="h-4 w-4 mr-2" />,
  },
  {
    id: "costs",
    label: "Costs",
    icon: <Calculator className="h-4 w-4 mr-2" />,
  },
  {
    id: "breakeven",
    label: "Breakeven analysis",
    icon: <Target className="h-4 w-4 mr-2" />,
  },
  {
    id: "pricing",
    label: "Pricing",
    icon: <CreditCard className="h-4 w-4 mr-2" />,
  },
];



// Helper functions for financial calculations
const calculateAverageVariableCost = (costs: CostItem[]): number => {
  if (!costs.length) return 0;
  
  const totalCost = costs.reduce((sum, cost) => sum + cost.amount, 0);
  return totalCost / costs.length;
};

const calculateTotalFixedCosts = (costs: CostItem[]): number => {
  return costs.reduce((sum, cost) => {
    // Annualize costs based on frequency
    let annualAmount = cost.amount;
    switch (cost.frequency) {
      case 'monthly':
        annualAmount *= 12;
        break;
      case 'quarterly':
        annualAmount *= 4;
        break;
      case 'annually':
        // Already annual
        break;
      case 'one-time':
        // One-time costs are included as-is
        break;
    }
    return sum + annualAmount;
  }, 0);
};

// Map database types to UI types
const mapToUIFormat = (sourceData: {
  financialRevenueStreams: FinancialRevenueStream[],
  financialCostStructure: FinancialCostStructure[],
  financialPricingStrategies: FinancialPricingStrategy[],
  financialProjections: FinancialProjection[]
}): FinancialData => {
  // Default empty data structure
  const defaultData: FinancialData = {
    revenue: {
      forecasts: [],
      assumptions: []
    },
    costs: {
      fixedCosts: [],
      variableCosts: []
    },
    breakeven: {
      unitSellingPrice: 0,
      unitVariableCost: 0,
      fixedCosts: 0,
      contributionMargin: 0,
      breakEvenUnits: 0,
      breakEvenRevenue: 0
    },
    pricing: {
      strategies: [],
      competitorPrices: []
    }
  };

  if (!sourceData) return defaultData;

  // Map revenue streams to forecasts and assumptions
  const forecasts: RevenueForecast[] = sourceData.financialRevenueStreams
    .filter(stream => stream.type === 'recurring' || stream.type === 'one-time')
    .map(stream => ({
      id: stream.id,
      period: stream.frequency || 'Monthly',
      amount: stream.unit_price ? stream.unit_price * (stream.volume || 1) : 0,
      growthRate: stream.growth_rate || undefined
    }));

  const assumptions: RevenueAssumption[] = sourceData.financialRevenueStreams
    .filter(stream => stream.assumptions !== null && stream.assumptions !== '')
    .map(stream => ({
      id: stream.id,
      description: stream.assumptions || stream.description || '',
      impact: stream.unit_price || 0
    }));

  // Map cost structure to fixed and variable costs
  const fixedCosts: CostItem[] = sourceData.financialCostStructure
    .filter(cost => cost.type === 'fixed')
    .map(cost => ({
      id: cost.id,
      category: cost.category || '',
      description: cost.description || '',
      amount: cost.amount || 0,
      frequency: (cost.frequency as "monthly" | "quarterly" | "annually" | "one-time") || "monthly"
    }));

  const variableCosts: CostItem[] = sourceData.financialCostStructure
    .filter(cost => cost.type === 'variable')
    .map(cost => ({
      id: cost.id,
      category: cost.category || '',
      description: cost.description || '',
      amount: cost.amount || 0,
      frequency: (cost.frequency as "monthly" | "quarterly" | "annually" | "one-time") || "monthly"
    }));

  // Create cost data structure
  const costsMapped: CostData = {
    fixedCosts,
    variableCosts
  };

  // Map pricing strategies
  const strategies: PricingStrategy[] = sourceData.financialPricingStrategies
    .filter(strategy => strategy.strategy_type !== null)
    .map(strategy => {
      // Parse target price range if it exists
      let pricePoint = 0;
      if (strategy.target_price_range) {
        try {
          const priceRange = typeof strategy.target_price_range === 'string' 
            ? JSON.parse(strategy.target_price_range) 
            : strategy.target_price_range;
          pricePoint = priceRange.min !== undefined ? priceRange.min : 0;
        } catch (e) {
          console.error('Failed to parse price range:', e);
        }
      }
      
      return {
        id: strategy.id,
        name: strategy.name || '',
        description: strategy.description || '',
        pricePoint,
        targetMarket: strategy.considerations || ''
      };
    });

  const competitorPrices: CompetitorPrice[] = sourceData.financialPricingStrategies
    .filter(strategy => strategy.strategy_type === 'competitive')
    .map(strategy => {
      // Parse target price range if it exists
      let price = 0;
      if (strategy.target_price_range) {
        try {
          const priceRange = typeof strategy.target_price_range === 'string' 
            ? JSON.parse(strategy.target_price_range) 
            : strategy.target_price_range;
          price = priceRange.max !== undefined ? priceRange.max : 0;
        } catch (e) {
          console.error('Failed to parse competitor price:', e);
        }
      }
      
      return {
        id: strategy.id,
        competitor: strategy.name || '',
        price,
        notes: strategy.description || ''
      };
    });

  // Create pricing data structure
  const pricingMapped: PricingData = {
    strategies,
    competitorPrices
  };

  // Map breakeven data from projections
  let breakEvenUnits = 0;
  let breakEvenRevenue = 0;
  
  // Find a projection with break_even data
  const breakEvenProjection = sourceData.financialProjections.find(p => p.break_even);
  
  if (breakEvenProjection && breakEvenProjection.break_even) {
    try {
      const breakEvenData = typeof breakEvenProjection.break_even === 'string' 
        ? JSON.parse(breakEvenProjection.break_even) 
        : breakEvenProjection.break_even;
      
      breakEvenUnits = breakEvenData.units || 0;
      breakEvenRevenue = breakEvenData.revenue || 0;
    } catch (e) {
      console.error('Failed to parse break-even data:', e);
    }
  }

  // Get unit selling price from revenue streams
  const avgUnitPrice = sourceData.financialRevenueStreams
    .filter(stream => stream.unit_price)
    .reduce((sum, stream, index, array) => sum + (stream.unit_price || 0) / array.length, 0);

  // Create breakeven data structure
  const breakevenMapped: BreakevenData = {
    unitSellingPrice: avgUnitPrice,
    unitVariableCost: calculateAverageVariableCost(costsMapped.variableCosts),
    fixedCosts: calculateTotalFixedCosts(costsMapped.fixedCosts),
    contributionMargin: 0, // Will be calculated below
    breakEvenUnits,
    breakEvenRevenue
  };

  // Calculate contribution margin
  const unitPrice = breakevenMapped.unitSellingPrice;
  const unitCost = breakevenMapped.unitVariableCost;
  
  breakevenMapped.contributionMargin = 
    unitPrice > 0 
      ? ((unitPrice - unitCost) / unitPrice) * 100
      : 0;

  return {
    revenue: { forecasts, assumptions },
    costs: costsMapped,
    pricing: pricingMapped,
    breakeven: breakevenMapped
  };
};

// Calculate profit margin from financial data
const calculateProfitMargin = (data: FinancialData): number => {
  // Calculate total revenue
  const totalRevenue = data.revenue.forecasts.reduce((sum, forecast) => sum + forecast.amount, 0);
  
  // Calculate total costs (fixed + variable)
  const totalFixedCosts = calculateTotalFixedCosts(data.costs.fixedCosts);
  const totalVariableCosts = data.costs.variableCosts.reduce((sum, cost) => sum + cost.amount, 0);
  
  if (totalRevenue === 0) return 0;
  
  const profit = totalRevenue - (totalFixedCosts + totalVariableCosts);
  return (profit / totalRevenue) * 100;
};

// Estimate breakeven timeframe
const getBreakevenTimeframe = (data: FinancialData): string => {
  // If we don't have enough data, return "Unknown"
  if (!data.breakeven.breakEvenUnits || data.revenue.forecasts.length === 0) {
    return "Unknown";
  }
  
  // Sort forecasts by period
  const sortedForecasts = [...data.revenue.forecasts].sort((a, b) => {
    // Assuming periods are in format "2023 Q1", "2023 Q2", etc.
    return a.period.localeCompare(b.period);
  });
  
  // Calculate cumulative units sold based on revenue and unit price
  let cumulativeUnits = 0;
  for (let i = 0; i < sortedForecasts.length; i++) {
    const forecast = sortedForecasts[i];
    const unitsSold = data.breakeven.unitSellingPrice > 0 
      ? forecast.amount / data.breakeven.unitSellingPrice 
      : 0;
    
    cumulativeUnits += unitsSold;
    
    if (cumulativeUnits >= data.breakeven.breakEvenUnits) {
      return forecast.period;
    }
  }
  
  return "Beyond forecast period";
};

// Determine financial health status based on metrics
const getFinancialHealth = (data: FinancialData): { status: string; color: string } => {
  const profitMargin = calculateProfitMargin(data);
  const hasForecastData = data.revenue.forecasts.length > 0;
  const hasBreakevenData = data.breakeven.breakEvenUnits > 0;
  const hasRevenueAssumptions = data.revenue.assumptions.length > 0;
  
  // If we don't have enough data, return "Incomplete"
  if (!hasForecastData || !hasBreakevenData) {
    return { status: "Incomplete", color: "text-orange-500" };
  }
  
  // Evaluate financial health based on profit margin
  if (profitMargin <= 0) {
    return { status: "At Risk", color: "text-red-500" };
  } else if (profitMargin < 10) {
    return { status: "Concerning", color: "text-orange-500" };
  } else if (profitMargin < 20) {
    return { status: "Stable", color: "text-blue-500" };
  } else {
    return { status: "Healthy", color: "text-green-500" };
  }
};


// Format currency values
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const FinancialProjections: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  
  const {
    currentData,
    comparisonMode,
    stagedData,
  } = useProjectStore();

  const { acceptAIChanges, rejectAIChanges } = useAIStore();

  // State for currently active tab
  const [activeTab, setActiveTab] = useState("revenue");
  
  // Map current data to UI format
  const data = useMemo(() => mapToUIFormat({
    financialRevenueStreams: currentData.financialRevenueStreams,
    financialCostStructure: currentData.financialCostStructure,
    financialPricingStrategies: currentData.financialPricingStrategies,
    financialProjections: currentData.financialProjections
  }), [currentData]);
  
  // Map staged data to UI format if in comparison mode
  const stagedUIData = useMemo(() => {
    if (!comparisonMode || !stagedData) return null;
    
    return mapToUIFormat({
      financialRevenueStreams: stagedData.financialRevenueStreams,
      financialCostStructure: stagedData.financialCostStructure,
      financialPricingStrategies: stagedData.financialPricingStrategies,
      financialProjections: stagedData.financialProjections
    });
  }, [comparisonMode, stagedData]);
  
  
  // Financial health and insights
  const profitMargin = calculateProfitMargin(data);
  const breakevenTimeframe = getBreakevenTimeframe(data);
  const financialHealth = getFinancialHealth(data);


  return (
    <div className="space-y-8">
      {/* Financial Overview Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Projected Revenue
              </CardTitle>
              <CardDescription>Next 6 months forecast</CardDescription>
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                data.revenue.forecasts.reduce(
                  (sum, forecast) => sum + forecast.amount,
                  0
                )
              )}
            </div>
            <div className="h-[60px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenue.forecasts.slice(0, 6)}>
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Profit Margin
              </CardTitle>
              <CardDescription>Based on current projections</CardDescription>
            </div>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitMargin.toFixed(1)}%</div>
            <div className="h-[60px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Profit", value: profitMargin },
                      { name: "Costs", value: 100 - profitMargin },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={18}
                    outerRadius={30}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#f87171" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Breakeven Timeline
              </CardTitle>
              <CardDescription>Estimated profitability point</CardDescription>
            </div>
            <Target className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{breakevenTimeframe}</div>
            <div className="h-[60px] mt-4 flex items-center justify-center">
              <div className="bg-gray-100 w-full h-2 rounded-full">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      (parseInt(breakevenTimeframe) / 24) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Financial Health
              </CardTitle>
              <CardDescription>Overall assessment</CardDescription>
            </div>
            <Activity className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div
                className={`text-xl font-bold ${financialHealth.color.replace(
                  "bg-",
                  "text-"
                )}`}
              >
                {financialHealth.status}
              </div>
            </div>
            <div className="h-[60px] mt-4 flex items-center justify-center">
              <Badge className={financialHealth.color} variant="outline">
                {financialHealth.status === "Incomplete"
                  ? "Complete your financial plan"
                  : financialHealth.status === "At Risk"
                  ? "Review cost structure"
                  : financialHealth.status === "Fair"
                  ? "Improve revenue streams"
                  : "Good financial outlook"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" onValueChange={setActiveTab}>
        <TabList
          tabs={financialTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className="pt-6">
          {/* Revenue Forecasting Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <RevenueCharts projectId={projectId} revenue={data.revenue} />

            
          </TabsContent>

          {/* Cost Structure Tab */}
          <TabsContent value="costs">
            <CostStructure costs={data.costs} />
          </TabsContent>

          {/* Break-even Analysis Tab */}
          <TabsContent value="breakeven">
            <BreakevenAnalysis data={{breakeven: data.breakeven}} />
          </TabsContent>

          {/* Pricing Strategy Tab */}
          <TabsContent value="pricing">
           <PricingStrategy data={{pricing: data.pricing}} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Add comparison mode controls if needed */}
      {comparisonMode && (
        <AIComparisonControls
          onApply={() => acceptAIChanges()}
          onReject={() => rejectAIChanges()}
          isComparingChanges={true}
        />
      )}
    </div>
  );
};
