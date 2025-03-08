import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { PlusCircle, Table as TableIcon } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import { FinancialRevenueStream } from '@/store/types'
import { formatCurrency } from './FinancialProjections'
import { TableHeader, TableBody, TableRow, TableCell, TableHead, Table } from '@/components/ui/table'
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
                  data={revenue.forecasts}
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
                {revenue.forecasts.map((forecast: any) => (
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
            {revenue.assumptions.map((assumption: any) => (
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
            <span className="font-medium">Pro Tip:</span> Regularly update your
            assumptions based on real market data to improve forecast accuracy.
          </div>
        </CardFooter>
      </Card>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => {}}
        >
          <TableIcon className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </div>
  );
}

export default RevenueCharts