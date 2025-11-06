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

interface CashFlowChartRealEstateProps {
  months?: string;
  height?: number;
}

export function CashFlowChartRealEstate({ months = '12', height = 300 }: CashFlowChartRealEstateProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['real-estate-cash-flow', months],
    queryFn: async () => {
      const response = await fetch(`/api/real-estate/investor/cash-flow?months=${months}`);
      if (!response.ok) throw new Error('Failed to fetch cash flow data');
      const result = await response.json();
      return result.cashFlowData || [];
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
    month: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    income: item.income || 0,
    expenses: item.expenses || 0,
    netCashFlow: item.netCashFlow || 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Cash Flow</CardTitle>
        <CardDescription>Income vs expenses over the last {months} months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month" 
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
                name === 'netCashFlow' ? 'Net Cash Flow' : name.charAt(0).toUpperCase() + name.slice(1)
              ]}
            />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name="Income" />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            <Line 
              type="monotone" 
              dataKey="netCashFlow" 
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

