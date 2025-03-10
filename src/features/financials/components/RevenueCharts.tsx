import React, { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { FinancialRevenueStream } from '@/store/types';
import { formatCurrency } from '../utils/dataProcessing';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar
} from 'recharts';

interface RevenueChartsProps {
  streams: FinancialRevenueStream[];
  projectId: string;
  onAdd: (formData: any) => Promise<void>;
  onUpdate: (id: string, formData: any) => Promise<void>;
  onDelete: (id: string) => Promise<boolean>;
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

/**
 * RevenueCharts component displays revenue streams data in charts and tables
 * Memoized to prevent unnecessary re-renders
 */
const RevenueCharts = memo(function RevenueCharts({
  streams,
  projectId,
  onAdd,
  onUpdate,
  onDelete
}: RevenueChartsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Process data for charts
  const revenueData = streams.map(stream => ({
    name: stream.name,
    value: (stream.unit_price || 0) * (stream.volume || 0)
  }));

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.value, 0);

  // Handler functions
  const handleShowAddForm = useCallback(() => {
    setShowAddForm(true);
    setEditingId(null);
  }, []);

  const handleEdit = useCallback((id: string) => {
    setEditingId(id);
    setShowAddForm(false);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleCancelAdd = useCallback(() => {
    setShowAddForm(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Revenue Streams</h2>
        <Button onClick={handleShowAddForm} disabled={showAddForm}>
          <Plus className="h-4 w-4 mr-2" /> Add Revenue Stream
        </Button>
      </div>

      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Revenue Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
            <CardDescription>Breakdown by revenue stream</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Stream */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Stream</CardTitle>
            <CardDescription>Projected revenue per stream</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="value" fill="#8884d8">
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Streams Table */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Streams</CardTitle>
          <CardDescription>Manage your revenue sources</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Table implementation would go here */}
          <div className="text-center py-8 text-muted-foreground">
            {streams.length === 0 ? (
              <p>No revenue streams added yet. Click "Add Revenue Stream" to get started.</p>
            ) : (
              <p>Revenue streams table would be displayed here.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default RevenueCharts; 