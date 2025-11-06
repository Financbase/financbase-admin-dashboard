/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatPercentage } from '@/lib/utils/real-estate-formatting';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  Users,
  BarChart3,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import { CashFlowChartRealEstate } from '@/components/financial/intelligence/cash-flow-chart-real-estate';

export default function InvestorAnalyticsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('12');

  // Fetch portfolio statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['portfolio-stats'],
    queryFn: async () => {
      const response = await fetch('/api/real-estate/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      return data.stats;
    },
  });

  // Fetch cash flow data
  const { data: cashFlowData, isLoading: cashFlowLoading } = useQuery({
    queryKey: ['cash-flow', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/real-estate/investor/cash-flow?months=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch cash flow');
      const data = await response.json();
      return data.cashFlowData;
    },
  });

  const stats = statsData || {
    totalProperties: 0,
    totalPortfolioValue: 0,
    totalInvested: 0,
    monthlyCashFlow: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    occupancyRate: 0,
    averageRoi: 0,
    activeProperties: 0,
    vacantProperties: 0,
    maintenanceProperties: 0,
    occupiedUnits: 0,
    totalUnits: 0,
  };

  const totalROI = stats.totalInvested > 0 
    ? ((stats.totalPortfolioValue - stats.totalInvested) / stats.totalInvested) * 100 
    : 0;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Analytics</h1>
          <p className="text-muted-foreground">Analyze performance, ROI, and occupancy across your portfolio.</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">Last 6 Months</SelectItem>
              <SelectItem value="12">Last 12 Months</SelectItem>
              <SelectItem value="24">Last 24 Months</SelectItem>
              <SelectItem value="36">Last 36 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => router.push('/real-estate/investor')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Portfolio Overview */}
      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalPortfolioValue)}</div>
              <p className="text-xs text-muted-foreground">
                Invested: {formatCurrency(stats.totalInvested)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Cash Flow</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.monthlyCashFlow)}
              </div>
              <p className="text-xs text-muted-foreground">
                Income: {formatCurrency(stats.monthlyIncome)} | Expenses: {formatCurrency(stats.monthlyExpenses)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(stats.occupancyRate)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.occupiedUnits} of {stats.totalUnits} units occupied
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(stats.averageRoi)}</div>
              <p className="text-xs text-muted-foreground">
                Total ROI: {formatPercentage(totalROI)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Property Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Property Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active</span>
                <Badge variant="default">{stats.activeProperties}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Vacant</span>
                <Badge variant="secondary">{stats.vacantProperties}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Maintenance</span>
                <Badge variant="outline">{stats.maintenanceProperties}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProperties}</div>
            <p className="text-sm text-muted-foreground mt-1">Properties in portfolio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cash Flow Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {cashFlowLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ) : cashFlowData && cashFlowData.length > 0 ? (
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {formatCurrency(cashFlowData[cashFlowData.length - 1]?.netCashFlow || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last month: {cashFlowData.length > 1 
                    ? formatCurrency(cashFlowData[cashFlowData.length - 2]?.netCashFlow || 0)
                    : 'N/A'}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No cash flow data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      <CashFlowChartRealEstate months={timeRange} height={400} />
    </div>
  );
}


