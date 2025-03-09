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
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  DollarSign,
  Percent,
  TrendingUp,
  Calculator,
  CreditCard,
  Target,
  Activity,
  Plus,
  AlertCircle,
  Loader2,
} from "lucide-react";
import RevenueCharts from "./RevenueChart";
import { Badge } from "@/components/ui/badge";
import { useProjectStore } from "@/store";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useFinancials } from "@/hooks/features/useFinancials";
import CostStructure from "./CostStructure";
import BreakevenAnalysis from "./BreakevenAnalysis";
import PricingStrategy from "./PricingStrategy";
import { BreakevenData } from "./BreakevenAnalysis";
import {
  Tables,
  TablesInsert,
  TablesUpdate
} from "@/types/database";

// Tabs configuration
const financialTabs = [
  {
    id: "revenue",
    label: "Revenue Streams",
    icon: <TrendingUp className="h-4 w-4 mr-2" />,
  },
  {
    id: "costs",
    label: "Cost Structure",
    icon: <DollarSign className="h-4 w-4 mr-2" />,
  },
  {
    id: "pricing",
    label: "Pricing Strategy",
    icon: <Percent className="h-4 w-4 mr-2" />,
  },
  {
    id: "breakeven",
    label: "Break-even Analysis",
    icon: <Target className="h-4 w-4 mr-2" />,
  },
  {
    id: "projections",
    label: "Financial Projections",
    icon: <Activity className="h-4 w-4 mr-2" />,
  },
];

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Calculate profit margin
const calculateProfitMargin = (data: any): number => {
  const totalRevenue = data.revenue.forecasts.reduce(
    (sum: number, forecast: any) => sum + forecast.amount,
    0
  );
  
  const totalCosts = 
    data.costs.fixedCosts.reduce((sum: number, cost: any) => sum + cost.amount, 0) +
    data.costs.variableCosts.reduce((sum: number, cost: any) => sum + cost.amount, 0);
  
  if (totalRevenue === 0) return 0;
  
  return Math.round(((totalRevenue - totalCosts) / totalRevenue) * 100);
};

// Main component
export const FinancialProjections: React.FC = () => {
  const [activeTab, setActiveTab] = useState("revenue");
  const { currentData } = useProjectStore();
  const projectId = currentData.project?.id;
  const { toast } = useToast();
  
  // Use the useFinancials hook
  const {
    data,
    isLoading,
    error,
    
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
  } = useFinancials(projectId);
  
  // Track which item is being edited for each section
  const [editingItem, setEditingItem] = useState<{
    type: 'revenue' | 'cost' | 'pricing' | 'projection' | null;
    id: string | null;
  }>({ type: null, id: null });
  
  // Track modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Handle adding a new revenue stream
  const handleAddRevenueStream = async (formData: any): Promise<void> => {
    try {
      // Create a deep copy to avoid mutation issues
      const formDataCopy = JSON.parse(JSON.stringify(formData));
      
      // Add the revenue stream
      await addRevenueStream(formDataCopy);
      
      toast({
        title: "Revenue stream added",
        description: "New revenue stream has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error adding revenue stream",
        description: "Failed to create new revenue stream.",
        variant: "destructive"
      });
      // Re-throw to let the component handle the error
      throw error;
    }
  };
  
  // Handle adding a new cost structure item
  const handleAddCost = async () => {
    try {
      const newCost = await addCostStructure({
        name: "New Cost",
        project_id: projectId,
        type: "fixed",
        category: "operations",
        amount: 500,
        frequency: "monthly",
      });
      
      if (newCost) {
        toast({
          title: "Cost added",
          description: "New cost has been created successfully.",
        });
      }
    } catch (err) {
      toast({
        title: "Error adding cost",
        description: "Failed to create new cost.",
        variant: "destructive",
      });
    }
  };
  
  // Handle adding a new pricing strategy
  const handleAddPricingStrategy = async () => {
    try {
      const newStrategy = await addPricingStrategy({
        name: "New Pricing Strategy",
        project_id: projectId,
        strategy_type: "value-based",
        target_market: "General",
      });
      
      if (newStrategy) {
        toast({
          title: "Pricing strategy added",
          description: "New pricing strategy has been created successfully.",
        });
      }
    } catch (err) {
      toast({
        title: "Error adding pricing strategy",
        description: "Failed to create new pricing strategy.",
        variant: "destructive",
      });
    }
  };
  
  // Handle adding a new financial projection
  const handleAddProjection = async () => {
    try {
      const newProjection = await addProjection({
        title: "New Financial Projection",
        project_id: projectId,
        scenario: "base",
        timeframe: "yearly",
        data: { periods: [], totals: { revenue: 0, costs: 0, profit: 0 } },
      });
      
      if (newProjection) {
        toast({
          title: "Projection added",
          description: "New financial projection has been created successfully.",
        });
      }
    } catch (err) {
      toast({
        title: "Error adding projection",
        description: "Failed to create new financial projection.",
        variant: "destructive",
      });
    }
  };
  
  // Handle updating a revenue stream
  const handleUpdateRevenueStream = async (id: string, formData: any): Promise<void> => {
    try {
      // Create a deep copy to avoid mutation issues
      const formDataCopy = JSON.parse(JSON.stringify(formData));
      
      // Update the revenue stream
      await updateRevenueStream({ 
        id, 
        data: formDataCopy
      });
      
      toast({
        title: "Revenue stream updated",
        description: "The revenue stream has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error updating revenue stream",
        description: "Failed to update the revenue stream.",
        variant: "destructive"
      });
      // Re-throw to let the component handle the error
      throw error;
    }
  };
  
  // Process data for UI
  const processedData = useMemo(() => {
    // Process revenue streams
    const revenueForecasts = data.revenueStreams.map((stream) => ({
      id: stream.id,
      name: stream.name,
      amount: (stream.unit_price || 0) * (stream.volume || 0),
      period: stream.frequency || 'monthly',
      growthRate: stream.growth_rate || 0,
    }));
    
    // Process costs
    const fixedCosts = data.costStructure.filter(cost => 
      cost.type === 'fixed').map(cost => ({
        id: cost.id,
        category: cost.category || 'other',
        description: cost.description || cost.name,
        amount: cost.amount || 0,
        frequency: cost.frequency || 'monthly',
      }));
      
    const variableCosts = data.costStructure.filter(cost => 
      cost.type === 'variable' || cost.type === 'semi-variable').map(cost => ({
        id: cost.id,
        category: cost.category || 'other',
        description: cost.description || cost.name,
        amount: cost.amount || 0,
        frequency: cost.frequency || 'monthly',
      }));
      
    // Calculate break-even
    const totalRevenue = revenueForecasts.reduce((sum, forecast) => sum + forecast.amount, 0);
    const totalFixedCosts = fixedCosts.reduce((sum, cost) => sum + cost.amount, 0);
    const totalVariableCosts = variableCosts.reduce((sum, cost) => sum + cost.amount, 0);
    
    let breakEvenUnits = 0;
    if (totalRevenue > 0) {
      // Simple break-even calculation
      const averageUnitPrice = totalRevenue / 
        Math.max(data.revenueStreams.reduce((sum, stream) => sum + (stream.volume || 0), 0), 1);
        
      const averageVariableCostPerUnit = totalVariableCosts / 
        Math.max(data.revenueStreams.reduce((sum, stream) => sum + (stream.volume || 0), 0), 1);
        
      if (averageUnitPrice > averageVariableCostPerUnit) {
        breakEvenUnits = totalFixedCosts / (averageUnitPrice - averageVariableCostPerUnit);
      }
    }
    
    // Safely handle the JSON type for projections data
    const projectionChartData = data.projections.length > 0 && data.projections[0].data 
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
    
    // Return processed data structure
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
        revenue: breakEvenUnits * (totalRevenue / 
          Math.max(data.revenueStreams.reduce((sum, stream) => sum + (stream.volume || 0), 0), 1)),
        data: [
          { units: Math.max(0, breakEvenUnits - 100), revenue: 0, costs: totalFixedCosts },
          { units: breakEvenUnits, revenue: breakEvenUnits * (totalRevenue / 
            Math.max(data.revenueStreams.reduce((sum, stream) => sum + (stream.volume || 0), 0), 1)), 
            costs: totalFixedCosts + (breakEvenUnits * (totalVariableCosts / 
            Math.max(data.revenueStreams.reduce((sum, stream) => sum + (stream.volume || 0), 0), 1))) },
          { units: breakEvenUnits + 100, revenue: (breakEvenUnits + 100) * (totalRevenue / 
            Math.max(data.revenueStreams.reduce((sum, stream) => sum + (stream.volume || 0), 0), 1)), 
            costs: totalFixedCosts + ((breakEvenUnits + 100) * (totalVariableCosts / 
            Math.max(data.revenueStreams.reduce((sum, stream) => sum + (stream.volume || 0), 0), 1))) },
        ]
      },
      pricing: {
        strategies: data.pricingStrategies,
      },
      projections: {
        data: projectionChartData,
        scenarios: data.projections.map(p => ({
          id: p.id,
          title: p.title,
          scenario: p.scenario || 'base',
          timeframe: p.timeframe || 'monthly',
        }))
      }
    };
  }, [data]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
          <h3 className="mt-2 font-semibold text-lg">Error loading financial data</h3>
          <p className="mt-1 text-muted-foreground">{error.message || 'An unknown error occurred'}</p>
          <Button 
            className="mt-4" 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Projected Revenue
              </CardTitle>
              <CardDescription>Current forecast</CardDescription>
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(processedData.revenue.total)}
            </div>
            <div className="h-[60px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData.revenue.forecasts.slice(0, 6)}>
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
                Total Costs
              </CardTitle>
              <CardDescription>Fixed + Variable</CardDescription>
            </div>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(processedData.costs.total)}
            </div>
            <div className="h-[60px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Fixed", value: processedData.costs.totalFixed },
                      { name: "Variable", value: processedData.costs.totalVariable },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={18}
                    outerRadius={30}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#8b5cf6" />
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
                Profit Margin
              </CardTitle>
              <CardDescription>Based on current data</CardDescription>
            </div>
            <Percent className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(0, Math.round((processedData.revenue.total - processedData.costs.total) / 
                Math.max(processedData.revenue.total, 1) * 100))}%
              </div>
            <div className="h-[60px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { 
                        name: "Profit", 
                        value: Math.max(0, processedData.revenue.total - processedData.costs.total)
                      },
                      { 
                        name: "Costs", 
                        value: processedData.costs.total
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={18}
                    outerRadius={30}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#ef4444" />
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
                Break-even Point
              </CardTitle>
              <CardDescription>Units to break even</CardDescription>
            </div>
            <Target className="w-5 h-5 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(processedData.breakeven.units).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(processedData.breakeven.revenue)} in revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="revenue"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
        <TabList
          tabs={financialTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        </div>

        <TabsContent value="revenue" className="mt-0 border-none shadow-none">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Revenue Streams</h2>
          </div>
          {projectId && (
            <RevenueCharts 
              streams={data.revenueStreams}
              onEdit={(id: string) => setEditingItem({ type: 'revenue', id })}
              onDelete={async (id: string) => {
                try {
                  await deleteRevenueStream(id);
                  return true;
                } catch (error) {
                  return false;
                }
              }}
              onAdd={handleAddRevenueStream}
              onUpdate={handleUpdateRevenueStream}
              projectId={projectId}
            />
          )}
        </TabsContent>

        <TabsContent value="costs" className="mt-0 border-none shadow-none">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Cost Structure</h2>
            <Button onClick={handleAddCost}>
              <Plus className="h-4 w-4 mr-2" /> Add Cost
            </Button>
          </div>
          <CostStructure costs={data.costStructure} />
          </TabsContent>

        <TabsContent value="pricing" className="mt-0 border-none shadow-none">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Pricing Strategies</h2>
            <Button onClick={handleAddPricingStrategy}>
              <Plus className="h-4 w-4 mr-2" /> Add Strategy
            </Button>
          </div>
          <PricingStrategy 
            data={{
              pricing: {
                strategies: data.pricingStrategies,
                competitorPrices: []
              }
            }}
          />
          </TabsContent>

        <TabsContent value="breakeven" className="mt-0 border-none shadow-none">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Break-even Analysis</h2>
          </div>
          <BreakevenAnalysis 
            data={{
              breakeven: {
                unitSellingPrice: processedData.revenue.total / Math.max(data.revenueStreams.reduce((sum, stream) => sum + (stream.volume || 0), 0), 1),
                unitVariableCost: processedData.costs.totalVariable / Math.max(data.revenueStreams.reduce((sum, stream) => sum + (stream.volume || 0), 0), 1),
                fixedCosts: processedData.costs.totalFixed,
                contributionMargin: (processedData.revenue.total / Math.max(data.revenueStreams.reduce((sum, stream) => sum + (stream.volume || 0), 0), 1)) - 
                  (processedData.costs.totalVariable / Math.max(data.revenueStreams.reduce((sum, stream) => sum + (stream.volume || 0), 0), 1)),
                breakEvenUnits: processedData.breakeven.units,
                breakEvenRevenue: processedData.breakeven.revenue
              }
            }}
          />
          </TabsContent>

        <TabsContent value="projections" className="mt-0 border-none shadow-none">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Financial Projections</h2>
            <Button onClick={handleAddProjection}>
              <Plus className="h-4 w-4 mr-2" /> Add Projection
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Projection</CardTitle>
              <CardDescription>
                Based on current revenue streams and cost structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedData.projections.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value).replace("$", "")}
                    />
                    <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#22c55e"
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="costs"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Costs"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Profit"
                    />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
        </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* TODO: Implement modals for adding and editing entries */}
    </div>
  );
};
