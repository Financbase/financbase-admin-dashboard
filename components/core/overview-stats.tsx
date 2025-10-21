"use client";

import { useDashboardDateRange } from "@/contexts/dashboard-context";
import { useDashboardStats } from "@/hooks/use-dashboard-data-optimized";
import { formatPercentage } from "@/lib/format-utils";
import {
	DollarSign,
	Key,
	LayoutDashboard,
	Package,
	ShoppingCart,
	TrendingDown,
	TrendingUp,
	Users,
	XCircle,
} from "lucide-react";
import type React from "react";
import EmptyState from "./empty-state";
import DashboardErrorBoundary from "./error-boundary";

interface StatCard {
	title: string;
	value: string;
	change: string;
	changeType: "increase" | "decrease";
	icon: React.ReactNode;
}

export default function OverviewStats() {
	const { dateRange } = useDashboardDateRange();
	const { data: stats, loading, error } = useDashboardStats(dateRange);

	if (loading) {
		return (
			<div
				className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4"
				data-testid="dashboard-stats"
			>
				{[...new Array(4)].map((_, i) => (
					<div
						key={`loading-stat-${i}`}
						className="bg-white dark:bg-[#0F0F12] rounded-lg sm:rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-[#1F1F23]"
						data-testid="stat-card"
					>
						<div className="animate-pulse">
							<div className="flex items-center justify-between pb-2">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
								<div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
							</div>
							<div className="space-y-2">
								<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<DashboardErrorBoundary>
				<div
					className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4"
					data-testid="dashboard-stats"
				>
					<div
						className="bg-white dark:bg-[#0F0F12] rounded-lg sm:rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-[#1F1F23]"
						data-testid="stat-card"
					>
						<EmptyState
							title="Failed to load stats"
							description="Unable to fetch dashboard statistics. Please try refreshing the page."
						/>
					</div>
				</div>
			</DashboardErrorBoundary>
		);
	}

	if (!stats) {
		return (
			<div
				className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4"
				data-testid="dashboard-stats"
			>
				<div
					className="bg-white dark:bg-[#0F0F12] rounded-lg sm:rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-[#1F1F23]"
					data-testid="stat-card"
				>
					<EmptyState
						title="No data available"
						description="Dashboard statistics will appear here once you have data."
					/>
				</div>
			</div>
		);
	}

	const statCards: StatCard[] = [
		{
			title: "Total Revenue",
			value: stats.revenue.value,
			change: formatPercentage(stats.revenue.change),
			changeType: stats.revenue.changeType,
			icon: <DollarSign className="h-4 w-4" />,
		},
		{
			title: "Orders",
			value: stats.orders.value,
			change: formatPercentage(stats.orders.change),
			changeType: stats.orders.changeType,
			icon: <ShoppingCart className="h-4 w-4" />,
		},
		{
			title: "Customers",
			value: stats.customers.value,
			change: formatPercentage(stats.customers.change),
			changeType: stats.customers.changeType,
			icon: <Users className="h-4 w-4" />,
		},
		{
			title: "Products",
			value: stats.products.value,
			change: formatPercentage(stats.products.change),
			changeType: stats.products.changeType,
			icon: <Package className="h-4 w-4" />,
		},
	];

	return (
		<DashboardErrorBoundary>
			<div
				className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4"
				data-testid="dashboard-stats"
			>
				{statCards.map((stat) => (
					<section
						key={stat.title}
						className="bg-white dark:bg-[#0F0F12] rounded-lg sm:rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-[#1F1F23] hover:shadow-md transition-shadow"
						aria-label={`${stat.title} statistic`}
						data-testid="stat-card"
					>
						<div className="flex items-center justify-between space-y-0 pb-2">
							<h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
								{stat.title}
							</h3>
							<div className="text-gray-600 dark:text-gray-400 flex-shrink-0">
								{stat.icon}
							</div>
						</div>
						<div className="space-y-1">
							<div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
								{stat.value}
							</div>
							<div className="flex items-center text-xs">
								{stat.changeType === "increase" ? (
									<TrendingUp className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
								) : (
									<TrendingDown className="h-3 w-3 text-red-500 mr-1 flex-shrink-0" />
								)}
								<span
									className={
										`font-medium ${stat.changeType}` === "increase"
											? "text-green-600"
											: "text-red-600"
									}
								>
									{stat.change}
								</span>
								<span className="text-gray-500 dark:text-gray-400 ml-1 hidden sm:inline">
									from last period
								</span>
								<span className="text-gray-500 dark:text-gray-400 ml-1 sm:hidden">
									vs last
								</span>
							</div>
						</div>
					</section>
				))}
			</div>
		</DashboardErrorBoundary>
	);
}
