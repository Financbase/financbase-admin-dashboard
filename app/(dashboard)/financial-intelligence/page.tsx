"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
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
  Activity
} from 'lucide-react';

interface FinancialInsight {
  id: number;
  title: string;
  description: string;
  type: 'prediction' | 'recommendation' | 'alert' | 'trend';
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  category: string;
  timestamp: string;
  actionable: boolean;
}

interface AIAnalysis {
  id: number;
  metric: string;
  currentValue: number;
  predictedValue: number;
  change: number;
  confidence: number;
  timeframe: string;
}

interface FinancialIntelligenceStats {
  totalInsights: number;
  activePredictions: number;
  recommendationsGenerated: number;
  accuracyRate: number;
  lastUpdated: string;
}

export default function FinancialIntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [stats, setStats] = useState<FinancialIntelligenceStats>({
    totalInsights: 0,
    activePredictions: 0,
    recommendationsGenerated: 0,
    accuracyRate: 0,
    lastUpdated: ''
  });

  // Sample data
  const sampleInsights: FinancialInsight[] = [
    {
      id: 1,
      title: "Cash Flow Optimization Opportunity",
      description: "Based on your spending patterns, you could save $2,400 monthly by optimizing vendor payments",
      type: 'recommendation',
      confidence: 87,
      impact: 'high',
      category: 'Cash Flow',
      timestamp: '2024-01-15T10:30:00Z',
      actionable: true
    },
    {
      id: 2,
      title: "Revenue Growth Prediction",
      description: "AI predicts 15% revenue increase in Q2 based on current trends and market conditions",
      type: 'prediction',
      confidence: 92,
      impact: 'high',
      category: 'Revenue',
      timestamp: '2024-01-15T09:15:00Z',
      actionable: false
    },
    {
      id: 3,
      title: "Expense Alert: Unusual Spending",
      description: "Detected 40% increase in marketing expenses compared to last month",
      type: 'alert',
      confidence: 95,
      impact: 'medium',
      category: 'Expenses',
      timestamp: '2024-01-15T08:45:00Z',
      actionable: true
    },
    {
      id: 4,
      title: "Market Trend Analysis",
      description: "Industry analysis shows growing demand for your services in Q2",
      type: 'trend',
      confidence: 78,
      impact: 'medium',
      category: 'Market',
      timestamp: '2024-01-15T07:20:00Z',
      actionable: true
    }
  ];

  const sampleAnalyses: AIAnalysis[] = [
    {
      id: 1,
      metric: 'Monthly Revenue',
      currentValue: 125000,
      predictedValue: 143750,
      change: 15,
      confidence: 92,
      timeframe: 'Q2 2024'
    },
    {
      id: 2,
      metric: 'Operating Expenses',
      currentValue: 85000,
      predictedValue: 78200,
      change: -8,
      confidence: 88,
      timeframe: 'Q2 2024'
    },
    {
      id: 3,
      metric: 'Cash Flow',
      currentValue: 40000,
      predictedValue: 65550,
      change: 64,
      confidence: 85,
      timeframe: 'Q2 2024'
    },
    {
      id: 4,
      metric: 'Customer Acquisition Cost',
      currentValue: 150,
      predictedValue: 135,
      change: -10,
      confidence: 90,
      timeframe: 'Q2 2024'
    }
  ];

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setInsights(sampleInsights);
        setAnalyses(sampleAnalyses);
        
        // Calculate stats
        const calculatedStats: FinancialIntelligenceStats = {
          totalInsights: sampleInsights.length,
          activePredictions: sampleInsights.filter(i => i.type === 'prediction').length,
          recommendationsGenerated: sampleInsights.filter(i => i.type === 'recommendation').length,
          accuracyRate: 89.5,
          lastUpdated: new Date().toISOString()
        };
        
        setStats(calculatedStats);
      } catch (err) {
        setError('Failed to load financial intelligence data');
        console.error('Error loading financial intelligence:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleRefreshInsights = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // In a real app, this would fetch fresh insights
      setStats(prev => ({
        ...prev,
        lastUpdated: new Date().toISOString()
      }));
    } catch (err) {
      setError('Failed to refresh insights');
      console.error('Error refreshing insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActOnInsight = (insightId: number) => {
    console.log('Acting on insight:', insightId);
    // In a real app, this would trigger an action workflow
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return TrendingUp;
      case 'recommendation': return Target;
      case 'alert': return AlertTriangle;
      case 'trend': return BarChart3;
      default: return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'prediction': return 'text-blue-600 bg-blue-100';
      case 'recommendation': return 'text-green-600 bg-green-100';
      case 'alert': return 'text-red-600 bg-red-100';
      case 'trend': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading Financial Intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Intelligence</h1>
          <p className="text-muted-foreground">
            AI-powered insights, predictions, and recommendations for your business
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefreshInsights}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Insights
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Configure AI
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInsights}</div>
            <p className="text-xs text-muted-foreground">
              AI-generated insights
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePredictions}</div>
            <p className="text-xs text-muted-foreground">
              Revenue & expense forecasts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recommendationsGenerated}</div>
            <p className="text-xs text-muted-foreground">
              Actionable suggestions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accuracyRate}%</div>
            <p className="text-xs text-muted-foreground">
              Prediction accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
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
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact} impact
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
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {insight.actionable && (
                          <Button 
                            size="sm"
                            onClick={() => handleActOnInsight(insight.id)}
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Take Action
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid gap-6">
            {analyses.map((analysis) => (
              <Card key={analysis.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{analysis.metric}</CardTitle>
                    <Badge variant="outline">
                      {analysis.confidence}% confidence
                    </Badge>
                  </div>
                  <CardDescription>
                    Prediction for {analysis.timeframe}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Current</div>
                      <div className="text-lg font-semibold">
                        ${analysis.currentValue.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Predicted</div>
                      <div className="text-lg font-semibold">
                        ${analysis.predictedValue.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Change</div>
                      <div className={`text-lg font-semibold ${
                        analysis.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analysis.change >= 0 ? '+' : ''}{analysis.change}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-6">
            {insights.filter(insight => insight.type === 'recommendation').map((insight) => {
              const IconComponent = getInsightIcon(insight.type);
              return (
                <Card key={insight.id} className="border-green-200 bg-green-50/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100">
                          <IconComponent className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {insight.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Category: {insight.category} • {new Date(insight.timestamp).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button size="sm">
                          <Zap className="h-4 w-4 mr-2" />
                          Implement
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Expense Forecasting</span>
                    <span className="font-semibold">88%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cash Flow Analysis</span>
                    <span className="font-semibold">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Market Trend Detection</span>
                    <span className="font-semibold">78%</span>
                  </div>
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
