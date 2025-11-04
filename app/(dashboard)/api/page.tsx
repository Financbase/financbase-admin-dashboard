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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Globe,
  Code,
  Database,
  Key,
  Activity,
  Clock,
  BarChart3,
  Zap,
  Shield,
  BookOpen,
  Download,
  Play,
  Settings,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  Server,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Copy,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock
} from 'lucide-react';

interface APIEndpoint {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  category: string;
  status: 'active' | 'beta' | 'deprecated';
  version: string;
  rateLimit: string;
  documentation: string;
}

interface APIStats {
  totalEndpoints: number;
  activeEndpoints: number;
  uptime: number;
  averageResponseTime: number;
  totalRequests: number;
  successRate: number;
}

interface WebhookEvent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  lastTriggered?: string;
  triggerCount: number;
}

export default function APIHubPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [apiStats, setApiStats] = useState<APIStats>({
    totalEndpoints: 0,
    activeEndpoints: 0,
    uptime: 0,
    averageResponseTime: 0,
    totalRequests: 0,
    successRate: 0
  });

  const [webhooks, setWebhooks] = useState<WebhookEvent[]>([]);

  // Sample data
  const sampleEndpoints: APIEndpoint[] = [
    {
      id: '1',
      name: 'Get Invoices',
      description: 'Retrieve a list of invoices',
      method: 'GET',
      path: '/api/v1/invoices',
      category: 'Financial',
      status: 'active',
      version: 'v1.2.0',
      rateLimit: '1000/hour',
      documentation: '/docs/invoices'
    },
    {
      id: '2',
      name: 'Create Invoice',
      description: 'Create a new invoice',
      method: 'POST',
      path: '/api/v1/invoices',
      category: 'Financial',
      status: 'active',
      version: 'v1.2.0',
      rateLimit: '100/hour',
      documentation: '/docs/invoices'
    },
    {
      id: '3',
      name: 'Get Clients',
      description: 'Retrieve client information',
      method: 'GET',
      path: '/api/v1/clients',
      category: 'Clients',
      status: 'active',
      version: 'v1.1.0',
      rateLimit: '2000/hour',
      documentation: '/docs/clients'
    }
  ];

  const sampleWebhooks: WebhookEvent[] = [
    {
      id: '1',
      name: 'Invoice Generated',
      description: 'Triggered when new invoices are created',
      status: 'active',
      lastTriggered: '2024-01-15T10:30:00Z',
      triggerCount: 1542
    },
    {
      id: '2',
      name: 'Payment Received',
      description: 'Notified when payments are processed',
      status: 'active',
      lastTriggered: '2024-01-15T09:15:00Z',
      triggerCount: 892
    },
    {
      id: '3',
      name: 'Sync Error',
      description: 'Alerted when synchronization fails',
      status: 'inactive',
      lastTriggered: '2024-01-14T16:45:00Z',
      triggerCount: 23
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
        
        setWebhooks(sampleWebhooks);
        
        // Calculate stats
        const stats = {
          totalEndpoints: sampleEndpoints.length,
          activeEndpoints: sampleEndpoints.filter(ep => ep.status === 'active').length,
          uptime: 99.9,
          averageResponseTime: 245,
          totalRequests: 2100000,
          successRate: 99.8
        };
        setApiStats(stats);
      } catch (err) {
        setError('Failed to load API data. Please try again.');
        console.error('Error loading API data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateWebhook = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate webhook creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newWebhook: WebhookEvent = {
        id: Date.now().toString(),
        name: 'New Webhook',
        description: 'Newly created webhook event',
        status: 'active',
        triggerCount: 0
      };
      
      setWebhooks(prev => [...prev, newWebhook]);
    } catch (err) {
      setError('Failed to create webhook. Please try again.');
      console.error('Error creating webhook:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWebhook = async (webhookId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate webhook toggle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setWebhooks(prev => prev.map(webhook => 
        webhook.id === webhookId 
          ? { 
              ...webhook, 
              status: webhook.status === 'active' ? 'inactive' : 'active' 
            }
          : webhook
      ));
    } catch (err) {
      setError('Failed to toggle webhook. Please try again.');
      console.error('Error toggling webhook:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    
    setLoading(true);
    setError(null);
    try {
      // Simulate webhook deletion
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
    } catch (err) {
      setError('Failed to delete webhook. Please try again.');
      console.error('Error deleting webhook:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8" />
            API Hub & Integration Center
          </h1>
          <p className="text-muted-foreground">
            Comprehensive API ecosystem with 13+ partner integrations and developer tools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <BookOpen className="mr-2 h-4 w-4" />
            API Documentation
          </Button>
          <Button>
            <Key className="mr-2 h-4 w-4" />
            Get API Key
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">API Endpoints</p>
                <p className="text-xl font-bold">{loading ? '...' : `${apiStats.totalEndpoints}+`}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-xl font-bold">{loading ? '...' : `${apiStats.uptime}%`}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Developers</p>
                <p className="text-xl font-bold">2,500+</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Requests/Month</p>
                <p className="text-xl font-bold">{loading ? '...' : `${(apiStats.totalRequests / 1000000).toFixed(1)}M+`}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="integrations">Partner APIs</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
          <TabsTrigger value="changelog">Changelog</TabsTrigger>
          <TabsTrigger value="status">API Status</TabsTrigger>
        </TabsList>

        {/* Partner APIs */}
        <TabsContent value="integrations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Banking & Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  Banking & Payments
                </CardTitle>
                <CardDescription>Connect with major payment processors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Stripe', status: 'Active', version: 'v1.2.0', docs: '/api/stripe' },
                  { name: 'PayPal', status: 'Active', version: 'v2.1.0', docs: '/api/paypal' },
                  { name: 'Square', status: 'Beta', version: 'v1.0.0', docs: '/api/square' },
                  { name: 'Wise', status: 'Coming Soon', version: '-', docs: '/api/wise' },
                ].map((api) => (
                  <div key={api.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Database className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{api.name}</p>
                        <p className="text-xs text-muted-foreground">{api.version}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        api.status === 'Active' ? 'default' :
                        api.status === 'Beta' ? 'secondary' : 'outline'
                      }>
                        {api.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Accounting & Finance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Accounting & Finance
                </CardTitle>
                <CardDescription>Integrate with accounting platforms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'QuickBooks Online', status: 'Active', version: 'v3.0.0', docs: '/api/quickbooks' },
                  { name: 'Xero', status: 'Active', version: 'v2.1.0', docs: '/api/xero' },
                  { name: 'FreshBooks', status: 'Coming Soon', version: '-', docs: '/api/freshbooks' },
                  { name: 'NetSuite', status: 'Coming Soon', version: '-', docs: '/api/netsuite' },
                ].map((api) => (
                  <div key={api.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{api.name}</p>
                        <p className="text-xs text-muted-foreground">{api.version}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        api.status === 'Active' ? 'default' :
                        api.status === 'Beta' ? 'secondary' : 'outline'
                      }>
                        {api.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* HR & Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  HR & Operations
                </CardTitle>
                <CardDescription>Connect with HR and productivity tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Gusto', status: 'Active', version: 'v1.1.0', docs: '/api/gusto' },
                  { name: 'BambooHR', status: 'Coming Soon', version: '-', docs: '/api/bamboohr' },
                  { name: 'ADP', status: 'Coming Soon', version: '-', docs: '/api/adp' },
                  { name: 'Slack', status: 'Beta', version: 'v1.0.0', docs: '/api/slack' },
                ].map((api) => (
                  <div key={api.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{api.name}</p>
                        <p className="text-xs text-muted-foreground">{api.version}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        api.status === 'Active' ? 'default' :
                        api.status === 'Beta' ? 'secondary' : 'outline'
                      }>
                        {api.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* API Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                API Features & Capabilities
              </CardTitle>
              <CardDescription>
                Comprehensive API coverage with real-time sync and enterprise security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Real-time Sync</h4>
                    <p className="text-sm text-muted-foreground">Live data synchronization with webhook support</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Enterprise Security</h4>
                    <p className="text-sm text-muted-foreground">SOC 2, GDPR compliant with OAuth 2.0</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Rate Limiting</h4>
                    <p className="text-sm text-muted-foreground">Intelligent rate limiting with usage analytics</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Multi-format Support</h4>
                    <p className="text-sm text-muted-foreground">JSON, XML, CSV export formats</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Version Control</h4>
                    <p className="text-sm text-muted-foreground">Backward compatible API versioning</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Developer Tools</h4>
                    <p className="text-sm text-muted-foreground">SDKs, CLI tools, and testing environments</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Webhook Management
              </CardTitle>
              <CardDescription>
                Configure webhooks for real-time event notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading webhooks...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          webhook.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {webhook.status === 'active' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{webhook.name}</p>
                          <p className="text-sm text-muted-foreground">{webhook.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span>Triggers: {webhook.triggerCount}</span>
                            {webhook.lastTriggered && (
                              <span>Last: {new Date(webhook.lastTriggered).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                          {webhook.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleToggleWebhook(webhook.id)}
                          disabled={loading}
                        >
                          {webhook.status === 'active' ? (
                            <>
                              <Lock className="h-4 w-4 mr-2" />
                              Disable
                            </>
                          ) : (
                            <>
                              <Unlock className="h-4 w-4 mr-2" />
                              Enable
                            </>
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteWebhook(webhook.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    className="w-full"
                    onClick={handleCreateWebhook}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Webhook
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rate Limits */}
        <TabsContent value="rate-limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Rate Limiting & Security
              </CardTitle>
              <CardDescription>
                Understand API limits and security measures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Rate Limits by Plan</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Free Plan</p>
                        <p className="text-sm text-muted-foreground">1,000 requests/hour</p>
                      </div>
                      <Badge variant="outline">Current</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Professional Plan</p>
                        <p className="text-sm text-muted-foreground">10,000 requests/hour</p>
                      </div>
                      <Button size="sm">Upgrade</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Enterprise Plan</p>
                        <p className="text-sm text-muted-foreground">100,000 requests/hour</p>
                      </div>
                      <Button size="sm">Contact Sales</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Security Features</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">OAuth 2.0 Authentication</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">API Key Management</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Request Signing</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">IP Whitelisting</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Audit Logging</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Changelog */}
        <TabsContent value="changelog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                API Changelog
              </CardTitle>
              <CardDescription>
                Latest updates and improvements to the API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border-l-4 border-green-500 bg-green-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge>v2.1.0</Badge>
                      <span className="text-sm text-muted-foreground">Nov 15, 2024</span>
                    </div>
                    <h4 className="font-medium mb-1">Enhanced Webhook Security</h4>
                    <p className="text-sm text-muted-foreground">
                      Added signature verification for webhook payloads and improved rate limiting for webhook endpoints.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border-l-4 border-blue-500 bg-blue-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge>v2.0.5</Badge>
                      <span className="text-sm text-muted-foreground">Nov 10, 2024</span>
                    </div>
                    <h4 className="font-medium mb-1">New Invoice API Endpoints</h4>
                    <p className="text-sm text-muted-foreground">
                      Added bulk invoice operations and enhanced invoice customization endpoints.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border-l-4 border-purple-500 bg-purple-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge>v2.0.0</Badge>
                      <span className="text-sm text-muted-foreground">Nov 1, 2024</span>
                    </div>
                    <h4 className="font-medium mb-1">Major API Redesign</h4>
                    <p className="text-sm text-muted-foreground">
                      Complete API redesign with improved performance, new endpoints, and enhanced documentation.
                    </p>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  View Full Changelog
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Status */}
        <TabsContent value="status" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>API Gateway</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <Badge>Operational</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Database</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <Badge>Operational</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Authentication</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <Badge>Operational</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Webhooks</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <Badge>Operational</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Avg Response Time</span>
                    <span className="font-medium">{loading ? '...' : `${apiStats.averageResponseTime}ms`}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Success Rate</span>
                    <span className="font-medium">{loading ? '...' : `${apiStats.successRate}%`}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Requests (24h)</span>
                    <span className="font-medium">{loading ? '...' : `${(apiStats.totalRequests / 1000000).toFixed(1)}M`}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Active Webhooks</span>
                    <span className="font-medium">{loading ? '...' : webhooks.filter(w => w.status === 'active').length}</span>
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
