import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { PlusCircle, Table } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from './FinancialProjections'
import { TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

// Use the same interfaces as in FinancialProjections
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

type RevenueChartProps = {
  projectId: string;
  revenue: RevenueData;
}

export const RevenueCharts = ({ projectId, revenue }: RevenueChartProps) => {
  
  // Handle adding a revenue forecast
  const handleAddRevenueForecast = () => {
    if (!projectId) return;
    
    // todo: handle form 
  };
  
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    size="icon"
                    variant="ghost"
                    onClick={handleAddRevenueForecast}
                  >
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p> Add a new time period to your revenue forecast</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenue.forecasts}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <RechartsTooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                  <Bar dataKey="amount" fill="#8884d8" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => {}}
            >
              <Table className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Projections</CardTitle>
            <CardDescription>
              Monthly revenue forecasts and growth rates
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
                {revenue.forecasts.map((forecast) => (
                  <TableRow key={forecast.id}>
                    <TableCell>{forecast.period}</TableCell>
                    <TableCell>{formatCurrency(forecast.amount)}</TableCell>
                    <TableCell>
                      {forecast.growthRate ? (
                        <Badge
                          variant="outline"
                          className={
                            forecast.growthRate > 0
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : forecast.growthRate < 0
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }
                        >
                          {forecast.growthRate > 0 && "+"}
                          {forecast.growthRate}%
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Revenue Assumptions</CardTitle>
          <CardDescription>
            Key assumptions informing your revenue projections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenue.assumptions && revenue.assumptions.length > 0 ? (
              revenue.assumptions.map((assumption) => (
                <div
                  key={assumption.id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div>
                    <p className="font-medium">{assumption.description}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      assumption.impact > 0
                        ? "bg-green-50 text-green-700"
                        : assumption.impact < 0
                        ? "bg-red-50 text-red-700"
                        : "bg-gray-50 text-gray-700"
                    }
                  >
                    Impact: {assumption.impact > 0 && "+"}
                    {assumption.impact}%
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-center py-4">
                No assumptions defined yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueCharts