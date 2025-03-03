import React, { useState } from "react";
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

// Types for financial data
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
  contributionMargin?: number;
  breakEvenUnits?: number;
  breakEvenRevenue?: number;
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

interface FinancialProjectionsProps {
  data?: FinancialData;
  onUpdate: (data: Partial<FinancialData>) => void;
}

// Sample data generator
const generateSampleData = (): FinancialData => {
  return {
    revenue: {
      forecasts: [
        { id: "1", period: "Month 1", amount: 10000, growthRate: 0 },
        { id: "2", period: "Month 2", amount: 12000, growthRate: 20 },
        { id: "3", period: "Month 3", amount: 15000, growthRate: 25 },
        { id: "4", period: "Month 4", amount: 18000, growthRate: 20 },
        { id: "5", period: "Month 5", amount: 20000, growthRate: 11 },
        { id: "6", period: "Month 6", amount: 22000, growthRate: 10 },
      ],
      assumptions: [
        { id: "1", description: "New product launch", impact: 20 },
        { id: "2", description: "Seasonal demand increase", impact: 15 },
        { id: "3", description: "Marketing campaign", impact: 25 },
      ],
    },
    costs: {
      fixedCosts: [
        {
          id: "1",
          category: "Rent",
          description: "Office space",
          amount: 2000,
          frequency: "monthly",
        },
        {
          id: "2",
          category: "Salaries",
          description: "Core team",
          amount: 10000,
          frequency: "monthly",
        },
        {
          id: "3",
          category: "Software",
          description: "Subscriptions",
          amount: 500,
          frequency: "monthly",
        },
      ],
      variableCosts: [
        {
          id: "1",
          category: "Materials",
          description: "Raw materials",
          amount: 15,
          frequency: "monthly",
        },
        {
          id: "2",
          category: "Shipping",
          description: "Product delivery",
          amount: 10,
          frequency: "monthly",
        },
        {
          id: "3",
          category: "Commission",
          description: "Sales commission",
          amount: 50,
          frequency: "monthly",
        },
      ],
    },
    breakeven: {
      unitSellingPrice: 100,
      unitVariableCost: 40,
      fixedCosts: 15000,
      contributionMargin: 60,
      breakEvenUnits: 250,
      breakEvenRevenue: 25000,
    },
    pricing: {
      strategies: [
        {
          id: "1",
          name: "Premium",
          description: "High-end market with premium features",
          pricePoint: 199,
          targetMarket: "Enterprise",
        },
        {
          id: "2",
          name: "Standard",
          description: "Core product for general market",
          pricePoint: 99,
          targetMarket: "SMB",
        },
        {
          id: "3",
          name: "Basic",
          description: "Entry-level offering",
          pricePoint: 49,
          targetMarket: "Startups",
        },
      ],
      competitorPrices: [
        {
          id: "1",
          competitor: "Competitor A",
          price: 120,
          notes: "Similar features, established brand",
        },
        {
          id: "2",
          competitor: "Competitor B",
          price: 80,
          notes: "Fewer features, aggressive pricing",
        },
        {
          id: "3",
          competitor: "Competitor C",
          price: 150,
          notes: "Premium positioning, more integrations",
        },
      ],
    },
  };
};

// Helper function to format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Helper functions for financial insights and analysis
const calculateProfitMargin = (data: FinancialData): number => {
  const totalRevenue = data.revenue.forecasts.reduce(
    (sum, forecast) => sum + forecast.amount,
    0
  );
  const totalCosts =
    data.costs.fixedCosts.reduce((sum, cost) => sum + cost.amount, 0) +
    data.costs.variableCosts.reduce((sum, cost) => sum + cost.amount, 0);

  return totalRevenue > 0
    ? ((totalRevenue - totalCosts) / totalRevenue) * 100
    : 0;
};

const getBreakevenTimeframe = (data: FinancialData): string => {
  const monthlyRevenue =
    data.revenue.forecasts.length > 0
      ? data.revenue.forecasts[data.revenue.forecasts.length - 1].amount
      : 0;
  const totalFixedCosts = data.costs.fixedCosts.reduce(
    (sum, cost) => sum + cost.amount,
    0
  );

  if (monthlyRevenue <= 0) return "Insufficient data";

  const months = Math.ceil(totalFixedCosts / monthlyRevenue);
  return months <= 12
    ? `${months} months`
    : `${Math.round((months / 12) * 10) / 10} years`;
};

const getFinancialHealth = (
  data: FinancialData
): { status: string; color: string } => {
  const profitMargin = calculateProfitMargin(data);

  if (profitMargin > 20)
    return { status: "Excellent", color: "bg-green-100 text-green-800" };
  if (profitMargin > 10)
    return { status: "Good", color: "bg-blue-100 text-blue-800" };
  if (profitMargin > 0)
    return { status: "Fair", color: "bg-yellow-100 text-yellow-800" };
  return { status: "Needs Attention", color: "bg-red-100 text-red-800" };
};

export const FinancialProjections: React.FC<FinancialProjectionsProps> = ({
  data,
  onUpdate,
}) => {
  const safeData = data || generateSampleData();
  const [activeBreakevenVolumeIndex, setActiveBreakevenVolumeIndex] = useState<
    number | null
  >(null);

  // Financial health and insights
  const profitMargin = calculateProfitMargin(safeData);
  const breakevenTimeframe = getBreakevenTimeframe(safeData);
  const financialHealth = getFinancialHealth(safeData);

  // Calculate breakeven values
  const calculateBreakeven = (data: BreakevenData): BreakevenData => {
    const contributionMargin = data.unitSellingPrice - data.unitVariableCost;
    const breakEvenUnits = data.fixedCosts / contributionMargin;
    const breakEvenRevenue = breakEvenUnits * data.unitSellingPrice;

    return {
      ...data,
      contributionMargin,
      breakEvenUnits,
      breakEvenRevenue,
    };
  };

  // Event handlers
  const handleAddRevenueForecast = () => {
    const lastForecast =
      safeData.revenue.forecasts[safeData.revenue.forecasts.length - 1];
    const nextPeriod = `Month ${safeData.revenue.forecasts.length + 1}`;
    const newAmount = lastForecast ? lastForecast.amount * 1.1 : 10000;

    const newForecast: RevenueForecast = {
      id: Math.random().toString(36).substring(2, 9),
      period: nextPeriod,
      amount: Math.round(newAmount),
      growthRate: 10,
    };

    onUpdate({
      revenue: {
        ...safeData.revenue,
        forecasts: [...safeData.revenue.forecasts, newForecast],
      },
    });
  };

  const handleAddPricingStrategy = () => {
    const newStrategy: PricingStrategy = {
      id: Math.random().toString(36).substring(2, 9),
      name: "New Strategy",
      description: "Enter strategy description",
      pricePoint: 99,
      targetMarket: "Target market",
    };

    onUpdate({
      pricing: {
        ...safeData.pricing,
        strategies: [...safeData.pricing.strategies, newStrategy],
      },
    });
  };

  const handleUpdateBreakeven = (field: keyof BreakevenData, value: number) => {
    const updatedBreakeven = calculateBreakeven({
      ...safeData.breakeven,
      [field]: value,
    });

    onUpdate({
      breakeven: updatedBreakeven,
    });
  };

  // Chart color scheme
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
                safeData.revenue.forecasts.reduce(
                  (sum, forecast) => sum + forecast.amount,
                  0
                )
              )}
            </div>
            <div className="h-[60px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={safeData.revenue.forecasts.slice(0, 6)}>
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

      <Alert
        variant="default"
        className="bg-blue-50 text-blue-800 border-blue-200"
      >
        <Info className="h-4 w-4" />
        <AlertTitle>Financial Planning Best Practices</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside text-sm mt-2 space-y-1">
            <li>
              Create multiple revenue scenarios (conservative, moderate,
              optimistic)
            </li>
            <li>Track both fixed and variable costs accurately</li>
            <li>Revisit your breakeven analysis regularly as costs change</li>
            <li>
              Consider competitor pricing when setting your own pricing strategy
            </li>
            <li>Plan for unexpected expenses with a contingency budget</li>
          </ul>
        </AlertDescription>
      </Alert>

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
                      data={safeData.revenue.forecasts}
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
                    {safeData.revenue.forecasts.map((forecast) => (
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
                {safeData.revenue.assumptions.map((assumption) => (
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
                            value: safeData.costs.fixedCosts.reduce(
                              (sum, item) => sum + item.amount,
                              0
                            ),
                          },
                          {
                            name: "Variable Costs",
                            value:
                              safeData.costs.variableCosts.reduce(
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
                        ...safeData.costs.fixedCosts.map((c) => ({
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
                    {safeData.costs.fixedCosts.map((cost) => (
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
                    {safeData.costs.variableCosts.map((cost) => (
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
                          safeData.breakeven.breakEvenUnits
                            ? safeData.breakeven.breakEvenUnits * 2
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
                            units: safeData.breakeven.breakEvenUnits
                              ? safeData.breakeven.breakEvenUnits * 2
                              : 500,
                            value:
                              (safeData.breakeven.breakEvenUnits
                                ? safeData.breakeven.breakEvenUnits * 2
                                : 500) * safeData.breakeven.unitSellingPrice,
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
                          { units: 0, value: safeData.breakeven.fixedCosts },
                          {
                            units: safeData.breakeven.breakEvenUnits
                              ? safeData.breakeven.breakEvenUnits * 2
                              : 500,
                            value:
                              safeData.breakeven.fixedCosts +
                              (safeData.breakeven.breakEvenUnits
                                ? safeData.breakeven.breakEvenUnits * 2
                                : 500) *
                                safeData.breakeven.unitVariableCost,
                          },
                        ]}
                        type="linear"
                        dataKey="value"
                        stroke="#FF8042"
                        strokeWidth={2}
                        dot={false}
                      />
                      {safeData.breakeven.breakEvenUnits && (
                        <Line
                          name="Break-even Point"
                          data={[
                            {
                              units: safeData.breakeven.breakEvenUnits,
                              value: 0,
                            },
                            {
                              units: safeData.breakeven.breakEvenUnits,
                              value: safeData.breakeven.breakEvenRevenue,
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
                      value={safeData.breakeven.unitSellingPrice}
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
                      value={safeData.breakeven.unitVariableCost}
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
                      value={safeData.breakeven.fixedCosts}
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
                        safeData.breakeven.contributionMargin || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Break-even Units:</span>
                    <span className="font-medium">
                      {Math.ceil(
                        safeData.breakeven.breakEvenUnits || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Break-even Revenue:</span>
                    <span className="font-medium">
                      {formatCurrency(safeData.breakeven.breakEvenRevenue || 0)}
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
                        ...safeData.pricing.strategies.map((s) => ({
                          name: s.name,
                          price: s.pricePoint,
                          type: "Your Strategies",
                        })),
                        ...safeData.pricing.competitorPrices.map((c) => ({
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
                    {safeData.pricing.strategies.map((strategy) => (
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
                    {safeData.pricing.competitorPrices.map((competitor) => (
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
    </div>
  );
};
