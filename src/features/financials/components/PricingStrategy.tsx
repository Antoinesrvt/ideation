import React, { memo } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table'
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Bar, Tooltip as RechartsTooltip } from 'recharts'
import { formatCurrency } from '../utils/dataProcessing'
import { FinancialPricingStrategy } from '@/store/types'
import { parseJsonbField } from '@/lib/utils'

// Interface for competitor price data
interface CompetitorPrice {
  id: string;
  competitor: string;
  price: number;
  notes: string;
}

interface PricingStrategyProps {
  data: {
    pricing: {
      strategies: FinancialPricingStrategy[];
      competitorPrices: CompetitorPrice[];
    };
  };
}

// Helper to get price from target_price_range
function getAveragePrice(strategy: FinancialPricingStrategy): number {
  const priceRange = parseJsonbField<{min: number, max: number}>(
    strategy.target_price_range, 
    {min: 0, max: 0}
  );
  return (priceRange.min + priceRange.max) / 2;
}

/**
 * PricingStrategy component displays pricing strategies
 * Memoized to prevent unnecessary re-renders
 */
const PricingStrategy = memo(function PricingStrategy({ data }: PricingStrategyProps) {
  const { strategies, competitorPrices } = data.pricing;

  // Transform data for the chart
  const chartData = [
    ...strategies.map((s) => ({
      name: s.name,
      price: getAveragePrice(s),
      type: "Your Strategies",
    })),
    ...competitorPrices.map((c) => ({
      name: c.competitor,
      price: c.price,
      type: "Competitors",
    })),
  ];

  return (
    <div className="space-y-6">
      <Alert
        variant="default"
        className="bg-blue-50 text-blue-800 border-blue-200"
      >
        <Info className="h-4 w-4" />
        <AlertTitle>Pricing Strategy Considerations</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside text-sm mt-2 space-y-1">
            <li>
              <strong>Cost-Plus Pricing:</strong> Add a markup to your costs
            </li>
            <li>
              <strong>Value-Based Pricing:</strong> Price based on perceived
              customer value
            </li>
            <li>
              <strong>Competitive Pricing:</strong> Set prices relative to
              competitors
            </li>
            <li>
              <strong>Penetration Pricing:</strong> Lower initial price to gain
              market share
            </li>
            <li>
              <strong>Premium Pricing:</strong> Higher price to signal quality
              or exclusivity
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Price Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Price Comparison</CardTitle>
          <CardDescription>Your pricing vs. competitor pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Legend />
                <Bar dataKey="price" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Strategies */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Strategies</CardTitle>
          <CardDescription>Define your pricing models and strategies</CardDescription>
        </CardHeader>
        <CardContent>
          {strategies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No pricing strategies added yet. Click "Add Strategy" to get started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {strategies.map((strategy) => (
                <div key={strategy.id} className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">{strategy.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Target Market</p>
                      <p>{strategy.target_market || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Strategy Type</p>
                      <p className="capitalize">{strategy.strategy_type || 'Not specified'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p>{strategy.description || 'No description provided.'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Pricing Considerations */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Considerations</CardTitle>
          <CardDescription>Factors to consider when setting prices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-medium mb-2">Value-Based Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Set prices based on the perceived value to customers rather than costs.
                Consider what customers are willing to pay for the benefits your product provides.
              </p>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">Competitive Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Set prices based on what competitors are charging. This works well in markets
                with similar products and price-sensitive customers.
              </p>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">Cost-Plus Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Calculate your costs and add a markup percentage. Simple but may not reflect
                market conditions or customer value perception.
              </p>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">Penetration Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Start with a low price to gain market share quickly, then potentially
                increase prices once established.
              </p>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">Premium Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Set prices higher than competitors to create a perception of higher quality
                or exclusivity.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitor Prices */}
      <Card>
        <CardHeader>
          <CardTitle>Competitor Prices</CardTitle>
          <CardDescription>
            Market benchmark for your pricing strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competitor</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitorPrices.map((competitor) => (
                <TableRow key={competitor.id}>
                  <TableCell className="font-medium">
                    {competitor.competitor}
                  </TableCell>
                  <TableCell>{formatCurrency(competitor.price)}</TableCell>
                  <TableCell>{competitor.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
});

export default PricingStrategy;