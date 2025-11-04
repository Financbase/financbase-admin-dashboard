/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

/**
 * Financial Overview Dashboard
 * Comprehensive view of financial metrics and KPIs
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
	TrendingUp, 
	TrendingDown, 
	DollarSign, 
	CreditCard, 
	FileText, 
	AlertCircle,
	ArrowUpRight,
	ArrowDownRight,
	Minus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { RevenueChart } from './revenue-chart';
import { ExpenseBreakdownChart } from './expense-breakdown-chart';
import { CashFlowChart } from './cash-flow-chart';

interface FinancialMetric {
	label: string;
	value: string;
	change: number;
	trend: 'up' | 'down' | 'neutral';
	period: string;
}

interface FinancialOverviewProps {
	className?: string;
}

export function FinancialOverviewDashboard({ className }: FinancialOverviewProps) {
	// This would come from your API/database
	const metrics: FinancialMetric[] = [
		{
			label: 'Total Revenue',
			value: '$124,592',
			change: 12.5,
			trend: 'up',
			period: 'vs last month',
		},
		{
			label: 'Total Expenses',
			value: '$78,234',
			change: -5.2,
			trend: 'down',
			period: 'vs last month',
		},
		{
			label: 'Net Profit',
			value: '$46,358',
			change: 8.3,
			trend: 'up',
			period: 'vs last month',
		},
		{
			label: 'Cash Flow',
			value: '$32,145',
			change: 15.7,
			trend: 'up',
			period: 'vs last month',
		},
	];

	const outstandingInvoices = {
		total: 24,
		overdue: 3,
		totalAmount: 45670,
		overdueAmount: 12340,
	};

	const cashFlowHealth = {
		current: 68,
		target: 100,
		status: 'healthy' as 'healthy' | 'warning' | 'critical',
	};

	return (
		<div className={cn('space-y-6', className)}>
			{/* Key Metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{metrics.map((metric) => (
					<MetricCard key={metric.label} metric={metric} />
				))}
			</div>

			{/* Detailed Views */}
			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="invoices">Invoices</TabsTrigger>
					<TabsTrigger value="expenses">Expenses</TabsTrigger>
					<TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						{/* Cash Flow Health */}
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Cash Flow Health</CardTitle>
								<CardDescription>
									Current financial stability score
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span>Health Score</span>
										<span className="font-semibold">{cashFlowHealth.current}%</span>
									</div>
									<Progress value={cashFlowHealth.current} className="h-2" />
								</div>
								<div className="flex items-center gap-2">
									<Badge
										variant={
											cashFlowHealth.status === 'healthy'
												? 'default'
												: cashFlowHealth.status === 'warning'
												? 'secondary'
												: 'destructive'
										}
									>
										{cashFlowHealth.status.toUpperCase()}
									</Badge>
									<span className="text-xs text-muted-foreground">
										{cashFlowHealth.status === 'healthy' 
											? 'Your cash flow is strong'
											: cashFlowHealth.status === 'warning'
											? 'Monitor your cash flow closely'
											: 'Action required'}
									</span>
								</div>
							</CardContent>
						</Card>

						{/* Outstanding Invoices */}
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Outstanding Invoices</CardTitle>
								<CardDescription>
									Pending and overdue payments
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">Total Outstanding</span>
										<span className="font-semibold">
											{outstandingInvoices.total} invoices
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">Total Amount</span>
										<span className="font-semibold">
											${outstandingInvoices.totalAmount.toLocaleString()}
										</span>
									</div>
									{outstandingInvoices.overdue > 0 && (
										<>
											<div className="h-px bg-border" />
											<div className="flex items-center justify-between text-destructive">
												<div className="flex items-center gap-2">
													<AlertCircle className="h-4 w-4" />
													<span className="text-sm font-medium">Overdue</span>
												</div>
												<span className="font-semibold">
													{outstandingInvoices.overdue} invoices
												</span>
											</div>
											<div className="flex items-center justify-between text-destructive">
												<span className="text-sm">Overdue Amount</span>
												<span className="font-semibold">
													${outstandingInvoices.overdueAmount.toLocaleString()}
												</span>
											</div>
										</>
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Charts */}
					<div className="grid gap-4">
						<RevenueChart />
						<div className="grid gap-4 md:grid-cols-2">
							<ExpenseBreakdownChart />
							<CashFlowChart />
						</div>
					</div>
				</TabsContent>

				<TabsContent value="invoices">
					<Card>
						<CardHeader>
							<CardTitle>Invoice Analytics</CardTitle>
							<CardDescription>
								Detailed breakdown of your invoicing performance
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								Invoice analytics dashboard coming soon...
							</p>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="expenses">
					<Card>
						<CardHeader>
							<CardTitle>Expense Analytics</CardTitle>
							<CardDescription>
								Track and categorize your business expenses
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								Expense analytics dashboard coming soon...
							</p>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="cashflow">
					<Card>
						<CardHeader>
							<CardTitle>Cash Flow Analysis</CardTitle>
							<CardDescription>
								Monitor your cash inflows and outflows
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								Cash flow analysis dashboard coming soon...
							</p>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}

interface MetricCardProps {
	metric: FinancialMetric;
}

function MetricCard({ metric }: MetricCardProps) {
	const TrendIcon = metric.trend === 'up' 
		? ArrowUpRight 
		: metric.trend === 'down' 
		? ArrowDownRight 
		: Minus;

	const trendColor = metric.trend === 'up' 
		? 'text-green-600 dark:text-green-400' 
		: metric.trend === 'down' 
		? 'text-red-600 dark:text-red-400' 
		: 'text-gray-600 dark:text-gray-400';

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">
					{metric.label}
				</CardTitle>
				<div className="h-4 w-4 text-muted-foreground">
					{metric.label.includes('Revenue') && <DollarSign className="h-4 w-4" />}
					{metric.label.includes('Expenses') && <CreditCard className="h-4 w-4" />}
					{metric.label.includes('Profit') && <TrendingUp className="h-4 w-4" />}
					{metric.label.includes('Cash Flow') && <FileText className="h-4 w-4" />}
				</div>
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{metric.value}</div>
				<div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
					<TrendIcon className={cn('h-3 w-3', trendColor)} />
					<span className={trendColor}>
						{Math.abs(metric.change)}%
					</span>
					<span>{metric.period}</span>
				</div>
			</CardContent>
		</Card>
	);
}

