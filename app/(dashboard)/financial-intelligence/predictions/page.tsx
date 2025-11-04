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
  Brain, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  BarChart3, 
  Calendar, 
  Filter, 
  Download, 
  Settings,
  RefreshCw,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  LineChart,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function PredictionsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('revenue');
  const [timeframe, setTimeframe] = useState('6m');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading Predictions...</span>
        </div>
      </div>
    );
  }

  // Mock prediction data
  const revenuePredictions = {
    nextMonth: { value: 285000, confidence: 92, change: 15.8 },
    nextQuarter: { value: 875000, confidence: 88, change: 18.2 },
    nextYear: { value: 3450000, confidence: 85, change: 20.5 }
  };

  const expensePredictions = {
    nextMonth: { value: 132000, confidence: 90, change: 6.2 },
    nextQuarter: { value: 398000, confidence: 87, change: 7.8 },
    nextYear: { value: 1580000, confidence: 82, change: 8.5 }
  };

  const cashFlowPredictions = {
    nextMonth: { value: 153000, confidence: 91, change: 22.3 },
    nextQuarter: { value: 477000, confidence: 89, change: 25.1 },
    nextYear: { value: 1870000, confidence: 86, change: 28.7 }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 80) return 'text-blue-600 bg-blue-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AI Predictions</h1>
          </div>
          <p className="text-gray-600">
            AI-powered financial forecasts and predictive analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            {timeframe === '3m' ? '3 months' : timeframe === '6m' ? '6 months' : '12 months'}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Prediction Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Forecast</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${revenuePredictions.nextYear.value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Predicted annual revenue
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Badge className={getConfidenceColor(revenuePredictions.nextYear.confidence)}>
                {revenuePredictions.nextYear.confidence}% confidence
              </Badge>
              <span className="text-xs text-green-600 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +{revenuePredictions.nextYear.change}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense Forecast</CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${expensePredictions.nextYear.value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Predicted annual expenses
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Badge className={getConfidenceColor(expensePredictions.nextYear.confidence)}>
                {expensePredictions.nextYear.confidence}% confidence
              </Badge>
              <span className="text-xs text-blue-600 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +{expensePredictions.nextYear.change}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Flow Forecast</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${cashFlowPredictions.nextYear.value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Predicted annual cash flow
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Badge className={getConfidenceColor(cashFlowPredictions.nextYear.confidence)}>
                {cashFlowPredictions.nextYear.confidence}% confidence
              </Badge>
              <span className="text-xs text-purple-600 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +{cashFlowPredictions.nextYear.change}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Revenue Forecast
              </CardTitle>
              <CardDescription>
                AI-powered revenue predictions based on historical trends and market analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg mb-6">
                <div className="text-center">
                  <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Revenue forecast visualization</p>
                  <p className="text-sm text-gray-400">Chart integration coming soon</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Next Month</span>
                    <Badge className={getConfidenceColor(revenuePredictions.nextMonth.confidence)}>
                      {revenuePredictions.nextMonth.confidence}%
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ${revenuePredictions.nextMonth.value.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+{revenuePredictions.nextMonth.change}%</span>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Next Quarter</span>
                    <Badge className={getConfidenceColor(revenuePredictions.nextQuarter.confidence)}>
                      {revenuePredictions.nextQuarter.confidence}%
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${revenuePredictions.nextQuarter.value.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-blue-600">+{revenuePredictions.nextQuarter.change}%</span>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Next Year</span>
                    <Badge className={getConfidenceColor(revenuePredictions.nextYear.confidence)}>
                      {revenuePredictions.nextYear.confidence}%
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${revenuePredictions.nextYear.value.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-3 w-3 text-purple-600" />
                    <span className="text-xs text-purple-600">+{revenuePredictions.nextYear.change}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Drivers</CardTitle>
              <CardDescription>
                Key factors influencing revenue predictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Strong Historical Growth</p>
                  <p className="text-sm text-green-700">
                    18.5% average monthly growth rate over the past 12 months supports continued growth trajectory.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Client Retention</p>
                  <p className="text-sm text-blue-700">
                    High client retention rate (94.2%) indicates stable recurring revenue base.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-800">Market Conditions</p>
                  <p className="text-sm text-purple-700">
                    Favorable market trends in your industry suggest continued growth opportunities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Expense Forecast
              </CardTitle>
              <CardDescription>
                Predicted expense trends and cost projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg mb-6">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Expense forecast visualization</p>
                  <p className="text-sm text-gray-400">Chart integration coming soon</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Next Month</span>
                    <Badge className={getConfidenceColor(expensePredictions.nextMonth.confidence)}>
                      {expensePredictions.nextMonth.confidence}%
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${expensePredictions.nextMonth.value.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-blue-600">+{expensePredictions.nextMonth.change}%</span>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Next Quarter</span>
                    <Badge className={getConfidenceColor(expensePredictions.nextQuarter.confidence)}>
                      {expensePredictions.nextQuarter.confidence}%
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${expensePredictions.nextQuarter.value.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-blue-600">+{expensePredictions.nextQuarter.change}%</span>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Next Year</span>
                    <Badge className={getConfidenceColor(expensePredictions.nextYear.confidence)}>
                      {expensePredictions.nextYear.confidence}%
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${expensePredictions.nextYear.value.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-blue-600">+{expensePredictions.nextYear.change}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow Tab */}
        <TabsContent value="cashflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Cash Flow Forecast
              </CardTitle>
              <CardDescription>
                Predicted cash flow trends and liquidity projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg mb-6">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Cash flow forecast visualization</p>
                  <p className="text-sm text-gray-400">Chart integration coming soon</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Next Month</span>
                    <Badge className={getConfidenceColor(cashFlowPredictions.nextMonth.confidence)}>
                      {cashFlowPredictions.nextMonth.confidence}%
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${cashFlowPredictions.nextMonth.value.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-3 w-3 text-purple-600" />
                    <span className="text-xs text-purple-600">+{cashFlowPredictions.nextMonth.change}%</span>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Next Quarter</span>
                    <Badge className={getConfidenceColor(cashFlowPredictions.nextQuarter.confidence)}>
                      {cashFlowPredictions.nextQuarter.confidence}%
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${cashFlowPredictions.nextQuarter.value.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-3 w-3 text-purple-600" />
                    <span className="text-xs text-purple-600">+{cashFlowPredictions.nextQuarter.change}%</span>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Next Year</span>
                    <Badge className={getConfidenceColor(cashFlowPredictions.nextYear.confidence)}>
                      {cashFlowPredictions.nextYear.confidence}%
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${cashFlowPredictions.nextYear.value.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-3 w-3 text-purple-600" />
                    <span className="text-xs text-purple-600">+{cashFlowPredictions.nextYear.change}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Model Insights
              </CardTitle>
              <CardDescription>
                Machine learning model analysis and confidence factors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Model Accuracy</span>
                </div>
                <p className="text-sm text-blue-700">
                  Revenue prediction model has 92% accuracy based on historical data validation. Model uses time-series analysis with seasonal adjustments.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Confidence Factors</span>
                </div>
                <p className="text-sm text-green-700">
                  High confidence (85-92%) due to consistent historical patterns, strong data quality, and stable market conditions.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800">Risk Considerations</span>
                </div>
                <p className="text-sm text-purple-700">
                  Predictions assume continuation of current trends. External factors like economic changes or market disruptions could impact accuracy.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
