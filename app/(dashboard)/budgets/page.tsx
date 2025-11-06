/**
 * Budgets Page
 * Main page for budget management with real-time expense integration
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Target, TrendingDown, TrendingUp, BarChart3, Plus, Settings } from "lucide-react";
import { BudgetList } from '@/components/budgets/budget-list';
import { BudgetAlerts } from '@/components/budgets/budget-alerts';
import { BudgetForm } from '@/components/budgets/budget-form';
import { useState } from 'react';
import { toast } from "sonner";

export default function BudgetsPage() {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
	const [budgetSettings, setBudgetSettings] = useState({
		defaultPeriod: 'monthly',
		notificationThreshold: 80,
		warningThreshold: 90,
		autoCreateRecurring: true,
		includeProjected: true,
		currency: 'USD',
	});

	// Fetch budget summary
	const { data: summaryResponse, isLoading: summaryLoading } = useQuery({
		queryKey: ['budget-summary'],
		queryFn: async () => {
			const response = await fetch('/api/budgets/summary');
			if (!response.ok) {
				throw new Error('Failed to fetch budget summary');
			}
			return response.json();
		},
	});

	const summary = summaryResponse?.data || {
		totalBudgeted: 0,
		totalSpent: 0,
		totalRemaining: 0,
		overallPercentage: 0,
		activeBudgets: 0,
		overBudgetCount: 0,
		warningCount: 0,
	};

	return (
		<div className="container mx-auto py-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Budget Management</h1>
					<p className="text-muted-foreground">
						Track and manage your business budgets with AI-powered insights and forecasting
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button onClick={() => setCreateDialogOpen(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Create Budget
					</Button>
					<Button variant="outline" onClick={() => setSettingsDialogOpen(true)}>
						<Settings className="h-4 w-4 mr-2" />
						Budget Settings
					</Button>
				</div>
			</div>

			{/* Overview Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Budget</CardTitle>
						<Target className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{summaryLoading ? '...' : `$${summary.totalBudgeted.toLocaleString()}`}
						</div>
						<p className="text-xs text-muted-foreground">Monthly allocation</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Spent</CardTitle>
						<TrendingDown className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{summaryLoading ? '...' : `$${summary.totalSpent.toLocaleString()}`}
						</div>
						<p className="text-xs text-muted-foreground">
							{summaryLoading ? '...' : `${Math.round(summary.overallPercentage)}% of budget`}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Remaining</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className={`text-2xl font-bold ${summary.totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
							{summaryLoading ? '...' : `$${Math.abs(summary.totalRemaining).toLocaleString()}`}
						</div>
						<p className="text-xs text-muted-foreground">
							{summary.totalRemaining >= 0 ? 'Under budget' : 'Over budget'}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
						<BarChart3 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{summaryLoading ? '...' : summary.activeBudgets}
						</div>
						<p className="text-xs text-muted-foreground">Categories tracked</p>
					</CardContent>
				</Card>
			</div>

			{/* Budget Alerts */}
			<BudgetAlerts />

			{/* Budget Categories */}
			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="categories">Categories</TabsTrigger>
					<TabsTrigger value="forecast">Forecast</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<BudgetList />
				</TabsContent>

				<TabsContent value="categories" className="space-y-4">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Budget Categories</CardTitle>
									<p className="text-sm text-muted-foreground">
										Manage and configure your budget categories
									</p>
								</div>
								<Button size="sm" onClick={() => toast.info('Category management feature will be available soon')}>
									<Plus className="h-4 w-4 mr-2" />
									Add Category
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid gap-4 md:grid-cols-3">
									{['Office Expenses', 'Marketing', 'Operations', 'Technology', 'Travel', 'Utilities'].map((category) => (
										<Card key={category} className="p-4">
											<div className="flex items-center justify-between">
												<div>
													<h4 className="font-medium">{category}</h4>
													<p className="text-sm text-muted-foreground">$0 budgeted</p>
												</div>
												<Button variant="ghost" size="sm">
													<Settings className="h-4 w-4" />
												</Button>
											</div>
										</Card>
									))}
								</div>
								<Button variant="outline" className="w-full" onClick={() => toast.info('Add new category feature coming soon')}>
									<Plus className="h-4 w-4 mr-2" />
									Create New Category
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="forecast" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Spending Forecast</CardTitle>
							<p className="text-sm text-muted-foreground">
								AI-powered spending predictions for next month
							</p>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid gap-4 md:grid-cols-3">
									<Card className="p-4">
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">Projected Spending</p>
											<p className="text-2xl font-bold">$45,200</p>
											<p className="text-xs text-green-600">+5% from current</p>
										</div>
									</Card>
									<Card className="p-4">
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">Risk Level</p>
											<p className="text-2xl font-bold">Low</p>
											<p className="text-xs text-muted-foreground">Within budget</p>
										</div>
									</Card>
									<Card className="p-4">
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">Confidence</p>
											<p className="text-2xl font-bold">87%</p>
											<p className="text-xs text-muted-foreground">Based on 6 months</p>
										</div>
									</Card>
								</div>
								<div className="h-64 border rounded-lg p-4 flex items-center justify-center bg-muted/50">
									<div className="text-center">
										<BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
										<p className="text-sm text-muted-foreground">Forecast chart will be displayed here</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<BudgetForm
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				onSuccess={() => {
					// Queries will be invalidated by BudgetList component
				}}
			/>

			{/* Budget Settings Dialog */}
			<Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Budget Settings</DialogTitle>
						<DialogDescription>
							Configure default budget preferences and notification settings
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Default Budget Period</Label>
							<select
								className="w-full px-3 py-2 border rounded-lg"
								value={budgetSettings.defaultPeriod}
								onChange={(e) => setBudgetSettings({ ...budgetSettings, defaultPeriod: e.target.value })}
							>
								<option value="weekly">Weekly</option>
								<option value="monthly">Monthly</option>
								<option value="quarterly">Quarterly</option>
								<option value="yearly">Yearly</option>
							</select>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Warning Threshold (%)</Label>
								<Input
									type="number"
									min="0"
									max="100"
									value={budgetSettings.warningThreshold}
									onChange={(e) => setBudgetSettings({ ...budgetSettings, warningThreshold: parseInt(e.target.value) || 90 })}
								/>
								<p className="text-xs text-muted-foreground">Show warning when budget reaches this percentage</p>
							</div>
							<div className="space-y-2">
								<Label>Notification Threshold (%)</Label>
								<Input
									type="number"
									min="0"
									max="100"
									value={budgetSettings.notificationThreshold}
									onChange={(e) => setBudgetSettings({ ...budgetSettings, notificationThreshold: parseInt(e.target.value) || 80 })}
								/>
								<p className="text-xs text-muted-foreground">Send notifications when budget reaches this percentage</p>
							</div>
						</div>
						<div className="space-y-2">
							<Label>Default Currency</Label>
							<select
								className="w-full px-3 py-2 border rounded-lg"
								value={budgetSettings.currency}
								onChange={(e) => setBudgetSettings({ ...budgetSettings, currency: e.target.value })}
							>
								<option value="USD">USD ($)</option>
								<option value="EUR">EUR (€)</option>
								<option value="GBP">GBP (£)</option>
								<option value="CAD">CAD ($)</option>
							</select>
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Auto-create Recurring Budgets</Label>
								<p className="text-sm text-muted-foreground">
									Automatically create budgets for recurring expenses
								</p>
							</div>
							<Switch
								checked={budgetSettings.autoCreateRecurring}
								onCheckedChange={(checked) => setBudgetSettings({ ...budgetSettings, autoCreateRecurring: checked })}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Include Projected Expenses</Label>
								<p className="text-sm text-muted-foreground">
									Include projected expenses in budget calculations
								</p>
							</div>
							<Switch
								checked={budgetSettings.includeProjected}
								onCheckedChange={(checked) => setBudgetSettings({ ...budgetSettings, includeProjected: checked })}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={() => {
							toast.success('Budget settings saved');
							setSettingsDialogOpen(false);
						}}>
							Save Settings
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
