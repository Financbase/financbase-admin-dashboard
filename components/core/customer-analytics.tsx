/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { BarChart3, Key, LayoutDashboard, User, XCircle } from "lucide-react";
import { useDashboard } from "@/contexts/dashboard-context";
import { useCustomerAnalytics } from "@/hooks/use-dashboard-data-optimized";
import { ArcElement, Legend, Tooltip, Chart as chartJs } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import EmptyState, { EmptyStates } from "./empty-state";
import DashboardErrorBoundary from "./error-boundary";

chartJs.register(ArcElement, Tooltip, Legend);

export default function CustomerAnalytics() {
	const { dateRange } = useDashboard();
	const { data: analytics, loading, error } = useCustomerAnalytics(dateRange);

	if (loading) {
		return (
			<div className="bg-white dark:bg-card rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-border w-full min-w-0">
				<div className="animate-pulse">
					<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
					<div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<DashboardErrorBoundary>
				<div className="bg-white dark:bg-card rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-border w-full min-w-0">
					<EmptyState
						title="Failed to load analytics"
						description="Unable to fetch customer analytics. Please try refreshing the page."
					/>
				</div>
			</DashboardErrorBoundary>
		);
	}

	if (!analytics || analytics.summary.totalCustomers === "0") {
		return (
			<div className="bg-white dark:bg-card rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-border w-full min-w-0">
				<EmptyState {...EmptyStates.customers} />
			</div>
		);
	}

	const customerData = analytics.chartData;

	const customerStats = analytics.stats;

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				callbacks: {
					label: (context: any) => {
						const ctx = context as { label?: string; parsed?: number };
						return `${ctx.label || 'Value'}: ${ctx.parsed || 0}%`;
					},
				},
			},
		},
	};

	return (
		<DashboardErrorBoundary>
			<div className="bg-white dark:bg-card rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-border w-full min-w-0">
				<div className="flex items-center justify-between mb-4 sm:mb-6">
					<h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
						Customer Analytics
					</h3>
					<button
						type="button"
						onClick={() => (window.location.href = "/customers")}
						className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline"
					>
						View all
					</button>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:gap-6">
					{/* Chart - Full width on mobile */}
					<div className="h-32 sm:h-48 w-full flex justify-center">
						<div className="w-32 sm:w-48 h-32 sm:h-48">
							<Doughnut data={customerData} options={chartOptions} />
						</div>
					</div>

					{/* Stats - Below chart on mobile */}
					<div className="space-y-3 sm:space-y-4">
						{customerStats.map((stat) => (
							<div
								key={stat.label}
								className="flex items-center justify-between"
							>
								<div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
									<div
										className={`w-3 h-3 rounded-full ${stat.color} flex-shrink-0`}
									/>
									<span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
										{stat.label}
									</span>
								</div>
								<div className="text-right flex-shrink-0">
									<p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
										{stat.value}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										{stat.percentage}
									</p>
								</div>
							</div>
						))}

						<div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
							<div className="flex justify-between items-center">
								<span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
									Total Customers
								</span>
								<span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
									{analytics.summary.totalCustomers}
								</span>
							</div>
							<p className="text-xs text-green-600 dark:text-green-400 mt-1">
								{analytics.summary.growthType === "increase" ? "+" : "-"}
								{analytics.summary.customerGrowth.toFixed(1)}% from last month
							</p>
						</div>
					</div>
				</div>
			</div>
		</DashboardErrorBoundary>
	);
}
