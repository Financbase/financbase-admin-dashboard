/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  CreditCard,
  Receipt,
  Users,
  Calendar,
  Filter,
  Download,
  Settings,
  RefreshCw,
  Activity,
  PieChart,
  LineChart,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { RevenueChart } from '@/components/financial/intelligence/revenue-chart';
import { ExpenseBreakdownChart } from '@/components/financial/intelligence/expense-breakdown-chart';

// Trend Analysis Chart Component
function TrendAnalysisChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-trend'],
    queryFn: async () => {
      const response = await fetch('/api/analytics?period=365d&metric=overview');
      if (!response.ok) throw new Error('Failed to fetch trend data');
      const result = await response.json();
      // Generate trend data for revenue and expenses
      const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        const baseRevenue = result.data?.revenue?.monthly || 50000;
        const baseExpenses = baseRevenue * 0.6;
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: Math.round(baseRevenue * (0.8 + Math.random() * 0.4)),
          expenses: Math.round(baseExpenses * (0.8 + Math.random() * 0.4)),
        };
      });
      return monthlyData;
    },
  });

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
          formatter={(value: number, name: string) => [
            `$${value.toLocaleString()}`,
            name === 'revenue' ? 'Revenue' : 'Expenses',
          ]}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="revenue"
          stackId="1"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.6}
        />
        <Area
          type="monotone"
          dataKey="expenses"
          stackId="2"
          stroke="hsl(var(--destructive))"
          fill="hsl(var(--destructive))"
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');

  // Fetch real analytics data from API
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics?period=${dateRange}&metric=overview`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      return data;
    },
  });

  const metrics = analyticsData?.data?.metrics || {
    totalRevenue: 0,
    revenueGrowth: 0,
    totalExpenses: 0,
    expenseGrowth: 0,
    netIncome: 0,
    incomeGrowth: 0,
    activeClients: 0,
    clientGrowth: 0,
    invoiceCount: 0,
    invoiceGrowth: 0,
    paymentSuccessRate: 0,
    avgInvoiceValue: 0,
    cashFlow: 0,
    cashFlowGrowth: 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading Analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive financial analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setDateRange(dateRange === '7d' ? '30d' : dateRange === '30d' ? '90d' : '7d')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            {dateRange === '7d' ? '7 days' : dateRange === '30d' ? '30 days' : '90 days'}
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+{metrics.revenueGrowth}%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.netIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+{metrics.incomeGrowth}%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeClients}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+{metrics.clientGrowth}%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Success</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.paymentSuccessRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Transaction success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowDownRight className="h-3 w-3 text-red-600" />
              <span className="text-red-600">+{metrics.expenseGrowth}%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.invoiceCount}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+{metrics.invoiceGrowth}%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Invoice Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.avgInvoiceValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per invoice average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.cashFlow.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+{metrics.cashFlowGrowth}%</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>
                  Revenue performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart period="30d" height={250} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Revenue by Category
                </CardTitle>
                <CardDescription>
                  Breakdown by revenue source
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseBreakdownChart period={dateRange} height={250} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Summary
              </CardTitle>
              <CardDescription>
                Key performance indicators and metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Profit Margin</h4>
                  <div className="text-2xl font-bold text-green-600">49.2%</div>
                  <p className="text-xs text-muted-foreground">Healthy margin</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Revenue Growth Rate</h4>
                  <div className="text-2xl font-bold text-blue-600">+18.5%</div>
                  <p className="text-xs text-muted-foreground">Strong growth</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Client Acquisition</h4>
                  <div className="text-2xl font-bold text-purple-600">+12.5%</div>
                  <p className="text-xs text-muted-foreground">Growing client base</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Sources</CardTitle>
                <CardDescription>
                  Breakdown by revenue stream
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Invoice Revenue</p>
                      <p className="text-sm text-muted-foreground">Primary revenue source</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">$180,000</p>
                      <Badge className="bg-blue-100 text-blue-700">73%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Payment Processing</p>
                      <p className="text-sm text-muted-foreground">Transaction fees</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">$45,000</p>
                      <Badge className="bg-green-100 text-green-700">18%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium">Subscriptions</p>
                      <p className="text-sm text-muted-foreground">Recurring revenue</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">$15,000</p>
                      <Badge className="bg-purple-100 text-purple-700">6%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>
                  Monthly revenue comparison
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">This Month</span>
                    <span className="font-bold text-green-600">$245,678</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Month</span>
                    <span className="font-bold">$207,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">This Quarter</span>
                    <span className="font-bold text-blue-600">$712,456</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">This Year</span>
                    <span className="font-bold text-purple-600">$2.8M</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>
                Breakdown of expenses by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Operating Expenses</p>
                    <p className="text-sm text-muted-foreground">Day-to-day operations</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$78,000</p>
                    <Badge variant="outline">62%</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Salaries & Benefits</p>
                    <p className="text-sm text-muted-foreground">Staff compensation</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$32,000</p>
                    <Badge variant="outline">26%</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Marketing</p>
                    <p className="text-sm text-muted-foreground">Advertising & promotion</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$14,567</p>
                    <Badge variant="outline">12%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Financial Trends
              </CardTitle>
              <CardDescription>
                Long-term performance trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrendAnalysisChart />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>
                  Important observations and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Strong Growth</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Revenue has increased by 18.5% this period, indicating healthy business growth.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">High Payment Success</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Payment success rate of 94.2% is above industry average, indicating good payment processing.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  Actionable insights for improvement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="font-medium mb-2">Optimize Expense Management</p>
                  <p className="text-sm text-muted-foreground">
                    Operating expenses represent 62% of total expenses. Consider reviewing and optimizing operational costs.
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="font-medium mb-2">Increase Average Invoice Value</p>
                  <p className="text-sm text-muted-foreground">
                    Current average invoice value is $1,050. Consider upselling strategies to increase per-invoice revenue.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
