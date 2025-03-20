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

// Import the useMarketAnalysis hook
import { useMarketAnalysis } from '@/hooks/features/useMarketAnalysis';
// Import the CompetitorPrice type
import { CompetitorPrice } from './common/EditableCompetitorPriceRow';
// Import the PricingStrategy type
import { PricingStrategy as IPricingStrategy } from './common/EditablePricingRow';
// Add import for ExtendedPricingStrategy
import { ExtendedPricingStrategy } from './common/PricingStrategyCard';

// Use more generic type definitions without specific database types
// Define or import the types for Cost and Revenue
interface Cost {
  id: string;
  name: string;
  amount: number;
  category: string;
  [key: string]: any;
}

interface Revenue {
  id: string;
  name: string;
  amount: number;
  category: string;
  [key: string]: any;
}

// Update the FinancialsData interface to use the correct PricingStrategy type
interface FinancialsData {
  costs: Cost[];
  revenue: Revenue[];
  pricingStrategies: IPricingStrategy[];
  marketAnalysis?: {
    competitors?: Array<{
      id: string;
      name?: string | null;
      price?: number | null;
      notes?: string | null;
      [key: string]: any;
    }>;
    // Add other marketAnalysis properties as needed
  };
}

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
  
  // Use market analysis hook here unconditionally with other hooks
  // This ensures it's always called in the same order
  const { 
    addCompetitor, 
    updateCompetitor, 
    deleteCompetitor 
  } = useMarketAnalysis(projectId);
  
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
  
  const handleAddPricingStrategy = async (strategyData: ExtendedPricingStrategy): Promise<void> => {
    try {
      // Transform UI model to database model
      const dbStrategy = {
        name: strategyData.name,
        description: strategyData.description,
        target_market: strategyData.target_market,
        // Ensure target_price_range is stored as a JSON string
        target_price_range: typeof strategyData.target_price_range === 'string'
          ? strategyData.target_price_range
          : JSON.stringify(strategyData.target_price_range),
        considerations: strategyData.considerations,
        project_id: projectId,
        strategy_type: strategyData.strategy_type
      };
      
      await addPricingStrategy(dbStrategy);
      
      toast({
        title: "Success",
        description: "Pricing strategy added successfully",
      });
      
      // Reload data if no refetch method exists
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error adding pricing strategy:", error);
      toast({
        title: "Error",
        description: "Failed to add pricing strategy.",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdatePricingStrategy = async (strategyData: ExtendedPricingStrategy): Promise<void> => {
    if (!strategyData || !strategyData.id) return;
    
    try {
      // Transform UI model to database model
      const updateData = {
        name: strategyData.name,
        description: strategyData.description,
        target_market: strategyData.target_market,
        // Ensure target_price_range is stored as a JSON string
        target_price_range: typeof strategyData.target_price_range === 'string'
          ? strategyData.target_price_range
          : JSON.stringify(strategyData.target_price_range),
        considerations: strategyData.considerations,
        strategy_type: strategyData.strategy_type
      };
      
      await updatePricingStrategy({
        id: strategyData.id,
        data: updateData
      });
      
      toast({
        title: "Success",
        description: "Pricing strategy updated successfully",
      });
      
      // Reload data if no refetch method exists
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error updating pricing strategy:", error);
      toast({
        title: "Error",
        description: "Failed to update pricing strategy.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePricingStrategy = async (id: string): Promise<void> => {
    if (!id) return;
    
    try {
      await deletePricingStrategy(id);
      
      toast({
        title: "Success",
        description: "Pricing strategy deleted successfully",
      });
      
      // Reload data if no refetch method exists
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error deleting pricing strategy:", error);
      toast({
        title: "Error",
        description: "Failed to delete pricing strategy.",
        variant: "destructive",
      });
    }
  };

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

  // Handlers for competitor prices
  const handleAddCompetitorPrice = async (competitorData: CompetitorPrice): Promise<void> => {
    try {
      // Only include properties that are expected by the API
      await addCompetitor({
        name: competitorData.competitor,
        price: String(competitorData.price), 
        notes: competitorData.notes,
        project_id: projectId
        // Remove properties that don't exist in the API schema
      });
      
      toast({
        title: "Success",
        description: "Competitor price added successfully",
      });
      
      // Reload data if no refetch method exists
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error adding competitor price:", error);
      toast({
        title: "Error",
        description: "Failed to add competitor price.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCompetitorPrice = async (competitorData: CompetitorPrice): Promise<void> => {
    if (!competitorData || !competitorData.id) return;
    
    try {
      // Map from the UI model to the market competitor model
      await updateCompetitor({
        id: competitorData.id,
        data: {
          name: competitorData.competitor,
          price: String(competitorData.price), // Convert to string if the API expects a string
          notes: competitorData.notes
        }
      });
      
      toast({
        title: "Success",
        description: "Competitor price updated successfully",
      });
    } catch (error) {
      console.error("Error updating competitor price:", error);
      toast({
        title: "Error",
        description: "Failed to update competitor price.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCompetitorPrice = async (id: string): Promise<void> => {
    if (!id) return;
    
    try {
      await deleteCompetitor(id);
      
      toast({
        title: "Success",
        description: "Competitor price deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting competitor price:", error);
      toast({
        title: "Error",
        description: "Failed to delete competitor price.",
        variant: "destructive",
      });
    }
  };

  // Restore the handleAddProjection function
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
    } catch (error) {
      toast({
        title: "Error adding projection",
        description: "Failed to create new projection.",
        variant: "destructive",
      });
    }
  }, [addProjection, projectId, toast]);

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
          </div>
          <PricingStrategy 
            data={{
              pricing: {
                strategies: data.pricingStrategies || [],
                competitorPrices: (data as any).marketAnalysis?.competitors?.map((comp: { 
                  id: string; 
                  name?: string | null; 
                  price?: number | null;
                  notes?: string | null;
                }) => ({
                  id: comp.id,
                  competitor: comp.name || '',
                  price: comp.price || 0,
                  notes: comp.notes || ''
                })) || []
              }
            }}
            onAddStrategy={handleAddPricingStrategy}
            onUpdateStrategy={handleUpdatePricingStrategy}
            onDeleteStrategy={handleDeletePricingStrategy}
            onUpdateCompetitor={handleUpdateCompetitorPrice}
            onDeleteCompetitor={handleDeleteCompetitorPrice}
            readOnly={false}
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
