/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Users, 
  Activity,
  Download,
  Settings,
  Bell,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { AuditLogViewer } from './audit-log-viewer';
import { SecurityEventsList } from './security-events-list';
import { ComplianceReports } from './compliance-reports';
import { MFASettings } from './mfa-settings';

interface SecurityEvent {
  id: string | number;
  eventType: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string | Date;
  isResolved: boolean;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  details?: Record<string, unknown>;
}

export function SecurityDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch security overview data
  const { data: securityOverview, isLoading: overviewLoading } = useQuery({
    queryKey: ['security-overview'],
    queryFn: async () => {
      const response = await fetch('/api/security/overview');
      return response.json();
    },
  });

  // Fetch security events
  const { data: securityEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const response = await fetch('/api/security/events');
      const data = await response.json();
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
  });

  // Fetch audit statistics
  const { data: auditStats, isLoading: statsLoading } = useQuery({
    queryKey: ['audit-statistics'],
    queryFn: async () => {
      const response = await fetch('/api/security/audit-statistics');
      return response.json();
    },
  });

  if (overviewLoading || eventsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getSecurityScore = () => {
    if (!securityOverview) return 0;
    
    const { mfaEnabled, auditLogging, dataEncryption, accessControls } = securityOverview;
    let score = 0;
    
    if (mfaEnabled) score += 25;
    if (auditLogging) score += 25;
    if (dataEncryption) score += 25;
    if (accessControls) score += 25;
    
    return score;
  };

  const getSecurityLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (score >= 70) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (score >= 50) return { level: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { level: 'Poor', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const securityScore = getSecurityScore();
  const securityLevel = getSecurityLevel(securityScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor security events, audit logs, and compliance status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Security Settings
          </Button>
        </div>
      </div>

      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Score
          </CardTitle>
          <CardDescription>
            Overall security posture assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{securityScore}/100</span>
              <Badge className={cn("text-sm", securityLevel.color, securityLevel.bgColor)}>
                {securityLevel.level}
              </Badge>
            </div>
            <Progress value={securityScore} className="h-2" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">MFA</div>
                <div className="font-semibold">
                  {securityOverview?.mfaEnabled ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Audit Logging</div>
                <div className="font-semibold">
                  {securityOverview?.auditLogging ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Encryption</div>
                <div className="font-semibold">
                  {securityOverview?.dataEncryption ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Access Controls</div>
                <div className="font-semibold">
                  {securityOverview?.accessControls ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      {Array.isArray(securityEvents) && securityEvents.filter((event: SecurityEvent) => event.severity === 'high' || event.severity === 'critical').length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle>Security Alerts</AlertTitle>
          <AlertDescription>
            {Array.isArray(securityEvents) ? securityEvents.filter((event: SecurityEvent) => event.severity === 'high' || event.severity === 'critical').length : 0} high-priority security events require attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Security Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityOverview?.activeUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Events</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityEvents?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingDown className="h-3 w-3 inline mr-1" />
                  -5% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auditStats?.totalEvents || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MFA Enabled</CardTitle>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {securityOverview?.mfaEnabledUsers || 0}/{securityOverview?.totalUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(((securityOverview?.mfaEnabledUsers || 0) / (securityOverview?.totalUsers || 1)) * 100)}% adoption
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Security Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Security Events
              </CardTitle>
              <CardDescription>
                Latest security events and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(securityEvents) && securityEvents.slice(0, 5).map((event: SecurityEvent) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        event.severity === 'critical' ? 'bg-red-500' :
                        event.severity === 'high' ? 'bg-orange-500' :
                        event.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      )} />
                      <div>
                        <div className="font-medium">{event.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.eventType} • {new Date(event.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant={event.isResolved ? 'secondary' : 'destructive'}>
                      {event.isResolved ? 'Resolved' : 'Active'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <SecurityEventsList />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogViewer />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceReports />
        </TabsContent>

        <TabsContent value="settings">
          <MFASettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}