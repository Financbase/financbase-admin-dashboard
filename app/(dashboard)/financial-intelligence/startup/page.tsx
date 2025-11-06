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
  Rocket, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Users, 
  Target,
  Calendar, 
  Filter, 
  Download, 
  Settings,
  RefreshCw,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  Brain,
  PieChart,
  LineChart,
  Flame
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

// Revenue Growth Chart Component
function RevenueGrowthChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['startup-revenue-growth'],
    queryFn: async () => {
      const response = await fetch('/api/analytics?period=365d&metric=revenue');
      if (!response.ok) throw new Error('Failed to fetch revenue data');
      const result = await response.json();
      // Generate monthly data points from the response
      const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        const baseValue = result.data?.revenue?.monthly || 0;
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: Math.round(baseValue * (0.7 + Math.random() * 0.6)),
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
        No revenue data available
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
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Growth Trend Chart Component
function GrowthTrendChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['startup-growth-trend'],
    queryFn: async () => {
      const response = await fetch('/api/analytics?period=365d&metric=overview');
      if (!response.ok) throw new Error('Failed to fetch growth data');
      const result = await response.json();
      // Generate growth trend data
      const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        const baseGrowth = result.data?.overview?.growth || 0;
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          growth: baseGrowth + (Math.random() - 0.5) * 10,
        };
      });
      return monthlyData;
    },
  });

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center mb-6">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center mb-6 text-muted-foreground">
        No growth data available
      </div>
    );
  }

  return (
    <div className="mb-6">
      <ResponsiveContainer width="100%" height={256}>
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Growth Rate']}
          />
          <Line
            type="monotone"
            dataKey="growth"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function StartupIntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading Startup Intelligence...</span>
        </div>
      </div>
    );
  }

  // Mock startup-specific data
  const startupMetrics = {
    burnRate: 12500,
    runway: 18,
    mrr: 45000,
    arr: 540000,
    cac: 125,
    ltv: 2850,
    ltvCacRatio: 22.8,
    churnRate: 3.2,
    growthRate: 28.5,
    fundingStage: "Seed",
    totalFunding: 250000
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Startup Intelligence</h1>
          </div>
          <p className="text-gray-600">
            Startup-specific financial metrics, runway analysis, and growth intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Critical Startup Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Burn Rate</p>
                <p className="text-2xl font-bold text-red-600">${startupMetrics.burnRate.toLocaleString()}</p>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <Flame className="h-3 w-3 mr-1" />
                  Monthly cash outflow
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Flame className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Runway</p>
                <p className="text-2xl font-bold text-orange-600">{startupMetrics.runway} months</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Healthy runway
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</p>
                <p className="text-2xl font-bold text-green-600">${startupMetrics.mrr.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +{startupMetrics.growthRate}% MoM
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">LTV:CAC Ratio</p>
                <p className="text-2xl font-bold text-blue-600">{startupMetrics.ltvCacRatio.toFixed(1)}:1</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Excellent ratio
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Annual Recurring Revenue</p>
                <p className="text-2xl font-bold">${startupMetrics.arr.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">Projected ARR</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Acquisition Cost</p>
                <p className="text-2xl font-bold">${startupMetrics.cac}</p>
                <p className="text-sm text-muted-foreground mt-1">Per customer</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lifetime Value</p>
                <p className="text-2xl font-bold">${startupMetrics.ltv.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">Per customer</p>
              </div>
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                <p className="text-2xl font-bold text-red-600">{startupMetrics.churnRate}%</p>
                <p className="text-sm text-muted-foreground mt-1">Monthly churn</p>
              </div>
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="runway">Runway</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="unit-economics">Unit Economics</TabsTrigger>
          <TabsTrigger value="funding">Funding</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Revenue Growth
                </CardTitle>
                <CardDescription>
                  Monthly recurring revenue trend
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueGrowthChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Revenue Breakdown
                </CardTitle>
                <CardDescription>
                  Revenue by source
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Subscriptions</span>
                    </div>
                    <span className="text-sm font-bold">$38K (84%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">One-time Sales</span>
                    </div>
                    <span className="text-sm font-bold">$5K (11%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium">Services</span>
                    </div>
                    <span className="text-sm font-bold">$2K (5%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Key Performance Indicators
              </CardTitle>
              <CardDescription>
                Critical startup metrics and benchmarks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Growth Rate</span>
                    <Badge className="bg-green-100 text-green-700">
                      {startupMetrics.growthRate}% MoM
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Strong monthly growth rate indicates healthy expansion
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">LTV:CAC</span>
                    <Badge className="bg-green-100 text-green-700">
                      {startupMetrics.ltvCacRatio.toFixed(1)}:1
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Excellent ratio (target: 3:1) indicates efficient customer acquisition
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Churn Rate</span>
                    <Badge className="bg-yellow-100 text-yellow-700">
                      {startupMetrics.churnRate}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Monthly churn rate (target: &lt;5% for SaaS)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Runway Tab */}
        <TabsContent value="runway" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Runway Analysis
              </CardTitle>
              <CardDescription>
                Cash runway and burn rate projections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Current Runway</p>
                  <p className="text-3xl font-bold text-green-600">{startupMetrics.runway} months</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Based on current burn rate
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Monthly Burn</p>
                  <p className="text-3xl font-bold text-red-600">${startupMetrics.burnRate.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Current monthly cash outflow
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Cash Balance</p>
                  <p className="text-3xl font-bold text-blue-600">$225,000</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Current available cash
                  </p>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Runway Recommendation</span>
                </div>
                <p className="text-sm text-yellow-700">
                  With {startupMetrics.runway} months of runway, consider starting fundraising activities 6-9 months before runway expiration to ensure adequate time for closing.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Growth Tab */}
        <TabsContent value="growth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Growth Metrics
              </CardTitle>
              <CardDescription>
                Growth rate analysis and projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GrowthTrendChart />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Monthly Growth Rate</p>
                  <p className="text-2xl font-bold text-green-600">{startupMetrics.growthRate}%</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Month-over-month revenue growth
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Projected ARR</p>
                  <p className="text-2xl font-bold text-blue-600">${startupMetrics.arr.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Annual recurring revenue projection
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Unit Economics Tab */}
        <TabsContent value="unit-economics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Economics</CardTitle>
                <CardDescription>
                  Customer acquisition and lifetime value
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Customer Acquisition Cost (CAC)</p>
                    <p className="text-sm text-muted-foreground">Cost to acquire one customer</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">${startupMetrics.cac}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Lifetime Value (LTV)</p>
                    <p className="text-sm text-muted-foreground">Total revenue per customer</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${startupMetrics.ltv.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border-2 border-green-200 rounded-lg bg-green-50">
                  <div>
                    <p className="font-medium">LTV:CAC Ratio</p>
                    <p className="text-sm text-muted-foreground">Customer value efficiency</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{startupMetrics.ltvCacRatio.toFixed(1)}:1</p>
                    <Badge className="bg-green-100 text-green-700 mt-1">Excellent</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Churn Analysis</CardTitle>
                <CardDescription>
                  Customer retention metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Monthly Churn Rate</p>
                    <p className="text-sm text-muted-foreground">Customer churn percentage</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{startupMetrics.churnRate}%</p>
                    <Badge className="bg-yellow-100 text-yellow-700 mt-1">Acceptable</Badge>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <Zap className="h-4 w-4 inline mr-1" />
                    Industry benchmark for SaaS: 3-5% monthly churn. Your rate is within acceptable range.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Funding Tab */}
        <TabsContent value="funding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Funding Status
              </CardTitle>
              <CardDescription>
                Current funding stage and financial position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Funding Stage</p>
                  <p className="text-2xl font-bold">{startupMetrics.fundingStage}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Current investment stage
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Total Funding</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${startupMetrics.totalFunding.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Total capital raised
                  </p>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800">AI Funding Recommendation</span>
                </div>
                <p className="text-sm text-purple-700">
                  Based on your current metrics and growth trajectory, consider Series A fundraising in 6-9 months. Your strong LTV:CAC ratio and growth rate position you well for the next funding round.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

