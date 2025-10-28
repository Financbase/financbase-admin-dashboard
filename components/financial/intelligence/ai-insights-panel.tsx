"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  ArrowRight,
  Zap,
  BookOpen,
  Calculator,
  PieChart,
  BarChart3,
  LineChart,
  Activity,
  Shield,
  Star,
  Award,
  Target as GoalIcon,
  Calendar,
  Users,
  Building2,
  ShoppingBag,
  CreditCard,
  FileText,
  Settings,
  RefreshCw,
  Download,
  Share2,
  Eye,
  Play,
  Pause
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'risk' | 'optimization' | 'prediction' | 'recommendation' | 'alert';
  priority: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  category: 'revenue' | 'expenses' | 'cashflow' | 'profitability' | 'growth' | 'efficiency' | 'market' | 'operations';
  estimatedValue?: number;
  timeframe: string;
  tags: string[];
  actionable: boolean;
  status: 'new' | 'in_progress' | 'completed' | 'dismissed';
  createdAt: string;
  updatedAt: string;
  actions?: ActionItem[];
  metrics?: MetricImpact[];
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  type: 'automated' | 'manual' | 'approval_required';
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  resources: string[];
  steps: string[];
  expectedOutcome: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

interface MetricImpact {
  metric: string;
  currentValue: number;
  expectedValue: number;
  improvement: number;
  timeframe: string;
}

interface AIInsightsPanelProps {
  className?: string;
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function AIInsightsPanel({ 
  className, 
  userId, 
  autoRefresh = true, 
  refreshInterval = 300000 
}: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Enhanced sample insights with actionable items
  const sampleInsights: AIInsight[] = [
    {
      id: '1',
      title: "Revenue Optimization Opportunity",
      description: "AI analysis reveals potential for 23% revenue increase through pricing optimization and client retention improvements. Current pricing is 15% below market average.",
      type: 'opportunity',
      priority: 'high',
      confidence: 89,
      impact: 'high',
      category: 'revenue',
      estimatedValue: 45000,
      timeframe: 'Q2 2024',
      tags: ['pricing', 'retention', 'optimization', 'market-analysis'],
      actionable: true,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      actions: [
        {
          id: '1-1',
          title: 'Conduct Pricing Analysis',
          description: 'Analyze current pricing against market benchmarks and competitor rates',
          type: 'manual',
          estimatedTime: '2-3 hours',
          difficulty: 'medium',
          resources: ['Market research tools', 'Competitor analysis', 'Financial data'],
          steps: [
            'Research competitor pricing for similar services',
            'Analyze client willingness to pay',
            'Calculate optimal pricing tiers',
            'Test pricing with select clients'
          ],
          expectedOutcome: '15-20% price increase recommendation',
          status: 'pending'
        },
        {
          id: '1-2',
          title: 'Implement Client Retention Program',
          description: 'Develop and launch a comprehensive client retention strategy',
          type: 'manual',
          estimatedTime: '1-2 weeks',
          difficulty: 'medium',
          resources: ['CRM system', 'Client data', 'Marketing team'],
          steps: [
            'Identify at-risk clients',
            'Create retention offers',
            'Implement feedback system',
            'Track retention metrics'
          ],
          expectedOutcome: '10-15% improvement in retention rate',
          status: 'pending'
        }
      ],
      metrics: [
        {
          metric: 'Average Revenue Per Client',
          currentValue: 2500,
          expectedValue: 3100,
          improvement: 24,
          timeframe: '3 months'
        },
        {
          metric: 'Client Retention Rate',
          currentValue: 78,
          expectedValue: 88,
          improvement: 12.8,
          timeframe: '6 months'
        }
      ]
    },
    {
      id: '2',
      title: "Cash Flow Risk Alert",
      description: "Projected cash flow shortfall of $15,000 in March due to delayed client payments and increased expenses. Immediate action required.",
      type: 'risk',
      priority: 'critical',
      confidence: 94,
      impact: 'high',
      category: 'cashflow',
      estimatedValue: -15000,
      timeframe: 'March 2024',
      tags: ['cashflow', 'risk', 'payments', 'urgent'],
      actionable: true,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      actions: [
        {
          id: '2-1',
          title: 'Accelerate Invoice Collections',
          description: 'Implement immediate collection strategies for overdue invoices',
          type: 'manual',
          estimatedTime: '1-2 days',
          difficulty: 'easy',
          resources: ['Invoice system', 'Client contacts', 'Payment tracking'],
          steps: [
            'Identify overdue invoices',
            'Send payment reminders',
            'Offer payment plans',
            'Follow up with clients'
          ],
          expectedOutcome: 'Recover $8,000-12,000 in 2 weeks',
          status: 'pending'
        },
        {
          id: '2-2',
          title: 'Optimize Expense Timing',
          description: 'Defer non-critical expenses to improve short-term cash flow',
          type: 'manual',
          estimatedTime: '1 day',
          difficulty: 'easy',
          resources: ['Expense reports', 'Vendor contracts'],
          steps: [
            'Review upcoming expenses',
            'Identify deferrable items',
            'Negotiate payment terms',
            'Implement expense controls'
          ],
          expectedOutcome: 'Defer $5,000-8,000 in expenses',
          status: 'pending'
        }
      ],
      metrics: [
        {
          metric: 'Cash Flow',
          currentValue: 25000,
          expectedValue: 10000,
          improvement: -60,
          timeframe: '1 month'
        },
        {
          metric: 'Days Sales Outstanding',
          currentValue: 45,
          expectedValue: 30,
          improvement: -33.3,
          timeframe: '2 months'
        }
      ]
    },
    {
      id: '3',
      title: "Expense Efficiency Improvement",
      description: "Identified $8,200 in potential monthly savings through vendor consolidation and process automation. Current expense ratio is 15% above industry average.",
      type: 'optimization',
      priority: 'medium',
      confidence: 87,
      impact: 'medium',
      category: 'efficiency',
      estimatedValue: 8200,
      timeframe: 'Next 30 days',
      tags: ['efficiency', 'automation', 'savings', 'optimization'],
      actionable: true,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      actions: [
        {
          id: '3-1',
          title: 'Vendor Consolidation Analysis',
          description: 'Analyze current vendors and identify consolidation opportunities',
          type: 'manual',
          estimatedTime: '3-4 hours',
          difficulty: 'medium',
          resources: ['Vendor contracts', 'Expense data', 'Procurement team'],
          steps: [
            'Audit current vendor relationships',
            'Identify duplicate services',
            'Negotiate bulk discounts',
            'Consolidate similar services'
          ],
          expectedOutcome: '15-20% reduction in vendor costs',
          status: 'pending'
        },
        {
          id: '3-2',
          title: 'Process Automation Implementation',
          description: 'Implement automated processes to reduce manual work and errors',
          type: 'manual',
          estimatedTime: '1-2 weeks',
          difficulty: 'hard',
          resources: ['IT team', 'Process documentation', 'Automation tools'],
          steps: [
            'Map current processes',
            'Identify automation opportunities',
            'Implement automation tools',
            'Train staff on new processes'
          ],
          expectedOutcome: '30-40% reduction in manual processing time',
          status: 'pending'
        }
      ],
      metrics: [
        {
          metric: 'Operating Expense Ratio',
          currentValue: 68,
          expectedValue: 58,
          improvement: -14.7,
          timeframe: '3 months'
        },
        {
          metric: 'Process Efficiency Score',
          currentValue: 65,
          expectedValue: 85,
          improvement: 30.8,
          timeframe: '6 months'
        }
      ]
    },
    {
      id: '4',
      title: "Market Growth Prediction",
      description: "Industry analysis indicates 18% market growth potential for your services in Q2-Q3 2024. Current market share is 2.3% with room for expansion.",
      type: 'prediction',
      priority: 'medium',
      confidence: 76,
      impact: 'medium',
      category: 'market',
      estimatedValue: 25000,
      timeframe: 'Q2-Q3 2024',
      tags: ['market', 'growth', 'industry', 'expansion'],
      actionable: false,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: [
        {
          metric: 'Market Share',
          currentValue: 2.3,
          expectedValue: 2.8,
          improvement: 21.7,
          timeframe: '6 months'
        },
        {
          metric: 'Market Growth Rate',
          currentValue: 12,
          expectedValue: 18,
          improvement: 50,
          timeframe: '1 year'
        }
      ]
    },
    {
      id: '5',
      title: "Profitability Trend Analysis",
      description: "Profit margins have improved 12% over the last quarter, indicating effective cost management. This trend is expected to continue with current strategies.",
      type: 'prediction',
      priority: 'low',
      confidence: 92,
      impact: 'medium',
      category: 'profitability',
      estimatedValue: 15000,
      timeframe: 'Q2 2024',
      tags: ['profitability', 'margins', 'trend', 'positive'],
      actionable: false,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: [
        {
          metric: 'Gross Profit Margin',
          currentValue: 68.5,
          expectedValue: 72.1,
          improvement: 5.3,
          timeframe: '3 months'
        },
        {
          metric: 'Net Profit Margin',
          currentValue: 24.2,
          expectedValue: 28.5,
          improvement: 17.8,
          timeframe: '6 months'
        }
      ]
    }
  ];

  useEffect(() => {
    const loadInsights = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setInsights(sampleInsights);
      } catch (err) {
        setError('Failed to load AI insights');
        console.error('Error loading insights:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();

    // Auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(loadInsights, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return Lightbulb;
      case 'risk': return AlertTriangle;
      case 'optimization': return Target;
      case 'prediction': return TrendingUp;
      case 'recommendation': return CheckCircle;
      case 'alert': return AlertTriangle;
      default: return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'text-yellow-600 bg-yellow-100';
      case 'risk': return 'text-red-600 bg-red-100';
      case 'optimization': return 'text-blue-600 bg-blue-100';
      case 'prediction': return 'text-purple-600 bg-purple-100';
      case 'recommendation': return 'text-green-600 bg-green-100';
      case 'alert': return 'text-orange-600 bg-orange-100';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const filteredInsights = insights.filter(insight => {
    const priorityMatch = filter === 'all' || insight.priority === filter;
    const categoryMatch = categoryFilter === 'all' || insight.category === categoryFilter;
    return priorityMatch && categoryMatch;
  });

  const handleActionStart = (insightId: string, actionId: string) => {
    setInsights(prev => prev.map(insight => {
      if (insight.id === insightId) {
        return {
          ...insight,
          actions: insight.actions?.map(action => 
            action.id === actionId 
              ? { ...action, status: 'in_progress' as const }
              : action
          ),
          status: 'in_progress' as const
        };
      }
      return insight;
    }));
  };

  const handleActionComplete = (insightId: string, actionId: string) => {
    setInsights(prev => prev.map(insight => {
      if (insight.id === insightId) {
        const updatedActions = insight.actions?.map(action => 
          action.id === actionId 
            ? { ...action, status: 'completed' as const }
            : action
        );
        
        const allActionsCompleted = updatedActions?.every(action => action.status === 'completed');
        
        return {
          ...insight,
          actions: updatedActions,
          status: allActionsCompleted ? 'completed' as const : 'in_progress' as const
        };
      }
      return insight;
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading AI Insights...</span>
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
            <Brain className="h-6 w-6 text-blue-600" />
            AI-Powered Insights
          </h2>
          <p className="text-muted-foreground">
            Intelligent recommendations and actionable insights for your business
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
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

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Priority:</span>
          <div className="flex gap-1">
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map((priority) => (
              <Button
                key={priority}
                variant={filter === priority ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(priority)}
                className="capitalize"
              >
                {priority}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Category:</span>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            <option value="revenue">Revenue</option>
            <option value="expenses">Expenses</option>
            <option value="cashflow">Cash Flow</option>
            <option value="profitability">Profitability</option>
            <option value="growth">Growth</option>
            <option value="efficiency">Efficiency</option>
            <option value="market">Market</option>
            <option value="operations">Operations</option>
          </select>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid gap-6">
        {filteredInsights.map((insight) => {
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
                    <Badge className={getStatusColor(insight.status)}>
                      {insight.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Key Metrics */}
                  {insight.metrics && insight.metrics.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Expected Impact</div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {insight.metrics.map((metric, index) => (
                          <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-muted-foreground">{metric.metric}</div>
                            <div className="text-lg font-semibold">
                              {metric.metric.includes('Rate') || metric.metric.includes('Margin') ? 
                               `${metric.currentValue}%` : formatCurrency(metric.currentValue)}
                            </div>
                            <div className="text-sm text-green-600">
                              → {metric.metric.includes('Rate') || metric.metric.includes('Margin') ? 
                                 `${metric.expectedValue}%` : formatCurrency(metric.expectedValue)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {metric.improvement > 0 ? '+' : ''}{metric.improvement.toFixed(1)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {insight.actions && insight.actions.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Recommended Actions</div>
                      <div className="space-y-3">
                        {insight.actions.map((action) => (
                          <div key={action.id} className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium">{action.title}</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {action.description}
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {action.estimatedTime}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    {action.difficulty}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {action.type}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={action.status === 'completed' ? 'default' : 'outline'}
                                  className={cn(
                                    action.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    action.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  )}
                                >
                                  {action.status.replace('_', ' ')}
                                </Badge>
                                {action.status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleActionStart(insight.id, action.id)}
                                  >
                                    <Play className="h-4 w-4 mr-2" />
                                    Start
                                  </Button>
                                )}
                                {action.status === 'in_progress' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleActionComplete(insight.id, action.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Complete
                                  </Button>
                                )}
                              </div>
                            </div>
                            {action.steps && action.steps.length > 0 && (
                              <div className="mt-3">
                                <div className="text-xs font-medium text-muted-foreground mb-1">Steps:</div>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                  {action.steps.slice(0, 3).map((step, index) => (
                                    <li key={index} className="flex items-center gap-1">
                                      <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                      {step}
                                    </li>
                                  ))}
                                  {action.steps.length > 3 && (
                                    <li className="text-xs text-blue-600">
                                      +{action.steps.length - 3} more steps
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Category: {insight.category}</span>
                      <span>•</span>
                      <span>{insight.timeframe}</span>
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

                  {/* Tags */}
                  {insight.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {insight.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Insights Summary</CardTitle>
          <CardDescription>
            Overview of AI-generated insights and their impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{insights.length}</div>
              <div className="text-sm text-muted-foreground">Total Insights</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {insights.filter(i => i.priority === 'critical').length}
              </div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {insights.filter(i => i.actionable).length}
              </div>
              <div className="text-sm text-muted-foreground">Actionable</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(insights.reduce((sum, i) => sum + (i.estimatedValue || 0), 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
