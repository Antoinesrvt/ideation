import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table'
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Bar, Tooltip as RechartsTooltip } from 'recharts'
import { formatCurrency } from './FinancialProjections'
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

const PricingStrategy = ({ data }: PricingStrategyProps) => {
  // Transform data for the chart
  const chartData = [
    ...data.pricing.strategies.map((s) => ({
      name: s.name,
      price: getAveragePrice(s),
      type: "Your Strategies",
    })),
    ...data.pricing.competitorPrices.map((c) => ({
      name: c.competitor,
      price: c.price,
      type: "Competitors",
    })),
  ];

  return (
    <div className="grid grid-cols-1 gap-6">
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
          <CardDescription>
            Different pricing tiers for different markets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Strategy</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Target Market</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.pricing.strategies.map((strategy) => (
                <TableRow key={strategy.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{strategy.name}</div>
                      <div className="text-xs text-gray-500">
                        {strategy.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(getAveragePrice(strategy))}</TableCell>
                  <TableCell>{strategy.target_market || strategy.considerations || 'General'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              {data.pricing.competitorPrices.map((competitor) => (
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
};

export default PricingStrategy;