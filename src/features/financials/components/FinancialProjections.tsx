import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  PlusCircle,
  Trash2,
  DollarSign,
  Percent,
  TrendingUp,
  Calculator,
  CreditCard,
  AlertCircle,
  Info,
  Target,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface BreakevenData {
  unitSellingPrice: number;
  unitVariableCost: number;
  fixedCosts: number;
  contributionMargin: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
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

// Generate a unique ID for new items
const generateUniqueId = (): string => {
  return generateId();
};

// Format currency values
const formatCurrency = (value: number): string => {
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
    addFinancialRevenueStream,
    addFinancialCostStructure,
    addFinancialPricingStrategy,
    addFinancialProjection,
    updateFinancialRevenueStream,
    updateFinancialCostStructure,
    updateFinancialPricingStrategy,
    updateFinancialProjection,
    deleteFinancialRevenueStream,
    deleteFinancialCostStructure,
    deleteFinancialPricingStrategy,
    deleteFinancialProjection
  } = useProjectStore();

  const { acceptAIChanges, rejectAIChanges } = useAIStore();

  // State for currently active tab
  const [activeTab, setActiveTab] = useState("overview");
  
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
  
  // Helper function to determine if an item is new/modified in comparison mode
  const getItemStatus = (
    section: 'revenue.forecasts' | 'revenue.assumptions' | 'costs.fixedCosts' | 'costs.variableCosts' | 'pricing.strategies' | 'pricing.competitorPrices',
    itemId: string
  ): 'new' | 'modified' | 'unchanged' | 'removed' => {
    if (!comparisonMode || !stagedUIData) return 'unchanged';
    
    // Function to get the current item based on the section
    const getCurrentItem = () => {
      const [mainSection, subSection] = section.split('.');
      
      switch (section) {
        case 'revenue.forecasts':
          return data.revenue.forecasts.find(item => item.id === itemId);
        case 'revenue.assumptions':
          return data.revenue.assumptions.find(item => item.id === itemId);
        case 'costs.fixedCosts':
          return data.costs.fixedCosts.find(item => item.id === itemId);
        case 'costs.variableCosts':
          return data.costs.variableCosts.find(item => item.id === itemId);
        case 'pricing.strategies':
          return data.pricing.strategies.find(item => item.id === itemId);
        case 'pricing.competitorPrices':
          return data.pricing.competitorPrices.find(item => item.id === itemId);
        default:
          return undefined;
      }
    };
    
    // Function to get the staged item based on the section
    const getStagedItem = () => {
      const [mainSection, subSection] = section.split('.');
      
      switch (section) {
        case 'revenue.forecasts':
          return stagedUIData.revenue.forecasts.find(item => item.id === itemId);
        case 'revenue.assumptions':
          return stagedUIData.revenue.assumptions.find(item => item.id === itemId);
        case 'costs.fixedCosts':
          return stagedUIData.costs.fixedCosts.find(item => item.id === itemId);
        case 'costs.variableCosts':
          return stagedUIData.costs.variableCosts.find(item => item.id === itemId);
        case 'pricing.strategies':
          return stagedUIData.pricing.strategies.find(item => item.id === itemId);
        case 'pricing.competitorPrices':
          return stagedUIData.pricing.competitorPrices.find(item => item.id === itemId);
        default:
          return undefined;
      }
    };
    
    const currentItem = getCurrentItem();
    const stagedItem = getStagedItem();
    
    if (!currentItem && stagedItem) return 'new';
    if (currentItem && !stagedItem) return 'removed';
    if (currentItem && stagedItem) {
      return JSON.stringify(currentItem) !== JSON.stringify(stagedItem) ? 'modified' : 'unchanged';
    }
    
    return 'unchanged';
  };
  
  // Handle adding a revenue forecast
  const handleAddRevenueForecast = () => {
    if (!projectId) return;
    
    addFinancialProjection({
      id: generateUniqueId(),
      title: `Month ${data.revenue.forecasts.length + 1}`,
      project_id: projectId,
      data: JSON.stringify({
        amount: 0,
        growth_rate: 0
      }),
      created_at: null,
      created_by: null,
      description: null,
      scenario: null,
      timeframe: null,
      start_date: null,
      break_even: null,
      assumptions: null,
      updated_at: null
    });
  };
  
  // Handle adding a revenue assumption
  const handleAddRevenueAssumption = () => {
    if (!projectId) return;
    
    addFinancialRevenueStream({
      id: generateUniqueId(),
      name: 'New Revenue Stream',
      description: '',
      project_id: projectId,
      projections: JSON.stringify({
        impact: 0
      }),
      created_at: null,
      created_by: null,
      type: null,
      pricing_model: null,
      unit_price: null,
      volume: null,
      frequency: null,
      growth_rate: null,
      assumptions: null,
      updated_at: null
    });
  };
  
  // Handle adding a cost item
  const handleAddCostItem = (type: 'fixed' | 'variable') => {
    if (!projectId) return;
    
    addFinancialCostStructure({
      id: generateUniqueId(),
      category: type === 'fixed' ? 'Fixed Cost' : 'Variable Cost',
      description: '',
      amount: 0,
      frequency: 'monthly',
      project_id: projectId,
      type: type,
      name: type === 'fixed' ? 'New Fixed Cost' : 'New Variable Cost',
      created_at: null,
      created_by: null,
      growth_rate: null,
      projections: null,
      assumptions: null,
      updated_at: null
    });
  };
  
  // Handle adding a pricing strategy
  const handleAddPricingStrategy = () => {
    if (!projectId) return;
    
    addFinancialPricingStrategy({
      id: generateUniqueId(),
      name: 'New Strategy',
      description: '',
      project_id: projectId,
      target_price_range: JSON.stringify({
        base: 0
      }),
      considerations: JSON.stringify({
        target_market: ''
      }),
      created_at: null,
      created_by: null,
      strategy_type: null,
      updated_at: null
    });
  };
  
  // Handle breakeven calculation updates
  const updateBreakeven = (updates: Partial<BreakevenData>) => {
    // Implementation...
    console.log("Updating breakeven with:", updates);
    
    // Find an existing projection to update, or create a new one
    const existingProjection = currentData.financialProjections.find(p => p.break_even);
    
    if (existingProjection) {
      // Update the existing projection
      updateFinancialProjection(existingProjection.id, {
        break_even: JSON.stringify({
          units: updates.breakEvenUnits || 0,
          revenue: updates.breakEvenRevenue || 0,
          months: 0 // Default months to breakeven
        })
      });
    } else if (projectId) {
      // Create a new projection with breakeven data
      addFinancialProjection({
        id: generateUniqueId(),
        title: 'Breakeven Analysis',
        project_id: projectId,
        data: JSON.stringify({}),
        break_even: JSON.stringify({
          units: updates.breakEvenUnits || 0,
          revenue: updates.breakEvenRevenue || 0,
          months: 0 // Default months to breakeven
        }),
        created_at: null,
        created_by: null,
        description: null,
        scenario: null,
        timeframe: null,
        start_date: null,
        assumptions: null,
        updated_at: null
      });
    }
  };
  
  // Calculate breakeven data based on the inputs
  const calculateBreakeven = (data: BreakevenData): BreakevenData => {
    const { unitSellingPrice, unitVariableCost, fixedCosts } = data;
    const contributionMarginValue = unitSellingPrice - unitVariableCost;
    
    // Calculate breakeven units and revenue
    const breakEvenUnits = contributionMarginValue > 0 ? fixedCosts / contributionMarginValue : 0;
    const breakEvenRevenue = breakEvenUnits * unitSellingPrice;
    
    // Return updated breakeven data with all required fields
    return {
      unitSellingPrice,
      unitVariableCost,
      fixedCosts,
      contributionMargin: unitSellingPrice > 0 
        ? (contributionMarginValue / unitSellingPrice) * 100 
        : 0,
      breakEvenUnits,
      breakEvenRevenue
    };
  };
  
  // Handle updating a specific breakeven field
  const handleUpdateBreakeven = (field: keyof BreakevenData, value: number) => {
    const updatedBreakeven = {
      ...data.breakeven,
      [field]: value
    };
    
    // Recalculate breakeven values
    const calculatedBreakeven = calculateBreakeven(updatedBreakeven);
    
    // Update the breakeven data
    updateBreakeven(calculatedBreakeven);
  };
  
  // Financial health and insights
  const profitMargin = calculateProfitMargin(data);
  const breakevenTimeframe = getBreakevenTimeframe(data);
  const financialHealth = getFinancialHealth(data);

  // Define chart color scheme
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#8DD1E1",
  ];

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Financial Projections
          </h1>
          <p className="text-muted-foreground">
            Plan and forecast your startup's financial future
          </p>
        </div>
        <Badge className={financialHealth.color}>
          Financial Health: {financialHealth.status}
        </Badge>
      </div>

      {/* <Collapsible
        open={expandedHelp.overview}
        onOpenChange={() => toggleHelp("overview")}
        className="mb-6"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="flex w-full justify-between p-2 text-sm border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 text-emerald-800"
          >
            <div className="flex items-center">
              <Calculator className="h-4 w-4 mr-2 text-emerald-600" />
              <span className="font-medium">
                Financial Planning Fundamentals
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 transform transition-transform ${
                expandedHelp.overview ? "rotate-180" : ""
              }`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 border border-emerald-100 border-t-0 bg-emerald-50 rounded-b-md">
          <div className="space-y-3">
            <p className="text-sm text-emerald-700">
              Financial projections help you plan your business finances,
              attract investors, and make informed decisions. An effective
              financial plan balances optimism with realism.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-md p-3 shadow-sm">
                <div className="flex items-center mb-2">
                  <div className="bg-emerald-100 rounded-full p-1.5 mr-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h4 className="font-medium text-emerald-800">
                    Growth Assumptions
                  </h4>
                </div>
                <p className="text-xs text-emerald-700">
                  Base your projections on reasonable growth rates. Document
                  your assumptions to track their accuracy over time.
                </p>
              </div>
              <div className="bg-white rounded-md p-3 shadow-sm">
                <div className="flex items-center mb-2">
                  <div className="bg-emerald-100 rounded-full p-1.5 mr-2">
                    <PiggyBank className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h4 className="font-medium text-emerald-800">
                    Conservative Estimates
                  </h4>
                </div>
                <p className="text-xs text-emerald-700">
                  Plan for multiple scenarios. Include best-case, expected-case,
                  and worst-case projections.
                </p>
              </div>
              <div className="bg-white rounded-md p-3 shadow-sm">
                <div className="flex items-center mb-2">
                  <div className="bg-emerald-100 rounded-full p-1.5 mr-2">
                    <LineChart className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h4 className="font-medium text-emerald-800">
                    Regular Updates
                  </h4>
                </div>
                <p className="text-xs text-emerald-700">
                  Review and adjust your projections monthly or quarterly as you
                  gather real performance data.
                </p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible> */}

      {/* Financial Overview Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>
      
      <Tabs defaultValue="revenue">
        <TabsList className="grid grid-cols-4 mb-8">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="revenue" className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Revenue Forecasting
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                Predict your future income streams based on market research and
                growth assumptions.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="costs" className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Cost Structure
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                Track your fixed and variable costs to understand spending
                patterns and identify savings opportunities.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="breakeven" className="flex items-center">
                  <Calculator className="h-4 w-4 mr-2" />
                  Break-even Analysis
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                Calculate when your business will start generating profit by
                determining the sales volume needed to cover costs.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="pricing" className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pricing Strategy
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                Develop effective pricing models based on costs, market
                positioning, and competitor analysis.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TabsList>

        {/* Revenue Forecasting Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Revenue Forecast</CardTitle>
                  <CardDescription>
                    Projected revenue over the next 6 months
                  </CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddRevenueForecast}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Forecast Period
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Add a new time period to your revenue forecast
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.revenue.forecasts}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis
                        tickFormatter={(value) =>
                          formatCurrency(value).replace("$", "")
                        }
                      />
                      <RechartsTooltip
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      <Legend />
                      <Bar
                        dataKey="amount"
                        name="Revenue"
                        fill="#22c55e"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Projections Table */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Projections</CardTitle>
                <CardDescription>
                  Detailed monthly revenue projections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Growth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.revenue.forecasts.map((forecast) => (
                      <TableRow key={forecast.id}>
                        <TableCell>{forecast.period}</TableCell>
                        <TableCell>{formatCurrency(forecast.amount)}</TableCell>
                        <TableCell>
                          <span
                            className={
                              forecast.growthRate
                                ? forecast.growthRate >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                                : "text-gray-600"
                            }
                          >
                            {forecast.growthRate
                              ? (forecast.growthRate >= 0 ? "+" : "") +
                                forecast.growthRate +
                                "%"
                              : "N/A"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Assumptions */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Assumptions</CardTitle>
              <CardDescription>
                Factors affecting your revenue projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.revenue.assumptions.map((assumption) => (
                  <div
                    key={assumption.id}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div>
                      <h4 className="font-medium">{assumption.description}</h4>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        assumption.impact > 0
                          ? "bg-green-100 text-green-800"
                          : assumption.impact < 0
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100"
                      }
                    >
                      {assumption.impact > 0 ? "+" : ""}
                      {assumption.impact}% Impact
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50">
              <div className="text-sm">
                <span className="font-medium">Pro Tip:</span> Regularly update
                your assumptions based on real market data to improve forecast
                accuracy.
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Cost Structure Tab */}
        <TabsContent value="costs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cost Breakdown Chart */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>Fixed vs. Variable costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Fixed Costs",
                            value: data.costs.fixedCosts.reduce(
                              (sum, item) => sum + item.amount,
                              0
                            ),
                          },
                          {
                            name: "Variable Costs",
                            value:
                              data.costs.variableCosts.reduce(
                                (sum, item) => sum + item.amount,
                                0
                              ) * 100, // Assuming 100 units
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {[0, 1].map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        ...data.costs.fixedCosts.map((c) => ({
                          category: c.category,
                          amount: c.amount,
                          type: "Fixed",
                        })),
                      ]
                        .sort((a, b) => b.amount - a.amount)
                        .slice(0, 5)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <RechartsTooltip
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      <Legend />
                      <Bar
                        dataKey="amount"
                        name="Top Cost Categories"
                        fill="#00C49F"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Fixed Costs */}
            <Card>
              <CardHeader>
                <CardTitle>Fixed Costs</CardTitle>
                <CardDescription>
                  Costs that don't vary with production volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Frequency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.costs.fixedCosts.map((cost) => (
                      <TableRow key={cost.id}>
                        <TableCell>{cost.category}</TableCell>
                        <TableCell>{cost.description}</TableCell>
                        <TableCell>{formatCurrency(cost.amount)}</TableCell>
                        <TableCell>{cost.frequency}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Variable Costs */}
            <Card>
              <CardHeader>
                <CardTitle>Variable Costs</CardTitle>
                <CardDescription>
                  Costs that vary with production volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Per</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.costs.variableCosts.map((cost) => (
                      <TableRow key={cost.id}>
                        <TableCell>{cost.category}</TableCell>
                        <TableCell>{cost.description}</TableCell>
                        <TableCell>{formatCurrency(cost.amount)}</TableCell>
                        <TableCell>unit</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Break-even Analysis Tab */}
        <TabsContent value="breakeven">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Break-even Chart */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Break-even Analysis</CardTitle>
                <CardDescription>
                  Revenue vs. Costs based on sales volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        dataKey="units"
                        domain={[
                          0,
                          data.breakeven.breakEvenUnits
                            ? data.breakeven.breakEvenUnits * 2
                            : 500,
                        ]}
                        label={{
                          value: "Units Sold",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis />
                      <RechartsTooltip
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      <Legend />
                      <Line
                        name="Total Revenue"
                        data={[
                          { units: 0, value: 0 },
                          {
                            units: data.breakeven.breakEvenUnits
                              ? data.breakeven.breakEvenUnits * 2
                              : 500,
                            value:
                              (data.breakeven.breakEvenUnits
                                ? data.breakeven.breakEvenUnits * 2
                                : 500) * data.breakeven.unitSellingPrice,
                          },
                        ]}
                        type="linear"
                        dataKey="value"
                        stroke="#0088FE"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        name="Total Cost"
                        data={[
                          { units: 0, value: data.breakeven.fixedCosts },
                          {
                            units: data.breakeven.breakEvenUnits
                              ? data.breakeven.breakEvenUnits * 2
                              : 500,
                            value:
                              data.breakeven.fixedCosts +
                              (data.breakeven.breakEvenUnits
                                ? data.breakeven.breakEvenUnits * 2
                                : 500) *
                                data.breakeven.unitVariableCost,
                          },
                        ]}
                        type="linear"
                        dataKey="value"
                        stroke="#FF8042"
                        strokeWidth={2}
                        dot={false}
                      />
                      {data.breakeven.breakEvenUnits && (
                        <Line
                          name="Break-even Point"
                          data={[
                            {
                              units: data.breakeven.breakEvenUnits,
                              value: 0,
                            },
                            {
                              units: data.breakeven.breakEvenUnits,
                              value: data.breakeven.breakEvenRevenue,
                            },
                          ]}
                          type="linear"
                          dataKey="value"
                          stroke="#8884D8"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Break-even Calculator */}
            <Card>
              <CardHeader>
                <CardTitle>Break-even Calculator</CardTitle>
                <CardDescription>
                  Adjust values to calculate break-even point
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Unit Selling Price
                  </label>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                    <Input
                      type="number"
                      value={data.breakeven.unitSellingPrice}
                      onChange={(e) =>
                        handleUpdateBreakeven(
                          "unitSellingPrice",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Unit Variable Cost
                  </label>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                    <Input
                      type="number"
                      value={data.breakeven.unitVariableCost}
                      onChange={(e) =>
                        handleUpdateBreakeven(
                          "unitVariableCost",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Fixed Costs</label>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                    <Input
                      type="number"
                      value={data.breakeven.fixedCosts}
                      onChange={(e) =>
                        handleUpdateBreakeven(
                          "fixedCosts",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Contribution Margin:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        data.breakeven.contributionMargin || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Break-even Units:</span>
                    <span className="font-medium">
                      {Math.ceil(
                        data.breakeven.breakEvenUnits || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Break-even Revenue:</span>
                    <span className="font-medium">
                      {formatCurrency(data.breakeven.breakEvenRevenue || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pricing Strategy Tab */}
        <TabsContent value="pricing">
          <div className="grid grid-cols-1 gap-6">
            <Alert
              variant="default"
              className="bg-blue-50 text-blue-800 border-blue-200"
            >
              <Info className="h-4 w-4" />
              <AlertTitle>Pricing Strategy Considerations</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                  <li>
                    <strong>Cost-Plus Pricing:</strong> Add a markup to your
                    costs
                  </li>
                  <li>
                    <strong>Value-Based Pricing:</strong> Price based on
                    perceived customer value
                  </li>
                  <li>
                    <strong>Competitive Pricing:</strong> Set prices relative to
                    competitors
                  </li>
                  <li>
                    <strong>Penetration Pricing:</strong> Lower initial price to
                    gain market share
                  </li>
                  <li>
                    <strong>Premium Pricing:</strong> Higher price to signal
                    quality or exclusivity
                  </li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Pricing Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Pricing Strategy Comparison</CardTitle>
                <CardDescription>
                  Your pricing strategies vs competitor prices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        ...data.pricing.strategies.map((s) => ({
                          name: s.name,
                          price: s.pricePoint,
                          type: "Your Strategies",
                        })),
                        ...data.pricing.competitorPrices.map((c) => ({
                          name: c.competitor,
                          price: c.price,
                          type: "Competitors",
                        })),
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                      <Legend />
                      <Bar dataKey="price" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Strategies */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Strategies</CardTitle>
                <CardDescription>
                  Different pricing tiers for different markets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Strategy</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Target Market</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.pricing.strategies.map((strategy) => (
                      <TableRow key={strategy.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{strategy.name}</div>
                            <div className="text-xs text-gray-500">
                              {strategy.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(strategy.pricePoint)}
                        </TableCell>
                        <TableCell>{strategy.targetMarket}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Competitor Prices */}
            <Card>
              <CardHeader>
                <CardTitle>Competitor Prices</CardTitle>
                <CardDescription>
                  Market benchmark for your pricing strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Competitor</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.pricing.competitorPrices.map((competitor) => (
                      <TableRow key={competitor.id}>
                        <TableCell>{competitor.competitor}</TableCell>
                        <TableCell>
                          {formatCurrency(competitor.price)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{competitor.notes}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
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
