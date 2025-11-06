/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useQuery } from '@tanstack/react-query';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

interface CashFlowChartProps {
  period?: string;
  height?: number;
}

export function CashFlowChart({ period = '30d', height = 300 }: CashFlowChartProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['cash-flow-chart', period],
    queryFn: async () => {
      const response = await fetch(`/api/analytics?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch cash flow data');
      const result = await response.json();
      
      // Calculate cash flow from revenue and expenses
      const revenue = result.data?.revenue?.timeSeries || [];
      const expenses = result.data?.expenses?.timeSeries || [];
      
      // Combine and calculate net cash flow
      const combined = revenue.map((rev: any, index: number) => {
        const exp = expenses[index] || { value: 0 };
        return {
          date: rev.date || rev.period || rev.month,
          revenue: Number(rev.value || rev.amount || 0),
          expenses: Number(exp.value || exp.amount || 0),
          cashFlow: Number(rev.value || rev.amount || 0) - Number(exp.value || exp.amount || 0),
        };
      });
      
      return combined;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[300px]">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No cash flow data available</p>
        </CardContent>
      </Card>
    );
  }

  // Format data for chart
  const chartData = data.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: item.revenue || 0,
    expenses: item.expenses || 0,
    cashFlow: item.cashFlow || 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Analysis</CardTitle>
        <CardDescription>Revenue vs expenses and net cash flow</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString()}`,
                name === 'cashFlow' ? 'Net Cash Flow' : name.charAt(0).toUpperCase() + name.slice(1)
              ]}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            <Line 
              type="monotone" 
              dataKey="cashFlow" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Net Cash Flow"
            />
            <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="2 2" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

