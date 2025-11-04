/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { PerformanceStatsCard } from "@/components/ui/performance-stats-card";
import {
	Activity,
	AlertTriangle,
	CheckCircle,
	Clock,
	Shield,
	Zap,
} from "lucide-react";
// components/ui/performance-stats-card-demo.tsx
import type * as React from "react";

// Mock data for the performance demo
const performanceStatsData = {
	title: "System Health",
	timeFrame: "Live Status",
	mainMetric: {
		value: 99.8,
		change: 0.2,
		changePeriod: "vs yesterday",
		label: "Uptime",
		unit: "%",
	},
	subStats: [
		{
			value: "45ms",
			label: "Response Time",
			subLabel: "Average latency",
			status: "healthy" as const,
			icon: <Clock className="h-4 w-4" />,
		},
		{
			value: "2",
			label: "Active Alerts",
			subLabel: "System warnings",
			status: "warning" as const,
			icon: <AlertTriangle className="h-4 w-4" />,
		},
	] as [
		{
			value: string;
			label: string;
			subLabel: string;
			status: "healthy" | "warning" | "critical";
			icon?: React.ReactNode;
		},
		{
			value: string;
			label: string;
			subLabel: string;
			status: "healthy" | "warning" | "critical";
			icon?: React.ReactNode;
		},
	],
	ranking: {
		score: "Excellent",
		category: "System Performance",
		icon: <Shield className="h-8 w-8" />,
		status: "healthy" as const,
	},
	performance: {
		title: "CPU Usage",
		bars: [
			{ level: 0.3, period: "00:00" },
			{ level: 0.2, period: "04:00" },
			{ level: 0.4, period: "08:00" },
			{ level: 0.6, period: "12:00" },
			{ level: 0.8, period: "16:00" },
			{ level: 0.7, period: "20:00" },
			{ level: 0.3, period: "00:00" },
			{ level: 0.2, period: "04:00" },
			{ level: 0.4, period: "08:00" },
			{ level: 0.6, period: "12:00" },
			{ level: 0.8, period: "16:00" },
			{ level: 0.7, period: "20:00" },
			{ level: 0.3, period: "00:00" },
			{ level: 0.2, period: "04:00" },
			{ level: 0.4, period: "08:00" },
		],
		label: "24-hour system performance",
		uptime: 99.8,
	},
};

export default function PerformanceStatsCardDemo() {
	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
			<PerformanceStatsCard {...performanceStatsData} />
		</div>
	);
}
