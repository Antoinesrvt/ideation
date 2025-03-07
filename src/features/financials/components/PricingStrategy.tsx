import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table'
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Bar, Tooltip as RechartsTooltip } from 'recharts'
import { formatCurrency } from './FinancialProjections'

interface PricingStrategyProps {
  data: {
    pricing: {
      strategies: any[];
      competitorPrices: any[];
    };
  };
}

const PricingStrategy = ({ data }: PricingStrategyProps) => {
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

      {/* Pricing Chart */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Pricing Strategy Comparison</CardTitle>
          <CardDescription>
            Your pricing strategies vs competitor prices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  ...data.pricing.strategies.map((s) => ({
                    name: s.name,
                    price: s.pricePoint,
                    type: "Your Strategies",
                  })),
                  ...data.pricing.competitorPrices.map((c) => ({
                    name: c.competitor,
                    price: c.price,
                    type: "Competitors",
                  })),
                ]}
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
                  <TableCell>{formatCurrency(strategy.pricePoint)}</TableCell>
                  <TableCell>{strategy.targetMarket}</TableCell>
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
                  <TableCell>{competitor.competitor}</TableCell>
                  <TableCell>{formatCurrency(competitor.price)}</TableCell>
                  <TableCell>
                    <div className="text-sm">{competitor.notes}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default PricingStrategy