"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonitoringDashboard } from '@/components/monitoring/monitoring-dashboard';
import { AlertConfiguration } from '@/components/monitoring/alert-configuration';
import { 
  Activity, 
  Bell, 
  BarChart3, 
  Settings,
  AlertTriangle,
  TrendingUp,
  Server,
  Database
} from 'lucide-react';

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleConfigureAlerts = () => {
    setActiveTab('alerts');
  };

  const handleViewMetrics = (metricType: string) => {
    console.log('View metrics:', metricType);
    // In a real implementation, this would navigate to a detailed metrics view
  };

  const handleViewAlerts = () => {
    setActiveTab('alerts');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor system health, performance metrics, and alerts
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <MonitoringDashboard 
            onConfigureAlerts={handleConfigureAlerts}
            onViewMetrics={handleViewMetrics}
            onViewAlerts={handleViewAlerts}
          />
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <AlertConfiguration onViewAlerts={handleViewAlerts} />
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Detailed performance and system metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">Metrics Dashboard</h4>
                <p className="text-muted-foreground">
                  Detailed metrics and charts will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Monitoring Settings
              </CardTitle>
              <CardDescription>
                Configure monitoring preferences and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Alert Thresholds</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure default alert thresholds for system metrics
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Notification Channels</h4>
                  <p className="text-sm text-muted-foreground">
                    Set up email, Slack, and webhook notifications
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Data Retention</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure how long to keep monitoring data
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Performance Monitoring</h4>
                  <p className="text-sm text-muted-foreground">
                    Enable/disable specific performance monitoring features
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
