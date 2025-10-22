"use client";

import { Loader2, TrendingUp, TrendingDown, Users, DollarSign, FileText, Receipt } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface DashboardOverview {
	revenue: {
		total: number;
		thisMonth: number;
		lastMonth: number;
		growth: number;
	};
	clients: {
		total: number;
		active: number;
		newThisMonth: number;
	};
	invoices: {
		total: number;
		pending: number;
		overdue: number;
		totalAmount: number;
	};
	expenses: {
		total: number;
		thisMonth: number;
		lastMonth: number;
		growth: number;
	};
	netIncome: {
		thisMonth: number;
		lastMonth: number;
		growth: number;
	};
}

interface RecentActivity {
	id: string;
	type: 'invoice' | 'expense' | 'payment' | 'client';
	description: string;
	amount?: number;
	status?: string;
	createdAt: string;
}

interface AIInsight {
	type: 'success' | 'warning' | 'info';
	title: string;
	description: string;
	action?: string;
}

/**
 * FINANCBASE DASHBOARD PAGE
 * 
 * This is the main dashboard for the Financbase financial management system.
 * Features:
 * - AI-powered financial insights
 * - Real-time analytics
 * - Expense and income tracking
 * - Invoice management
 * - Client management
 */
export default function DashboardPage() {
	// Fetch dashboard overview
	const { data: overviewData, isLoading: overviewLoading, error: overviewError } = useQuery({
		queryKey: ['dashboard-overview'],
		queryFn: async () => {
			const response = await fetch('/api/dashboard/overview');
			if (!response.ok) throw new Error('Failed to fetch dashboard overview');
			return response.json();
		},
	});

	// Fetch recent activity
	const { data: activityData, isLoading: activityLoading } = useQuery({
		queryKey: ['dashboard-activity'],
		queryFn: async () => {
			const response = await fetch('/api/dashboard/recent-activity');
			if (!response.ok) throw new Error('Failed to fetch recent activity');
			return response.json();
		},
	});

	// Fetch AI insights
	const { data: insightsData, isLoading: insightsLoading } = useQuery({
		queryKey: ['dashboard-insights'],
		queryFn: async () => {
			const response = await fetch('/api/dashboard/ai-insights');
			if (!response.ok) throw new Error('Failed to fetch AI insights');
			return response.json();
		},
	});

	const overview: DashboardOverview = overviewData?.overview || {
		revenue: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0 },
		clients: { total: 0, active: 0, newThisMonth: 0 },
		invoices: { total: 0, pending: 0, overdue: 0, totalAmount: 0 },
		expenses: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0 },
		netIncome: { thisMonth: 0, lastMonth: 0, growth: 0 },
	};

	const activities: RecentActivity[] = activityData?.activities || [];
	const insights: AIInsight[] = insightsData?.insights || [];

	if (overviewLoading) {
		return (
			<div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
				<div className="flex items-center justify-center h-64">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			</div>
		);
	}

	if (overviewError) {
		return (
			<div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
				<div className="text-center text-red-600">
					Error loading dashboard: {overviewError.message}
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
			<div className="flex items-center justify-between space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">
					Financial Dashboard
				</h2>
				<div className="text-sm text-muted-foreground">
					AI-powered financial insights and analytics
				</div>
			</div>

			{/* Key Metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center space-x-2">
						<div className="h-4 w-4 rounded-full bg-green-500"></div>
						<div className="text-sm font-medium">Total Revenue</div>
					</div>
					<div className="text-2xl font-bold">${overview.revenue.total.toLocaleString()}</div>
					<p className={`text-xs ${overview.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
						{overview.revenue.growth >= 0 ? '+' : ''}{overview.revenue.growth.toFixed(1)}% from last month
					</p>
				</div>
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center space-x-2">
						<div className="h-4 w-4 rounded-full bg-blue-500"></div>
						<div className="text-sm font-medium">Active Clients</div>
					</div>
					<div className="text-2xl font-bold">{overview.clients.active}</div>
					<p className="text-xs text-muted-foreground">
						{overview.clients.newThisMonth} new this month
					</p>
				</div>
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center space-x-2">
						<div className="h-4 w-4 rounded-full bg-orange-500"></div>
						<div className="text-sm font-medium">Pending Invoices</div>
					</div>
					<div className="text-2xl font-bold">{overview.invoices.pending}</div>
					<p className="text-xs text-muted-foreground">
						${overview.invoices.totalAmount.toLocaleString()} total
					</p>
				</div>
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center space-x-2">
						<div className="h-4 w-4 rounded-full bg-purple-500"></div>
						<div className="text-sm font-medium">Net Income</div>
					</div>
					<div className="text-2xl font-bold">${overview.netIncome.thisMonth.toLocaleString()}</div>
					<p className={`text-xs ${overview.netIncome.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
						{overview.netIncome.growth >= 0 ? '+' : ''}{overview.netIncome.growth.toFixed(1)}% from last month
					</p>
				</div>
			</div>

			{/* Dashboard Content */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
					<div className="space-y-2">
						<button className="w-full text-left p-3 rounded-lg border hover:bg-muted">
							Create New Invoice
						</button>
						<button className="w-full text-left p-3 rounded-lg border hover:bg-muted">
							Add Expense
						</button>
						<button className="w-full text-left p-3 rounded-lg border hover:bg-muted">
							Add Client
						</button>
					</div>
				</div>
				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
					{activityLoading ? (
						<div className="flex items-center justify-center py-4">
							<Loader2 className="h-4 w-4 animate-spin" />
						</div>
					) : activities.length === 0 ? (
						<div className="text-sm text-muted-foreground text-center py-4">
							No recent activity
						</div>
					) : (
						<div className="space-y-2 text-sm">
							{activities.slice(0, 5).map((activity) => (
								<div key={activity.id} className="flex justify-between">
									<span className="truncate">{activity.description}</span>
									{activity.amount && (
										<span className="text-muted-foreground ml-2">
											${activity.amount.toLocaleString()}
										</span>
									)}
								</div>
							))}
						</div>
					)}
				</div>
				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-lg font-semibold mb-4">AI Insights</h3>
					{insightsLoading ? (
						<div className="flex items-center justify-center py-4">
							<Loader2 className="h-4 w-4 animate-spin" />
						</div>
					) : insights.length === 0 ? (
						<div className="text-sm text-muted-foreground text-center py-4">
							No insights available
						</div>
					) : (
						<div className="space-y-2 text-sm">
							{insights.slice(0, 3).map((insight, index) => (
								<div 
									key={index}
									className={`p-2 rounded ${
										insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' :
										insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
										'bg-blue-50 dark:bg-blue-900/20'
									}`}
								>
									<div className="font-medium">{insight.title}</div>
									<div className="text-xs text-muted-foreground mt-1">
										{insight.description}
									</div>
									{insight.action && (
										<button className="text-xs text-blue-600 hover:underline mt-1">
											{insight.action}
										</button>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>

		</div>
	);
}