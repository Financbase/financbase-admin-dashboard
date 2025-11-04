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
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  Calendar, 
  Filter, 
  Download, 
  Settings,
  RefreshCw,
  Activity,
  Shield,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  LineChart
} from 'lucide-react';

export default function FinancialHealthPage() {
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
          <span>Loading Financial Health...</span>
        </div>
      </div>
    );
  }

  // Mock health data
  const healthScore = 82;
  const healthMetrics = {
    liquidity: { score: 85, status: 'excellent', trend: 'up' },
    profitability: { score: 78, status: 'good', trend: 'up' },
    efficiency: { score: 72, status: 'good', trend: 'up' },
    leverage: { score: 88, status: 'excellent', trend: 'stable' },
    growth: { score: 75, status: 'good', trend: 'up' }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Health</h1>
          </div>
          <p className="text-gray-600">
            Comprehensive financial health assessment and scoring
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

      {/* Overall Health Score */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-green-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Overall Health Score</h2>
                  <p className="text-sm text-gray-600">Based on comprehensive financial analysis</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className={`text-6xl font-bold ${getHealthScoreColor(healthScore)}`}>
                    {healthScore}
                  </span>
                  <span className="text-2xl text-gray-600">/100</span>
                </div>
                <Progress value={healthScore} className="mt-4 h-3" />
                <div className="flex items-center gap-2 mt-3">
                  <Badge className={getHealthStatusColor('excellent')}>
                    Excellent
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Your financial health is in excellent condition
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right space-y-4">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-lg font-semibold">Today</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">Trend</p>
                <div className="flex items-center gap-1 text-green-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="font-semibold">+5 points</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {Object.entries(healthMetrics).map(([key, metric]) => (
          <Card key={key}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600 capitalize">
                    {key === 'liquidity' ? 'Liquidity' :
                     key === 'profitability' ? 'Profitability' :
                     key === 'efficiency' ? 'Efficiency' :
                     key === 'leverage' ? 'Leverage' :
                     'Growth'}
                  </h3>
                  {metric.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : metric.trend === 'down' ? (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  ) : (
                    <Activity className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="text-3xl font-bold">{metric.score}</div>
                <Progress value={metric.score} className="h-2" />
                <Badge className={getHealthStatusColor(metric.status)}>
                  {metric.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Health Trend
                </CardTitle>
                <CardDescription>
                  Financial health over the last 12 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Health trend visualization</p>
                    <p className="text-sm text-gray-400">Chart integration coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Key Strengths
                </CardTitle>
                <CardDescription>
                  Areas where your business excels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Strong Liquidity</p>
                    <p className="text-sm text-green-700">
                      Excellent cash flow management with healthy reserves
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Low Leverage</p>
                    <p className="text-sm text-blue-700">
                      Minimal debt-to-equity ratio indicates strong financial stability
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-800">Growing Revenue</p>
                    <p className="text-sm text-purple-700">
                      Consistent revenue growth demonstrates strong market position
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Health Indicators
              </CardTitle>
              <CardDescription>
                Detailed breakdown of financial health components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Ratio</span>
                    <span className="font-bold text-green-600">2.4</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-muted-foreground">Healthy liquidity</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Debt-to-Equity</span>
                    <span className="font-bold text-green-600">0.3</span>
                  </div>
                  <Progress value={88} className="h-2" />
                  <p className="text-xs text-muted-foreground">Low leverage</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Profit Margin</span>
                    <span className="font-bold text-blue-600">49%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                  <p className="text-xs text-muted-foreground">Strong profitability</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Liquidity Metrics</CardTitle>
                <CardDescription>
                  Cash flow and working capital analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Current Ratio</p>
                    <p className="text-sm text-muted-foreground">Current assets / Current liabilities</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">2.4</p>
                    <Badge className="bg-green-100 text-green-700">Excellent</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Quick Ratio</p>
                    <p className="text-sm text-muted-foreground">Liquid assets / Current liabilities</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">1.8</p>
                    <Badge className="bg-green-100 text-green-700">Good</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Cash Flow</p>
                    <p className="text-sm text-muted-foreground">Monthly cash flow</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">$156K</p>
                    <Badge className="bg-green-100 text-green-700">Positive</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profitability Metrics</CardTitle>
                <CardDescription>
                  Revenue and profit analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Gross Margin</p>
                    <p className="text-sm text-muted-foreground">Gross profit / Revenue</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">62%</p>
                    <Badge className="bg-blue-100 text-blue-700">Good</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Net Profit Margin</p>
                    <p className="text-sm text-muted-foreground">Net profit / Revenue</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">49%</p>
                    <Badge className="bg-blue-100 text-blue-700">Good</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">ROI</p>
                    <p className="text-sm text-muted-foreground">Return on investment</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">18.5%</p>
                    <Badge className="bg-blue-100 text-blue-700">Strong</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risks Tab */}
        <TabsContent value="risks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Risk Assessment
              </CardTitle>
              <CardDescription>
                Potential financial risks and mitigation strategies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Moderate Risk: Expense Growth</span>
                </div>
                <p className="text-sm text-yellow-700 mb-2">
                  Operating expenses have increased by 8.2% this period. While revenue growth outpaces expense growth, monitor this trend closely.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">View Details</Button>
                  <Button size="sm">Create Action Plan</Button>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Low Risk: Liquidity</span>
                </div>
                <p className="text-sm text-green-700">
                  Strong liquidity position with healthy cash reserves. Current ratio of 2.4 indicates excellent short-term financial stability.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Wins
                </CardTitle>
                <CardDescription>
                  Immediate actions to improve financial health
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Optimize Expense Management</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Review and negotiate vendor contracts to reduce operating expenses by 5-10%.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Increase Invoice Value</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Implement upselling strategies to increase average invoice value by 15%.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Long-term Strategies
                </CardTitle>
                <CardDescription>
                  Strategic initiatives for sustained health
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Diversify Revenue Streams</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Explore new revenue opportunities to reduce dependency on single income source.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Build Emergency Reserve</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Aim to maintain 6 months of operating expenses in reserve for better financial security.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Health Score History</CardTitle>
              <CardDescription>
                Historical financial health trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Historical health score visualization</p>
                  <p className="text-sm text-gray-400">Chart integration coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
