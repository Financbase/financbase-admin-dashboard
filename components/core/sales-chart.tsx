/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import {
	BarChart3,
	Clock,
	LayoutDashboard,
	TrendingUp,
	XCircle,
} from "lucide-react";

import { useDashboardDateRange } from "@/contexts/dashboard-context";
import { useChartData } from "@/hooks/use-dashboard-data-optimized";
import {
	BarElement,
	CategoryScale,
	Legend,
	LineElement,
	LinearScale,
	PointElement,
	Title,
	Tooltip,
	Chart as chartJs,
} from "chart.js";
import { useEffect, useState, useMemo } from "react";
import { Bar, Line } from "react-chartjs-2";
import EmptyState, { EmptyStates } from "./empty-state";
import DashboardErrorBoundary from "./error-boundary";
import { useWindowSize } from "@/hooks";
import { getThemeRgb } from "@/lib/utils/theme-colors";

chartJs.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	BarElement,
);

/**
 * Get chart options with theme colors
 */
function getChartOptions() {
	// Get border color with opacity for grid lines
	const borderColor = getThemeRgb("--border", 0.1);
	
	return {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top" as const,
				labels: {
					usePointStyle: true,
					padding: 20,
					font: {
						size: 12,
					},
				},
			},
			title: {
				display: false,
			},
			tooltip: {
				mode: "index" as const,
				intersect: false,
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				grid: {
					color: borderColor || "rgba(0, 0, 0, 0.1)",
				},
				ticks: {
					font: {
						size: 11,
					},
				},
			},
			x: {
				grid: {
					color: borderColor || "rgba(0, 0, 0, 0.1)",
				},
				ticks: {
					font: {
						size: 11,
					},
				},
			},
		},
		interaction: {
			mode: "nearest" as const,
			axis: "x" as const,
			intersect: false,
		},
	};
}

/**
 * Get mobile chart options with theme colors
 */
function getMobileChartOptions() {
	const baseOptions = getChartOptions();
	return {
		...baseOptions,
		plugins: {
			...baseOptions.plugins,
			legend: {
				...baseOptions.plugins.legend,
				labels: {
					...baseOptions.plugins.legend.labels,
					padding: 10,
					font: {
						size: 10,
					},
				},
			},
		},
		scales: {
			...baseOptions.scales,
			y: {
				...baseOptions.scales.y,
				ticks: {
					font: {
						size: 9,
					},
					maxTicksLimit: 6,
				},
			},
			x: {
				...baseOptions.scales.x,
				ticks: {
					font: {
						size: 9,
					},
					maxRotation: 45,
					minRotation: 0,
				},
			},
		},
	};
}

export function SalesChart() {
	const { width } = useWindowSize();
	const isMobile = width < 640;
	const [timeRange, setTimeRange] = useState<"month" | "week" | "day">("month");
	const { dateRange } = useDashboardDateRange();
	const {
		data: chartData,
		loading,
		error,
	} = useChartData("sales", undefined, timeRange);

	// Memoize chart options to avoid recalculating on every render
	const chartOptionsMemo = useMemo(() => getChartOptions(), []);
	const mobileChartOptionsMemo = useMemo(() => getMobileChartOptions(), []);

	const handleTimeRangeChange = (value: string) => {
		setTimeRange(value as "month" | "week" | "day");
	};

	if (loading) {
		return (
			<div className="w-full h-full min-h-0">
				<div className="animate-pulse">
					<div className="flex justify-between mb-4">
						<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32" />
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
					</div>
					<div className="h-48 sm:h-64 bg-gray-200 dark:bg-gray-700 rounded" />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<DashboardErrorBoundary>
				<div className="w-full h-full min-h-0">
					<EmptyState
						title="Failed to load chart"
						description="Unable to fetch sales data. Please try refreshing the page."
					/>
				</div>
			</DashboardErrorBoundary>
		);
	}

	if (!chartData?.datasets[0].data.some((value) => value > 0)) {
		return (
			<div className="w-full h-full min-h-0">
				<EmptyState {...EmptyStates.charts} />
			</div>
		);
	}

	return (
		<DashboardErrorBoundary>
			<div
				className="w-full h-full min-h-0"
				data-testid="sales-chart"
			>
				<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
					<h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
						Sales Overview
					</h3>
					<select
						value={timeRange}
						onChange={(e) => handleTimeRangeChange(e.target.value)}
						className="text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full sm:w-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						aria-label="Select time range for sales chart"
						data-testid="chart-time-range-selector"
					>
						<option value="day">Last 30 days</option>
						<option value="week">Last 12 weeks</option>
						<option value="month">Last 12 months</option>
					</select>
				</div>
				<div
					className="h-48 sm:h-56 w-full min-w-0"
					role="img"
					aria-label={`Sales chart showing ${timeRange} data with ${chartData?.datasets[0]?.data?.length || 0} data points`}
					data-testid="chart-container"
				>
					<Line
						data={chartData}
						options={isMobile ? mobileChartOptionsMemo : chartOptionsMemo}
					/>
				</div>
			</div>
		</DashboardErrorBoundary>
	);
}

export function RevenueChart() {
	const { width } = useWindowSize();
	const isMobile = width < 640;
	const { dateRange } = useDashboardDateRange();
	const {
		data: chartData,
		loading,
		error,
	} = useChartData("revenue", undefined, "week");

	// Memoize chart options to avoid recalculating on every render
	const chartOptionsMemo = useMemo(() => getChartOptions(), []);
	const mobileChartOptionsMemo = useMemo(() => getMobileChartOptions(), []);

	if (loading) {
		return (
			<div className="w-full h-full min-h-0">
				<div className="animate-pulse">
					<div className="flex justify-between mb-4">
						<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32" />
						<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
					</div>
					<div className="h-48 sm:h-56 bg-gray-200 dark:bg-gray-700 rounded" />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<DashboardErrorBoundary>
				<div className="w-full h-full min-h-0">
					<EmptyState
						title="Failed to load chart"
						description="Unable to fetch revenue data. Please try refreshing the page."
					/>
				</div>
			</DashboardErrorBoundary>
		);
	}

	if (!chartData?.datasets[0].data.some((value) => value > 0)) {
		return (
			<div className="w-full h-full min-h-0">
				<EmptyState {...EmptyStates.charts} />
			</div>
		);
	}

	return (
		<DashboardErrorBoundary>
			<div className="w-full h-full min-h-0">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
					<h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
						Weekly Revenue
					</h3>
					<span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
						This week
					</span>
				</div>
				<div
					className="h-48 sm:h-56 w-full min-w-0"
					role="img"
					aria-label={`Revenue chart showing weekly data with ${chartData?.datasets[0]?.data?.length || 0} data points`}
				>
					<Bar
						data={chartData}
						options={isMobile ? mobileChartOptionsMemo : chartOptionsMemo}
					/>
				</div>
			</div>
		</DashboardErrorBoundary>
	);
}
