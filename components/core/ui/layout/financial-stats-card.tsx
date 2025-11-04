/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
	AlertTriangle,
	ArrowDown,
	ArrowUp,
	BarChart3,
	Clock,
	DollarSign,
	Key,
	Target,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
// components/ui/financial-stats-card.tsx
import * as React from "react";

// Type definitions for financial metrics
type FinancialSubStat = {
	value: string | number;
	label: string;
	subLabel: string;
	trend?: "up" | "down" | "neutral";
};

type FinancialBar = {
	level: number; // A value between 0 and 1 representing the fill percentage
	period: string;
	color?: string;
};

interface FinancialStatsCardProps {
	/** The main title of the card */
	title: string;
	/** The text for the time frame display */
	timeFrame: string;
	/** Main financial metric */
	mainMetric: {
		amount: number;
		change: number;
		changePeriod: string;
		currency?: string;
	};
	/** An array of two sub-financial statistics */
	subStats: [FinancialSubStat, FinancialSubStat];
	/** Financial health/performance ranking */
	ranking: {
		score: string;
		category: string;
		icon?: React.ReactNode;
		trend?: "up" | "down" | "neutral";
	};
	/** Cash flow or performance visualization */
	performance: {
		title: string;
		bars: FinancialBar[];
		label: string;
		healthScore?: number;
	};
	/** Optional additional class names */
	className?: string;
}

/**
 * A specialized card component for displaying financial statistics with animated performance charts.
 * Built for financial intelligence dashboards with revenue, expenses, and profit metrics.
 */
export const FinancialStatsCard = React.forwardRef<
	HTMLDivElement,
	FinancialStatsCardProps
>(
	(
		{ title, timeFrame, mainMetric, subStats, ranking, performance, className },
		ref,
	) => {
		const currencyFormatter = new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: mainMetric.currency || "USD",
		});

		// Animation variants for the performance bars container
		const containerVariants = {
			hidden: { opacity: 0 },
			visible: {
				opacity: 1,
				transition: {
					staggerChildren: 0.05,
				},
			},
		};

		// Animation variants for each individual bar
		const barVariants = {
			hidden: { height: "0%", opacity: 0 },
			visible: {
				height: "100%",
				opacity: 1,
				transition: { duration: 0.5, ease: "easeOut" },
			},
		};

		// Financial performance color scheme
		const getBarColor = (level: number, index: number) => {
			if (level === 0) return "hsl(var(--muted))";

			const colors = [
				"#ef4444", // Red for low performance
				"#f97316", // Orange for below average
				"#eab308", // Yellow for average
				"#22c55e", // Green for good
				"#3b82f6", // Blue for excellent
			];

			const colorIndex = Math.min(
				Math.floor(level * colors.length),
				colors.length - 1,
			);
			return colors[colorIndex];
		};

		const getTrendIcon = (trend?: "up" | "down" | "neutral") => {
			switch (trend) {
				case "up":
					return <TrendingUp className="h-4 w-4 text-green-500" />;
				case "down":
					return <TrendingDown className="h-4 w-4 text-red-500" />;
				default:
					return <Target className="h-4 w-4 text-muted-foreground" />;
			}
		};

		const getHealthColor = (score?: number) => {
			if (!score) return "text-muted-foreground";
			if (score >= 80) return "text-green-500";
			if (score >= 60) return "text-yellow-500";
			return "text-red-500";
		};

		return (
			<div
				ref={ref}
				className={cn(
					"w-full max-w-sm rounded-2xl bg-card text-card-foreground p-6 shadow-lg font-sans flex flex-col gap-6 border",
					className,
				)}
				aria-labelledby="financial-stats-card-title"
			>
				{/* Card Header */}
				<header className="flex justify-between items-center">
					<h2
						id="financial-stats-card-title"
						className="text-xl font-bold flex items-center gap-2"
					>
						<DollarSign className="h-5 w-5" />
						{title}
					</h2>
					<div className="text-sm font-medium px-3 py-1 rounded-md bg-muted text-muted-foreground">
						{timeFrame}
					</div>
				</header>

				{/* Main Financial Metric */}
				<section aria-label="Main Financial Metric">
					<p className="text-sm text-muted-foreground">Revenue</p>
					<h3 className="text-5xl font-bold tracking-tighter mt-1">
						{currencyFormatter.format(mainMetric.amount)}
					</h3>
					<div className="flex items-center gap-2 mt-2">
						{getTrendIcon(mainMetric.change >= 0 ? "up" : "down")}
						<p
							className={cn(
								"text-sm font-semibold",
								mainMetric.change >= 0 ? "text-green-500" : "text-red-500",
							)}
						>
							{mainMetric.change >= 0 ? "+" : ""}
							{currencyFormatter.format(mainMetric.change)}{" "}
							{mainMetric.changePeriod}
						</p>
					</div>
				</section>

				{/* Sub-Financial Stats Grid */}
				<section
					className="grid grid-cols-2 gap-4"
					aria-label="Financial Breakdown"
				>
					{subStats.map((stat, index) => (
						<div
							key={`financial-stat-${stat.label}-${index}`}
							className="bg-muted rounded-lg p-4"
						>
							<div className="flex items-center justify-between mb-1">
								<p className="text-2xl font-bold">{stat.value}</p>
								{stat.trend && getTrendIcon(stat.trend)}
							</div>
							<p className="text-base font-normal text-muted-foreground">
								{stat.label}
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								{stat.subLabel}
							</p>
						</div>
					))}
				</section>

				{/* Financial Health Ranking */}
				<section
					className={cn(
						"flex items-center justify-between p-4 rounded-lg",
						ranking.trend === "up"
							? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
							: ranking.trend === "down"
								? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
								: "bg-primary-foreground text-primary",
					)}
					aria-label={`Financial Health: ${ranking.score}`}
				>
					<div>
						<h4 className="text-xl font-bold">{ranking.score}</h4>
						<p className="text-sm opacity-80">{ranking.category}</p>
					</div>
					{ranking.icon && <div aria-hidden="true">{ranking.icon}</div>}
				</section>

				{/* Performance Visualization */}
				<section aria-labelledby="performance-title">
					<div className="flex items-center justify-between mb-3">
						<h4 id="performance-title" className="text-md font-semibold">
							{performance.title}
						</h4>
						{performance.healthScore && (
							<div className="flex items-center gap-1">
								<AlertTriangle className="h-4 w-4" />
								<span
									className={cn(
										"text-sm font-medium",
										getHealthColor(performance.healthScore),
									)}
								>
									{performance.healthScore}%
								</span>
							</div>
						)}
					</div>
					<motion.div
						className="flex items-end gap-1 h-12 mt-3"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						aria-label="Financial performance chart"
					>
						{performance.bars.map((bar, index) => {
							const color = getBarColor(bar.level, index);

							return (
								<div
									key={`financial-bar-${index}-${bar.level}`}
									className="w-full h-full rounded-sm flex items-end"
									style={{
										backgroundColor:
											bar.level > 0 ? "transparent" : "hsl(var(--muted))",
									}}
								>
									<motion.div
										className="w-full rounded-sm"
										style={{
											height: `${bar.level * 100}%`,
											backgroundColor: color,
										}}
										variants={barVariants}
									/>
								</div>
							);
						})}
					</motion.div>
					<p className="text-xs text-muted-foreground mt-2">
						{performance.label}
					</p>
				</section>
			</div>
		);
	},
);

FinancialStatsCard.displayName = "FinancialStatsCard";
