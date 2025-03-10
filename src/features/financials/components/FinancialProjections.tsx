import React, { useState, useMemo, useCallback } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import TabList from "@/features/common/components/TabList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Wallet, Target, TrendingUp, Loader2, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useProjectStore } from "@/store/project-store";
import { useFinancials } from "@/hooks/features/useFinancials";
import { financialTabs } from "../data/tabs";
import { CostItem } from "./common/EditableCostRow";

// Import the tab components
import RevenueCharts from "./RevenueCharts";
import CostStructure from "./CostStructure";
import PricingStrategy from "./PricingStrategy";
import BreakevenAnalysis from "./BreakevenAnalysis";
import ProjectionChart from "./ProjectionChart";

// Import utilities
import { 
  formatCurrency, 
  calculateProfitMargin, 
  processFinancialData 
} from "../utils/dataProcessing";

// Main component
export const FinancialProjections: React.FC = () => {
  const [activeTab, setActiveTab] = useState("revenue");
  const { currentData } = useProjectStore();
  
  // Memoize the project ID to ensure it doesn't change on every render
  const projectId = useMemo(() => currentData?.project?.id, [currentData?.project?.id]);
  
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
  } = useFinancials(projectId);

  // Process financial data using memoization
  const processedData = useMemo(() => 
    processFinancialData(data, isLoading),
  [data, isLoading]);

  // Handler functions with proper memoization
  const handleAddRevenueStream = useCallback(async (formData: any): Promise<void> => {
    try {
      // Create a deep copy to avoid mutation issues
      const formDataCopy = JSON.parse(JSON.stringify(formData));
      
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
      throw error;
    }
  }, [addRevenueStream, toast]);
  
  const handleUpdateRevenueStream = useCallback(async (id: string, formData: any): Promise<void> => {
    try {
      // Create a deep copy to avoid mutation issues
      const formDataCopy = JSON.parse(JSON.stringify(formData));
      
      await updateRevenueStream({ id, data: formDataCopy });
      
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
      throw error;
    }
  }, [updateRevenueStream, toast]);
  
  const handleDeleteRevenueStream = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteRevenueStream(id);
      
      toast({
        title: "Revenue stream deleted",
        description: "The revenue stream has been deleted successfully.",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error deleting revenue stream",
        description: "Failed to delete the revenue stream.",
        variant: "destructive"
      });
      return false;
    }
  }, [deleteRevenueStream, toast]);

  const handleUpdateCost = useCallback(async (costData: CostItem): Promise<void> => {
    if (!costData) return;
    
    try {
      if (costData.id) {
        // It's an update
        const updateData = {
          category: costData.category,
          description: costData.description,
          amount: costData.amount,
          frequency: costData.frequency,
          type: costData.type,
        };
        
        await updateCostStructure({
          id: costData.id,
          data: updateData
        });
        
        toast({
          title: "Success",
          description: "Cost updated successfully",
        });
      } else {
        // It's a new cost
        const newCost = {
          name: costData.description, // Name is required for database model
          category: costData.category,
          description: costData.description,
          amount: costData.amount,
          frequency: costData.frequency,
          type: costData.type,
          project_id: projectId,
        };
        
        await addCostStructure(newCost);
        
        toast({
          title: "Success",
          description: "Cost added successfully",
        });
      }
    } catch (error) {
      console.error("Error updating cost:", error);
      toast({
        title: "Error",
        description: `Failed to ${costData.id ? 'update' : 'add'} cost. Please try again.`,
        variant: "destructive",
      });
    }
  }, [addCostStructure, projectId, toast, updateCostStructure]);
  
  const handleDeleteCost = useCallback(async (id: string): Promise<void> => {
    if (!id) return;
    
    try {
      await deleteCostStructure(id);
      
      toast({
        title: "Success",
        description: "Cost deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting cost:", error);
      toast({
        title: "Error",
        description: "Failed to delete cost. Please try again.",
        variant: "destructive",
      });
    }
  }, [deleteCostStructure, toast]);
  
  const handleAddPricingStrategy = useCallback(async (): Promise<void> => {
    try {
      await addPricingStrategy({
        name: "New Pricing Strategy",
        project_id: projectId,
        strategy_type: "value-based",
        target_market: "General",
      });
      
      toast({
        title: "Pricing strategy added",
        description: "New pricing strategy has been created successfully.",
      });
    } catch (err) {
      toast({
        title: "Error adding pricing strategy",
        description: "Failed to create new pricing strategy.",
        variant: "destructive",
      });
    }
  }, [addPricingStrategy, projectId, toast]);
  
  const handleAddProjection = useCallback(async (): Promise<void> => {
    try {
      await addProjection({
        title: "New Financial Projection",
        project_id: projectId,
        scenario: "base",
        timeframe: "yearly",
        data: { periods: [], totals: { revenue: 0, costs: 0, profit: 0 } },
      });
      
      toast({
        title: "Projection added",
        description: "New projection has been created successfully.",
      });
    } catch (err) {
      toast({
        title: "Error adding projection",
        description: "Failed to create new projection.",
        variant: "destructive",
      });
    }
  }, [addProjection, projectId, toast]);

  // Error handler
  const handleReloadPage = useCallback(() => {
    window.location.reload();
  }, []);
  
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
            onClick={handleReloadPage}
            type="button"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Calculate metrics for summary cards
  const totalRevenue = processedData.revenue.total;
  const totalCosts = processedData.costs.total;
  const profitMargin = calculateProfitMargin(totalRevenue, totalCosts);
  const profit = totalRevenue - totalCosts;

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <CardDescription>Projected annual revenue</CardDescription>
            </div>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {processedData.revenue.forecasts.length} revenue streams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Total Costs
              </CardTitle>
              <CardDescription>Fixed and variable costs</CardDescription>
            </div>
            <Wallet className="w-5 h-5 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCosts)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(processedData.costs.totalFixed)} fixed / {formatCurrency(processedData.costs.totalVariable)} variable
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium">
                Profit Margin
              </CardTitle>
              <CardDescription>Percentage of revenue</CardDescription>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitMargin}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(profit)} projected profit
            </p>
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
          {projectId && (
            <RevenueCharts
              streams={data.revenueStreams}
              projectId={projectId}
              onAdd={handleAddRevenueStream}
              onUpdate={handleUpdateRevenueStream}
              onDelete={handleDeleteRevenueStream}
            />
          )}
        </TabsContent>

        <TabsContent value="costs" className="mt-0 border-none shadow-none">
          <CostStructure 
            costs={data.costStructure} 
            onUpdateCost={handleUpdateCost}
            onDeleteCost={handleDeleteCost}
          />
        </TabsContent>

        <TabsContent value="pricing" className="mt-0 border-none shadow-none">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Pricing Strategies</h2>
            <Button onClick={handleAddPricingStrategy} type="button">
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
                breakEvenRevenue: processedData.breakeven.revenue,
                data: processedData.breakeven.data
              }
            }}
          />
        </TabsContent>

        <TabsContent value="projections" className="mt-0 border-none shadow-none">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Financial Projections</h2>
            <Button onClick={handleAddProjection} type="button">
              <Plus className="h-4 w-4 mr-2" /> Add Projection
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Projections</CardTitle>
              <CardDescription>
                Revenue, costs, and profit over the next 12 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ProjectionChart data={processedData.projections.data} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
