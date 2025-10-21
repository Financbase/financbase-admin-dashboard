import { FinancialStatsCard } from "@/components/ui/financial-stats-card";
import {
	AlertTriangle,
	ArrowDown,
	ArrowUp,
	DollarSign,
	Target,
	TrendingUp,
} from "lucide-react";
// components/ui/financial-stats-card-demo.tsx
import * as React from "react";

// Mock data for the financial demo
const financialStatsData = {
	title: "Revenue Analytics",
	timeFrame: "Q4 2024",
	mainMetric: {
		amount: 284750.5,
		change: 45620.25,
		changePeriod: "vs Q3 2024",
		currency: "USD",
	},
	subStats: [
		{
			value: "$125,400",
			label: "Monthly Revenue",
			subLabel: "December 2024",
			trend: "up" as const,
		},
		{
			value: "$45,200",
			label: "Expenses",
			subLabel: "Operating costs",
			trend: "down" as const,
		},
	] as [
		{
			value: string;
			label: string;
			subLabel: string;
			trend: "up" | "down" | "neutral";
		},
		{
			value: string;
			label: string;
			subLabel: string;
			trend: "up" | "down" | "neutral";
		},
	],
	ranking: {
		score: "A+ Rating",
		category: "Financial Health",
		icon: <Target className="h-8 w-8" />,
		trend: "up" as const,
	},
	performance: {
		title: "Revenue Trend",
		bars: [
			{ level: 0.8, period: "Jan" },
			{ level: 0.9, period: "Feb" },
			{ level: 0.7, period: "Mar" },
			{ level: 0.95, period: "Apr" },
			{ level: 1.0, period: "May" },
			{ level: 0.85, period: "Jun" },
			{ level: 0.9, period: "Jul" },
			{ level: 0.75, period: "Aug" },
			{ level: 0.8, period: "Sep" },
			{ level: 0.9, period: "Oct" },
			{ level: 0.95, period: "Nov" },
			{ level: 1.0, period: "Dec" },
		],
		label: "Monthly revenue performance",
		healthScore: 92,
	},
};

export default function FinancialStatsCardDemo() {
	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
			<FinancialStatsCard {...financialStatsData} />
		</div>
	);
}
