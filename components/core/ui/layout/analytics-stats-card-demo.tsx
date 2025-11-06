/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { AnalyticsStatsCard } from "@/components/core/ui/layout/analytics-stats-card";
import {
	Activity,
	ArrowDown,
	ArrowUp,
	BarChart3,
	Clock,
	Eye,
	MousePointerClick,
	TrendingUp,
	Users,
} from "lucide-react";
// components/ui/analytics-stats-card-demo.tsx
import type * as React from "react";

// Mock data for the analytics demo
const analyticsStatsData = {
	title: "User Analytics",
	timeFrame: "Last 30 Days",
	mainMetric: {
		value: 125430,
		change: 15420,
		changePeriod: "vs previous month",
		label: "Total Page Views",
	},
	subStats: [
		{
			value: "8,420",
			label: "Unique Users",
			subLabel: "Active this month",
			trend: "up" as const,
			icon: <Users className="h-4 w-4" />,
		},
		{
			value: "2.3 min",
			label: "Avg Session",
			subLabel: "Time on site",
			trend: "up" as const,
			icon: <Clock className="h-4 w-4" />,
		},
	] as [
		{
			value: string;
			label: string;
			subLabel: string;
			trend: "up" | "down" | "neutral";
			icon?: React.ReactNode;
		},
		{
			value: string;
			label: string;
			subLabel: string;
			trend: "up" | "down" | "neutral";
			icon?: React.ReactNode;
		},
	],
	ranking: {
		score: "High Engagement",
		category: "User Activity",
		icon: <TrendingUp className="h-8 w-8" />,
		trend: "up" as const,
	},
	activity: {
		title: "Daily Activity",
		bars: [
			{ level: 0.6, period: "Mon" },
			{ level: 0.8, period: "Tue" },
			{ level: 0.9, period: "Wed" },
			{ level: 0.7, period: "Thu" },
			{ level: 0.85, period: "Fri" },
			{ level: 0.4, period: "Sat" },
			{ level: 0.3, period: "Sun" },
			{ level: 0.6, period: "Mon" },
			{ level: 0.8, period: "Tue" },
			{ level: 0.9, period: "Wed" },
			{ level: 0.7, period: "Thu" },
			{ level: 0.85, period: "Fri" },
			{ level: 0.4, period: "Sat" },
			{ level: 0.3, period: "Sun" },
			{ level: 0.6, period: "Mon" },
		],
		label: "User engagement over time",
		engagementScore: 78,
	},
};

export default function AnalyticsStatsCardDemo() {
	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
			<AnalyticsStatsCard {...analyticsStatsData} />
		</div>
	);
}
