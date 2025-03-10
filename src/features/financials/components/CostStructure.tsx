import React, { useState, useCallback, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table'
import { formatCurrency } from "../utils/dataProcessing";
import { FinancialCostStructure } from '@/store/types'
import { parseJsonbField } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid';
import { EditableCostRow, CostItem, defaultCostItem } from './common/EditableCostRow';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { AnimatePresence } from 'framer-motion';

// Interface for UI-friendly cost data structure
interface CostData {
  fixedCosts: CostItem[];
  variableCosts: CostItem[];
}

interface CostStructureProps {
  costs: CostData | FinancialCostStructure[];
  onUpdateCost?: (cost: CostItem) => Promise<void>;
  onDeleteCost?: (id: string) => Promise<void>;
  readOnly?: boolean;
}

// Define chart color scheme
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#8DD1E1",
];

const CostStructure: React.FC<CostStructureProps> = ({ 
  costs, 
  onUpdateCost,
  onDeleteCost,
  readOnly = false 
}) => {
  const { toast } = useToast();
  const [showNewFixedCostRow, setShowNewFixedCostRow] = useState(false);
  const [showNewVariableCostRow, setShowNewVariableCostRow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Determine if we're receiving the organized UI data or raw DB data
  const isCostData = useCallback((data: any): data is CostData => {
    return data.fixedCosts !== undefined && data.variableCosts !== undefined;
  }, []);
  
  // Convert DB model to UI model
  const convertToUIModel = useCallback((cost: FinancialCostStructure): CostItem => {
    return {
      id: cost.id,
      category: cost.category || '',
      description: cost.description || '',
      amount: cost.amount || 0,
      frequency: (cost.frequency as "monthly" | "quarterly" | "annually" | "one-time") || 'monthly',
      type: (cost.type as 'fixed' | 'variable') || 'fixed',
    };
  }, []);
  
  // Convert raw DB data to UI-friendly format if needed
  const costData = useMemo<CostData>(() => {
    if (isCostData(costs)) {
      return costs;
    } else {
      return {
        fixedCosts: (costs as FinancialCostStructure[])
          .filter((cost: FinancialCostStructure) => cost.type === 'fixed')
          .map(convertToUIModel),
        variableCosts: (costs as FinancialCostStructure[])
          .filter((cost: FinancialCostStructure) => 
            cost.type === 'variable' || cost.type === 'semi-variable')
          .map(convertToUIModel),
      };
    }
  }, [costs, convertToUIModel, isCostData]);
  
  // Destructure the costs
  const { fixedCosts, variableCosts } = costData;
  
  // Calculate totals for fixed and variable costs
  const totalFixedCosts = useMemo(() => 
    fixedCosts.reduce((sum, cost) => sum + (cost.amount || 0), 0),
  [fixedCosts]);
  
  const totalVariableCosts = useMemo(() => 
    variableCosts.reduce((sum, cost) => sum + (cost.amount || 0), 0),
  [variableCosts]);
  
  // Prepare data for the pie chart
  const pieData = useMemo(() => [
    { name: "Fixed Costs", value: totalFixedCosts },
    { name: "Variable Costs", value: totalVariableCosts },
  ], [totalFixedCosts, totalVariableCosts]);
  
  // Function to categorize and sum costs for the bar chart
  const categorizeAndSum = useCallback((costs: CostItem[]) => {
    const categoryMap = new Map<string, number>();
    
    costs.forEach(cost => {
      const category = cost.category || 'Other';
      const amount = cost.amount || 0;
      const currentAmount = categoryMap.get(category) || 0;
      categoryMap.set(category, currentAmount + amount);
    });
    
    return Array.from(categoryMap).map(([name, value]) => ({ name, value }));
  }, []);

  // Memoize category data to prevent recreation on each render
  const categoryData = useMemo(() => 
    categorizeAndSum([...fixedCosts, ...variableCosts]),
  [categorizeAndSum, fixedCosts, variableCosts]);
  
  // Handle adding a new cost
  const handleSaveCost = useCallback(async (cost: CostItem) => {
    if (!onUpdateCost) return;
    
    setIsSubmitting(true);
    try {
      // If it's a new cost, generate an ID
      if (!cost.id) {
        cost.id = uuidv4();
      }
      
      await onUpdateCost(cost);
      
      // Hide the new row form
      if (cost.type === 'fixed') {
        setShowNewFixedCostRow(false);
      } else {
        setShowNewVariableCostRow(false);
      }
      
      toast({
        title: 'Success',
        description: `Cost ${cost.id ? 'updated' : 'added'} successfully.`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${cost.id ? 'update' : 'add'} cost.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [onUpdateCost, toast]);
  
  // Handle deleting a cost
  const handleDeleteCostInternal = useCallback(async (cost: CostItem) => {
    if (!onDeleteCost) return;
    
    try {
      await onDeleteCost(cost.id);
      
      toast({
        title: 'Success',
        description: 'Cost deleted successfully.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete cost.',
        variant: 'destructive',
      });
    }
  }, [onDeleteCost, toast]);
  
  // Handlers for showing/hiding new cost rows
  const handleShowNewFixedCost = useCallback(() => {
    setShowNewFixedCostRow(true);
    setShowNewVariableCostRow(false);
  }, []);
  
  const handleShowNewVariableCost = useCallback(() => {
    setShowNewVariableCostRow(true);
    setShowNewFixedCostRow(false);
  }, []);
  
  const handleCancelNewFixedCost = useCallback(() => {
    setShowNewFixedCostRow(false);
  }, []);
  
  const handleCancelNewVariableCost = useCallback(() => {
    setShowNewVariableCostRow(false);
  }, []);
  
  return (
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
                  data={pieData}
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
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Legend />
                <Bar dataKey="value" name="Amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Fixed Costs Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
          <CardTitle>Fixed Costs</CardTitle>
          <CardDescription>
            Costs that remain constant regardless of production volume
          </CardDescription>
          </div>
          
          {!readOnly && onUpdateCost && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShowNewFixedCost}
              disabled={showNewFixedCostRow || isSubmitting}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Cost
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
              {fixedCosts.length > 0 ? (
                fixedCosts.map((cost) => (
                    <EditableCostRow
                      key={cost.id}
                      cost={cost}
                      onSave={handleSaveCost}
                      onDelete={handleDeleteCostInternal}
                      readOnly={readOnly || !onUpdateCost}
                    />
                  ))
                ) : !showNewFixedCostRow && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                    No fixed costs defined
                  </TableCell>
                </TableRow>
              )}
                
                {/* New cost row */}
                {showNewFixedCostRow && !readOnly && onUpdateCost && (
                  <EditableCostRow
                    cost={{...defaultCostItem, type: 'fixed'}}
                    isNewRow={true}
                    onSave={handleSaveCost}
                    onCancel={handleCancelNewFixedCost}
                    readOnly={readOnly || !onUpdateCost}
                  />
                )}
                
                {/* Add new cost row button */}
                {!showNewFixedCostRow && !readOnly && onUpdateCost && (
                  <EditableCostRow
                    cost={{...defaultCostItem, type: 'fixed'}}
                    isEmptyRow={true}
                    onSave={() => {
                      setShowNewFixedCostRow(true);
                      return Promise.resolve();
                    }}
                    readOnly={readOnly || !onUpdateCost}
                  />
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Variable Costs Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
          <CardTitle>Variable Costs</CardTitle>
          <CardDescription>
              Costs that change based on production volume
          </CardDescription>
          </div>
          
          {!readOnly && onUpdateCost && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShowNewVariableCost}
              disabled={showNewVariableCostRow || isSubmitting}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Cost
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
              {variableCosts.length > 0 ? (
                variableCosts.map((cost) => (
                    <EditableCostRow
                      key={cost.id}
                      cost={cost}
                      onSave={handleSaveCost}
                      onDelete={handleDeleteCostInternal}
                      readOnly={readOnly || !onUpdateCost}
                    />
                  ))
                ) : !showNewVariableCostRow && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                    No variable costs defined
                  </TableCell>
                </TableRow>
              )}
                
                {/* New cost row */}
                {showNewVariableCostRow && !readOnly && onUpdateCost && (
                  <EditableCostRow
                    cost={{...defaultCostItem, type: 'variable'}}
                    isNewRow={true}
                    onSave={handleSaveCost}
                    onCancel={handleCancelNewVariableCost}
                    readOnly={readOnly || !onUpdateCost}
                  />
                )}
                
                {/* Add new cost row button */}
                {!showNewVariableCostRow && !readOnly && onUpdateCost && (
                  <EditableCostRow
                    cost={{...defaultCostItem, type: 'variable'}}
                    isEmptyRow={true}
                    onSave={() => {
                      setShowNewVariableCostRow(true);
                      return Promise.resolve();
                    }}
                    readOnly={readOnly || !onUpdateCost}
                  />
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(CostStructure);