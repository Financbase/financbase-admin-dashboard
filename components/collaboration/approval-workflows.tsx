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
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
	CheckCircle,
	XCircle,
	Clock,
	AlertTriangle,
	Plus,
	Settings,
	Users,
	FileText,
	DollarSign,
	Building2,
	MoreVertical,
	Search,
	Filter,
	ThumbsUp,
	ThumbsDown,
	MessageSquare,
	Calendar,
	Timer,
	Trash2
} from 'lucide-react';
import { ApprovalWorkflow, ApprovalRequest, ApprovalStep } from '@/types/auth';
import { workspaceService } from '@/lib/services/workspace-service';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ApprovalWorkflowManagerProps {
	workspaceId: string;
}

export function ApprovalWorkflowManager({ workspaceId }: ApprovalWorkflowManagerProps) {
	const { user } = useUser();
	const { toast } = useToast();
	const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
	const [requests, setRequests] = useState<ApprovalRequest[]>([]);
	const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null);
	const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
	const [loading, setLoading] = useState(true);
	const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
	const [showCreateRequest, setShowCreateRequest] = useState(false);
	const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
	const [workflowSteps, setWorkflowSteps] = useState<ApprovalStep[]>([]);

	// Form states
	const [newWorkflow, setNewWorkflow] = useState({
		name: '',
		description: '',
		type: 'expense_approval' as ApprovalWorkflow['type'],
	});

	const [newRequest, setNewRequest] = useState({
		title: '',
		description: '',
		priority: 'medium' as ApprovalRequest['priority'],
		dueDate: '',
	});

	useEffect(() => {
		loadWorkflowsAndRequests();
	}, [workspaceId]);

	const loadWorkflowsAndRequests = async () => {
		try {
			setLoading(true);
			const [workflowData, requestData] = await Promise.all([
				workspaceService.getApprovalWorkflows(workspaceId),
				workspaceService.getApprovalRequests(workspaceId),
			]);

			setWorkflows(workflowData);
			setRequests(requestData);
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to load approval data',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleCreateWorkflow = async () => {
		try {
			const workflow = await workspaceService.createApprovalWorkflow({
				...newWorkflow,
				workspaceId,
				steps: workflowSteps,
				isActive: true,
			});

			setWorkflows(prev => [...prev, workflow]);
			setShowCreateWorkflow(false);
			setNewWorkflow({ name: '', description: '', type: 'expense_approval' });
			setWorkflowSteps([]);

			toast({
				title: 'Success',
				description: 'Approval workflow created successfully',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to create workflow',
				variant: 'destructive',
			});
		}
	};

	const handleCreateRequest = async () => {
		if (!user?.id) {
			toast({
				title: 'Error',
				description: 'User not authenticated',
				variant: 'destructive',
			});
			return;
		}

		if (!selectedWorkflowId && workflows.length > 0) {
			toast({
				title: 'Error',
				description: 'Please select a workflow',
				variant: 'destructive',
			});
			return;
		}

		try {
			const request = await workspaceService.createApprovalRequest({
				...newRequest,
				workflowId: selectedWorkflowId || workflows[0]?.id || '',
				workspaceId,
				requestedBy: user.id,
				metadata: {},
			});

			setRequests(prev => [...prev, request]);
			setShowCreateRequest(false);
			setNewRequest({ title: '', description: '', priority: 'medium', dueDate: '' });
			setSelectedWorkflowId('');

			toast({
				title: 'Success',
				description: 'Approval request created successfully',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to create request',
				variant: 'destructive',
			});
		}
	};

	const handleApproveRequest = async (requestId: string) => {
		if (!user?.id) {
			toast({
				title: 'Error',
				description: 'User not authenticated',
				variant: 'destructive',
			});
			return;
		}

		try {
			await workspaceService.approveRequest(workspaceId, requestId, user.id);
			await loadWorkflowsAndRequests();

			toast({
				title: 'Success',
				description: 'Request approved successfully',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to approve request',
				variant: 'destructive',
			});
		}
	};

	const handleRejectRequest = async (requestId: string, reason?: string) => {
		if (!user?.id) {
			toast({
				title: 'Error',
				description: 'User not authenticated',
				variant: 'destructive',
			});
			return;
		}

		try {
			await workspaceService.rejectRequest(workspaceId, requestId, user.id, reason);
			await loadWorkflowsAndRequests();

			toast({
				title: 'Success',
				description: 'Request rejected successfully',
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to reject request',
				variant: 'destructive',
			});
		}
	};

	const getStatusIcon = (status: ApprovalRequest['status']) => {
		switch (status) {
			case 'pending':
				return <Clock className="h-4 w-4 text-yellow-600" />;
			case 'approved':
				return <CheckCircle className="h-4 w-4 text-green-600" />;
			case 'rejected':
				return <XCircle className="h-4 w-4 text-red-600" />;
			case 'cancelled':
				return <XCircle className="h-4 w-4 text-gray-600" />;
			default:
				return <Clock className="h-4 w-4 text-gray-600" />;
		}
	};

	const getStatusColor = (status: ApprovalRequest['status']) => {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'approved':
				return 'bg-green-100 text-green-800';
			case 'rejected':
				return 'bg-red-100 text-red-800';
			case 'cancelled':
				return 'bg-gray-100 text-gray-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getPriorityColor = (priority: ApprovalRequest['priority']) => {
		switch (priority) {
			case 'urgent':
				return 'bg-red-100 text-red-800';
			case 'high':
				return 'bg-orange-100 text-orange-800';
			case 'medium':
				return 'bg-blue-100 text-blue-800';
			case 'low':
				return 'bg-gray-100 text-gray-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="text-center">
					<CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<p className="text-muted-foreground">Loading approval workflows...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Approval Workflows</h2>
					<p className="text-muted-foreground">
						Manage approval processes for expenses, invoices, and documents
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => setShowCreateWorkflow(true)}>
						<Settings className="mr-2 h-4 w-4" />
						New Workflow
					</Button>
					<Button onClick={() => setShowCreateRequest(true)}>
						<Plus className="mr-2 h-4 w-4" />
						New Request
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-yellow-600" />
							<div>
								<p className="text-sm text-muted-foreground">Pending</p>
								<p className="text-xl font-bold">
									{requests.filter(r => r.status === 'pending').length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<CheckCircle className="h-4 w-4 text-green-600" />
							<div>
								<p className="text-sm text-muted-foreground">Approved</p>
								<p className="text-xl font-bold">
									{requests.filter(r => r.status === 'approved').length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<XCircle className="h-4 w-4 text-red-600" />
							<div>
								<p className="text-sm text-muted-foreground">Rejected</p>
								<p className="text-xl font-bold">
									{requests.filter(r => r.status === 'rejected').length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<FileText className="h-4 w-4 text-blue-600" />
							<div>
								<p className="text-sm text-muted-foreground">Active Workflows</p>
								<p className="text-xl font-bold">{workflows.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="requests">
				<TabsList>
					<TabsTrigger value="requests">Requests</TabsTrigger>
					<TabsTrigger value="workflows">Workflows</TabsTrigger>
				</TabsList>

				{/* Requests Tab */}
				<TabsContent value="requests" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Approval Requests</CardTitle>
							<CardDescription>
								Review and approve pending requests
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{requests.map((request) => (
									<div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="flex items-center gap-4">
											{getStatusIcon(request.status)}
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-1">
													<h4 className="font-medium">{request.title}</h4>
													<Badge className={getStatusColor(request.status)}>
														{request.status}
													</Badge>
													<Badge variant="outline" className={getPriorityColor(request.priority)}>
														{request.priority}
													</Badge>
												</div>
												<p className="text-sm text-muted-foreground mb-2">
													{request.description}
												</p>
												<div className="flex items-center gap-4 text-xs text-muted-foreground">
													<span>Requested {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
													{request.dueDate && (
														<span className={cn(
															"flex items-center gap-1",
															new Date(request.dueDate) < new Date() && "text-red-600"
														)}>
															<Calendar className="h-3 w-3" />
															Due {format(new Date(request.dueDate), 'MMM d, yyyy')}
														</span>
													)}
													<span>Step {request.currentStep}</span>
												</div>
											</div>
										</div>

										{request.status === 'pending' && (
											<div className="flex gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleRejectRequest(request.id)}
													className="text-red-600 hover:text-red-700"
												>
													<ThumbsDown className="mr-1 h-3 w-3" />
													Reject
												</Button>
												<Button
													size="sm"
													onClick={() => handleApproveRequest(request.id)}
													className="bg-green-600 hover:bg-green-700"
												>
													<ThumbsUp className="mr-1 h-3 w-3" />
													Approve
												</Button>
											</div>
										)}
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Workflows Tab */}
				<TabsContent value="workflows" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Approval Workflows</CardTitle>
							<CardDescription>
								Configure approval processes for different types of requests
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{workflows.map((workflow) => (
									<div key={workflow.id} className="p-4 border rounded-lg">
										<div className="flex items-center justify-between mb-2">
											<h4 className="font-medium">{workflow.name}</h4>
											<div className="flex items-center gap-2">
												<Badge variant={workflow.isActive ? 'default' : 'secondary'}>
													{workflow.isActive ? 'Active' : 'Inactive'}
												</Badge>
												<Button variant="ghost" size="sm">
													<MoreVertical className="h-4 w-4" />
												</Button>
											</div>
										</div>
										<p className="text-sm text-muted-foreground mb-3">
											{workflow.description}
										</p>
										<div className="flex items-center gap-4 text-xs text-muted-foreground">
											<span>Type: {workflow.type.replace('_', ' ')}</span>
											<span>{workflow.steps.length} steps</span>
											<span>Created {formatDistanceToNow(new Date(workflow.createdAt), { addSuffix: true })}</span>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Create Workflow Modal */}
			<Dialog open={showCreateWorkflow} onOpenChange={setShowCreateWorkflow}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create Approval Workflow</DialogTitle>
						<DialogDescription>
							Set up a new approval process for your workspace
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="workflowName">Workflow Name</Label>
							<Input
								id="workflowName"
								value={newWorkflow.name}
								onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
								placeholder="Expense Approval Process"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="workflowDescription">Description</Label>
							<Textarea
								id="workflowDescription"
								value={newWorkflow.description}
								onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
								placeholder="Brief description of the approval process"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="workflowType">Type</Label>
							<Select value={newWorkflow.type} onValueChange={(value: ApprovalWorkflow['type']) => setNewWorkflow(prev => ({ ...prev, type: value }))}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="expense_approval">Expense Approval</SelectItem>
									<SelectItem value="invoice_approval">Invoice Approval</SelectItem>
									<SelectItem value="document_review">Document Review</SelectItem>
									<SelectItem value="client_onboarding">Client Onboarding</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label>Workflow Steps</Label>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => {
										setWorkflowSteps(prev => [...prev, {
											id: `step_${Date.now()}`,
											name: `Step ${prev.length + 1}`,
											order: prev.length + 1,
											approvers: [],
											requiresAllApprovers: false,
											notifyOnTimeout: true,
										}]);
									}}
								>
									<Plus className="h-4 w-4 mr-1" />
									Add Step
								</Button>
							</div>
							<div className="space-y-2 max-h-48 overflow-y-auto">
								{workflowSteps.map((step, index) => (
									<div key={step.id} className="p-3 border rounded-lg flex items-center justify-between">
										<div className="flex-1">
											<Input
												value={step.name}
												onChange={(e) => {
													setWorkflowSteps(prev => prev.map((s, i) => 
														i === index ? { ...s, name: e.target.value } : s
													));
												}}
												placeholder="Step name"
												className="mb-2"
											/>
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<Switch
													checked={step.requiresAllApprovers}
													onCheckedChange={(checked) => {
														setWorkflowSteps(prev => prev.map((s, i) => 
															i === index ? { ...s, requiresAllApprovers: checked } : s
														));
													}}
												/>
												<span>Requires all approvers</span>
											</div>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => {
												setWorkflowSteps(prev => prev.filter((_, i) => i !== index));
											}}
										>
											<Trash2 className="h-4 w-4 text-red-600" />
										</Button>
									</div>
								))}
								{workflowSteps.length === 0 && (
									<p className="text-sm text-muted-foreground text-center py-4">
										No steps added. Click "Add Step" to create your first approval step.
									</p>
								)}
							</div>
						</div>
						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => {
								setShowCreateWorkflow(false);
								setWorkflowSteps([]);
							}}>
								Cancel
							</Button>
							<Button onClick={handleCreateWorkflow} disabled={!newWorkflow.name}>
								Create Workflow
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Create Request Modal */}
			<Dialog open={showCreateRequest} onOpenChange={setShowCreateRequest}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create Approval Request</DialogTitle>
						<DialogDescription>
							Submit a new request for approval
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="requestTitle">Request Title</Label>
							<Input
								id="requestTitle"
								value={newRequest.title}
								onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
								placeholder="Approve office supplies purchase"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="requestDescription">Description</Label>
							<Textarea
								id="requestDescription"
								value={newRequest.description}
								onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
								placeholder="Detailed description of the request"
							/>
						</div>
						{workflows.length > 0 && (
							<div className="space-y-2">
								<Label htmlFor="requestWorkflow">Workflow</Label>
								<Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
									<SelectTrigger>
										<SelectValue placeholder="Select a workflow" />
									</SelectTrigger>
									<SelectContent>
										{workflows.map((workflow) => (
											<SelectItem key={workflow.id} value={workflow.id}>
												{workflow.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="requestPriority">Priority</Label>
								<Select value={newRequest.priority} onValueChange={(value: ApprovalRequest['priority']) => setNewRequest(prev => ({ ...prev, priority: value }))}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">Low</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="high">High</SelectItem>
										<SelectItem value="urgent">Urgent</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="requestDueDate">Due Date</Label>
								<Input
									id="requestDueDate"
									type="date"
									value={newRequest.dueDate}
									onChange={(e) => setNewRequest(prev => ({ ...prev, dueDate: e.target.value }))}
								/>
							</div>
						</div>
						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => setShowCreateRequest(false)}>
								Cancel
							</Button>
							<Button onClick={handleCreateRequest} disabled={!newRequest.title}>
								Create Request
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
