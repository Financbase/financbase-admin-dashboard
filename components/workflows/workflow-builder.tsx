"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
	Plus,
	Play,
	Pause,
	Settings,
	Trash2,
	Edit,
	Copy,
	Share,
	Clock,
	Webhook,
	Brain,
	Mail,
	Bell,
	Target,
	Filter,
	Search,
	RefreshCw,
	Activity,
	CheckCircle,
	AlertTriangle,
	Info,
	ArrowRight,
	ArrowDown,
	Database,
	Zap
} from 'lucide-react';
import { WorkflowEngine } from '@/lib/services/workflow-engine';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

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
	successRate: number;
	lastExecutionAt?: string;
	createdAt: string;
}

interface WorkflowStep {
	id: string;
	name: string;
	type: 'action' | 'condition' | 'delay' | 'webhook' | 'email' | 'notification' | 'gpt';
	configuration: Record<string, any>;
	parameters: Record<string, any>;
	conditions?: Record<string, any>;
	timeout: number;
	retryCount: number;
}

const STEP_TYPES = [
	{
		type: 'email',
		name: 'Send Email',
		icon: Mail,
		description: 'Send an email notification',
		color: 'bg-blue-500',
		category: 'Communication'
	},
	{
		type: 'notification',
		name: 'Create Notification',
		icon: Bell,
		description: 'Create an in-app notification',
		color: 'bg-green-500',
		category: 'Communication'
	},
	{
		type: 'webhook',
		name: 'Webhook Call',
		icon: Webhook,
		description: 'Call an external API',
		color: 'bg-purple-500',
		category: 'Integration'
	},
	{
		type: 'gpt',
		name: 'AI Analysis',
		icon: Brain,
		description: 'Run AI analysis with GPT',
		color: 'bg-orange-500',
		category: 'AI'
	},
	{
		type: 'delay',
		name: 'Wait/Delay',
		icon: Clock,
		description: 'Wait for a specified time',
		color: 'bg-yellow-500',
		category: 'Control'
	},
	{
		type: 'condition',
		name: 'Condition',
		icon: Target,
		description: 'Execute based on conditions',
		color: 'bg-red-500',
		category: 'Control'
	},
	{
		type: 'action',
		name: 'Custom Action',
		icon: Zap,
		description: 'Execute custom business logic',
		color: 'bg-gray-500',
		category: 'Action'
	},
];

const TRIGGER_TYPES = [
	{
		type: 'invoice_created',
		name: 'Invoice Created',
		description: 'When a new invoice is created',
		icon: Database,
	},
	{
		type: 'expense_approved',
		name: 'Expense Approved',
		description: 'When an expense is approved',
		icon: CheckCircle,
	},
	{
		type: 'report_generated',
		name: 'Report Generated',
		description: 'When a report is generated',
		icon: Activity,
	},
	{
		type: 'webhook',
		name: 'Webhook Received',
		description: 'When a webhook is received',
		icon: Webhook,
	},
	{
		type: 'schedule',
		name: 'Scheduled',
		description: 'On a scheduled basis',
		icon: Clock,
	},
	{
		type: 'manual',
		name: 'Manual Trigger',
		description: 'Triggered manually',
		icon: Play,
	},
];

export function WorkflowBuilder() {
	const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [showBuilderDialog, setShowBuilderDialog] = useState(false);
	const [newWorkflow, setNewWorkflow] = useState({
		name: '',
		description: '',
		category: 'general',
		type: 'sequential',
	});

	const queryClient = useQueryClient();

	// Fetch workflows
	const queryResult = useQuery({
		queryKey: ['workflows'],
		queryFn: async () => {
			const response = await fetch('/api/workflows');
			if (!response.ok) {
				throw new Error('Failed to fetch workflows');
			}
			return response.json();
		},
	});
	const workflows = queryResult?.data ?? [];
	const isLoading = queryResult?.isLoading ?? false;

	// Create workflow mutation
	const createWorkflowMutation = useMutation({
		mutationFn: async (workflowData: any) => {
			const response = await fetch('/api/workflows', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(workflowData),
			});
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['workflows'] });
			setShowCreateDialog(false);
			setNewWorkflow({ name: '', description: '', category: 'general', type: 'sequential' });
		},
	});

	// Toggle workflow status mutation
	const toggleWorkflowMutation = useMutation({
		mutationFn: async ({ workflowId, isActive }: { workflowId: number; isActive: boolean }) => {
			const response = await fetch(`/api/workflows/${workflowId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isActive }),
			});
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['workflows'] });
		},
	});

	// Delete workflow mutation
	const deleteWorkflowMutation = useMutation({
		mutationFn: async (workflowId: number) => {
			const response = await fetch(`/api/workflows/${workflowId}`, {
				method: 'DELETE',
			});
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['workflows'] });
			setSelectedWorkflow(null);
		},
	});

	const handleCreateWorkflow = () => {
		if (!newWorkflow.name.trim()) return;

		createWorkflowMutation?.mutate({
			...newWorkflow,
			steps: [],
			triggers: [],
			status: 'draft',
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'paused':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'draft':
				return 'bg-gray-100 text-gray-800 border-gray-200';
			case 'archived':
				return 'bg-red-100 text-red-800 border-red-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const getStepIcon = (type: string) => {
		const stepType = STEP_TYPES.find(st => st.type === type);
		return stepType ? stepType.icon : Target;
	};

	const getStepColor = (type: string) => {
		const stepType = STEP_TYPES.find(st => st.type === type);
		return stepType ? stepType.color : 'bg-gray-500';
	};

	return (
		<div className="space-y-6" data-testid="workflow-builder">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Workflow Automation</h2>
					<p className="text-muted-foreground">
						Build automated workflows to streamline your business processes
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Filter className="mr-2 h-4 w-4" />
						Templates
					</Button>
					<Button onClick={() => setShowCreateDialog(true)}>
						<Plus className="mr-2 h-4 w-4" />
						New Workflow
					</Button>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Activity className="h-4 w-4 text-blue-600" />
							<div>
								<p className="text-sm text-muted-foreground">Active Workflows</p>
								<p className="text-xl font-bold">
									{workflows.filter((w: any) => w.status === 'active').length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Play className="h-4 w-4 text-green-600" />
							<div>
								<p className="text-sm text-muted-foreground">Total Executions</p>
								<p className="text-xl font-bold">
									{workflows.reduce((sum: number, w: any) => sum + (w.executionCount || 0), 0)}
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
								<p className="text-sm text-muted-foreground">Success Rate</p>
								<p className="text-xl font-bold">
									{Math.round(workflows.reduce((sum: number, w: any) => sum + (w.successRate || 0), 0) / workflows.length || 0)}%
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-orange-600" />
							<div>
								<p className="text-sm text-muted-foreground">This Week</p>
								<p className="text-xl font-bold">
									{workflows.reduce((sum: number, w: any) => {
										const weekAgo = new Date();
										weekAgo.setDate(weekAgo.getDate() - 7);
										return sum + (new Date(w.lastExecutionAt || 0) > weekAgo ? 1 : 0);
									}, 0)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Workflow Templates */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<Zap className="mr-2 h-5 w-5" />
						Workflow Templates
					</CardTitle>
					<CardDescription>
						Get started quickly with pre-built workflow templates
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{[
							{
								name: 'Invoice Approval Flow',
								description: 'Automatically route invoices for approval based on amount',
								icon: CheckCircle,
								steps: 4,
								estimatedTime: '2 minutes'
							},
							{
								name: 'Overdue Invoice Reminders',
								description: 'Send automated reminders for overdue invoices',
								icon: Clock,
								steps: 3,
								estimatedTime: '1 minute'
							},
							{
								name: 'Expense Report Automation',
								description: 'Generate monthly expense reports automatically',
								icon: Activity,
								steps: 5,
								estimatedTime: '3 minutes'
							},
							{
								name: 'Client Onboarding',
								description: 'Automated welcome sequence for new clients',
								icon: Brain,
								steps: 6,
								estimatedTime: '5 minutes'
							},
						].map((template, index) => (
							<Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
								<CardContent className="p-4">
									<div className="flex items-start gap-3">
										<div className={`p-2 rounded-lg ${getStepColor('action')}`}>
											<template.icon className="h-5 w-5 text-white" />
										</div>
										<div className="flex-1">
											<h3 className="font-medium mb-1">{template.name}</h3>
											<p className="text-sm text-muted-foreground mb-3">
												{template.description}
											</p>
											<div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
												<span>{template.steps} steps</span>
												<span>{template.estimatedTime} setup</span>
											</div>
											<Button size="sm" className="w-full">
												<Plus className="mr-2 h-3 w-3" />
												Use Template
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Workflow List */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<Settings className="mr-2 h-5 w-5" />
						Your Workflows ({workflows.length})
					</CardTitle>
					<CardDescription>
						Manage and monitor your automation workflows
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						</div>
					) : workflows.length === 0 ? (
						<div className="text-center py-8">
							<Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground">No workflows created yet</p>
							<Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
								<Plus className="mr-2 h-4 w-4" />
								Create Your First Workflow
							</Button>
						</div>
					) : (
						<div className="space-y-4">
							{/* Workflow Table */}
							<div className="border rounded-lg">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Workflow</TableHead>
											<TableHead>Type</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Executions</TableHead>
											<TableHead>Success Rate</TableHead>
											<TableHead>Last Run</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{workflows.map((workflow: any) => (
											<TableRow key={workflow.id}>
												<TableCell>
													<div>
														<p className="font-medium">{workflow.name}</p>
														<p className="text-sm text-muted-foreground">
															{workflow.description}
														</p>
														<div className="flex items-center gap-2 mt-1">
															<Badge variant="outline" className="text-xs">
																{workflow.steps.length} steps
															</Badge>
															<Badge variant="outline" className="text-xs">
																{workflow.triggers.length} triggers
															</Badge>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<span className="text-sm capitalize">
															{workflow.type.replace('_', ' ')}
														</span>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<div className={cn(
															"w-2 h-2 rounded-full",
															workflow.isActive ? "bg-green-500" : "bg-gray-400"
														)}></div>
														<Badge className={cn("text-xs", getStatusColor(workflow.status))}>
															{workflow.status}
														</Badge>
													</div>
												</TableCell>
												<TableCell>
													<p className="font-medium">{workflow.executionCount}</p>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
															<div
																className="h-full bg-green-500 rounded-full"
																style={{ width: `${workflow.successRate || 0}%` }}
															></div>
														</div>
														<span className="text-sm">{Math.round(workflow.successRate || 0)}%</span>
													</div>
												</TableCell>
												<TableCell>
													{workflow.lastExecutionAt ? (
														<p className="text-sm text-muted-foreground">
															{formatDistanceToNow(new Date(workflow.lastExecutionAt), { addSuffix: true })}
														</p>
													) : (
														<p className="text-sm text-muted-foreground">Never</p>
													)}
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => {
																setSelectedWorkflow(workflow);
																setShowBuilderDialog(true);
															}}
														>
															<Edit className="h-4 w-4" />
														</Button>

														<Button
															variant="ghost"
															size="sm"
															onClick={() => toggleWorkflowMutation.mutate({
																workflowId: workflow.id,
																isActive: !workflow.isActive
															})}
															disabled={toggleWorkflowMutation.isPending}
														>
															{workflow.isActive ? (
																<Pause className="h-4 w-4" />
															) : (
																<Play className="h-4 w-4" />
															)}
														</Button>

														<Button
															variant="ghost"
															size="sm"
															onClick={() => {/* Test workflow */}}
														>
															<Play className="h-4 w-4" />
														</Button>

														<Button
															variant="ghost"
															size="sm"
															onClick={() => {/* Duplicate workflow */}}
														>
															<Copy className="h-4 w-4" />
														</Button>

														<Button
															variant="ghost"
															size="sm"
															onClick={() => {/* Share workflow */}}
														>
															<Share className="h-4 w-4" />
														</Button>

														<Button
															variant="ghost"
															size="sm"
															className="text-red-600 hover:text-red-700"
															onClick={() => deleteWorkflowMutation.mutate(workflow.id)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Create Workflow Dialog */}
			<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Create New Workflow</DialogTitle>
						<DialogDescription>
							Set up a new automation workflow from scratch or use a template
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						{/* Basic Information */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="workflowName">Workflow Name</Label>
								<Input
									id="workflowName"
									placeholder="e.g., Invoice Approval Process"
									value={newWorkflow.name}
									onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="workflowCategory">Category</Label>
								<Select
									value={newWorkflow.category}
									onValueChange={(value) => setNewWorkflow(prev => ({ ...prev, category: value }))}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="invoice">Invoice Management</SelectItem>
										<SelectItem value="expense">Expense Management</SelectItem>
										<SelectItem value="reporting">Reporting</SelectItem>
										<SelectItem value="client">Client Management</SelectItem>
										<SelectItem value="general">General</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="workflowDescription">Description</Label>
							<Input
								id="workflowDescription"
								placeholder="Brief description of what this workflow does"
								value={newWorkflow.description}
								onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="workflowType">Workflow Type</Label>
								<Select
									value={newWorkflow.type}
									onValueChange={(value) => setNewWorkflow(prev => ({ ...prev, type: value }))}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="sequential">Sequential</SelectItem>
										<SelectItem value="parallel">Parallel</SelectItem>
										<SelectItem value="conditional">Conditional</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Template Selection */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-sm">Or Start with a Template</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 gap-3">
									{[
										{ name: 'Invoice Approval', icon: CheckCircle, steps: 4 },
										{ name: 'Expense Review', icon: Activity, steps: 3 },
										{ name: 'Report Distribution', icon: Share, steps: 5 },
										{ name: 'Client Welcome', icon: Brain, steps: 6 },
									].map((template, index) => (
										<Button
											key={index}
											variant="outline"
											className="justify-start"
											onClick={() => {
												setNewWorkflow(prev => ({
													...prev,
													name: template.name,
													description: `${template.name} workflow template`,
												}));
											}}
										>
											<template.icon className="mr-2 h-4 w-4" />
											<div className="text-left">
												<div className="font-medium text-sm">{template.name}</div>
												<div className="text-xs text-muted-foreground">
													{template.steps} steps
												</div>
											</div>
										</Button>
									))}
								</div>
							</CardContent>
						</Card>

						<div className="flex gap-2">
							<Button
								className="flex-1"
								onClick={handleCreateWorkflow}
								disabled={!newWorkflow.name.trim() || createWorkflowMutation?.isPending}
							>
								<Plus className="mr-2 h-4 w-4" />
								Create Workflow
							</Button>
							<Button
								variant="outline"
								className="flex-1"
								onClick={() => {
									setSelectedWorkflow(null);
									setShowBuilderDialog(true);
								}}
							>
								<Settings className="mr-2 h-4 w-4" />
								Advanced Builder
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Workflow Builder Dialog */}
			{selectedWorkflow && (
				<Dialog open={showBuilderDialog} onOpenChange={setShowBuilderDialog}>
					<DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
						<DialogHeader>
							<DialogTitle>Workflow Builder - {selectedWorkflow.name}</DialogTitle>
							<DialogDescription>
								Build your automation workflow step by step
							</DialogDescription>
						</DialogHeader>

						<div className="flex h-[600px] gap-4">
							{/* Step Palette */}
							<div className="w-64 border rounded-lg p-4">
								<h3 className="font-medium mb-4">Available Steps</h3>
								<div className="space-y-2">
									{STEP_TYPES.map((stepType) => (
										<div
											key={stepType.type}
											className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
											draggable
											onDragStart={(e) => {
												e.dataTransfer.setData('text/plain', stepType.type);
											}}
										>
											<div className="flex items-center gap-2">
												<div className={`p-1 rounded ${stepType.color}`}>
													<stepType.icon className="h-3 w-3 text-white" />
												</div>
												<div>
													<p className="font-medium text-sm">{stepType.name}</p>
													<p className="text-xs text-muted-foreground">
														{stepType.description}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Workflow Canvas */}
							<div className="flex-1 border rounded-lg p-4">
								<h3 className="font-medium mb-4">Workflow Canvas</h3>
								<div className="h-full border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
									<div className="text-center">
										<Target className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
										<p className="text-muted-foreground">Drag steps here to build your workflow</p>
									</div>
								</div>
							</div>

							{/* Step Configuration */}
							<div className="w-80 border rounded-lg p-4">
								<h3 className="font-medium mb-4">Step Configuration</h3>
								<div className="text-center py-8">
									<Settings className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
									<p className="text-muted-foreground text-sm">
										Select a step to configure
									</p>
								</div>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
