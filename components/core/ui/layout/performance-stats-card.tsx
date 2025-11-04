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
	Activity,
	AlertTriangle,
	BarChart3,
	CheckCircle,
	Clock,
	Key,
	Shield,
	TrendingDown,
	TrendingUp,
	Zap,
} from "lucide-react";
// components/ui/performance-stats-card.tsx
import * as React from "react";

// Type definitions for performance metrics
type PerformanceSubStat = {
	value: string | number;
	label: string;
	subLabel: string;
	status?: "healthy" | "warning" | "critical";
	icon?: React.ReactNode;
};

type PerformanceBar = {
	level: number; // A value between 0 and 1 representing the fill percentage
	period: string;
	color?: string;
};

interface PerformanceStatsCardProps {
	/** The main title of the card */
	title: string;
	/** The text for the time frame display */
	timeFrame: string;
	/** Main performance metric */
	mainMetric: {
		value: number;
		change: number;
		changePeriod: string;
		label: string;
		unit?: string;
	};
	/** An array of two sub-performance statistics */
	subStats: [PerformanceSubStat, PerformanceSubStat];
	/** System health or performance ranking */
	ranking: {
		score: string;
		category: string;
		icon?: React.ReactNode;
		status?: "healthy" | "warning" | "critical";
	};
	/** System performance or health visualization */
	performance: {
		title: string;
		bars: PerformanceBar[];
		label: string;
		uptime?: number;
	};
	/** Optional additional class names */
	className?: string;
}

/**
 * A specialized card component for displaying system performance statistics with animated health charts.
 * Built for monitoring dashboards with system health, alerts, performance metrics, and uptime tracking.
 */
export const PerformanceStatsCard = React.forwardRef<
	HTMLDivElement,
	PerformanceStatsCardProps
>(
	(
		{ title, timeFrame, mainMetric, subStats, ranking, performance, className },
		ref,
	) => {
		const numberFormatter = new Intl.NumberFormat("en-US");

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

		// Performance health color scheme
		const getBarColor = (level: number, index: number) => {
			if (level === 0) return "hsl(var(--muted))";

			const colors = [
				"#ef4444", // Red for critical performance
				"#f97316", // Orange for poor performance
				"#eab308", // Yellow for moderate performance
				"#22c55e", // Green for good performance
				"#3b82f6", // Blue for excellent performance
			];

			const colorIndex = Math.min(
				Math.floor(level * colors.length),
				colors.length - 1,
			);
			return colors[colorIndex];
		};

		const getStatusIcon = (status?: "healthy" | "warning" | "critical") => {
			switch (status) {
				case "healthy":
					return <CheckCircle className="h-4 w-4 text-green-500" />;
				case "warning":
					return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
				case "critical":
					return <AlertTriangle className="h-4 w-4 text-red-500" />;
				default:
					return <Activity className="h-4 w-4 text-muted-foreground" />;
			}
		};

		const getStatusColor = (status?: "healthy" | "warning" | "critical") => {
			switch (status) {
				case "healthy":
					return "text-green-500";
				case "warning":
					return "text-yellow-500";
				case "critical":
					return "text-red-500";
				default:
					return "text-muted-foreground";
			}
		};

		const getUptimeColor = (uptime?: number) => {
			if (!uptime) return "text-muted-foreground";
			if (uptime >= 99.9) return "text-green-500";
			if (uptime >= 99.0) return "text-yellow-500";
			return "text-red-500";
		};

		const formatValue = (value: number, unit?: string) => {
			const formatted = numberFormatter.format(value);
			return unit ? `${formatted}${unit}` : formatted;
		};

		return (
			<div
				ref={ref}
				className={cn(
					"w-full max-w-sm rounded-2xl bg-card text-card-foreground p-6 shadow-lg font-sans flex flex-col gap-6 border",
					className,
				)}
				aria-labelledby="performance-stats-card-title"
			>
				{/* Card Header */}
				<header className="flex justify-between items-center">
					<h2
						id="performance-stats-card-title"
						className="text-xl font-bold flex items-center gap-2"
					>
						<Activity className="h-5 w-5" />
						{title}
					</h2>
					<div className="text-sm font-medium px-3 py-1 rounded-md bg-muted text-muted-foreground">
						{timeFrame}
					</div>
				</header>

				{/* Main Performance Metric */}
				<section aria-label="Main Performance Metric">
					<p className="text-sm text-muted-foreground">{mainMetric.label}</p>
					<h3 className="text-5xl font-bold tracking-tighter mt-1">
						{formatValue(mainMetric.value, mainMetric.unit)}
					</h3>
					<div className="flex items-center gap-2 mt-2">
						{mainMetric.change >= 0 ? (
							<TrendingUp className="h-4 w-4 text-green-500" />
						) : (
							<TrendingDown className="h-4 w-4 text-red-500" />
						)}
						<p
							className={cn(
								"text-sm font-semibold",
								mainMetric.change >= 0 ? "text-green-500" : "text-red-500",
							)}
						>
							{mainMetric.change >= 0 ? "+" : ""}
							{formatValue(mainMetric.change, mainMetric.unit)}{" "}
							{mainMetric.changePeriod}
						</p>
					</div>
				</section>

				{/* Sub-Performance Stats Grid */}
				<section
					className="grid grid-cols-2 gap-4"
					aria-label="Performance Breakdown"
				>
					{subStats.map((stat, index) => (
						<div
							key={`performance-stat-${stat.label}-${index}`}
							className="bg-muted rounded-lg p-4"
						>
							<div className="flex items-center justify-between mb-1">
								<div className="flex items-center gap-2">
									{stat.icon && (
										<div className="text-muted-foreground">{stat.icon}</div>
									)}
									<p className="text-2xl font-bold">{stat.value}</p>
								</div>
								{getStatusIcon(stat.status)}
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

				{/* System Health Ranking */}
				<section
					className={cn(
						"flex items-center justify-between p-4 rounded-lg",
						ranking.status === "healthy"
							? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
							: ranking.status === "warning"
								? "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300"
								: ranking.status === "critical"
									? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
									: "bg-primary-foreground text-primary",
					)}
					aria-label={`System Health: ${ranking.score}`}
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
						{performance.uptime && (
							<div className="flex items-center gap-1">
								<Shield className="h-4 w-4" />
								<span
									className={cn(
										"text-sm font-medium",
										getUptimeColor(performance.uptime),
									)}
								>
									{performance.uptime}%
								</span>
							</div>
						)}
					</div>
					<motion.div
						className="flex items-end gap-1 h-12 mt-3"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						aria-label="Performance chart"
					>
						{performance.bars.map((bar, index) => {
							const color = getBarColor(bar.level, index);

							return (
								<div
									key={`performance-bar-${index}-${bar.level}`}
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

PerformanceStatsCard.displayName = "PerformanceStatsCard";
