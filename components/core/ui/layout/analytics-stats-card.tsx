/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { cn } from "@/lib/utils";
import { type PanInfo, motion } from "framer-motion";
import {
	Activity,
	ArrowDown,
	ArrowUp,
	BarChart3,
	Clock,
	Eye,
	Key,
	MousePointerClick,
	TrendingDown,
	TrendingUp,
	Users,
} from "lucide-react";
// components/ui/analytics-stats-card.tsx
import * as React from "react";

// Import new animation library
import {
	AnimatedCard,
	AnimatedProgressBar,
	FadeInUp,
	StaggeredContainer,
	animationPresets,
	cardVariants,
	fadeInUpVariants,
	smoothTransition,
	staggerContainerVariants,
	swipeVariants,
} from "@/lib/animations";

// Type definitions for analytics metrics
type AnalyticsSubStat = {
	value: string | number;
	label: string;
	subLabel: string;
	trend?: "up" | "down" | "neutral";
	icon?: React.ReactNode;
};

type AnalyticsBar = {
	level: number; // A value between 0 and 1 representing the fill percentage
	period: string;
	color?: string;
};

interface AnalyticsStatsCardProps {
	/** The main title of the card */
	title: string;
	/** The text for the time frame display */
	timeFrame: string;
	/** Main analytics metric */
	mainMetric: {
		value: number;
		change: number;
		changePeriod: string;
		label: string;
	};
	/** An array of two sub-analytics statistics */
	subStats: [AnalyticsSubStat, AnalyticsSubStat];
	/** Performance ranking or engagement score */
	ranking: {
		score: string;
		category: string;
		icon?: React.ReactNode;
		trend?: "up" | "down" | "neutral";
	};
	/** Activity or engagement visualization */
	activity: {
		title: string;
		bars: AnalyticsBar[];
		label: string;
		engagementScore?: number;
	};
	/** Optional additional class names */
	className?: string;
}

/**
 * A specialized card component for displaying analytics statistics with animated activity charts.
 * Built for analytics dashboards with user engagement, performance metrics, and activity tracking.
 */
export const AnalyticsStatsCard = React.forwardRef<
	HTMLDivElement,
	AnalyticsStatsCardProps
>(
	(
		{ title, timeFrame, mainMetric, subStats, ranking, activity, className },
		ref,
	) => {
		const numberFormatter = new Intl.NumberFormat("en-US");
		const [swipeOffset, setSwipeOffset] = React.useState(0);

		// Animation variants using the optimized library
		const cardVariants = animationPresets.dashboardCard;

		// Enhanced bar animations with stagger
		const barVariants = {
			hidden: { height: "0%", opacity: 0, transform: "scaleY(0)" },
			visible: {
				height: "100%",
				opacity: 1,
				transform: "scaleY(1)",
				transition: {
					duration: 0.6,
					ease: [0.25, 0.46, 0.45, 0.94],
					layout: { duration: 0.3 },
				},
			},
		};

		// Analytics activity color scheme
		const getBarColor = (level: number, index: number) => {
			if (level === 0) return "hsl(var(--muted))";

			const colors = [
				"#3b82f6", // Blue for low activity
				"#8b5cf6", // Purple for moderate activity
				"#06b6d4", // Cyan for good activity
				"#10b981", // Green for high activity
				"#f59e0b", // Amber for peak activity
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
					return <Activity className="h-4 w-4 text-muted-foreground" />;
			}
		};

		const getEngagementColor = (score?: number) => {
			if (!score) return "text-muted-foreground";
			if (score >= 80) return "text-green-500";
			if (score >= 60) return "text-yellow-500";
			return "text-red-500";
		};

		// Mobile gesture handlers
		const handleDragStart = () => {
			setSwipeOffset(0);
		};

		const handleDragEnd = (event: any, info: PanInfo) => {
			const threshold = 50;
			if (Math.abs(info.offset.x) > threshold) {
				setSwipeOffset(info.offset.x > 0 ? 100 : -100);
				setTimeout(() => setSwipeOffset(0), 300);
			}
		};

		return (
			<motion.div
				ref={ref}
				className={cn(
					"w-full max-w-sm rounded-2xl bg-card text-card-foreground p-6 shadow-lg font-sans flex flex-col gap-6 border",
					className,
				)}
				style={{
					willChange: "transform",
					x: swipeOffset,
				}}
				drag="x"
				dragConstraints={{ left: 0, right: 0 }}
				dragElastic={0.1}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				whileTap={{ scale: 0.98 }}
				animate={{ x: swipeOffset }}
				variants={swipeVariants}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: "-100px" }}
				aria-labelledby="analytics-stats-card-title"
			>
				{/* Card Header */}
				<header className="flex justify-between items-center">
					<h2
						id="analytics-stats-card-title"
						className="text-xl font-bold flex items-center gap-2"
					>
						<BarChart3 className="h-5 w-5" />
						{title}
					</h2>
					<div className="text-sm font-medium px-3 py-1 rounded-md bg-muted text-muted-foreground">
						{timeFrame}
					</div>
				</header>

				{/* Main Analytics Metric */}
				<section aria-label="Main Analytics Metric">
					<p className="text-sm text-muted-foreground">{mainMetric.label}</p>
					<h3 className="text-5xl font-bold tracking-tighter mt-1">
						{numberFormatter.format(mainMetric.value)}
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
							{numberFormatter.format(mainMetric.change)}{" "}
							{mainMetric.changePeriod}
						</p>
					</div>
				</section>

				{/* Sub-Analytics Stats Grid */}
				<section
					className="grid grid-cols-2 gap-4"
					aria-label="Analytics Breakdown"
				>
					{subStats.map((stat, index) => (
						<motion.div
							key={`analytics-stat-${stat.label}-${index}`}
							className="bg-muted rounded-lg p-4"
							whileHover={{
								scale: 1.02,
								transition: { duration: 0.2 },
							}}
						>
							<div className="flex items-center justify-between mb-1">
								<div className="flex items-center gap-2">
									{stat.icon && (
										<div className="text-muted-foreground">{stat.icon}</div>
									)}
									<p className="text-2xl font-bold">{stat.value}</p>
								</div>
								{stat.trend && getTrendIcon(stat.trend)}
							</div>
							<p className="text-base font-normal text-muted-foreground">
								{stat.label}
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								{stat.subLabel}
							</p>
						</motion.div>
					))}
				</section>

				{/* Performance Ranking */}
				<section
					className={cn(
						"flex items-center justify-between p-4 rounded-lg",
						ranking.trend === "up"
							? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
							: ranking.trend === "down"
								? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
								: "bg-primary-foreground text-primary",
					)}
					aria-label={`Performance: ${ranking.score}`}
				>
					<div>
						<h4 className="text-xl font-bold">{ranking.score}</h4>
						<p className="text-sm opacity-80">{ranking.category}</p>
					</div>
					{ranking.icon && <div aria-hidden="true">{ranking.icon}</div>}
				</section>

				{/* Activity Visualization */}
				<section aria-labelledby="activity-title">
					<div className="flex items-center justify-between mb-3">
						<h4 id="activity-title" className="text-md font-semibold">
							{activity.title}
						</h4>
						{activity.engagementScore && (
							<div className="flex items-center gap-1">
								<MousePointerClick className="h-4 w-4" />
								<span
									className={cn(
										"text-sm font-medium",
										getEngagementColor(activity.engagementScore),
									)}
								>
									{activity.engagementScore}%
								</span>
							</div>
						)}
					</div>
					<StaggeredContainer
						initial="hidden"
						animate="visible"
						variants={staggerContainerVariants}
					>
						<div
							className="flex items-end gap-1 h-12 mt-3"
							aria-label="Activity chart"
						>
							{activity.bars.map((bar, index) => {
								const color = getBarColor(bar.level, index);

								return (
									<div
										key={`analytics-bar-${index}-${bar.level}`}
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
											whileHover={{
												scaleY: 1.1,
												transition: { duration: 0.2 },
											}}
										/>
									</div>
								);
							})}
						</div>
					</StaggeredContainer>
					<p className="text-xs text-muted-foreground mt-2">{activity.label}</p>
				</section>
			</motion.div>
		);
	},
);

AnalyticsStatsCard.displayName = "AnalyticsStatsCard";
