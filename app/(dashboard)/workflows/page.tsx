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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { 
  Plus, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  Settings, 
  Trash2, 
  Copy,
  Zap,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

import { WorkflowBuilder } from '@/components/workflows/workflow-builder';
import { WorkflowCanvas } from '@/components/workflows/workflow-canvas';
import { StepConfigurator } from '@/components/workflows/step-configurator';
import { TriggerConfigurator } from '@/components/workflows/trigger-configurator';
import { ExecutionHistory } from '@/components/workflows/execution-history';
import { WorkflowTemplates } from '@/components/workflows/workflow-templates';

interface Workflow {
  id: number;
  name: string;
  description: string;
  category: string;
  type: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  isActive: boolean;
  steps: any[];
  triggers: any[];
  executionCount: number;
  successCount: number;
  failureCount: number;
  lastExecutionAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function WorkflowsPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedStep, setSelectedStep] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('workflows');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch workflows
  const { data: workflows = [], isLoading, refetch } = useQuery({
    queryKey: ['workflows', searchTerm, statusFilter, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
      });
      
      const response = await fetch(`/api/workflows?${params}`);
      return response.json();
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'draft': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'archived': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'archived': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCreateWorkflow = () => {
    setSelectedWorkflow(null);
    setActiveTab('builder');
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setActiveTab('builder');
  };

  const handleViewExecution = (execution: any) => {
    console.log('View execution:', execution);
  };

  const handleRerunExecution = (execution: any) => {
    console.log('Rerun execution:', execution);
  };

  const handleUseTemplate = (template: any) => {
    console.log('Use template:', template);
    setActiveTab('builder');
  };

  const handleCreateFromTemplate = (template: any) => {
    console.log('Create from template:', template);
    setActiveTab('builder');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflows & Automations</h1>
          <p className="text-muted-foreground">
            Automate your business processes with powerful workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateWorkflow}>
            <Plus className="mr-2 h-4 w-4" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Workflows List */}
        <TabsContent value="workflows" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="reporting">Reporting</SelectItem>
                <SelectItem value="automation">Automation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Workflows Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : workflows.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">No Workflows</h4>
                  <p className="text-muted-foreground mb-4">
                    Create your first workflow to automate business processes
                  </p>
                  <Button onClick={handleCreateWorkflow}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Workflow
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflows.map((workflow: Workflow) => (
                <Card 
                  key={workflow.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleEditWorkflow(workflow)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {workflow.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(workflow.status)}
                        <Badge className={cn("text-xs", getStatusColor(workflow.status))}>
                          {workflow.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Workflow Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          <span>{workflow.executionCount} runs</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>{workflow.successCount} success</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{workflow.failureCount} failed</span>
                        </div>
                      </div>

                      {/* Workflow Details */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div>{workflow.steps.length} steps</div>
                        <div>{workflow.triggers.length} triggers</div>
                        <div className="capitalize">{workflow.category}</div>
                      </div>

                      {/* Last Execution */}
                      {workflow.lastExecutionAt && (
                        <div className="text-xs text-muted-foreground">
                          Last run: {formatDistanceToNow(new Date(workflow.lastExecutionAt), { addSuffix: true })}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditWorkflow(workflow);
                          }}
                        >
                          <Settings className="mr-2 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle duplicate
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle delete
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Workflow Builder */}
        <TabsContent value="builder" className="space-y-4">
          <WorkflowBuilder />
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-4">
          <WorkflowTemplates 
            onUseTemplate={handleUseTemplate}
            onCreateFromTemplate={handleCreateFromTemplate}
          />
        </TabsContent>

        {/* Executions */}
        <TabsContent value="executions" className="space-y-4">
          {selectedWorkflow ? (
            <ExecutionHistory 
              workflowId={selectedWorkflow.id}
              onViewExecution={handleViewExecution}
              onRerunExecution={handleRerunExecution}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">Select a Workflow</h4>
                  <p className="text-muted-foreground">
                    Choose a workflow to view its execution history
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Settings</CardTitle>
              <CardDescription>
                Configure global workflow settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Execution Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure how workflows are executed and monitored
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Notification Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Set up notifications for workflow events
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Integration Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure external service integrations
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
