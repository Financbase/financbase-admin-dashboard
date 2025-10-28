"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  LineChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Calendar,
  Filter,
  Download,
  Eye,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

interface FinancialChartProps {
  data: ChartDataPoint[];
  title: string;
  description?: string;
  type: 'line' | 'bar' | 'area' | 'pie';
  height?: number;
  className?: string;
  showTrend?: boolean;
  trendValue?: number;
  currency?: boolean;
}

export function RevenueTrendChart({ 
  data, 
  title, 
  description, 
  height = 300, 
  className,
  showTrend = true,
  trendValue = 0,
  currency = true 
}: FinancialChartProps) {
  const formatValue = (value: number) => {
    if (currency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return value.toLocaleString();
  };

  const getTrendIcon = () => {
    if (trendValue > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (trendValue < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (trendValue > 0) return 'text-green-600';
    if (trendValue < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Simple chart implementation (in a real app, you'd use a charting library like Recharts)
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-blue-600" />
              {title}
            </CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showTrend && (
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                <span className={cn('text-sm font-medium', getTrendColor())}>
                  {trendValue > 0 ? '+' : ''}{trendValue.toFixed(1)}%
                </span>
              </div>
            )}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart Area */}
          <div 
            className="relative bg-gradient-to-t from-blue-50 to-transparent rounded-lg p-4"
            style={{ height: `${height}px` }}
          >
            <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
              {data.map((point, index) => {
                const heightPercent = range > 0 ? ((point.value - minValue) / range) * 100 : 50;
                return (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div 
                      className="w-8 bg-blue-600 rounded-t transition-all duration-300 hover:bg-blue-700"
                      style={{ height: `${heightPercent}%` }}
                      title={`${point.date}: ${formatValue(point.value)}`}
                    />
                    <div className="text-xs text-muted-foreground">
                      {new Date(point.date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Current</div>
              <div className="font-semibold">{formatValue(data[data.length - 1]?.value || 0)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Average</div>
              <div className="font-semibold">
                {formatValue(data.reduce((sum, d) => sum + d.value, 0) / data.length)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Peak</div>
              <div className="font-semibold">{formatValue(maxValue)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ExpenseBreakdownChart({ 
  data, 
  title = "Expense Breakdown", 
  description = "Monthly expense distribution by category",
  height = 300,
  className 
}: FinancialChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-green-600" />
          {title}
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Pie Chart Visualization */}
          <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {data.map((point, index) => {
                  const percentage = (point.value / total) * 100;
                  const cumulativePercentage = data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 100, 0);
                  const strokeDasharray = `${percentage} ${100 - percentage}`;
                  const strokeDashoffset = -cumulativePercentage;
                  
                  return (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className={cn('transition-all duration-300 hover:opacity-80', getCategoryColor(index))}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold">{formatValue(total)}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="space-y-2">
            {data.map((point, index) => {
              const percentage = ((point.value / total) * 100).toFixed(1);
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-3 h-3 rounded-full', getCategoryColor(index))} />
                    <span className="text-sm">{point.label || `Category ${index + 1}`}</span>
                  </div>
                  <div className="text-sm font-medium">
                    {formatValue(point.value)} ({percentage}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CashFlowChart({ 
  data, 
  title = "Cash Flow Analysis", 
  description = "Monthly cash flow trends and projections",
  height = 300,
  className 
}: FinancialChartProps) {
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-600" />
          {title}
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart Area */}
          <div 
            className="relative bg-gradient-to-t from-purple-50 to-transparent rounded-lg p-4"
            style={{ height: `${height}px` }}
          >
            <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
              {data.map((point, index) => {
                const heightPercent = range > 0 ? ((point.value - minValue) / range) * 100 : 50;
                const isPositive = point.value >= 0;
                return (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div 
                      className={cn(
                        'w-8 rounded-t transition-all duration-300 hover:opacity-80',
                        isPositive ? 'bg-green-600' : 'bg-red-600'
                      )}
                      style={{ height: `${Math.abs(heightPercent)}%` }}
                      title={`${point.date}: ${formatValue(point.value)}`}
                    />
                    <div className="text-xs text-muted-foreground">
                      {new Date(point.date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Positive Months</div>
              <div className="font-semibold text-green-600">
                {data.filter(d => d.value > 0).length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Negative Months</div>
              <div className="font-semibold text-red-600">
                {data.filter(d => d.value < 0).length}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProfitabilityChart({ 
  data, 
  title = "Profitability Trends", 
  description = "Revenue vs expenses and profit margins",
  height = 300,
  className 
}: FinancialChartProps) {
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          {title}
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart Area */}
          <div 
            className="relative bg-gradient-to-t from-indigo-50 to-transparent rounded-lg p-4"
            style={{ height: `${height}px` }}
          >
            <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
              {data.map((point, index) => {
                const heightPercent = (point.value / maxValue) * 100;
                return (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div 
                      className="w-8 bg-indigo-600 rounded-t transition-all duration-300 hover:bg-indigo-700"
                      style={{ height: `${heightPercent}%` }}
                      title={`${point.date}: ${formatValue(point.value)}`}
                    />
                    <div className="text-xs text-muted-foreground">
                      {new Date(point.date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Average</div>
              <div className="font-semibold">
                {formatValue(data.reduce((sum, d) => sum + d.value, 0) / data.length)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Growth</div>
              <div className="font-semibold text-green-600">
                {data.length > 1 ? 
                  (((data[data.length - 1].value - data[0].value) / data[0].value) * 100).toFixed(1) + '%' : 
                  '0%'
                }
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Peak</div>
              <div className="font-semibold">{formatValue(maxValue)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FinancialChartsDashboard() {
  // Sample data for charts
  const revenueData: ChartDataPoint[] = [
    { date: '2024-01-01', value: 95000 },
    { date: '2024-02-01', value: 108000 },
    { date: '2024-03-01', value: 125000 },
    { date: '2024-04-01', value: 118000 },
    { date: '2024-05-01', value: 135000 },
    { date: '2024-06-01', value: 142000 }
  ];

  const expenseData: ChartDataPoint[] = [
    { date: '2024-01-01', value: 45000, label: 'Marketing' },
    { date: '2024-02-01', value: 52000, label: 'Operations' },
    { date: '2024-03-01', value: 48000, label: 'Technology' },
    { date: '2024-04-01', value: 55000, label: 'Personnel' },
    { date: '2024-05-01', value: 62000, label: 'Administrative' },
    { date: '2024-06-01', value: 58000, label: 'Other' }
  ];

  const cashFlowData: ChartDataPoint[] = [
    { date: '2024-01-01', value: 50000 },
    { date: '2024-02-01', value: 56000 },
    { date: '2024-03-01', value: 77000 },
    { date: '2024-04-01', value: 63000 },
    { date: '2024-05-01', value: 73000 },
    { date: '2024-06-01', value: 84000 }
  ];

  const profitabilityData: ChartDataPoint[] = [
    { date: '2024-01-01', value: 50000 },
    { date: '2024-02-01', value: 56000 },
    { date: '2024-03-01', value: 77000 },
    { date: '2024-04-01', value: 63000 },
    { date: '2024-05-01', value: 73000 },
    { date: '2024-06-01', value: 84000 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Analytics</h2>
          <p className="text-muted-foreground">
            Interactive charts and visualizations for your financial data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 6 months
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueTrendChart 
              data={revenueData}
              title="Revenue Trends"
              description="Monthly revenue performance and growth"
              type="line"
              trendValue={12.5}
            />
            <ExpenseBreakdownChart 
              data={expenseData}
              title="Expense Breakdown"
              description="Current month expense distribution"
              type="pie"
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <CashFlowChart 
              data={cashFlowData}
              title="Cash Flow Analysis"
              description="Monthly cash flow trends"
              type="area"
            />
            <ProfitabilityChart 
              data={profitabilityData}
              title="Profitability Trends"
              description="Net profit trends over time"
              type="bar"
            />
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <RevenueTrendChart 
            data={revenueData}
            title="Revenue Analysis"
            description="Detailed revenue trends and projections"
            type="line"
            trendValue={12.5}
            height={400}
          />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <ExpenseBreakdownChart 
            data={expenseData}
            title="Expense Analysis"
            description="Detailed expense breakdown and trends"
            type="pie"
            height={400}
          />
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-6">
          <CashFlowChart 
            data={cashFlowData}
            title="Cash Flow Analysis"
            description="Detailed cash flow trends and projections"
            type="area"
            height={400}
          />
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6">
          <ProfitabilityChart 
            data={profitabilityData}
            title="Profitability Analysis"
            description="Detailed profitability trends and margins"
            type="bar"
            height={400}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
