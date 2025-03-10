import React, { memo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatCurrency } from '../utils/dataProcessing';

interface ProjectionChartProps {
  data: Array<{
    period: string;
    revenue: number;
    costs: number;
    profit: number;
  }>;
}

/**
 * ProjectionChart component displays financial projections in a line chart
 * Memoized to prevent unnecessary re-renders
 */
const ProjectionChart = memo(function ProjectionChart({ data }: ProjectionChartProps) {
  // Custom tooltip formatter to display currency values
  const formatTooltipValue = (value: number) => {
    return formatCurrency(value);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis tickFormatter={(value) => `$${value}`} />
        <Tooltip formatter={formatTooltipValue} />
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
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Profit"
        />
        <Legend />
      </LineChart>
    </ResponsiveContainer>
  );
});

export default ProjectionChart; 