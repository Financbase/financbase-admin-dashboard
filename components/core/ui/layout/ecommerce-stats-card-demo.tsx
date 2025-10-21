import { EcommerceStatsCard } from "@/components/ui/ecommerce-stats-card";
import {
	ArrowDown,
	ArrowUp,
	Package,
	ShoppingCart,
	Star,
	TrendingUp,
	Users,
} from "lucide-react";
// components/ui/ecommerce-stats-card-demo.tsx
import type * as React from "react";

// Mock data for the e-commerce demo
const ecommerceStatsData = {
	title: "Sales Dashboard",
	timeFrame: "Black Friday",
	mainMetric: {
		value: 125400.75,
		change: 25400.25,
		changePeriod: "vs last week",
		label: "Total Revenue",
		currency: "USD",
	},
	subStats: [
		{
			value: "1,240",
			label: "Orders",
			subLabel: "Completed today",
			trend: "up" as const,
			icon: <ShoppingCart className="h-4 w-4" />,
		},
		{
			value: "850",
			label: "Products",
			subLabel: "In stock",
			trend: "neutral" as const,
			icon: <Package className="h-4 w-4" />,
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
		score: "Top 5%",
		category: "Sales Performance",
		icon: <Star className="h-8 w-8" />,
		trend: "up" as const,
	},
	performance: {
		title: "Sales Performance",
		bars: [
			{ level: 0.6, period: "6AM" },
			{ level: 0.8, period: "9AM" },
			{ level: 0.9, period: "12PM" },
			{ level: 0.7, period: "3PM" },
			{ level: 1.0, period: "6PM" },
			{ level: 0.8, period: "9PM" },
			{ level: 0.4, period: "12AM" },
			{ level: 0.3, period: "3AM" },
			{ level: 0.5, period: "6AM" },
			{ level: 0.8, period: "9AM" },
			{ level: 0.9, period: "12PM" },
			{ level: 0.7, period: "3PM" },
			{ level: 1.0, period: "6PM" },
			{ level: 0.8, period: "9PM" },
			{ level: 0.4, period: "12AM" },
		],
		label: "Hourly sales performance",
		conversionRate: 3.2,
	},
};

export default function EcommerceStatsCardDemo() {
	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
			<EcommerceStatsCard {...ecommerceStatsData} />
		</div>
	);
}
