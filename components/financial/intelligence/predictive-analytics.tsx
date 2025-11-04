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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart, 
  PieChart,
  Target,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Settings,
  Download,
  Calendar,
  Filter,
  Eye,
  Calculator,
  Brain,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Clock,
  Zap,
  Lightbulb,
  Shield,
  Star,
  Award,
  Users,
  Building2,
  ShoppingBag,
  CreditCard,
  FileText,
  Megaphone,
  Workflow,
  Home,
  User,
  Store,
  Briefcase,
  Search,
  LayoutDashboard,
  Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ForecastData {
  id: string;
  metric: string;
  currentValue: number;
  forecastValues: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  };
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
  confidence: number;
  factors: string[];
  timeframe: string;
  trend: 'up' | 'down' | 'stable';
  accuracy?: number;
}

interface ScenarioAnalysis {
  id: string;
  name: string;
  description: string;
  assumptions: string[];
  outcomes: {
    revenue: number;
    expenses: number;
    profit: number;
    cashflow: number;
    marketShare: number;
  };
  probability: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: string;
  roi?: number;
}

interface PredictiveModel {
  id: string;
  name: string;
  type: 'revenue' | 'expense' | 'cashflow' | 'market' | 'customer';
  accuracy: number;
  lastTrained: string;
  status: 'active' | 'training' | 'error';
  performance: {
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
    r2: number;   // R-squared
  };
  features: string[];
}

interface PredictiveAnalyticsProps {
  className?: string;
  userId?: string;
}

export function PredictiveAnalytics({ className, userId }: PredictiveAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forecasts, setForecasts] = useState<ForecastData[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioAnalysis[]>([]);
  const [models, setModels] = useState<PredictiveModel[]>([]);
  const [activeTab, setActiveTab] = useState('forecasts');

  // Sample forecast data
  const sampleForecasts: ForecastData[] = [
    {
      id: '1',
      metric: 'Monthly Revenue',
      currentValue: 125000,
      forecastValues: {
        nextMonth: 132000,
        nextQuarter: 145000,
        nextYear: 180000
      },
      scenarios: {
        optimistic: 155000,
        realistic: 145000,
        pessimistic: 125000
      },
      confidence: 89,
      factors: ['Client growth', 'Pricing optimization', 'Market expansion', 'Seasonal trends'],
      timeframe: 'Q2-Q4 2024',
      trend: 'up',
      accuracy: 92
    },
    {
      id: '2',
      metric: 'Operating Expenses',
      currentValue: 85000,
      forecastValues: {
        nextMonth: 82000,
        nextQuarter: 88000,
        nextYear: 95000
      },
      scenarios: {
        optimistic: 80000,
        realistic: 88000,
        pessimistic: 95000
      },
      confidence: 85,
      factors: ['Inflation impact', 'Efficiency improvements', 'Growth investments', 'Vendor costs'],
      timeframe: 'Q2-Q4 2024',
      trend: 'up',
      accuracy: 88
    },
    {
      id: '3',
      metric: 'Customer Acquisition Cost',
      currentValue: 150,
      forecastValues: {
        nextMonth: 145,
        nextQuarter: 135,
        nextYear: 120
      },
      scenarios: {
        optimistic: 120,
        realistic: 135,
        pessimistic: 150
      },
      confidence: 78,
      factors: ['Marketing efficiency', 'Channel optimization', 'Competition', 'Market saturation'],
      timeframe: 'Q2-Q4 2024',
      trend: 'down',
      accuracy: 85
    },
    {
      id: '4',
      metric: 'Cash Flow',
      currentValue: 40000,
      forecastValues: {
        nextMonth: 45000,
        nextQuarter: 55000,
        nextYear: 75000
      },
      scenarios: {
        optimistic: 65000,
        realistic: 55000,
        pessimistic: 35000
      },
      confidence: 82,
      factors: ['Payment terms', 'Collection efficiency', 'Expense timing', 'Revenue growth'],
      timeframe: 'Q2-Q4 2024',
      trend: 'up',
      accuracy: 87
    }
  ];

  const sampleScenarios: ScenarioAnalysis[] = [
    {
      id: '1',
      name: 'Aggressive Growth Strategy',
      description: 'Invest heavily in marketing and sales to capture market share rapidly',
      assumptions: [
        '20% increase in marketing spend',
        'New sales team hire (3 people)',
        'Product expansion into 2 new markets',
        'Partnership with 3 major clients'
      ],
      outcomes: {
        revenue: 180000,
        expenses: 120000,
        profit: 60000,
        cashflow: 45000,
        marketShare: 3.2
      },
      probability: 0.6,
      riskLevel: 'high',
      timeframe: '6 months',
      roi: 2.4
    },
    {
      id: '2',
      name: 'Conservative Growth',
      description: 'Steady, sustainable growth with controlled investments',
      assumptions: [
        '5% increase in marketing spend',
        'Process optimization initiatives',
        'Client retention focus',
        'Gradual team expansion'
      ],
      outcomes: {
        revenue: 145000,
        expenses: 90000,
        profit: 55000,
        cashflow: 50000,
        marketShare: 2.8
      },
      probability: 0.8,
      riskLevel: 'low',
      timeframe: '6 months',
      roi: 1.8
    },
    {
      id: '3',
      name: 'Efficiency Focus',
      description: 'Maximize profitability through operational improvements',
      assumptions: [
        'Automation investments',
        'Vendor consolidation',
        'Process streamlining',
        'Cost reduction initiatives'
      ],
      outcomes: {
        revenue: 130000,
        expenses: 75000,
        profit: 55000,
        cashflow: 52000,
        marketShare: 2.5
      },
      probability: 0.7,
      riskLevel: 'medium',
      timeframe: '6 months',
      roi: 2.1
    },
    {
      id: '4',
      name: 'Market Expansion',
      description: 'Enter new markets and diversify revenue streams',
      assumptions: [
        'Launch in 2 new geographic markets',
        'Develop 3 new service offerings',
        'Strategic partnerships',
        'Brand awareness campaigns'
      ],
      outcomes: {
        revenue: 165000,
        expenses: 110000,
        profit: 55000,
        cashflow: 40000,
        marketShare: 3.5
      },
      probability: 0.5,
      riskLevel: 'high',
      timeframe: '12 months',
      roi: 1.5
    }
  ];

  const sampleModels: PredictiveModel[] = [
    {
      id: '1',
      name: 'Revenue Forecasting Model',
      type: 'revenue',
      accuracy: 92,
      lastTrained: '2024-01-15',
      status: 'active',
      performance: {
        mape: 8.5,
        rmse: 12500,
        r2: 0.89
      },
      features: ['Historical revenue', 'Client count', 'Market trends', 'Seasonality', 'Economic indicators']
    },
    {
      id: '2',
      name: 'Expense Prediction Model',
      type: 'expense',
      accuracy: 88,
      lastTrained: '2024-01-10',
      status: 'active',
      performance: {
        mape: 12.3,
        rmse: 8500,
        r2: 0.82
      },
      features: ['Historical expenses', 'Revenue growth', 'Inflation rate', 'Vendor contracts', 'Operational metrics']
    },
    {
      id: '3',
      name: 'Cash Flow Analysis Model',
      type: 'cashflow',
      accuracy: 87,
      lastTrained: '2024-01-12',
      status: 'active',
      performance: {
        mape: 15.2,
        rmse: 9500,
        r2: 0.78
      },
      features: ['Payment patterns', 'Collection efficiency', 'Expense timing', 'Revenue cycles', 'Client behavior']
    },
    {
      id: '4',
      name: 'Customer Acquisition Model',
      type: 'customer',
      accuracy: 85,
      lastTrained: '2024-01-08',
      status: 'training',
      performance: {
        mape: 18.7,
        rmse: 45,
        r2: 0.75
      },
      features: ['Marketing spend', 'Channel performance', 'Market conditions', 'Competition', 'Brand awareness']
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate API calls
        await Promise.all([
          new Promise(resolve => setTimeout(resolve, 1000)),
          new Promise(resolve => setTimeout(resolve, 1200)),
          new Promise(resolve => setTimeout(resolve, 800))
        ]);
        
        setForecasts(sampleForecasts);
        setScenarios(sampleScenarios);
        setModels(sampleModels);
      } catch (err) {
        setError('Failed to load predictive analytics data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'down': return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading Predictive Analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Predictive Analytics
          </h2>
          <p className="text-muted-foreground">
            AI-powered forecasting and scenario analysis for strategic planning
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Time Range
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
            Configure
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Forecasts Tab */}
        <TabsContent value="forecasts" className="space-y-6">
          <div className="grid gap-6">
            {forecasts.map((forecast) => (
              <Card key={forecast.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{forecast.metric}</CardTitle>
                        <CardDescription>
                          Forecast for {forecast.timeframe}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(forecast.trend)}
                      <Badge variant="outline">
                        {forecast.confidence}% confidence
                      </Badge>
                      {forecast.accuracy && (
                        <Badge className="bg-green-100 text-green-800">
                          {forecast.accuracy}% accuracy
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Current vs Forecast */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Current</div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(forecast.currentValue)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Next Month</div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(forecast.forecastValues.nextMonth)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Next Quarter</div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(forecast.forecastValues.nextQuarter)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Next Year</div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(forecast.forecastValues.nextYear)}
                        </div>
                      </div>
                    </div>

                    {/* Scenario Analysis */}
                    <div>
                      <div className="text-sm font-medium mb-3">Scenario Analysis</div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <div className="text-sm text-muted-foreground">Pessimistic</div>
                          <div className="font-semibold text-red-600">
                            {formatCurrency(forecast.scenarios.pessimistic)}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm text-muted-foreground">Realistic</div>
                          <div className="font-semibold">
                            {formatCurrency(forecast.scenarios.realistic)}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-sm text-muted-foreground">Optimistic</div>
                          <div className="font-semibold text-green-600">
                            {formatCurrency(forecast.scenarios.optimistic)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Key Factors */}
                    <div>
                      <div className="text-sm font-medium mb-2">Key Factors</div>
                      <div className="flex flex-wrap gap-1">
                        {forecast.factors.map((factor) => (
                          <Badge key={factor} variant="secondary" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid gap-6">
            {scenarios.map((scenario) => (
              <Card key={scenario.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getRiskColor(scenario.riskLevel)}>
                        {scenario.riskLevel} risk
                      </Badge>
                      <Badge variant="outline">
                        {(scenario.probability * 100).toFixed(0)}% probability
                      </Badge>
                      {scenario.roi && (
                        <Badge className="bg-blue-100 text-blue-800">
                          {scenario.roi}x ROI
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Assumptions */}
                    <div>
                      <div className="text-sm font-medium mb-2">Key Assumptions</div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {scenario.assumptions.map((assumption, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {assumption}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Projected Outcomes */}
                    <div>
                      <div className="text-sm font-medium mb-2">Projected Outcomes</div>
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Revenue</div>
                          <div className="text-lg font-semibold">
                            {formatCurrency(scenario.outcomes.revenue)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Expenses</div>
                          <div className="text-lg font-semibold">
                            {formatCurrency(scenario.outcomes.expenses)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Profit</div>
                          <div className="text-lg font-semibold text-green-600">
                            {formatCurrency(scenario.outcomes.profit)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Cash Flow</div>
                          <div className="text-lg font-semibold">
                            {formatCurrency(scenario.outcomes.cashflow)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Market Share</div>
                          <div className="text-lg font-semibold">
                            {formatPercentage(scenario.outcomes.marketShare)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Timeline: {scenario.timeframe}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        <Button size="sm">
                          <Calculator className="h-4 w-4 mr-2" />
                          Analyze
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-6">
          <div className="grid gap-6">
            {models.map((model) => (
              <Card key={model.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Brain className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                        <CardDescription>
                          {model.type.charAt(0).toUpperCase() + model.type.slice(1)} prediction model
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(model.status)}>
                        {model.status}
                      </Badge>
                      <Badge variant="outline">
                        {model.accuracy}% accuracy
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Performance Metrics */}
                    <div>
                      <div className="text-sm font-medium mb-2">Performance Metrics</div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">MAPE</div>
                          <div className="text-lg font-semibold">
                            {formatPercentage(model.performance.mape)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">RMSE</div>
                          <div className="text-lg font-semibold">
                            {model.performance.rmse.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">R²</div>
                          <div className="text-lg font-semibold">
                            {model.performance.r2.toFixed(3)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <div className="text-sm font-medium mb-2">Model Features</div>
                      <div className="flex flex-wrap gap-1">
                        {model.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Last trained: {new Date(model.lastTrained).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        <Button size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retrain
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Predictive Insights
                </CardTitle>
                <CardDescription>
                  Key insights derived from predictive models and scenario analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-900">Revenue Growth Opportunity</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Models predict 15-20% revenue growth potential through pricing optimization and market expansion strategies.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-900">Cash Flow Risk</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Predictive models indicate potential cash flow constraints in Q3 if aggressive growth scenario is pursued.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Optimization Opportunity</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Scenario analysis shows efficiency-focused strategy could yield highest ROI with lowest risk.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Model Performance Summary
                </CardTitle>
                <CardDescription>
                  Overall performance metrics across all predictive models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">89%</div>
                    <div className="text-sm text-muted-foreground">Average Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">4</div>
                    <div className="text-sm text-muted-foreground">Active Models</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">12.3%</div>
                    <div className="text-sm text-muted-foreground">Avg MAPE</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">0.81</div>
                    <div className="text-sm text-muted-foreground">Avg R²</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
