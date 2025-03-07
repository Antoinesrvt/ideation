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

interface CostStructureProps {
  costs: FinancialCostStructure[];
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

  const fixedCosts = costs.filter(cost => cost.type === 'fixed');
  const variableCosts = costs.filter(cost => cost.type === 'variable');

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
                  data={[
                    {
                      name: "Fixed Costs",
                      value: fixedCosts.reduce(
                        (sum, item) => sum + (item.amount ?? 0),
                        0
                      ),
                    },
                    {
                      name: "Variable Costs",
                      value:
                        variableCosts.reduce(
                          (sum, item) => sum + (item.amount ?? 0),
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
                  ...fixedCosts.map((c) => ({
                    category: c.category,
                    amount: c.amount,
                    type: "Fixed",
                  })),
                ]
                  .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))
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
              {fixedCosts.map((cost) => (
                <TableRow key={cost.id}>
                  <TableCell>{cost.category}</TableCell>
                  <TableCell>{cost.description}</TableCell>
                  <TableCell>{formatCurrency(cost.amount ?? 0)}</TableCell>
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
              {variableCosts.map((cost) => (
                <TableRow key={cost.id}>
                  <TableCell>{cost.category}</TableCell>
                  <TableCell>{cost.description}</TableCell>
                  <TableCell>{formatCurrency(cost.amount ?? 0)}</TableCell>
                  <TableCell>unit</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default CostStructure