import React from 'react'
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
import { formatCurrency } from './FinancialProjections'
import { FinancialCostStructure } from '@/store/types'
import { parseJsonbField } from '@/lib/utils'

// Interface for UI-friendly cost data structure
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

interface CostStructureProps {
  costs: CostData | FinancialCostStructure[];
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

const CostStructure = ({ costs }: CostStructureProps) => {
  // Determine if we're receiving the organized UI data or raw DB data
  const isOrganizedData = Array.isArray(costs) ? false : true;
  
  // Organize costs into fixed and variable if needed
  const fixedCosts = isOrganizedData 
    ? (costs as CostData).fixedCosts
    : (costs as FinancialCostStructure[])
        .filter(cost => cost.type === 'fixed')
        .map(cost => ({
          id: cost.id,
          category: cost.category || 'other',
          description: cost.description || cost.name,
          amount: cost.amount || 0,
          frequency: (cost.frequency as "monthly" | "quarterly" | "annually" | "one-time") || 'monthly'
        }));
  
  const variableCosts = isOrganizedData 
    ? (costs as CostData).variableCosts 
    : (costs as FinancialCostStructure[])
        .filter(cost => cost.type === 'variable' || cost.type === 'semi-variable')
        .map(cost => ({
          id: cost.id,
          category: cost.category || 'other',
          description: cost.description || cost.name,
          amount: cost.amount || 0,
          frequency: (cost.frequency as "monthly" | "quarterly" | "annually" | "one-time") || 'monthly'
        }));

  // Calculate sums for the pie chart
  const totalFixed = fixedCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const totalVariable = variableCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const total = totalFixed + totalVariable;

  // Prepare data for the pie chart
  const pieData = [
    { name: "Fixed Costs", value: totalFixed },
    { name: "Variable Costs", value: totalVariable },
  ];

  // Group costs by category for the bar chart
  const categorizeAndSum = (costs: CostItem[]) => {
    const categoryMap = new Map<string, number>();
    
    costs.forEach(cost => {
      const category = cost.category || 'Other';
      const current = categoryMap.get(category) || 0;
      categoryMap.set(category, current + cost.amount);
    });
    
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  };

  const categoryData = categorizeAndSum([...fixedCosts, ...variableCosts]);

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
        <CardHeader>
          <CardTitle>Fixed Costs</CardTitle>
          <CardDescription>
            Costs that remain constant regardless of production volume
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
              {fixedCosts.length > 0 ? (
                fixedCosts.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell className="font-medium">{cost.category}</TableCell>
                    <TableCell>{cost.description}</TableCell>
                    <TableCell>{formatCurrency(cost.amount)}</TableCell>
                    <TableCell className="capitalize">{cost.frequency}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                    No fixed costs defined
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Variable Costs Table */}
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
                <TableHead>Frequency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variableCosts.length > 0 ? (
                variableCosts.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell className="font-medium">{cost.category}</TableCell>
                    <TableCell>{cost.description}</TableCell>
                    <TableCell>{formatCurrency(cost.amount)}</TableCell>
                    <TableCell className="capitalize">{cost.frequency}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                    No variable costs defined
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostStructure;