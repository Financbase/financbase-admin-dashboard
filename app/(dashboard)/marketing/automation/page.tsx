"use client";

import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap,
  Plus,
  Play,
  Pause,
  Square,
  Edit,
  Trash2,
  MoreHorizontal,
  Settings,
  BarChart3,
  Users,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Filter,
  Search
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface Automation {
  id: string;
  name: string;
  description: string;
  type: 'email_sequence' | 'cart_recovery' | 'lead_nurturing' | 'onboarding';
  status: 'active' | 'paused' | 'draft' | 'completed';
  trigger: string;
  triggerConditions: Record<string, any>;
  actions: Array<{
    id: string;
    type: string;
    delay: number;
    template?: string;
    subject?: string;
    crmField?: string;
    value?: string;
    taskType?: string;
    assignedTo?: string;
  }>;
  metrics: {
    totalRuns: number;
    successRate: number;
    averageEngagement: number;
    conversionRate: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface AutomationStats {
  totalAutomations: number;
  activeAutomations: number;
  pausedAutomations: number;
  draftAutomations: number;
  totalRuns: number;
  averageSuccessRate: number;
  averageConversionRate: number;
}

export default function MarketingAutomationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedAutomation, setSelectedAutomation] = useState<string | null>(null);

  // Fetch automation data
  const { data: automationData, isLoading, error } = useQuery({
    queryKey: ['marketing-automation', searchQuery, statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);

      const response = await fetch(`/api/marketing/automation?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch automation data');
      return response.json();
    },
  });

  const automations: Automation[] = automationData?.automations || [];
  const stats: AutomationStats = automationData?.stats || {
    totalAutomations: 0,
    activeAutomations: 0,
    pausedAutomations: 0,
    draftAutomations: 0,
    totalRuns: 0,
    averageSuccessRate: 0,
    averageConversionRate: 0
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'draft':
        return 'outline';
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4" />;
      case 'paused':
        return <Pause className="h-4 w-4" />;
      case 'draft':
        return <Edit className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email_sequence':
        return <Mail className="h-4 w-4" />;
      case 'cart_recovery':
        return <Square className="h-4 w-4" />;
      case 'lead_nurturing':
        return <Users className="h-4 w-4" />;
      case 'onboarding':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const handleAutomationAction = async (action: string, automationId: string) => {
    try {
      const response = await fetch('/api/marketing/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, automationId })
      });
      
      if (response.ok) {
        console.log(`${action} action completed`);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            Error loading automation data: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Marketing Automation
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Create and manage automated marketing workflows
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Automation
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Total Automations
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.totalAutomations}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {stats.activeAutomations} active
                  </p>
                </div>
                <Zap className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Total Runs
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.totalRuns.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    All time
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.averageSuccessRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Average
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Conversion Rate
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.averageConversionRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Average
                  </p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search automations..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md bg-white dark:bg-slate-800"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="px-3 py-2 border rounded-md bg-white dark:bg-slate-800"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
              </select>
              <select 
                className="px-3 py-2 border rounded-md bg-white dark:bg-slate-800"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="email_sequence">Email Sequence</option>
                <option value="cart_recovery">Cart Recovery</option>
                <option value="lead_nurturing">Lead Nurturing</option>
                <option value="onboarding">Onboarding</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Automations List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Marketing Automations
                </CardTitle>
                <CardDescription>
                  Manage your automated marketing workflows
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {automations.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    No automations found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Create your first automation to start engaging customers automatically.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Automation
                  </Button>
                </div>
              ) : (
                automations.map((automation) => (
                  <div
                    key={automation.id}
                    className="p-6 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                          {getTypeIcon(automation.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-lg">{automation.name}</h3>
                            <Badge
                              variant={getStatusBadgeVariant(automation.status)}
                              className="text-xs"
                            >
                              <div className="flex items-center gap-1">
                                {getStatusIcon(automation.status)}
                                {automation.status}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {automation.description}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Trigger: {automation.trigger} • {automation.actions.length} actions • Created by {automation.createdBy}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {automation.status === 'draft' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleAutomationAction('activate', automation.id)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Activate
                          </Button>
                        )}
                        {automation.status === 'active' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAutomationAction('pause', automation.id)}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        )}
                        {automation.status === 'paused' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleAutomationAction('activate', automation.id)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Total Runs</p>
                        <p className="font-medium">{automation.metrics.totalRuns.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Success Rate</p>
                        <p className="font-medium">{automation.metrics.successRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Engagement</p>
                        <p className="font-medium">{automation.metrics.averageEngagement.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Conversion Rate</p>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          {automation.metrics.conversionRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Actions Preview */}
                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                        Workflow Actions:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {automation.actions.slice(0, 3).map((action, index) => (
                          <Badge key={action.id} variant="outline" className="text-xs">
                            {index + 1}. {action.type.replace('_', ' ')}
                            {action.delay > 0 && ` (+${Math.floor(action.delay / 3600)}h)`}
                          </Badge>
                        ))}
                        {automation.actions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{automation.actions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Automation Templates */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Automation Templates</CardTitle>
              <CardDescription>
                Quick-start templates for common marketing workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <h4 className="font-medium">Welcome Series</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    3-email welcome sequence for new subscribers
                  </p>
                </div>
                <div className="p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <Square className="h-5 w-5 text-green-500" />
                    <h4 className="font-medium">Cart Recovery</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Recover abandoned carts with targeted emails
                  </p>
                </div>
                <div className="p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    <h4 className="font-medium">Lead Nurturing</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Nurture leads through the sales funnel
                  </p>
                </div>
                <div className="p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="h-5 w-5 text-orange-500" />
                    <h4 className="font-medium">Customer Onboarding</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Guide new customers through onboarding
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}