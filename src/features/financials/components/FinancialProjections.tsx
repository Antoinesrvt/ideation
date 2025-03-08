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
import { generateId, parseJsonbField } from "@/lib/utils";
import {
  FinancialRevenueStream,
  FinancialCostStructure,
  FinancialPricingStrategy,
  FinancialProjection,
} from "@/store/types";
import { AIComparisonControls } from "@/components/ai/AIComparisonControls";
import CostStructure from "./CostStructure";
import BreakevenAnalysis from "./BreakevenAnalysis";
import PricingStrategy from "./PricingStrategy";
import { BreakevenData } from "./BreakevenAnalysis";

// Types for UI-friendly financial data structures
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

interface RevenueData {
  forecasts: RevenueForecast[];
  assumptions: RevenueAssumption[];
}

interface CostItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "annually" | "one-time";
}

interface CostData {
  fixedCosts: CostItem[];
  variableCosts: CostItem[];
}

interface CompetitorPrice {
  id: string;
  competitor: string;
  price: number;
  notes: string;
}

export interface FinancialData {
  revenue: RevenueData;
  costs: CostData;
  breakeven: BreakevenData;
  pricing: {
    strategies: FinancialPricingStrategy[];
    competitorPrices: CompetitorPrice[];
  };
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
      case "monthly":
        annualAmount *= 12;
        break;
      case "quarterly":
        annualAmount *= 4;
        break;
      case "annually":
        // Already annual
        break;
      case "one-time":
        // One-time costs are included as-is
        break;
    }
    return sum + annualAmount;
  }, 0);
};

/**
 * Map database types to UI-friendly format
 */
const mapToUIFormat = (sourceData: {
  financialRevenueStreams: FinancialRevenueStream[];
  financialCostStructure: FinancialCostStructure[];
  financialPricingStrategies: FinancialPricingStrategy[];
  financialProjections: FinancialProjection[];
}): FinancialData => {
  // Default empty data structure
  const defaultData: FinancialData = {
    revenue: {
      forecasts: [],
      assumptions: [],
    },
    costs: {
      fixedCosts: [],
      variableCosts: [],
    },
    breakeven: {
      unitSellingPrice: 0,
      unitVariableCost: 0,
      fixedCosts: 0,
      contributionMargin: 0,
      breakEvenUnits: 0,
      breakEvenRevenue: 0,
    },
    pricing: {
      strategies: [],
      competitorPrices: [],
    },
  };

  if (!sourceData) return defaultData;

  // Map revenue streams to forecasts and assumptions
  const forecasts: RevenueForecast[] = sourceData.financialRevenueStreams
    .filter(
      (stream) => stream.type === "recurring" || stream.type === "one-time"
    )
    .map((stream) => {
      // Generate forecasts based on revenue stream data
      const projections = parseJsonbField<
        Array<{ period: string; amount: number }>
      >(stream.projections, []);

      // If we have projections, map them directly
      if (projections.length > 0) {
        return projections.map((p: { period: string; amount: number }) => ({
          id: `${stream.id}-${p.period}`,
          period: p.period,
          amount: p.amount,
          growthRate: stream.growth_rate || undefined,
        }));
      }

      // If no projections, create a basic forecast from the stream data
      return [
        {
          id: stream.id,
          period: stream.frequency || "monthly",
          amount: (stream.unit_price || 0) * (stream.volume || 1),
          growthRate: stream.growth_rate || undefined,
        },
      ];
    })
    .flat();

  // Extract assumptions from revenue streams
  const assumptions: RevenueAssumption[] = sourceData.financialRevenueStreams
    .filter((stream) => stream.assumptions)
    .map((stream) => ({
      id: `${stream.id}-assumption`,
      description: stream.assumptions || "",
      impact: stream.growth_rate || 0,
    }));

  // Map cost structure to fixed and variable costs
  const fixedCosts: CostItem[] = sourceData.financialCostStructure
    .filter((cost) => cost.type === "fixed")
    .map((cost) => ({
      id: cost.id,
      category: cost.category || "other",
      description: cost.description || cost.name,
      amount: cost.amount || 0,
      frequency:
        (cost.frequency as "monthly" | "quarterly" | "annually" | "one-time") ||
        "monthly",
    }));

  const variableCosts: CostItem[] = sourceData.financialCostStructure
    .filter((cost) => cost.type === "variable" || cost.type === "semi-variable")
    .map((cost) => ({
      id: cost.id,
      category: cost.category || "other",
      description: cost.description || cost.name,
      amount: cost.amount || 0,
      frequency:
        (cost.frequency as "monthly" | "quarterly" | "annually" | "one-time") ||
        "monthly",
    }));

  // Create generic competitor prices if none exist
  // In a real app, this would come from another part of the database
  const competitorPrices: CompetitorPrice[] = [
    {
      id: "comp1",
      competitor: "Competitor A",
      price: 199,
      notes: "Market leader",
    },
    {
      id: "comp2",
      competitor: "Competitor B",
      price: 149,
      notes: "Budget option",
    },
  ];

  // Calculate breakeven data
  // This is just an example - in a real app we would use more sophisticated formulas
  const averageRevenue =
    forecasts.reduce((sum, f) => sum + f.amount, 0) /
    Math.max(forecasts.length, 1);
  const avgVariableCost = calculateAverageVariableCost(variableCosts);
  const totalFixedCosts = calculateTotalFixedCosts(fixedCosts);
  const contributionMargin = averageRevenue - avgVariableCost;

  const breakeven = {
    unitSellingPrice: averageRevenue,
    unitVariableCost: avgVariableCost,
    fixedCosts: totalFixedCosts,
    contributionMargin: contributionMargin,
    breakEvenUnits:
      contributionMargin > 0
        ? Math.ceil(totalFixedCosts / contributionMargin)
        : 0,
    breakEvenRevenue:
      contributionMargin > 0
        ? Math.ceil(totalFixedCosts / contributionMargin) * averageRevenue
        : 0,
  };

  return {
    revenue: {
      forecasts,
      assumptions,
    },
    costs: {
      fixedCosts,
      variableCosts,
    },
    breakeven,
    pricing: {
      strategies: sourceData.financialPricingStrategies || [],
      competitorPrices,
    },
  };
};

// Format currency values
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Calculate profit margin from financial data
const calculateProfitMargin = (data: FinancialData): number => {
  // Calculate total revenue
  const totalRevenue = data.revenue.forecasts.reduce(
    (sum, f) => sum + f.amount,
    0
  );

  // Calculate total costs (fixed + variable)
  const totalFixedCosts = data.costs.fixedCosts.reduce(
    (sum, c) => sum + c.amount,
    0
  );
  const totalVariableCosts = data.costs.variableCosts.reduce(
    (sum, c) => sum + c.amount,
    0
  );
  const totalCosts = totalFixedCosts + totalVariableCosts;

  // Calculate profit and margin
  const profit = totalRevenue - totalCosts;
  return totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
};

// Get breakeven timeframe description
const getBreakevenTimeframe = (data: FinancialData): string => {
  const { breakEvenUnits } = data.breakeven;

  if (breakEvenUnits <= 0) return "Not determined";
  if (breakEvenUnits < 100) return "Short-term (1-3 months)";
  if (breakEvenUnits < 1000) return "Medium-term (3-12 months)";
  return "Long-term (12+ months)";
};

// Get financial health assessment
const getFinancialHealth = (
  data: FinancialData
): { status: string; color: string } => {
  const profitMargin = calculateProfitMargin(data);
  const hasRevenue = data.revenue.forecasts.length > 0;
  const hasCosts =
    data.costs.fixedCosts.length > 0 || data.costs.variableCosts.length > 0;

  if (!hasRevenue || !hasCosts) {
    return {
      status: "Incomplete",
      color: "text-gray-500 border-gray-200",
    };
  }

  if (profitMargin < 0) {
    return {
      status: "At Risk",
      color: "text-red-500 border-red-200",
    };
  }

  if (profitMargin < 15) {
    return {
      status: "Fair",
      color: "text-amber-500 border-amber-200",
    };
  }

  return {
    status: "Good",
    color: "text-green-500 border-green-200",
  };
};

export const FinancialProjections: React.FC = () => {
  const [activeTab, setActiveTab] = useState("revenue");
  const { currentData } = useProjectStore();
  const projectId = currentData.project?.id;
  const params = useParams();

  // Get comparison mode flag
  const comparisonMode = false; // Replace with actual logic if needed

  // Map financial data from store
  const financialData = useMemo(() => {
    return mapToUIFormat({
      financialRevenueStreams: currentData.financialRevenueStreams || [],
      financialCostStructure: currentData.financialCostStructure || [],
      financialPricingStrategies: currentData.financialPricingStrategies || [],
      financialProjections: currentData.financialProjections || [],
    });
  }, [currentData]);

  // Compute financial health
  const financialHealth = getFinancialHealth(financialData);

  const data = financialData;

  return (
    <div className="space-y-6">
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
            <div className="text-2xl font-bold">{calculateProfitMargin(data).toFixed(1)}%</div>
            <div className="h-[60px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Profit", value: calculateProfitMargin(data) },
                      { name: "Costs", value: 100 - calculateProfitMargin(data) },
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
            <div className="text-2xl font-bold">{getBreakevenTimeframe(data)}</div>
            <div className="h-[60px] mt-4 flex items-center justify-center">
              <div className="bg-gray-100 w-full h-2 rounded-full">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      (parseInt(getBreakevenTimeframe(data)) / 24) * 100,
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
            <RevenueCharts projectId={projectId || ""} revenue={data.revenue} />
          </TabsContent>

          {/* Cost Structure Tab */}
          <TabsContent value="costs">
            <CostStructure costs={data.costs} />
          </TabsContent>

          {/* Break-even Analysis Tab */}
          <TabsContent value="breakeven">
            <BreakevenAnalysis data={{ breakeven: data.breakeven }} />
          </TabsContent>

          {/* Pricing Strategy Tab */}
          <TabsContent value="pricing">
            <PricingStrategy data={{ pricing: data.pricing }} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
