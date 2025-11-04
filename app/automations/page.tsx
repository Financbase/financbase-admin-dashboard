/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Metadata } from "next";
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
	Zap
} from "lucide-react";
export const metadata: Metadata = {
	title: "Workflow Automation | Financbase",
	description: "Create and manage automated workflows for your financial processes",
};

const automationStats = [
	{
		name: "Active Workflows",
		value: "24",
		change: "+5",
		changeType: "positive",
		icon: Workflow,
	},
	{
		name: "Executions Today",
		value: "1,247",
		change: "+18%",
		changeType: "positive",
		icon: Activity,
	},
	{
		name: "Time Saved",
		value: "47h",
		change: "+12%",
		changeType: "positive",
		icon: Clock,
	},
	{
		name: "Success Rate",
		value: "98.7%",
		change: "+0.3%",
		changeType: "positive",
		icon: Target,
	},
];

const activeWorkflows = [
	{
		name: "Invoice Processing",
		description: "Automatically process and categorize invoices",
		status: "active",
		executions: 1247,
		success: 98.5,
		lastRun: "2 minutes ago",
		nextRun: "Every 15 minutes",
		trigger: "New email with invoice",
		actions: ["Extract data", "Categorize", "Route for approval"],
	},
	{
		name: "Expense Reports",
		description: "Generate weekly expense reports automatically",
		status: "active",
		executions: 89,
		success: 100,
		lastRun: "1 hour ago",
		nextRun: "Weekly on Monday",
		trigger: "Schedule trigger",
		actions: ["Collect expenses", "Generate report", "Email stakeholders"],
	},
	{
		name: "Payment Reminders",
		description: "Send payment reminders to overdue customers",
		status: "active",
		executions: 156,
		success: 97.2,
		lastRun: "30 minutes ago",
		nextRun: "Daily at 9 AM",
		trigger: "Overdue invoice",
		actions: ["Check due date", "Send reminder", "Update status"],
	},
	{
		name: "Bank Reconciliation",
		description: "Daily bank transaction reconciliation",
		status: "paused",
		executions: 234,
		success: 95.8,
		lastRun: "Yesterday",
		nextRun: "When resumed",
		trigger: "Daily schedule",
		actions: ["Fetch transactions", "Match records", "Flag discrepancies"],
	},
];

const workflowTemplates = [
	{
		name: "Invoice Approval Workflow",
		description: "Multi-level approval process for invoices",
		category: "Finance",
		complexity: "Medium",
		estimatedSetup: "15 minutes",
		icon: CheckCircle,
	},
	{
		name: "Customer Onboarding",
		description: "Automated customer welcome and setup",
		category: "Sales",
		complexity: "Low",
		estimatedSetup: "10 minutes",
		icon: Users,
	},
	{
		name: "Expense Reimbursement",
		description: "Streamlined employee expense processing",
		category: "HR",
		complexity: "High",
		estimatedSetup: "25 minutes",
		icon: Receipt,
	},
];

const automationAlerts = [
	{
		type: "warning",
		workflow: "Bank Reconciliation",
		message: "Workflow paused due to API connectivity issues",
		action: "Resume",
	},
	{
		type: "success",
		workflow: "Payment Reminders",
		message: "Successfully processed 12 reminders today",
		action: null,
	},
];

export default function AutomationsPage() {
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
					<Button variant="outline">
						<Filter className="h-4 w-4 mr-2" />
						Filter
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
						{automationAlerts.map((alert) => (
							<div key={`${alert.workflow}-${alert.message}`} className="flex items-center justify-between p-3 rounded-lg border">
								<div className="flex items-center gap-3">
									{alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
									{alert.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
									<div>
										<span className="text-sm font-medium">{alert.workflow}</span>
										<p className="text-sm text-muted-foreground">{alert.message}</p>
									</div>
								</div>
								{alert.action && (
									<Button variant="outline" size="sm">
										{alert.action}
									</Button>
								)}
							</div>
						))}
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
							<div className="space-y-4">
								{activeWorkflows.map((workflow) => (
									<div key={workflow.name} className="p-4 border rounded-lg">
										<div className="flex items-center justify-between mb-3">
											<div className="space-y-1">
												<div className="flex items-center gap-2">
													<h4 className="font-medium">{workflow.name}</h4>
													<Badge variant={
														workflow.status === 'active' ? 'default' :
														workflow.status === 'paused' ? 'secondary' :
														'destructive'
													}>
														{workflow.status}
													</Badge>
												</div>
												<p className="text-sm text-muted-foreground">{workflow.description}</p>
											</div>
											<div className="flex items-center gap-2">
												{workflow.status === 'active' ? (
													<Button variant="outline" size="sm">
														<Pause className="h-3 w-3 mr-1" />
														Pause
													</Button>
												) : (
													<Button variant="outline" size="sm">
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
												<p className="font-medium">{workflow.executions.toLocaleString()}</p>
											</div>
											<div>
												<p className="text-muted-foreground">Success Rate</p>
												<p className="font-medium text-green-600">{workflow.success}%</p>
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
												<span>•</span>
												<span>Actions: {workflow.actions.join(', ')}</span>
											</div>
										</div>
									</div>
								))}
							</div>
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
							<div className="space-y-4">
								{workflowTemplates.map((template) => (
									<div key={template.name} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<template.icon className="h-4 w-4" />
												<h4 className="font-medium">{template.name}</h4>
												<Badge variant="outline">{template.category}</Badge>
												<Badge variant={
													template.complexity === 'Low' ? 'default' :
													template.complexity === 'Medium' ? 'secondary' :
													'destructive'
												}>
													{template.complexity}
												</Badge>
											</div>
											<p className="text-sm text-muted-foreground">{template.description}</p>
											<p className="text-sm text-muted-foreground">
												Setup time: {template.estimatedSetup}
											</p>
										</div>
										<div className="flex items-center gap-2">
											<Button variant="outline" size="sm">
												Preview
											</Button>
											<Button size="sm">
												Use Template
											</Button>
										</div>
									</div>
								))}
							</div>
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
									<Button variant="outline" className="flex-1 justify-start">
										<Search className="h-4 w-4 mr-2" />
										Search executions...
									</Button>
									<Button variant="outline">
										<Filter className="h-4 w-4 mr-2" />
										Filter
									</Button>
									<Button variant="outline">
										<RefreshCw className="h-4 w-4 mr-2" />
										Refresh
									</Button>
								</div>

								{/* Execution history placeholder */}
								<div className="text-center py-8 text-muted-foreground">
									<p>Execution history with detailed logs, error tracking, and performance metrics would be implemented here</p>
								</div>
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
										<span className="text-sm">Avg Execution Time</span>
										<span className="font-medium">2.3 seconds</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Error Rate</span>
										<span className="font-medium text-green-600">1.3%</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Cost Savings</span>
										<span className="font-medium">$2,847/month</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">ROI</span>
										<span className="font-medium text-green-600">340%</span>
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
								<div className="space-y-2 text-sm">
									<div className="flex items-center justify-between">
										<span>Invoice Processing</span>
										<span className="font-medium">1,247 runs</span>
									</div>
									<div className="flex items-center justify-between">
										<span>Payment Reminders</span>
										<span className="font-medium">156 runs</span>
									</div>
									<div className="flex items-center justify-between">
										<span>Expense Reports</span>
										<span className="font-medium">89 runs</span>
									</div>
									<div className="flex items-center justify-between">
										<span>Bank Reconciliation</span>
										<span className="font-medium">234 runs</span>
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
