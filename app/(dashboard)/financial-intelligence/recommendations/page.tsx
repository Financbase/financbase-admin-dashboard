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
  Lightbulb, 
  TrendingUp, 
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
  Target,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  Sparkles,
  Brain
} from 'lucide-react';

export default function RecommendationsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading Recommendations...</span>
        </div>
      </div>
    );
  }

  // Mock recommendations data
  const recommendations = [
    {
      id: 1,
      title: "Optimize Marketing Spend",
      category: "Revenue",
      priority: "high",
      impact: "High",
      effort: "Medium",
      estimatedValue: "$45,000/year",
      description: "Reduce marketing costs by 15% while maintaining conversion rates through better targeting and optimization.",
      actions: [
        "Review current marketing channels and ROI",
        "Implement A/B testing for campaigns",
        "Focus budget on high-performing channels"
      ],
      status: "pending"
    },
    {
      id: 2,
      title: "Implement Just-in-Time Inventory",
      category: "Expenses",
      priority: "medium",
      impact: "Medium",
      effort: "High",
      estimatedValue: "$28,000/year",
      description: "Reduce inventory carrying costs by implementing just-in-time inventory management.",
      actions: [
        "Analyze current inventory turnover",
        "Establish vendor relationships",
        "Implement inventory tracking system"
      ],
      status: "pending"
    },
    {
      id: 3,
      title: "Increase Average Invoice Value",
      category: "Revenue",
      priority: "high",
      impact: "High",
      effort: "Low",
      estimatedValue: "$52,000/year",
      description: "Implement upselling strategies to increase average invoice value by 15%.",
      actions: [
        "Identify upsell opportunities",
        "Train sales team on upselling",
        "Create bundled service packages"
      ],
      status: "in-progress"
    },
    {
      id: 4,
      title: "Diversify Revenue Streams",
      category: "Growth",
      priority: "medium",
      impact: "High",
      effort: "High",
      estimatedValue: "$125,000/year",
      description: "Explore new revenue opportunities to reduce dependency on single income source.",
      actions: [
        "Market research for new opportunities",
        "Develop new service offerings",
        "Partner with complementary businesses"
      ],
      status: "pending"
    },
    {
      id: 5,
      title: "Build Emergency Reserve",
      category: "Stability",
      priority: "low",
      impact: "Medium",
      effort: "Medium",
      estimatedValue: "Improved stability",
      description: "Aim to maintain 6 months of operating expenses in reserve for better financial security.",
      actions: [
        "Calculate 6-month expense target",
        "Set up automatic savings",
        "Review and adjust monthly"
      ],
      status: "pending"
    },
    {
      id: 6,
      title: "Negotiate Vendor Contracts",
      category: "Expenses",
      priority: "medium",
      impact: "Medium",
      effort: "Low",
      estimatedValue: "$18,000/year",
      description: "Review and renegotiate vendor contracts to reduce operating expenses by 5-10%.",
      actions: [
        "Audit all vendor contracts",
        "Identify renegotiation opportunities",
        "Schedule vendor meetings"
      ],
      status: "pending"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-green-600';
      case 'Medium': return 'text-blue-600';
      case 'Low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (activeTab !== 'all' && rec.category.toLowerCase() !== activeTab.toLowerCase()) {
      return false;
    }
    if (selectedPriority && rec.priority !== selectedPriority) {
      return false;
    }
    return true;
  });

  const categories = ['All', 'Revenue', 'Expenses', 'Growth', 'Stability'];
  const priorities = ['high', 'medium', 'low'];

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AI Recommendations</h1>
          </div>
          <p className="text-gray-600">
            Strategic recommendations powered by AI analysis of your financial data
          </p>
        </div>
        <div className="flex items-center gap-3">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recommendations</p>
                <p className="text-2xl font-bold">{recommendations.length}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">
                  {recommendations.filter(r => r.priority === 'high').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Potential Value</p>
                <p className="text-2xl font-bold text-green-600">$268K</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {recommendations.filter(r => r.status === 'in-progress').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Tabs */}
      <div className="flex items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList>
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat.toLowerCase()}>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Priority:</span>
          <div className="flex gap-2">
            {priorities.map(pri => (
              <Button
                key={pri}
                variant={selectedPriority === pri ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPriority(selectedPriority === pri ? null : pri)}
              >
                {pri.charAt(0).toUpperCase() + pri.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.map((rec) => (
          <Card key={rec.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{rec.title}</CardTitle>
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                    </Badge>
                    {rec.status === 'in-progress' && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        In Progress
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-2">{rec.description}</CardDescription>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm font-semibold text-green-600 mb-1">
                    {rec.estimatedValue}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={getImpactColor(rec.impact)}>Impact: {rec.impact}</span>
                    <span>•</span>
                    <span>Effort: {rec.effort}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Recommended Actions
                  </h4>
                  <ul className="space-y-2">
                    {rec.actions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{rec.category}</Badge>
                    <Badge variant="outline" className={getImpactColor(rec.impact)}>
                      {rec.impact} Impact
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                    <Button size="sm">
                      <Zap className="h-4 w-4 mr-2" />
                      Implement
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            How These Recommendations Are Generated
          </CardTitle>
          <CardDescription>
            Understanding our AI recommendation engine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium">Data-Driven Analysis</p>
                <p className="text-sm text-muted-foreground">
                  Recommendations are generated by analyzing your financial data, historical trends, and industry benchmarks.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Impact & Effort Scoring</p>
                <p className="text-sm text-muted-foreground">
                  Each recommendation is scored based on potential impact and implementation effort to help prioritize actions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Activity className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Continuous Learning</p>
                <p className="text-sm text-muted-foreground">
                  Our AI models continuously learn from your business patterns to provide increasingly relevant recommendations.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
