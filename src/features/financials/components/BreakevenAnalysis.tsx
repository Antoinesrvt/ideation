import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Legend, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts'
import { formatCurrency } from './FinancialProjections'
import { DollarSign } from 'lucide-react'
import { Input } from '@/components/ui/input'

export interface BreakevenData {
  unitSellingPrice: number;
  unitVariableCost: number;
  fixedCosts: number;
  contributionMargin: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
}


interface BreakevenAnalysisProps {
  data: {
    breakeven: BreakevenData;
  };
}

  // Calculate breakeven data based on the inputs
  const calculateBreakeven = (data: BreakevenData): BreakevenData => {
    const { unitSellingPrice, unitVariableCost, fixedCosts } = data;
    const contributionMarginValue = unitSellingPrice - unitVariableCost;
    
    // Calculate breakeven units and revenue
    const breakEvenUnits = contributionMarginValue > 0 ? fixedCosts / contributionMarginValue : 0;
    const breakEvenRevenue = breakEvenUnits * unitSellingPrice;
    
    // Return updated breakeven data with all required fields
    return {
      unitSellingPrice,
      unitVariableCost,
      fixedCosts,
      contributionMargin: unitSellingPrice > 0 
        ? (contributionMarginValue / unitSellingPrice) * 100 
        : 0,
      breakEvenUnits,
      breakEvenRevenue
    };
  };

const BreakevenAnalysis = ({ data }: BreakevenAnalysisProps) => {

    const handleUpdateBreakeven = (
      field: keyof any,
      value: number
    ) => {
      const updatedBreakeven = {
        ...data.breakeven,
        [field]: value,
      };
      
      // Recalculate breakeven values
      const calculatedBreakeven = calculateBreakeven(updatedBreakeven);

      // Update the breakeven data
      // updateBreakeven(calculatedBreakeven);
    };
  

  return (
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
              <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="units"
                  domain={[
                    0,
                    data.breakeven.breakEvenUnits
                      ? data.breakeven.breakEvenUnits * 2
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
                      units: data.breakeven.breakEvenUnits
                        ? data.breakeven.breakEvenUnits * 2
                        : 500,
                      value:
                        (data.breakeven.breakEvenUnits
                          ? data.breakeven.breakEvenUnits * 2
                          : 500) * data.breakeven.unitSellingPrice,
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
                    { units: 0, value: data.breakeven.fixedCosts },
                    {
                      units: data.breakeven.breakEvenUnits
                        ? data.breakeven.breakEvenUnits * 2
                        : 500,
                      value:
                        data.breakeven.fixedCosts +
                        (data.breakeven.breakEvenUnits
                          ? data.breakeven.breakEvenUnits * 2
                          : 500) *
                          data.breakeven.unitVariableCost,
                    },
                  ]}
                  type="linear"
                  dataKey="value"
                  stroke="#FF8042"
                  strokeWidth={2}
                  dot={false}
                />
                {data.breakeven.breakEvenUnits && (
                  <Line
                    name="Break-even Point"
                    data={[
                      {
                        units: data.breakeven.breakEvenUnits,
                        value: 0,
                      },
                      {
                        units: data.breakeven.breakEvenUnits,
                        value: data.breakeven.breakEvenRevenue,
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
            <label className="text-sm font-medium">Unit Selling Price</label>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
              <Input
                type="number"
                value={data.breakeven.unitSellingPrice}
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
            <label className="text-sm font-medium">Unit Variable Cost</label>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
              <Input
                type="number"
                value={data.breakeven.unitVariableCost}
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
                value={data.breakeven.fixedCosts}
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
                {formatCurrency(data.breakeven.contributionMargin || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Break-even Units:</span>
              <span className="font-medium">
                {Math.ceil(data.breakeven.breakEvenUnits || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Break-even Revenue:</span>
              <span className="font-medium">
                {formatCurrency(data.breakeven.breakEvenRevenue || 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BreakevenAnalysis