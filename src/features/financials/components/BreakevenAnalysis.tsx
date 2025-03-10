import React, { memo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts'
import { formatCurrency } from '../utils/dataProcessing'
import { DollarSign } from 'lucide-react'
import { Input } from '@/components/ui/input'

export interface BreakevenData {
  unitSellingPrice: number;
  unitVariableCost: number;
  fixedCosts: number;
  contributionMargin: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
  data: Array<{
    units: number;
    revenue: number;
    costs: number;
  }>;
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
    breakEvenRevenue,
    data: data.data
  };
};

/**
 * BreakevenAnalysis component displays break-even analysis data
 * Memoized to prevent unnecessary re-renders
 */
const BreakevenAnalysis = memo(function BreakevenAnalysis({ data }: BreakevenAnalysisProps) {
  const { 
    unitSellingPrice, 
    unitVariableCost, 
    fixedCosts, 
    contributionMargin,
    breakEvenUnits,
    breakEvenRevenue
  } = data.breakeven;

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

  // Custom tooltip formatter to display currency values
  const formatTooltipValue = (value: number, name: string) => {
    return formatCurrency(value);
  };

  return (
    <div className="space-y-6">
      {/* Break-even Metrics */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Break-even Point</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(breakEvenUnits).toLocaleString()} units</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(breakEvenRevenue)} in revenue
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Contribution Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(contributionMargin)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per unit ({((contributionMargin / unitSellingPrice) * 100).toFixed(1)}% of price)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Fixed Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(fixedCosts)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total fixed costs to cover
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Break-even Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Break-even Analysis</CardTitle>
          <CardDescription>Revenue and costs by sales volume</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.breakeven.data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="units" 
                  label={{ 
                    value: 'Units Sold', 
                    position: 'insideBottomRight', 
                    offset: -10 
                  }} 
                />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                  label={{ 
                    value: 'Amount ($)', 
                    angle: -90, 
                    position: 'insideLeft' 
                  }} 
                />
                <Tooltip formatter={formatTooltipValue} />
                <Legend />
                <ReferenceLine
                  x={breakEvenUnits}
                  stroke="#ff7300"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Break-even',
                    position: 'top',
                    fill: '#ff7300',
                    fontSize: 12
                  }}
                />
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
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Break-even Details */}
      <Card>
        <CardHeader>
          <CardTitle>Break-even Details</CardTitle>
          <CardDescription>Key metrics and calculations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium">Unit Selling Price</h4>
                <p className="text-lg">{formatCurrency(unitSellingPrice)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Unit Variable Cost</h4>
                <p className="text-lg">{formatCurrency(unitVariableCost)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Contribution Margin</h4>
                <p className="text-lg">{formatCurrency(contributionMargin)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Contribution Margin Ratio</h4>
                <p className="text-lg">{((contributionMargin / unitSellingPrice) * 100).toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Break-even Calculation</h4>
              <p className="text-sm text-muted-foreground">
                Break-even Units = Fixed Costs ÷ Contribution Margin
              </p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(fixedCosts)} ÷ {formatCurrency(contributionMargin)} = {Math.round(breakEvenUnits).toLocaleString()} units
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default BreakevenAnalysis