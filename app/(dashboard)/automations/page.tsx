/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Activity,
	AlertTriangle,
	CheckCircle,
	Clock,
	Filter,
	Pause,
	Play,
	Plus,
	Receipt,
	RefreshCw,
	Search,
	Settings,
	Target,
	TrendingUp,
	Users,
	Workflow,
	Zap,
	Loader2
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Workflow {
	id: number;
	name: string;
	description: string | null;
	category: string;
	status: "draft" | "active" | "paused" | "archived";
	isActive: boolean;
	executionCount: number;
	successCount: number;
	failureCount: number;
	lastExecutionAt: string | null;
	triggers: any[];
	steps: any[];
	createdAt: string;
	updatedAt: string;
}

interface WorkflowTemplate {
	id: number;
	name: string;
	description: string | null;
	category: string;
	templateConfig: any;
	isPopular: boolean;
	usageCount: number;
}

interface WorkflowExecution {
	id: number;
	workflowId: number;
	executionId: string;
	status: "pending" | "running" | "completed" | "failed" | "cancelled";
	startedAt: string;
	completedAt: string | null;
	duration: string | null;
	errorData: any;
}

export default function AutomationsPage() {
	const [workflows, setWorkflows] = useState<Workflow[]>([]);
	const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
	const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [selectedWorkflowId, setSelectedWorkflowId] = useState<number | null>(null);

	// Fetch workflows
	const fetchWorkflows = async () => {
		try {
			const response = await fetch("/api/workflows");
			if (!response.ok) throw new Error("Failed to fetch workflows");
			const data = await response.json();
			setWorkflows(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Error fetching workflows:", error);
			toast.error("Failed to load workflows");
		}
	};

	// Fetch templates
	const fetchTemplates = async () => {
		try {
			const response = await fetch("/api/workflows/templates");
			if (!response.ok) throw new Error("Failed to fetch templates");
			const data = await response.json();
			setTemplates(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Error fetching templates:", error);
		}
	};

	// Fetch executions for a workflow
	const fetchExecutions = async (workflowId: number) => {
		try {
			const response = await fetch(`/api/workflows/${workflowId}/executions?limit=10`);
			if (!response.ok) throw new Error("Failed to fetch executions");
			const data = await response.json();
			setExecutions(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Error fetching executions:", error);
		}
	};

	// Toggle workflow active status
	const toggleWorkflow = async (workflowId: number, currentStatus: string) => {
		try {
			const newStatus = currentStatus === "active" ? "paused" : "active";
			const response = await fetch(`/api/workflows/${workflowId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: newStatus, isActive: newStatus === "active" }),
			});
			if (!response.ok) throw new Error("Failed to update workflow");
			await fetchWorkflows();
			toast.success(`Workflow ${newStatus === "active" ? "activated" : "paused"}`);
		} catch (error) {
			console.error("Error toggling workflow:", error);
			toast.error("Failed to update workflow");
		}
	};

	// Calculate stats from workflows
	const calculateStats = () => {
		const activeWorkflows = workflows.filter((w) => w.status === "active" && w.isActive);
		const totalExecutions = workflows.reduce((sum, w) => sum + w.executionCount, 0);
		const totalSuccess = workflows.reduce((sum, w) => sum + w.successCount, 0);
		const successRate = totalExecutions > 0 ? (totalSuccess / totalExecutions) * 100 : 0;

		// Calculate executions today (approximate from lastExecutionAt)
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const executionsToday = workflows.filter(
			(w) => w.lastExecutionAt && new Date(w.lastExecutionAt) >= today
		).length;

		return {
			active: activeWorkflows.length,
			executionsToday,
			successRate: successRate.toFixed(1),
		};
	};

	// Get active workflows for display
	const getActiveWorkflows = () => {
		return workflows
			.filter((w) => w.status === "active" || w.status === "paused")
			.map((w) => {
				const successRate =
					w.executionCount > 0 ? (w.successCount / w.executionCount) * 100 : 0;
				const lastRun = w.lastExecutionAt
					? formatDistanceToNow(new Date(w.lastExecutionAt), { addSuffix: true })
					: "Never";
				const trigger = w.triggers?.[0]?.type || "Manual";
				const actions = w.steps?.map((s: any) => s.name || s.type) || [];

				return {
					id: w.id,
					name: w.name,
					description: w.description || "",
					status: w.status,
					executions: w.executionCount,
					success: successRate,
					lastRun,
					nextRun: w.status === "active" ? "Scheduled" : "When resumed",
					trigger: trigger,
					actions: actions,
				};
			});
	};

	// Generate alerts from workflows
	const getAlerts = () => {
		const alerts: any[] = [];
		workflows.forEach((w) => {
			if (w.status === "paused" && w.isActive) {
				alerts.push({
					type: "warning",
					workflow: w.name,
					message: "Workflow is paused",
					action: "Resume",
					workflowId: w.id,
				});
			}
			if (w.failureCount > 0 && w.executionCount > 0) {
				const failureRate = (w.failureCount / w.executionCount) * 100;
				if (failureRate > 10) {
					alerts.push({
						type: "warning",
						workflow: w.name,
						message: `High failure rate: ${failureRate.toFixed(1)}%`,
						action: null,
					});
				}
			}
		});
		return alerts;
	};

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			await Promise.all([fetchWorkflows(), fetchTemplates()]);
			setLoading(false);
		};
		loadData();
	}, []);

	useEffect(() => {
		if (selectedWorkflowId) {
			fetchExecutions(selectedWorkflowId);
		}
	}, [selectedWorkflowId]);

	const stats = calculateStats();
	const activeWorkflowsList = getActiveWorkflows();
	const alerts = getAlerts();

const automationStats = [
	{
		name: "Active Workflows",
			value: stats.active.toString(),
			change: `+${stats.active}`,
			changeType: "positive" as const,
		icon: Workflow,
	},
	{
		name: "Executions Today",
			value: stats.executionsToday.toString(),
		change: "+18%",
			changeType: "positive" as const,
		icon: Activity,
	},
	{
		name: "Time Saved",
		value: "47h",
		change: "+12%",
			changeType: "positive" as const,
		icon: Clock,
	},
	{
		name: "Success Rate",
			value: `${stats.successRate}%`,
		change: "+0.3%",
			changeType: "positive" as const,
		icon: Target,
	},
];
	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Workflow Automation</h1>
					<p className="text-muted-foreground">
						Create and manage automated workflows for your financial processes
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={() => {
							setRefreshing(true);
							fetchWorkflows().then(() => setRefreshing(false));
						}}
						disabled={refreshing}
					>
						<RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
						Refresh
					</Button>
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Create Workflow
					</Button>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-4">
				{automationStats.map((stat) => (
					<Card key={stat.name}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
							<stat.icon className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stat.value}</div>
							<p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
								{stat.change} from last week
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Automation Alerts */}
			{automationAlerts.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5" />
							Automation Alerts
						</CardTitle>
						<CardDescription>
							Important notifications about your workflows
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{alerts.length === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-4">
								No alerts at this time
							</p>
						) : (
							alerts.map((alert) => (
								<div
									key={`${alert.workflow}-${alert.message}`}
									className="flex items-center justify-between p-3 rounded-lg border"
								>
								<div className="flex items-center gap-3">
										{alert.type === "warning" && (
											<AlertTriangle className="h-4 w-4 text-yellow-500" />
										)}
										{alert.type === "success" && (
											<CheckCircle className="h-4 w-4 text-green-500" />
										)}
									<div>
										<span className="text-sm font-medium">{alert.workflow}</span>
										<p className="text-sm text-muted-foreground">{alert.message}</p>
									</div>
								</div>
									{alert.action && alert.workflowId && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												const workflow = workflows.find((w) => w.id === alert.workflowId);
												if (workflow) {
													toggleWorkflow(alert.workflowId, workflow.status);
												}
											}}
										>
										{alert.action}
									</Button>
								)}
							</div>
							))
						)}
					</CardContent>
				</Card>
			)}

			{/* Workflow Management */}
			<Tabs defaultValue="active" className="space-y-4">
				<TabsList>
					<TabsTrigger value="active">Active Workflows</TabsTrigger>
					<TabsTrigger value="templates">Templates</TabsTrigger>
					<TabsTrigger value="execution">Execution History</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
				</TabsList>

				<TabsContent value="active" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Active Workflows</CardTitle>
							<CardDescription>
								Currently running automation workflows
							</CardDescription>
						</CardHeader>
						<CardContent>
							{activeWorkflowsList.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<p>No active workflows yet</p>
									<p className="text-sm mt-2">Create your first workflow to get started</p>
								</div>
							) : (
							<div className="space-y-4">
									{activeWorkflowsList.map((workflow) => (
										<div key={workflow.id} className="p-4 border rounded-lg">
										<div className="flex items-center justify-between mb-3">
											<div className="space-y-1">
												<div className="flex items-center gap-2">
													<h4 className="font-medium">{workflow.name}</h4>
														<Badge
															variant={
																workflow.status === "active"
																	? "default"
																	: workflow.status === "paused"
																		? "secondary"
																		: "destructive"
															}
														>
														{workflow.status}
													</Badge>
												</div>
													<p className="text-sm text-muted-foreground">
														{workflow.description}
													</p>
											</div>
											<div className="flex items-center gap-2">
													{workflow.status === "active" ? (
														<Button
															variant="outline"
															size="sm"
															onClick={() => toggleWorkflow(workflow.id, workflow.status)}
														>
														<Pause className="h-3 w-3 mr-1" />
														Pause
													</Button>
												) : (
														<Button
															variant="outline"
															size="sm"
															onClick={() => toggleWorkflow(workflow.id, workflow.status)}
														>
														<Play className="h-3 w-3 mr-1" />
														Resume
													</Button>
												)}
												<Button variant="outline" size="sm">
													<Settings className="h-3 w-3 mr-1" />
													Edit
												</Button>
											</div>
										</div>
										<div className="grid gap-4 md:grid-cols-4 text-sm">
											<div>
												<p className="text-muted-foreground">Executions</p>
													<p className="font-medium">
														{workflow.executions.toLocaleString()}
													</p>
											</div>
											<div>
												<p className="text-muted-foreground">Success Rate</p>
													<p className="font-medium text-green-600">
														{workflow.success.toFixed(1)}%
													</p>
											</div>
											<div>
												<p className="text-muted-foreground">Last Run</p>
												<p className="font-medium">{workflow.lastRun}</p>
											</div>
											<div>
												<p className="text-muted-foreground">Next Run</p>
												<p className="font-medium">{workflow.nextRun}</p>
											</div>
										</div>
										<div className="mt-3 pt-3 border-t">
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<span>Trigger: {workflow.trigger}</span>
													{workflow.actions.length > 0 && (
														<>
												<span>•</span>
															<span>Actions: {workflow.actions.slice(0, 3).join(", ")}</span>
															{workflow.actions.length > 3 && (
																<span> +{workflow.actions.length - 3} more</span>
															)}
														</>
													)}
												</div>
										</div>
									</div>
								))}
							</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="templates" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Workflow Templates</CardTitle>
							<CardDescription>
								Pre-built automation templates to get started quickly
							</CardDescription>
						</CardHeader>
						<CardContent>
							{templates.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<p>No templates available</p>
								</div>
							) : (
							<div className="space-y-4">
									{templates.map((template) => {
										const getIcon = () => {
											if (template.category.toLowerCase().includes("finance"))
												return CheckCircle;
											if (template.category.toLowerCase().includes("sales")) return Users;
											if (template.category.toLowerCase().includes("hr")) return Receipt;
											return Workflow;
										};
										const Icon = getIcon();
										const complexity =
											template.templateConfig?.complexity || "Medium";
										return (
											<div
												key={template.id}
												className="flex items-center justify-between p-4 border rounded-lg"
											>
										<div className="space-y-1">
											<div className="flex items-center gap-2">
														<Icon className="h-4 w-4" />
												<h4 className="font-medium">{template.name}</h4>
												<Badge variant="outline">{template.category}</Badge>
														<Badge
															variant={
																complexity === "Low"
																	? "default"
																	: complexity === "Medium"
																		? "secondary"
																		: "destructive"
															}
														>
															{complexity}
												</Badge>
											</div>
													<p className="text-sm text-muted-foreground">
														{template.description || "No description available"}
													</p>
											<p className="text-sm text-muted-foreground">
														Used {template.usageCount} times
											</p>
										</div>
										<div className="flex items-center gap-2">
											<Button variant="outline" size="sm">
												Preview
											</Button>
													<Button
														size="sm"
														onClick={() => {
															toast.info("Template feature will be available soon");
														}}
													>
												Use Template
											</Button>
										</div>
									</div>
										);
									})}
							</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="execution" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Execution History</CardTitle>
							<CardDescription>
								Track workflow executions and performance
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center gap-4">
										<select
											className="flex-1 px-3 py-2 border rounded-lg text-sm"
											value={selectedWorkflowId || ""}
											onChange={(e) =>
												setSelectedWorkflowId(e.target.value ? parseInt(e.target.value) : null)
											}
										>
											<option value="">Select a workflow...</option>
											{workflows.map((w) => (
												<option key={w.id} value={w.id}>
													{w.name}
												</option>
											))}
										</select>
										<Button
											variant="outline"
											onClick={() => {
												if (selectedWorkflowId) {
													fetchExecutions(selectedWorkflowId);
												}
											}}
										>
										<RefreshCw className="h-4 w-4 mr-2" />
										Refresh
									</Button>
								</div>

								{selectedWorkflowId ? (
									executions.length === 0 ? (
										<div className="text-center py-8 text-muted-foreground">
											<p>No executions found for this workflow</p>
										</div>
									) : (
										<div className="space-y-2">
											{executions.map((exec) => (
												<div
													key={exec.id}
													className="flex items-center justify-between p-3 border rounded-lg"
												>
													<div className="space-y-1">
														<div className="flex items-center gap-2">
															<Badge
																variant={
																	exec.status === "completed"
																		? "default"
																		: exec.status === "failed"
																			? "destructive"
																			: "secondary"
																}
															>
																{exec.status}
															</Badge>
															<span className="text-sm font-medium">
																Execution {exec.executionId}
															</span>
														</div>
														<p className="text-xs text-muted-foreground">
															Started: {formatDistanceToNow(new Date(exec.startedAt), { addSuffix: true })}
															{exec.completedAt &&
																` • Duration: ${exec.duration || "N/A"}s`}
														</p>
													</div>
													{exec.errorData && (
														<AlertTriangle className="h-4 w-4 text-red-500" />
													)}
												</div>
											))}
										</div>
									)
								) : (
								<div className="text-center py-8 text-muted-foreground">
										<p>Select a workflow to view execution history</p>
								</div>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="analytics" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Automation Performance</CardTitle>
								<CardDescription>
									Workflow performance and efficiency metrics
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm">Total Executions</span>
										<span className="font-medium">
											{workflows.reduce((sum, w) => sum + w.executionCount, 0).toLocaleString()}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Error Rate</span>
										<span className="font-medium text-green-600">
											{workflows.reduce((sum, w) => sum + w.failureCount, 0) > 0
												? (
														(workflows.reduce((sum, w) => sum + w.failureCount, 0) /
															workflows.reduce((sum, w) => sum + w.executionCount, 0)) *
														100
													).toFixed(1)
												: "0.0"}
											%
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Active Workflows</span>
										<span className="font-medium">
											{workflows.filter((w) => w.status === "active" && w.isActive).length}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Success Rate</span>
										<span className="font-medium text-green-600">{stats.successRate}%</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Popular Workflows</CardTitle>
								<CardDescription>
									Most frequently used automation workflows
								</CardDescription>
							</CardHeader>
							<CardContent>
								{workflows.length === 0 ? (
									<p className="text-sm text-muted-foreground text-center py-4">
										No workflows yet
									</p>
								) : (
									<div className="space-y-2 text-sm">
										{[...workflows]
											.sort((a, b) => b.executionCount - a.executionCount)
											.slice(0, 4)
											.map((w) => (
												<div key={w.id} className="flex items-center justify-between">
													<span>{w.name}</span>
													<span className="font-medium">{w.executionCount} runs</span>
												</div>
											))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
