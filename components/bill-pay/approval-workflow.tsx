/**
 * Approval Workflow Management Component
 * Multi-level approval chains with role-based and threshold-based approvals
 * Uses battle-tested patterns: atomic components, optimistic UI, comprehensive validation
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Users,
  DollarSign,
  MessageSquare,
  Edit,
  Plus,
  Trash2,
  Eye,
  Send,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { billPayService } from '@/lib/services/bill-pay/bill-pay-service';
import type {
  BillApproval,
  ApprovalWorkflow,
  ApprovalStep,
  Bill
} from '@/lib/services/bill-pay/bill-pay-service';

// Approval workflow schema
const workflowSchema = z.object({
  name: z.string().min(1, 'Workflow name is required'),
  description: z.string().optional(),
  amountThreshold: z.number().min(0, 'Amount threshold must be positive'),
  vendorCategories: z.array(z.string()).min(1, 'At least one category required'),
  steps: z.array(z.object({
    name: z.string().min(1, 'Step name is required'),
    type: z.enum(['user', 'role', 'auto_approve']),
    approverId: z.string().optional(),
    role: z.string().optional(),
    threshold: z.number().optional(),
    order: z.number().min(1)
  })).min(1, 'At least one approval step required')
});

type WorkflowFormData = z.infer<typeof workflowSchema>;

interface ApprovalWorkflowProps {
  userId: string;
  billId?: string;
  className?: string;
}

export function ApprovalWorkflowDashboard({ userId, billId, className }: ApprovalWorkflowProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch approval workflows
  const { data: workflows, isLoading: workflowsLoading } = useQuery({
    queryKey: ['approval-workflows', userId],
    queryFn: async () => {
      const response = await fetch(`/api/approval-workflows?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch workflows');
      return response.json().then(data => data.workflows || []);
    }
  });

  // Fetch pending approvals
  const { data: pendingApprovals, isLoading: approvalsLoading } = useQuery({
    queryKey: ['pending-approvals', userId],
    queryFn: async () => {
      const response = await fetch(`/api/approvals/pending?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch approvals');
      return response.json().then(data => data.approvals || []);
    }
  });

  // Create workflow mutation
  const createWorkflowMutation = useMutation({
    mutationFn: async (workflowData: WorkflowFormData) => {
      const response = await fetch('/api/approval-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData)
      });
      if (!response.ok) throw new Error('Failed to create workflow');
      return response.json().then(data => data.workflow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflows'] });
      setShowCreateWorkflow(false);
    }
  });

  // Approve/reject mutation
  const processApprovalMutation = useMutation({
    mutationFn: async ({
      approvalId,
      decision,
      comments
    }: {
      approvalId: string;
      decision: 'approve' | 'reject';
      comments?: string;
    }) => {
      return await billPayService.processApproval(userId, approvalId, decision, comments);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      setShowApprovalDialog(null);
    }
  });

  const workflowForm = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: '',
      description: '',
      amountThreshold: 1000,
      vendorCategories: [],
      steps: []
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'escalated':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Approval Workflows</h1>
          <p className="text-muted-foreground">
            Manage bill approval processes and pending approvals
          </p>
        </div>

        <Button onClick={() => setShowCreateWorkflow(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approvals ({pendingApprovals?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="workflows">
            Workflows ({workflows?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {approvalsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Loading approvals...</span>
            </div>
          ) : pendingApprovals?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <h3 className="text-lg font-medium">No Pending Approvals</h3>
                <p className="text-muted-foreground">
                  All bills have been processed or are waiting for approval.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map(approval => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  onApprove={(comments) => {
                    processApprovalMutation.mutate({
                      approvalId: approval.id,
                      decision: 'approve',
                      comments
                    });
                  }}
                  onReject={(comments) => {
                    processApprovalMutation.mutate({
                      approvalId: approval.id,
                      decision: 'reject',
                      comments
                    });
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          {workflowsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Loading workflows...</span>
            </div>
          ) : (
            <div className="grid gap-4">
              {workflows?.map(workflow => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onEdit={() => setSelectedWorkflow(workflow.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateWorkflow} onOpenChange={setShowCreateWorkflow}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Approval Workflow</DialogTitle>
            <DialogDescription>
              Set up rules and steps for bill approval processes
            </DialogDescription>
          </DialogHeader>

          <WorkflowForm
            form={workflowForm}
            onSubmit={(data) => {
              createWorkflowMutation.mutate(data);
            }}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateWorkflow(false)}>
              Cancel
            </Button>
            <Button
              onClick={workflowForm.handleSubmit((data) => {
                createWorkflowMutation.mutate(data);
              })}
              disabled={createWorkflowMutation.isPending}
            >
              {createWorkflowMutation.isPending ? 'Creating...' : 'Create Workflow'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Decision Dialog */}
      <Dialog open={!!showApprovalDialog} onOpenChange={() => setShowApprovalDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approval Decision</DialogTitle>
            <DialogDescription>
              Review and approve or reject this bill
            </DialogDescription>
          </DialogHeader>

          {showApprovalDialog && (
            <ApprovalDecisionForm
              approvalId={showApprovalDialog}
              onApprove={(comments) => {
                processApprovalMutation.mutate({
                  approvalId: showApprovalDialog,
                  decision: 'approve',
                  comments
                });
              }}
              onReject={(comments) => {
                processApprovalMutation.mutate({
                  approvalId: showApprovalDialog,
                  decision: 'reject',
                  comments
                });
              }}
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Individual approval card component
interface ApprovalCardProps {
  approval: BillApproval;
  onApprove: (comments?: string) => void;
  onReject: (comments?: string) => void;
}

function ApprovalCard({ approval, onApprove, onReject }: ApprovalCardProps) {
  const { data: bill } = useQuery({
    queryKey: ['bill', approval.billId],
    queryFn: async () => {
      const response = await fetch(`/api/bills/${approval.billId}`);
      if (!response.ok) throw new Error('Failed to fetch bill');
      return response.json().then(data => data.bill);
    }
  });

  const { data: workflow } = useQuery({
    queryKey: ['workflow', approval.workflowId],
    queryFn: async () => {
      const response = await fetch(`/api/approval-workflows/${approval.workflowId}`);
      if (!response.ok) throw new Error('Failed to fetch workflow');
      return response.json().then(data => data.workflow);
    }
  });

  const currentStep = approval.steps[approval.currentStep];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>

            <div>
              <CardTitle className="text-lg">{bill?.description || 'Bill Approval'}</CardTitle>
              <CardDescription>
                {bill ? formatCurrency(bill.amount) : 'Loading...'} •
                Due: {bill ? formatDate(bill.dueDate) : 'Loading...'}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(approval.status)}>
              {approval.status.replace('_', ' ')}
            </Badge>

            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {formatDate(approval.initiatedAt)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Step */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
              {approval.currentStep + 1}
            </div>
            <span className="font-medium">{currentStep?.name || 'Unknown Step'}</span>
            <Badge variant="outline" className="text-xs">
              {currentStep?.type.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            {currentStep?.approvedBy && (
              <span className="text-xs text-muted-foreground">
                Approved by {currentStep.approvedBy}
              </span>
            )}

            {currentStep?.approvedAt && (
              <span className="text-xs text-muted-foreground">
                {formatDate(currentStep.approvedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Approval Steps</h4>
          <div className="space-y-1">
            {approval.steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded",
                  index === approval.currentStep ? "bg-primary/10 border border-primary/20" : "bg-muted/30"
                )}
              >
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-xs",
                    index === approval.currentStep ? "bg-primary text-primary-foreground" :
                    step.status === 'approved' ? "bg-green-100 text-green-800" :
                    step.status === 'rejected' ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  )}>
                    {step.status === 'approved' ? <CheckCircle className="h-3 w-3" /> :
                     step.status === 'rejected' ? <AlertTriangle className="h-3 w-3" /> :
                     index + 1}
                  </div>

                  <span className="text-sm font-medium">{step.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {step.type.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="flex items-center space-x-2">
                  {step.approvedBy && (
                    <span className="text-xs text-muted-foreground">
                      {step.approvedBy}
                    </span>
                  )}

                  {step.status !== 'pending' && (
                    <Badge className={getStepStatusColor(step.status)}>
                      {step.status}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onReject()}
            disabled={processApprovalMutation.isPending}
          >
            <ThumbsDown className="h-4 w-4 mr-2" />
            Reject
          </Button>

          <Button
            onClick={() => onApprove()}
            disabled={processApprovalMutation.isPending}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Workflow card component
interface WorkflowCardProps {
  workflow: ApprovalWorkflow;
  onEdit: () => void;
}

function WorkflowCard({ workflow, onEdit }: WorkflowCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{workflow.name}</CardTitle>
            <CardDescription>{workflow.description}</CardDescription>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
              {workflow.status}
            </Badge>

            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Conditions */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium mb-1">Amount Threshold</div>
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono">{formatCurrency(workflow.conditions.amountThreshold)}</span>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-1">Vendor Categories</div>
            <div className="flex flex-wrap gap-1">
              {workflow.conditions.vendorCategories.map(category => (
                <Badge key={category} variant="outline" className="text-xs">
                  {category.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div>
          <div className="text-sm font-medium mb-2">Approval Steps</div>
          <div className="space-y-1">
            {workflow.steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                  {index + 1}
                </div>
                <span className="text-sm font-medium">{step.name}</span>
                <Badge variant="outline" className="text-xs">
                  {step.type.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Created: {formatDate(workflow.createdAt)}</span>
          <span>Updated: {formatDate(workflow.updatedAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Workflow creation form component
interface WorkflowFormProps {
  form: any;
  onSubmit: (data: WorkflowFormData) => void;
}

function WorkflowForm({ form, onSubmit }: WorkflowFormProps) {
  const [steps, setSteps] = useState<Array<{ id: string; name: string; type: string; order: number }>>([]);

  const addStep = () => {
    const newStep = {
      id: crypto.randomUUID(),
      name: '',
      type: 'user',
      order: steps.length + 1
    };
    setSteps(prev => [...prev, newStep]);
  };

  const removeStep = (stepId: string) => {
    setSteps(prev => prev.filter(s => s.id !== stepId));
  };

  const updateStep = (stepId: string, updates: any) => {
    setSteps(prev => prev.map(s =>
      s.id === stepId ? { ...s, ...updates } : s
    ));
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Workflow Name</label>
          <input
            {...form.register('name')}
            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
            placeholder="Manager Approval Workflow"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <input
            {...form.register('description')}
            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
            placeholder="Optional description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Amount Threshold</label>
            <input
              {...form.register('amountThreshold', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              placeholder="1000.00"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Vendor Categories</label>
            <Select
              value={form.watch('vendorCategories')?.[0] || ''}
              onValueChange={(value) => form.setValue('vendorCategories', [value])}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="office_supplies">Office Supplies</SelectItem>
                <SelectItem value="software">Software</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="professional_services">Professional Services</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Approval Steps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Approval Steps</h3>
          <Button type="button" variant="outline" size="sm" onClick={addStep}>
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </div>

        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center space-x-2 p-3 border rounded">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                {index + 1}
              </div>

              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  value={step.name}
                  onChange={(e) => updateStep(step.id, { name: e.target.value })}
                  className="px-2 py-1 border rounded text-sm"
                  placeholder="Step name"
                />

                <Select
                  value={step.type}
                  onValueChange={(value) => updateStep(step.id, { type: value })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Specific User</SelectItem>
                    <SelectItem value="role">Role-based</SelectItem>
                    <SelectItem value="auto_approve">Auto-approve</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeStep(step.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {steps.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No approval steps added yet
            </div>
          )}
        </div>
      </div>

      {/* Hidden field to pass steps to form */}
      <input
        type="hidden"
        {...form.register('steps')}
        value={JSON.stringify(steps)}
      />

      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          This workflow will be applied to bills that meet the specified conditions.
          Users will receive notifications when bills require their approval.
        </AlertDescription>
      </Alert>
    </form>
  );
}

// Approval decision form component
interface ApprovalDecisionFormProps {
  approvalId: string;
  onApprove: (comments?: string) => void;
  onReject: (comments?: string) => void;
}

function ApprovalDecisionForm({ approvalId, onApprove, onReject }: ApprovalDecisionFormProps) {
  const [comments, setComments] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Comments (Optional)</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
          placeholder="Add any comments or notes about this approval decision"
          rows={3}
        />
      </div>

      <Alert>
        <MessageSquare className="h-4 w-4" />
        <AlertDescription>
          Your decision will be recorded in the audit log and the next approver will be notified.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => onReject(comments || undefined)}
          disabled={processApprovalMutation.isPending}
        >
          <ThumbsDown className="h-4 w-4 mr-2" />
          Reject
        </Button>

        <Button
          onClick={() => onApprove(comments || undefined)}
          disabled={processApprovalMutation.isPending}
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          Approve
        </Button>
      </div>
    </div>
  );
}
