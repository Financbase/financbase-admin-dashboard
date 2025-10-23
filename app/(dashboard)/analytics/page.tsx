"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, BarChart3, PieChart, ArrowUpRight, Loader2, Brain, Layout, Users, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import PredictiveDashboard from "@/components/analytics/predictive-dashboard";
import { ReportBuilder } from "@/components/analytics/report-builder";
import { InvestorPortalManager } from "@/components/investor-portal/investor-portal-manager";
import { BenchmarkingInsights } from "@/components/analytics/benchmarking-insights";

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic';

interface RevenueAnalytics {
	totalRevenue: number;
	monthlyRevenue: Array<{
		month: string;
		revenue: number;
		growth: number;
	}>;
	revenueByClient: Array<{
		clientName: string;
		revenue: number;
		invoiceCount: number;
	}>;
	revenueGrowth: {
		monthOverMonth: number;
		yearOverYear: number;
	};
}

interface ExpenseAnalytics {
	totalExpenses: number;
	monthlyExpenses: Array<{
		month: string;
		expenses: number;
		growth: number;
	}>;
	expensesByCategory: Array<{
		category: string;
		amount: number;
		percentage: number;
	}>;
	expenseGrowth: {
		monthOverMonth: number;
		yearOverYear: number;
	};
}

interface ClientAnalytics {
	totalClients: number;
	activeClients: number;
	newClients: Array<{
		month: string;
		count: number;
	}>;
	clientRetention: number;
	topClients: Array<{
		clientName: string;
		revenue: number;
		invoiceCount: number;
		lastInvoice: string;
	}>;
}

interface PerformanceMetrics {
	profitMargin: number;
	cashFlow: number;
	averageInvoiceValue: number;
	paymentSuccessRate: number;
	clientAcquisitionCost: number;
	lifetimeValue: number;
}

export default function AnalyticsPage() {
	const [activeTab, setActiveTab] = useState("overview");

	// Fetch revenue analytics
	const { data: revenueData, isLoading: revenueLoading } = useQuery({
		queryKey: ['analytics-revenue'],
		queryFn: async () => {
			const response = await fetch('/api/analytics/revenue');
			if (!response.ok) throw new Error('Failed to fetch revenue analytics');
			return response.json();
		},
	});

	// Fetch expense analytics
	const { data: expenseData, isLoading: expenseLoading } = useQuery({
		queryKey: ['analytics-expenses'],
		queryFn: async () => {
			const response = await fetch('/api/analytics/expenses');
			if (!response.ok) throw new Error('Failed to fetch expense analytics');
			return response.json();
		},
	});

	// Fetch client analytics
	const { data: clientData, isLoading: clientLoading } = useQuery({
		queryKey: ['analytics-clients'],
		queryFn: async () => {
			const response = await fetch('/api/analytics/clients');
			if (!response.ok) throw new Error('Failed to fetch client analytics');
			return response.json();
		},
	});

	// Fetch performance metrics
	const { data: performanceData, isLoading: performanceLoading } = useQuery({
		queryKey: ['analytics-performance'],
		queryFn: async () => {
			const response = await fetch('/api/analytics/performance');
			if (!response.ok) throw new Error('Failed to fetch performance metrics');
			return response.json();
		},
	});

	const revenueAnalytics: RevenueAnalytics = revenueData?.analytics || {
		totalRevenue: 0,
		monthlyRevenue: [],
		revenueByClient: [],
		revenueGrowth: { monthOverMonth: 0, yearOverYear: 0 },
	};

	const expenseAnalytics: ExpenseAnalytics = expenseData?.analytics || {
		totalExpenses: 0,
		monthlyExpenses: [],
		expensesByCategory: [],
		expenseGrowth: { monthOverMonth: 0, yearOverYear: 0 },
	};

	const clientAnalytics: ClientAnalytics = clientData?.analytics || {
		totalClients: 0,
		activeClients: 0,
		newClients: [],
		clientRetention: 0,
		topClients: [],
	};

	const performanceMetrics: PerformanceMetrics = performanceData?.metrics || {
		profitMargin: 0,
		cashFlow: 0,
		averageInvoiceValue: 0,
		paymentSuccessRate: 0,
		clientAcquisitionCost: 0,
		lifetimeValue: 0,
	};

	const isLoading = revenueLoading || expenseLoading || clientLoading || performanceLoading;

	if (isLoading) {
		return (
			<div className="space-y-8 p-8">
				<div className="flex items-center justify-center h-64">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
						<BarChart3 className="h-8 w-8" />
						Advanced Analytics
					</h1>
					<p className="text-muted-foreground">
						Predictive modeling, custom reports, and industry benchmarking
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline">Last 30 Days</Button>
					<Button>Export Report</Button>
				</div>
			</div>

			{/* Main Analytics Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="overview" className="flex items-center gap-2">
						<BarChart3 className="h-4 w-4" />
						Overview
					</TabsTrigger>
					<TabsTrigger value="predictive" className="flex items-center gap-2">
						<Brain className="h-4 w-4" />
						Predictive
					</TabsTrigger>
					<TabsTrigger value="reports" className="flex items-center gap-2">
						<Layout className="h-4 w-4" />
						Reports
					</TabsTrigger>
					<TabsTrigger value="investors" className="flex items-center gap-2">
						<Users className="h-4 w-4" />
						Investors
					</TabsTrigger>
					<TabsTrigger value="benchmarking" className="flex items-center gap-2">
						<Target className="h-4 w-4" />
						Benchmarking
					</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6">
					{/* Key Performance Indicators */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<div className="rounded-lg border bg-card p-6">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-medium text-muted-foreground">Revenue Growth</h3>
								<TrendingUp className="h-4 w-4 text-green-600" />
							</div>
							<div className="mt-3">
								<div className="text-2xl font-bold">{revenueAnalytics.revenueGrowth.monthOverMonth.toFixed(1)}%</div>
								<p className={`text-xs mt-1 ${revenueAnalytics.revenueGrowth.monthOverMonth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
									{revenueAnalytics.revenueGrowth.monthOverMonth >= 0 ? '+' : ''}{revenueAnalytics.revenueGrowth.monthOverMonth.toFixed(1)}% from last month
								</p>
							</div>
						</div>

						<div className="rounded-lg border bg-card p-6">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-medium text-muted-foreground">Profit Margin</h3>
								<BarChart3 className="h-4 w-4 text-blue-600" />
							</div>
							<div className="mt-3">
								<div className="text-2xl font-bold">{performanceMetrics.profitMargin.toFixed(1)}%</div>
								<p className="text-xs text-blue-600 mt-1">Net profit percentage</p>
							</div>
						</div>

						<div className="rounded-lg border bg-card p-6">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-medium text-muted-foreground">Avg Invoice Value</h3>
								<PieChart className="h-4 w-4 text-purple-600" />
							</div>
							<div className="mt-3">
								<div className="text-2xl font-bold">${performanceMetrics.averageInvoiceValue.toLocaleString()}</div>
								<p className="text-xs text-purple-600 mt-1">Per invoice average</p>
							</div>
						</div>

						<div className="rounded-lg border bg-card p-6">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-medium text-muted-foreground">Client Retention</h3>
								<ArrowUpRight className="h-4 w-4 text-orange-600" />
							</div>
							<div className="mt-3">
								<div className="text-2xl font-bold">{clientAnalytics.clientRetention.toFixed(1)}%</div>
								<p className="text-xs text-orange-600 mt-1">{clientAnalytics.activeClients} of {clientAnalytics.totalClients} clients active</p>
							</div>
						</div>
					</div>

					{/* Charts Row */}
					<div className="grid gap-6 lg:grid-cols-2">
						{/* Revenue Trend */}
						<div className="rounded-lg border bg-card">
							<div className="p-6 border-b">
								<h3 className="text-lg font-semibold">Revenue Trend</h3>
								<p className="text-sm text-muted-foreground">Monthly revenue over the last 12 months</p>
							</div>
							<div className="p-6">
								{revenueAnalytics.monthlyRevenue.length === 0 ? (
									<div className="text-center text-muted-foreground py-8">
										No revenue data available
									</div>
								) : (
									<div className="space-y-4">
										{revenueAnalytics.monthlyRevenue.slice(-6).map((data) => (
											<div key={data.month}>
												<div className="flex items-center justify-between mb-2">
													<span className="text-sm font-medium">{data.month}</span>
													<div className="flex items-center gap-2">
														<span className="text-sm font-bold">${(data.revenue / 1000).toFixed(1)}K</span>
														<Badge variant="secondary" className="text-xs">
															{data.growth >= 0 ? '+' : ''}{data.growth.toFixed(1)}%
														</Badge>
													</div>
												</div>
												<div className="h-2 bg-muted rounded-full overflow-hidden">
													<div
														className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
														style={{ width: `${Math.min((data.revenue / Math.max(...revenueAnalytics.monthlyRevenue.map(r => r.revenue))) * 100, 100)}%` }}
													></div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Top Categories */}
						<div className="rounded-lg border bg-card">
							<div className="p-6 border-b">
								<h3 className="text-lg font-semibold">Expense by Category</h3>
								<p className="text-sm text-muted-foreground">Distribution of expenses by category</p>
							</div>
							<div className="p-6 space-y-4">
								{expenseAnalytics.expensesByCategory.length === 0 ? (
									<div className="text-center text-muted-foreground py-8">
										No expense data available
									</div>
								) : (
									expenseAnalytics.expensesByCategory.slice(0, 5).map((cat, index) => {
										const colors = ["bg-blue-600", "bg-purple-600", "bg-green-600", "bg-orange-600", "bg-gray-600"];
										return (
											<div key={cat.category}>
												<div className="flex items-center justify-between mb-2">
													<span className="text-sm font-medium">{cat.category}</span>
													<div className="flex items-center gap-2">
														<span className="text-sm text-muted-foreground">${cat.amount.toLocaleString()}</span>
														<span className="text-sm font-medium">{cat.percentage.toFixed(1)}%</span>
													</div>
												</div>
												<div className="h-2 bg-muted rounded-full overflow-hidden">
													<div
														className={`h-full ${colors[index]} rounded-full`}
														style={{ width: `${cat.percentage}%` }}
													></div>
												</div>
											</div>
										);
									})
								)}
							</div>
						</div>
					</div>

					{/* Performance Metrics */}
					<div className="grid gap-6 lg:grid-cols-3">
						{/* Client Acquisition */}
						<div className="rounded-lg border bg-card">
							<div className="p-6 border-b">
								<h3 className="text-lg font-semibold">Client Acquisition</h3>
								<p className="text-sm text-muted-foreground">New clients by month</p>
							</div>
							<div className="p-6 space-y-3">
								{clientAnalytics.newClients.length === 0 ? (
									<div className="text-center text-muted-foreground py-8">
										No client data available
									</div>
								) : (
									clientAnalytics.newClients.slice(-4).map((data, index) => {
										const previousCount = index > 0 ? clientAnalytics.newClients[clientAnalytics.newClients.length - 4 + index - 1]?.count || 0 : 0;
										const trend = data.count > previousCount ? "up" : data.count < previousCount ? "down" : "stable";
										return (
											<div key={data.month} className="flex items-center justify-between">
												<span className="text-sm">{data.month}</span>
												<div className="flex items-center gap-2">
													<span className="text-sm font-semibold">{data.count}</span>
													{trend === "up" ? (
														<TrendingUp className="h-4 w-4 text-green-600" />
													) : trend === "down" ? (
														<TrendingDown className="h-4 w-4 text-red-600" />
													) : null}
												</div>
											</div>
										);
									})
								)}
							</div>
						</div>

						{/* Payment Success Rate */}
						<div className="rounded-lg border bg-card">
							<div className="p-6 border-b">
								<h3 className="text-lg font-semibold">Payment Success</h3>
								<p className="text-sm text-muted-foreground">Transaction success rate</p>
							</div>
							<div className="p-6 space-y-4">
								<div className="text-center">
									<div className="text-4xl font-bold text-green-600">{performanceMetrics.paymentSuccessRate.toFixed(1)}%</div>
									<p className="text-sm text-muted-foreground mt-1">Overall success rate</p>
								</div>
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span>Successful</span>
										<span className="font-medium text-green-600">{Math.round(performanceMetrics.paymentSuccessRate * 10)}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span>Failed</span>
										<span className="font-medium text-red-600">{Math.round((100 - performanceMetrics.paymentSuccessRate) * 10)}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span>Pending</span>
										<span className="font-medium text-yellow-600">0</span>
									</div>
								</div>
							</div>
						</div>

						{/* Average Response Time */}
						<div className="rounded-lg border bg-card">
							<div className="p-6 border-b">
								<h3 className="text-lg font-semibold">Invoice Turnaround</h3>
								<p className="text-sm text-muted-foreground">Average payment time</p>
							</div>
							<div className="p-6 space-y-4">
								<div className="text-center">
									<div className="text-4xl font-bold text-blue-600">12.5</div>
									<p className="text-sm text-muted-foreground mt-1">Days average</p>
								</div>
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span>0-7 days</span>
										<span className="font-medium">42%</span>
									</div>
									<div className="flex justify-between text-sm">
										<span>8-14 days</span>
										<span className="font-medium">31%</span>
									</div>
									<div className="flex justify-between text-sm">
										<span>15-30 days</span>
										<span className="font-medium">18%</span>
									</div>
									<div className="flex justify-between text-sm">
										<span>30+ days</span>
										<span className="font-medium text-red-600">9%</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</TabsContent>

				{/* Predictive Tab */}
				<TabsContent value="predictive">
					<PredictiveDashboard />
				</TabsContent>

				{/* Reports Tab */}
				<TabsContent value="reports">
					<ReportBuilder />
				</TabsContent>

				{/* Investors Tab */}
				<TabsContent value="investors">
					<InvestorPortalManager />
				</TabsContent>

				{/* Benchmarking Tab */}
				<TabsContent value="benchmarking">
					<BenchmarkingInsights />
				</TabsContent>
			</Tabs>
		</div>
	);
}

