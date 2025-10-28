"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Calendar, 
  Filter, 
  Download, 
  Settings,
  Activity,
  Shield,
  RefreshCw
} from 'lucide-react';

export default function FinancialIntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
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
            Last 30 days
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

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,234.00</div>
                <p className="text-xs text-muted-foreground">
                  +5.2% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$32,997.89</div>
                <p className="text-xs text-muted-foreground">
                  +15.3% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$28,450.00</div>
                <p className="text-xs text-muted-foreground">
                  +8.7% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  AI Insights
                </CardTitle>
                <CardDescription>
                  Key recommendations from our AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge className="bg-green-100 text-green-800">High Impact</Badge>
                  <div>
                    <p className="font-medium">Optimize Marketing Spend</p>
                    <p className="text-sm text-muted-foreground">
                      Reduce marketing costs by 15% while maintaining conversion rates
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-blue-100 text-blue-800">Medium Impact</Badge>
                  <div>
                    <p className="font-medium">Inventory Management</p>
                    <p className="text-sm text-muted-foreground">
                      Implement just-in-time inventory to reduce carrying costs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Financial Health Score
                </CardTitle>
                <CardDescription>
                  Overall business financial performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Revenue Growth</span>
                  <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Expense Control</span>
                  <Badge className="bg-blue-100 text-blue-800">Good</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cash Flow</span>
                  <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Profitability</span>
                  <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI-Powered Recommendations
              </CardTitle>
              <CardDescription>
                Actionable insights generated by our AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Badge className="bg-red-100 text-red-800">Critical</Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold">Cash Flow Risk Alert</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Your cash flow is projected to decrease by 12% next month due to seasonal factors.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View Details</Button>
                      <Button size="sm">Take Action</Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Badge className="bg-green-100 text-green-800">Opportunity</Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold">Revenue Optimization</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Implementing dynamic pricing could increase revenue by 8-12% based on market analysis.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Learn More</Button>
                      <Button size="sm">Implement</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Financial Forecasts
              </CardTitle>
              <CardDescription>
                AI-powered predictions for the next 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-semibold">Revenue Forecast</h3>
                  <div className="text-2xl font-bold text-green-600">+15.2%</div>
                  <p className="text-sm text-muted-foreground">
                    Expected growth over next quarter
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Expense Forecast</h3>
                  <div className="text-2xl font-bold text-blue-600">+8.7%</div>
                  <p className="text-sm text-muted-foreground">
                    Predicted expense increase
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                AI Model Performance
              </CardTitle>
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
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Financial Charts
              </CardTitle>
              <CardDescription>
                Interactive visualizations of your financial data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Charts Coming Soon</h3>
                <p className="text-muted-foreground">
                  Interactive charts and visualizations will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}