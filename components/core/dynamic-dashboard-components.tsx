"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamic imports for heavy components
export const DynamicAIInsightsPanel = dynamic(
	() =>
		import("@/components/core/ai-insights-panel").then((mod) => ({
			default: mod.AIInsightsPanel,
		})),
	{
		loading: () => (
			<div className="animate-pulse bg-gray-200 h-32 rounded-lg" />
		),
		ssr: false,
	},
);

export const DynamicFraudNotificationDropdown = dynamic(
	() =>
		import("@/components/fraud-notification-dropdown").then((mod) => ({
			default: mod.FraudNotificationDropdown,
		})),
	{
		loading: () => (
			<div className="animate-pulse bg-gray-200 h-8 w-8 rounded" />
		),
		ssr: false,
	},
);

export const DynamicRecentActivityFeed = dynamic(
	() =>
		import("@/components/ui/dashboard-activities").then((mod) => ({
			default: mod.RecentActivityFeed,
		})),
	{
		loading: () => (
			<div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
		),
		ssr: false,
	},
);

export const DynamicProfileCard = dynamic(
	() =>
		import("@/components/ui/flexible-profile-card").then((mod) => ({
			default: mod.ProfileCard,
		})),
	{
		loading: () => (
			<div className="animate-pulse bg-gray-200 h-48 rounded-lg" />
		),
		ssr: false,
	},
);

export const DynamicStockPortfolioCard = dynamic(
	() =>
		import("@/components/ui/stock-portfolio-card").then((mod) => ({
			default: mod.StockPortfolioCard,
		})),
	{
		loading: () => (
			<div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
		),
		ssr: false,
	},
);

export const DynamicSimpleAreaChartDemo = dynamic(
	() =>
		import("@/components/ui/simple-area-chart-demo").then((mod) => ({
			default: mod.default,
		})),
	{
		loading: () => (
			<div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
		),
		ssr: false,
	},
);

// Wrapper component for Suspense
export function DashboardSuspense({ children }: { children: React.ReactNode }) {
	return (
		<Suspense
			fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-lg" />}
		>
			{children}
		</Suspense>
	);
}
