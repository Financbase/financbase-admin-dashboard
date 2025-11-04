/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import React from "react";
import { StatsWidget } from "./stats-widget";

// Revenue-focused stats widget
export const RevenueStatsWidget = ({
	amount,
	change,
	title = "Revenue",
	chartData,
	autoUpdate = true,
}: {
	amount: number;
	change: number;
	title?: string;
	chartData?: number[];
	autoUpdate?: boolean;
}) => (
	<StatsWidget
		amount={amount}
		change={change}
		title={title}
		chartData={chartData || [20, 35, 45, 60, 55, 75, 80]}
		autoUpdate={autoUpdate}
	/>
);

// Expense-focused stats widget (typically shows negative trends)
export const ExpenseStatsWidget = ({
	amount,
	change,
	title = "Expenses",
	chartData,
	autoUpdate = true,
}: {
	amount: number;
	change: number;
	title?: string;
	chartData?: number[];
	autoUpdate?: boolean;
}) => (
	<StatsWidget
		amount={amount}
		change={change}
		title={title}
		chartData={chartData || [60, 55, 45, 40, 35, 30, 25]}
		autoUpdate={autoUpdate}
	/>
);

// Performance metrics widget
export const PerformanceStatsWidget = ({
	amount,
	change,
	title = "Performance",
	chartData,
	autoUpdate = true,
}: {
	amount: number;
	change: number;
	title?: string;
	chartData?: number[];
	autoUpdate?: boolean;
}) => (
	<StatsWidget
		amount={amount}
		change={change}
		title={title}
		chartData={chartData || [40, 45, 50, 55, 60, 65, 70]}
		autoUpdate={autoUpdate}
	/>
);

// Health score widget (typically shows percentage)
export const HealthScoreWidget = ({
	score,
	change,
	title = "Health Score",
	chartData,
	autoUpdate = true,
}: {
	score: number;
	change: number;
	title?: string;
	chartData?: number[];
	autoUpdate?: boolean;
}) => (
	<StatsWidget
		amount={score}
		change={change}
		title={title}
		chartData={chartData || [60, 65, 70, 75, 80, 85, 90]}
		autoUpdate={autoUpdate}
	/>
);

// User activity widget
export const UserActivityWidget = ({
	count,
	change,
	title = "Active Users",
	chartData,
	autoUpdate = true,
}: {
	count: number;
	change: number;
	title?: string;
	chartData?: number[];
	autoUpdate?: boolean;
}) => (
	<StatsWidget
		amount={count}
		change={change}
		title={title}
		chartData={chartData || [100, 120, 110, 140, 130, 160, 150]}
		autoUpdate={autoUpdate}
	/>
);

// Conversion rate widget (shows percentage)
export const ConversionRateWidget = ({
	rate,
	change,
	title = "Conversion Rate",
	chartData,
	autoUpdate = true,
}: {
	rate: number;
	change: number;
	title?: string;
	chartData?: number[];
	autoUpdate?: boolean;
}) => (
	<StatsWidget
		amount={rate}
		change={change}
		title={title}
		chartData={chartData || [2.5, 3.0, 2.8, 3.5, 3.2, 4.0, 3.8]}
		autoUpdate={autoUpdate}
	/>
);

// Profit margin widget
export const ProfitMarginWidget = ({
	margin,
	change,
	title = "Profit Margin",
	chartData,
	autoUpdate = true,
}: {
	margin: number;
	change: number;
	title?: string;
	chartData?: number[];
	autoUpdate?: boolean;
}) => (
	<StatsWidget
		amount={margin}
		change={change}
		title={title}
		chartData={chartData || [15, 18, 20, 22, 25, 28, 30]}
		autoUpdate={autoUpdate}
	/>
);

// ROI widget
export const ROIWidget = ({
	roi,
	change,
	title = "ROI",
	chartData,
	autoUpdate = true,
}: {
	roi: number;
	change: number;
	title?: string;
	chartData?: number[];
	autoUpdate?: boolean;
}) => (
	<StatsWidget
		amount={roi}
		change={change}
		title={title}
		chartData={chartData || [8, 10, 12, 15, 18, 20, 22]}
		autoUpdate={autoUpdate}
	/>
);

// Alert count widget (typically shows decreasing trend as good)
export const AlertCountWidget = ({
	count,
	change,
	title = "Active Alerts",
	chartData,
	autoUpdate = true,
}: {
	count: number;
	change: number;
	title?: string;
	chartData?: number[];
	autoUpdate?: boolean;
}) => (
	<StatsWidget
		amount={count}
		change={change}
		title={title}
		chartData={chartData || [80, 70, 60, 50, 40, 30, 25]}
		autoUpdate={autoUpdate}
	/>
);

// Growth rate widget
export const GrowthRateWidget = ({
	rate,
	change,
	title = "Growth Rate",
	chartData,
	autoUpdate = true,
}: {
	rate: number;
	change: number;
	title?: string;
	chartData?: number[];
	autoUpdate?: boolean;
}) => (
	<StatsWidget
		amount={rate}
		change={change}
		title={title}
		chartData={chartData || [5, 8, 10, 12, 15, 18, 20]}
		autoUpdate={autoUpdate}
	/>
);
