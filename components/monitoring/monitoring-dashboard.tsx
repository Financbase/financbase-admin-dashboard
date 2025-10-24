"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Server,
  Database,
  Zap,
  Users,
  DollarSign,
  FileText,
  RefreshCw,
  Settings,
  Bell,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  databaseConnections: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface AlertSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  active: number;
  resolved: number;
}

interface MetricTrend {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
}

interface MonitoringDashboardProps {
  onConfigureAlerts: () => void;
  onViewMetrics: (metricType: string) => void;
  onViewAlerts: () => void;
}

export function MonitoringDashboard({
  onConfigureAlerts,
  onViewMetrics,
  onViewAlerts
}: MonitoringDashboardProps) {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch system health
  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['systemHealth', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/monitoring/health?timeRange=${timeRange}`);
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch alert summary
  const { data: alertSummary, isLoading: alertsLoading } = useQuery({
    queryKey: ['alertSummary', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/monitoring/alerts/summary?timeRange=${timeRange}`);
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Fetch metrics trends
  const { data: metricsTrends, isLoading: metricsLoading } = useQuery({
    queryKey: ['metricsTrends', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/monitoring/metrics/trends?timeRange=${timeRange}`);
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch recent errors
  const { data: recentErrors, isLoading: errorsLoading } = useQuery({
    queryKey: ['recentErrors', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/monitoring/errors?timeRange=${timeRange}&limit=10`);
      return response.json();
    },
    refetchInterval: 30000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Trigger refetch of all queries
    window.location.reload();
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (healthLoading || alertsLoading || metricsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time system health and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {getHealthStatusIcon(systemHealth?.status)}
                  <span className={cn("text-sm font-medium", getHealthStatusColor(systemHealth?.status))}>
                    {systemHealth?.status?.toUpperCase()}
                  </span>
                </div>
              </div>
              <Server className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold">{systemHealth?.responseTime || 0}ms</p>
              </div>
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold">{systemHealth?.errorRate || 0}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{systemHealth?.activeUsers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Alert Summary
          </CardTitle>
          <CardDescription>
            Current alert status and recent activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{alertSummary?.critical || 0}</p>
              <p className="text-sm text-muted-foreground">Critical</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{alertSummary?.high || 0}</p>
              <p className="text-sm text-muted-foreground">High</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{alertSummary?.medium || 0}</p>
              <p className="text-sm text-muted-foreground">Medium</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{alertSummary?.resolved || 0}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onViewAlerts}>
              View All Alerts
            </Button>
            <Button variant="outline" onClick={onConfigureAlerts}>
              <Settings className="mr-2 h-4 w-4" />
              Configure Alerts
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricsTrends?.map((metric: MetricTrend) => (
          <Card key={metric.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                  <p className="text-2xl font-bold">{metric.value}{metric.unit}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getTrendIcon(metric.trend)}
                    <span className={cn("text-sm", getTrendColor(metric.trend))}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewMetrics(metric.name)}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Errors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Recent Errors
          </CardTitle>
          <CardDescription>
            Latest system errors and exceptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentErrors?.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">No recent errors</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentErrors?.map((error: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium text-sm">{error.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {error.type} • {formatDistanceToNow(new Date(error.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {error.severity}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common monitoring tasks and configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={onConfigureAlerts}>
              <Bell className="h-6 w-6" />
              <span>Configure Alerts</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => onViewMetrics('performance')}>
              <BarChart3 className="h-6 w-6" />
              <span>Performance Metrics</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => onViewMetrics('business')}>
              <DollarSign className="h-6 w-6" />
              <span>Business Metrics</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={onViewAlerts}>
              <Activity className="h-6 w-6" />
              <span>View All Alerts</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}