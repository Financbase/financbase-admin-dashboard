"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Eye,
  RefreshCw,
  Settings,
  Zap,
  Shield,
  Activity,
  DollarSign,
  PieChart,
  LineChart,
  Calculator,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calendar,
  Filter,
  Download,
  Share2,
  BookOpen,
  TrendingUp as GrowthIcon,
  AlertCircle as WarningIcon,
  CheckCircle2 as SuccessIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced interfaces for comprehensive financial intelligence
interface FinancialInsight {
  id: string;
  title: string;
  description: string;
  type: 'prediction' | 'recommendation' | 'alert' | 'trend' | 'opportunity' | 'risk';
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  category: 'revenue' | 'expenses' | 'cashflow' | 'profitability' | 'growth' | 'efficiency' | 'market';
  timestamp: string;
  actionable: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedValue?: number;
  timeframe?: string;
  tags: string[];
}

interface FinancialMetric {
  id: string;
  name: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  unit: 'currency' | 'percentage' | 'count' | 'ratio';
  category: string;
  lastUpdated: string;
}

interface FinancialHealthScore {
  overall: number;
  revenue: number;
  expenses: number;
  cashflow: number;
  profitability: number;
  growth: number;
  efficiency: number;
  risk: number;
  lastCalculated: string;
  trend: 'improving' | 'stable' | 'declining';
  benchmark: {
    industry: number;
    percentile: number;
  };
}

interface PredictiveAnalysis {
  id: string;
  metric: string;
  currentValue: number;
  predictedValues: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  };
  confidence: number;
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
  factors: string[];
  timeframe: string;
}

interface BenchmarkData {
  metric: string;
  yourValue: number;
  industryAverage: number;
  topQuartile: number;
  percentile: number;
  recommendation: string;
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
  };
  probability: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export function AdvancedFinancialDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [metrics, setMetrics] = useState<FinancialMetric[]>([]);
  const [healthScore, setHealthScore] = useState<FinancialHealthScore | null>(null);
  const [predictions, setPredictions] = useState<PredictiveAnalysis[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioAnalysis[]>([]);

  // Enhanced sample data with more realistic and comprehensive insights
  const sampleInsights: FinancialInsight[] = [
    {
      id: '1',
      title: "Revenue Optimization Opportunity",
      description: "AI analysis shows potential for 23% revenue increase through pricing optimization and client retention improvements",
      type: 'opportunity',
      confidence: 89,
      impact: 'high',
      category: 'revenue',
      timestamp: new Date().toISOString(),
      actionable: true,
      priority: 'high',
      estimatedValue: 45000,
      timeframe: 'Q2 2024',
      tags: ['pricing', 'retention', 'optimization']
    },
    {
      id: '2',
      title: "Cash Flow Risk Alert",
      description: "Projected cash flow shortfall of $15,000 in March due to delayed client payments and increased expenses",
      type: 'risk',
      confidence: 94,
      impact: 'high',
      category: 'cashflow',
      timestamp: new Date().toISOString(),
      actionable: true,
      priority: 'critical',
      estimatedValue: -15000,
      timeframe: 'March 2024',
      tags: ['cashflow', 'risk', 'payments']
    },
    {
      id: '3',
      title: "Expense Efficiency Improvement",
      description: "Identified $8,200 in potential monthly savings through vendor consolidation and process automation",
      type: 'recommendation',
      confidence: 87,
      impact: 'medium',
      category: 'efficiency',
      timestamp: new Date().toISOString(),
      actionable: true,
      priority: 'medium',
      estimatedValue: 8200,
      timeframe: 'Next 30 days',
      tags: ['efficiency', 'automation', 'savings']
    },
    {
      id: '4',
      title: "Market Growth Prediction",
      description: "Industry analysis indicates 18% market growth potential for your services in Q2-Q3 2024",
      type: 'prediction',
      confidence: 76,
      impact: 'medium',
      category: 'market',
      timestamp: new Date().toISOString(),
      actionable: false,
      priority: 'medium',
      timeframe: 'Q2-Q3 2024',
      tags: ['market', 'growth', 'industry']
    },
    {
      id: '5',
      title: "Profitability Trend Analysis",
      description: "Profit margins have improved 12% over the last quarter, indicating effective cost management",
      type: 'trend',
      confidence: 92,
      impact: 'medium',
      category: 'profitability',
      timestamp: new Date().toISOString(),
      actionable: false,
      priority: 'low',
      tags: ['profitability', 'margins', 'trend']
    }
  ];

  const sampleMetrics: FinancialMetric[] = [
    {
      id: '1',
      name: 'Monthly Recurring Revenue',
      currentValue: 125000,
      previousValue: 118000,
      change: 7000,
      changePercent: 5.9,
      trend: 'up',
      target: 150000,
      unit: 'currency',
      category: 'Revenue',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Customer Acquisition Cost',
      currentValue: 150,
      previousValue: 165,
      change: -15,
      changePercent: -9.1,
      trend: 'up',
      target: 120,
      unit: 'currency',
      category: 'Efficiency',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Gross Profit Margin',
      currentValue: 68.5,
      previousValue: 65.2,
      change: 3.3,
      changePercent: 5.1,
      trend: 'up',
      target: 70,
      unit: 'percentage',
      category: 'Profitability',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Cash Conversion Cycle',
      currentValue: 28,
      previousValue: 32,
      change: -4,
      changePercent: -12.5,
      trend: 'up',
      target: 25,
      unit: 'count',
      category: 'Efficiency',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Client Retention Rate',
      currentValue: 94.2,
      previousValue: 91.8,
      change: 2.4,
      changePercent: 2.6,
      trend: 'up',
      target: 95,
      unit: 'percentage',
      category: 'Growth',
      lastUpdated: new Date().toISOString()
    },
    {
      id: '6',
      name: 'Monthly Burn Rate',
      currentValue: 45000,
      previousValue: 48000,
      change: -3000,
      changePercent: -6.3,
      trend: 'up',
      target: 40000,
      unit: 'currency',
      category: 'Expenses',
      lastUpdated: new Date().toISOString()
    }
  ];

  const sampleHealthScore: FinancialHealthScore = {
    overall: 78,
    revenue: 82,
    expenses: 75,
    cashflow: 71,
    profitability: 85,
    growth: 79,
    efficiency: 73,
    risk: 68,
    lastCalculated: new Date().toISOString(),
    trend: 'improving',
    benchmark: {
      industry: 72,
      percentile: 85
    }
  };

  const samplePredictions: PredictiveAnalysis[] = [
    {
      id: '1',
      metric: 'Monthly Revenue',
      currentValue: 125000,
      predictedValues: {
        nextMonth: 132000,
        nextQuarter: 145000,
        nextYear: 180000
      },
      confidence: 89,
      scenarios: {
        optimistic: 155000,
        realistic: 145000,
        pessimistic: 125000
      },
      factors: ['Client growth', 'Pricing optimization', 'Market expansion'],
      timeframe: 'Q2-Q4 2024'
    },
    {
      id: '2',
      metric: 'Operating Expenses',
      currentValue: 85000,
      predictedValues: {
        nextMonth: 82000,
        nextQuarter: 88000,
        nextYear: 95000
      },
      confidence: 85,
      scenarios: {
        optimistic: 80000,
        realistic: 88000,
        pessimistic: 95000
      },
      factors: ['Inflation impact', 'Efficiency improvements', 'Growth investments'],
      timeframe: 'Q2-Q4 2024'
    }
  ];

  const sampleBenchmarks: BenchmarkData[] = [
    {
      metric: 'Revenue Growth Rate',
      yourValue: 15.2,
      industryAverage: 8.5,
      topQuartile: 22.1,
      percentile: 78,
      recommendation: 'Above average performance, consider scaling strategies'
    },
    {
      metric: 'Profit Margin',
      yourValue: 68.5,
      industryAverage: 45.2,
      topQuartile: 72.8,
      percentile: 92,
      recommendation: 'Excellent profitability, maintain current strategies'
    },
    {
      metric: 'Customer Acquisition Cost',
      yourValue: 150,
      industryAverage: 280,
      topQuartile: 120,
      percentile: 85,
      recommendation: 'Efficient acquisition, optimize for scale'
    }
  ];

  const sampleScenarios: ScenarioAnalysis[] = [
    {
      id: '1',
      name: 'Aggressive Growth',
      description: 'Invest heavily in marketing and sales to capture market share',
      assumptions: ['20% increase in marketing spend', 'New sales team hire', 'Product expansion'],
      outcomes: {
        revenue: 180000,
        expenses: 120000,
        profit: 60000,
        cashflow: 45000
      },
      probability: 0.6,
      riskLevel: 'high'
    },
    {
      id: '2',
      name: 'Conservative Growth',
      description: 'Steady, sustainable growth with controlled investments',
      assumptions: ['5% increase in marketing', 'Process optimization', 'Client retention focus'],
      outcomes: {
        revenue: 145000,
        expenses: 90000,
        profit: 55000,
        cashflow: 50000
      },
      probability: 0.8,
      riskLevel: 'low'
    },
    {
      id: '3',
      name: 'Efficiency Focus',
      description: 'Maximize profitability through operational improvements',
      assumptions: ['Automation investments', 'Vendor consolidation', 'Process streamlining'],
      outcomes: {
        revenue: 130000,
        expenses: 75000,
        profit: 55000,
        cashflow: 52000
      },
      probability: 0.7,
      riskLevel: 'medium'
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
        
        setInsights(sampleInsights);
        setMetrics(sampleMetrics);
        setHealthScore(sampleHealthScore);
        setPredictions(samplePredictions);
        setBenchmarks(sampleBenchmarks);
        setScenarios(sampleScenarios);
      } catch (err) {
        setError('Failed to load financial intelligence data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeRange]);

  const handleRefreshData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Refresh logic here
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return TrendingUp;
      case 'recommendation': return Target;
      case 'alert': return AlertTriangle;
      case 'trend': return BarChart3;
      case 'opportunity': return Lightbulb;
      case 'risk': return WarningIcon;
      default: return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'prediction': return 'text-blue-600 bg-blue-100';
      case 'recommendation': return 'text-green-600 bg-green-100';
      case 'alert': return 'text-red-600 bg-red-100';
      case 'trend': return 'text-purple-600 bg-purple-100';
      case 'opportunity': return 'text-yellow-600 bg-yellow-100';
      case 'risk': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading Financial Intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            Financial Intelligence
          </h1>
          <p className="text-muted-foreground">
            AI-powered insights, predictions, and strategic recommendations for your business
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            {timeRange}
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRefreshData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
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

      {/* Financial Health Score */}
      {healthScore && (
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Financial Health Score
            </CardTitle>
            <CardDescription>
              Overall business health assessment based on key financial metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getHealthColor(healthScore.overall)}`}>
                  {healthScore.overall}
                </div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getHealthBgColor(healthScore.overall)} ${getHealthColor(healthScore.overall)}`}>
                  {healthScore.trend === 'improving' ? <TrendingUp className="h-3 w-3" /> : 
                   healthScore.trend === 'declining' ? <TrendingDown className="h-3 w-3" /> : 
                   <Minus className="h-3 w-3" />}
                  {healthScore.trend}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Revenue</span>
                  <span className={getHealthColor(healthScore.revenue)}>{healthScore.revenue}</span>
                </div>
                <Progress value={healthScore.revenue} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Expenses</span>
                  <span className={getHealthColor(healthScore.expenses)}>{healthScore.expenses}</span>
                </div>
                <Progress value={healthScore.expenses} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Cash Flow</span>
                  <span className={getHealthColor(healthScore.cashflow)}>{healthScore.cashflow}</span>
                </div>
                <Progress value={healthScore.cashflow} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Profitability</span>
                  <span className={getHealthColor(healthScore.profitability)}>{healthScore.profitability}</span>
                </div>
                <Progress value={healthScore.profitability} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Growth</span>
                  <span className={getHealthColor(healthScore.growth)}>{healthScore.growth}</span>
                </div>
                <Progress value={healthScore.growth} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Efficiency</span>
                  <span className={getHealthColor(healthScore.efficiency)}>{healthScore.efficiency}</span>
                </div>
                <Progress value={healthScore.efficiency} className="h-2" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Industry Benchmark</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{healthScore.benchmark.industry}</span>
                  <Badge variant="outline">{healthScore.benchmark.percentile}th percentile</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {metric.unit === 'currency' ? formatCurrency(metric.currentValue) :
                   metric.unit === 'percentage' ? `${metric.currentValue.toFixed(1)}%` :
                   metric.currentValue.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {metric.trend === 'up' ? <ArrowUpRight className="h-4 w-4 text-green-600" /> :
                   metric.trend === 'down' ? <ArrowDownRight className="h-4 w-4 text-red-600" /> :
                   <Minus className="h-4 w-4 text-gray-600" />}
                  <span className={cn(
                    metric.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {formatPercentage(metric.changePercent)}
                  </span>
                  <span className="text-muted-foreground">vs last period</span>
                </div>
                {metric.target && (
                  <div className="text-xs text-muted-foreground">
                    Target: {metric.unit === 'currency' ? formatCurrency(metric.target) :
                             metric.unit === 'percentage' ? `${metric.target}%` :
                             metric.target.toLocaleString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Critical Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Critical Insights
                </CardTitle>
                <CardDescription>
                  High-priority insights requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.filter(i => i.priority === 'critical').map((insight) => {
                  const IconComponent = getInsightIcon(insight.type);
                  return (
                    <div key={insight.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-red-100">
                          <IconComponent className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-red-900">{insight.title}</div>
                          <div className="text-sm text-red-700 mt-1">{insight.description}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              {insight.confidence}% confidence
                            </Badge>
                            {insight.estimatedValue && (
                              <Badge variant="outline" className="text-xs">
                                {formatCurrency(insight.estimatedValue)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Recommended actions based on current insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calculator className="h-4 w-4 mr-2" />
                  Run Cash Flow Analysis
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Generate Revenue Forecast
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <PieChart className="h-4 w-4 mr-2" />
                  Analyze Expense Categories
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <LineChart className="h-4 w-4 mr-2" />
                  View Trend Analysis
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="space-y-4">
            {insights.map((insight) => {
              const IconComponent = getInsightIcon(insight.type);
              return (
                <Card key={insight.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {insight.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(insight.priority)}>
                          {insight.priority}
                        </Badge>
                        <Badge variant="outline">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Category: {insight.category}</span>
                        <span>•</span>
                        <span>{new Date(insight.timestamp).toLocaleDateString()}</span>
                        {insight.estimatedValue && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(insight.estimatedValue)}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        {insight.actionable && (
                          <Button size="sm">
                            <Zap className="h-4 w-4 mr-2" />
                            Take Action
                          </Button>
                        )}
                      </div>
                    </div>
                    {insight.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {insight.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid gap-6">
            {predictions.map((prediction) => (
              <Card key={prediction.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{prediction.metric}</CardTitle>
                    <Badge variant="outline">
                      {prediction.confidence}% confidence
                    </Badge>
                  </div>
                  <CardDescription>
                    Forecast for {prediction.timeframe}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Current</div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(prediction.currentValue)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Next Month</div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(prediction.predictedValues.nextMonth)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Next Quarter</div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(prediction.predictedValues.nextQuarter)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Next Year</div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(prediction.predictedValues.nextYear)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm font-medium mb-2">Scenario Analysis</div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-muted-foreground">Optimistic</div>
                        <div className="font-semibold text-green-600">
                          {formatCurrency(prediction.scenarios.optimistic)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">Realistic</div>
                        <div className="font-semibold">
                          {formatCurrency(prediction.scenarios.realistic)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">Pessimistic</div>
                        <div className="font-semibold text-red-600">
                          {formatCurrency(prediction.scenarios.pessimistic)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Key Factors</div>
                    <div className="flex flex-wrap gap-1">
                      {prediction.factors.map((factor) => (
                        <Badge key={factor} variant="secondary" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-6">
          <div className="grid gap-6">
            {benchmarks.map((benchmark) => (
              <Card key={benchmark.metric}>
                <CardHeader>
                  <CardTitle>{benchmark.metric}</CardTitle>
                  <CardDescription>
                    Performance comparison with industry standards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Your Performance</div>
                        <div className="text-2xl font-bold">
                          {benchmark.metric.includes('Rate') || benchmark.metric.includes('Margin') ? 
                           `${benchmark.yourValue}%` : formatCurrency(benchmark.yourValue)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Industry Average</div>
                        <div className="text-lg font-semibold">
                          {benchmark.metric.includes('Rate') || benchmark.metric.includes('Margin') ? 
                           `${benchmark.industryAverage}%` : formatCurrency(benchmark.industryAverage)}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Industry Percentile</span>
                        <span className="font-medium">{benchmark.percentile}th percentile</span>
                      </div>
                      <Progress value={benchmark.percentile} className="h-2" />
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-900">Recommendation</div>
                      <div className="text-sm text-blue-700 mt-1">{benchmark.recommendation}</div>
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
                    <CardTitle>{scenario.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={cn(
                        scenario.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                        scenario.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      )}>
                        {scenario.riskLevel} risk
                      </Badge>
                      <Badge variant="outline">
                        {(scenario.probability * 100).toFixed(0)}% probability
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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
                    <div>
                      <div className="text-sm font-medium mb-2">Projected Outcomes</div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Model Performance</CardTitle>
                <CardDescription>
                  Accuracy and performance metrics for our AI models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Revenue Prediction Accuracy</span>
                    <span className="font-semibold">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Expense Forecasting</span>
                    <span className="font-semibold">88%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cash Flow Analysis</span>
                    <span className="font-semibold">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Market Trend Detection</span>
                    <span className="font-semibold">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Processing Status</CardTitle>
                <CardDescription>
                  Real-time data processing and analysis status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Data Ingestion</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">AI Processing</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Running</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Security Scan</span>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">Secure</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">Last Update</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date().toLocaleTimeString()}
                    </span>
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
