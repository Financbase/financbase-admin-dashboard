import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
	ArrowDown,
	ArrowUp,
	BarChart3,
	Clock,
	DollarSign,
	Download,
	Key,
	Package,
	ShoppingCart,
	Star,
	TrendingDown,
	TrendingUp,
	Users,
} from "lucide-react";
// components/ui/ecommerce-stats-card.tsx
import * as React from "react";

// Type definitions for e-commerce metrics
type EcommerceSubStat = {
	value: string | number;
	label: string;
	subLabel: string;
	trend?: "up" | "down" | "neutral";
	icon?: React.ReactNode;
};

type EcommerceBar = {
	level: number; // A value between 0 and 1 representing the fill percentage
	period: string;
	color?: string;
};

interface EcommerceStatsCardProps {
	/** The main title of the card */
	title: string;
	/** The text for the time frame display */
	timeFrame: string;
	/** Main e-commerce metric */
	mainMetric: {
		value: number;
		change: number;
		changePeriod: string;
		label: string;
		currency?: string;
	};
	/** An array of two sub-e-commerce statistics */
	subStats: [EcommerceSubStat, EcommerceSubStat];
	/** Sales performance or marketplace ranking */
	ranking: {
		score: string;
		category: string;
		icon?: React.ReactNode;
		trend?: "up" | "down" | "neutral";
	};
	/** Sales or product performance visualization */
	performance: {
		title: string;
		bars: EcommerceBar[];
		label: string;
		conversionRate?: number;
	};
	/** Optional additional class names */
	className?: string;
}

/**
 * A specialized card component for displaying e-commerce statistics with animated sales charts.
 * Built for e-commerce dashboards with sales, products, marketplace metrics, and conversion tracking.
 */
export const EcommerceStatsCard = React.forwardRef<
	HTMLDivElement,
	EcommerceStatsCardProps
>(
	(
		{ title, timeFrame, mainMetric, subStats, ranking, performance, className },
		ref,
	) => {
		const currencyFormatter = new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: mainMetric.currency || "USD",
		});

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

		// E-commerce performance color scheme
		const getBarColor = (level: number, index: number) => {
			if (level === 0) return "hsl(var(--muted))";

			const colors = [
				"#ef4444", // Red for low sales
				"#f97316", // Orange for moderate sales
				"#eab308", // Yellow for good sales
				"#22c55e", // Green for high sales
				"#3b82f6", // Blue for excellent sales
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
					return <ShoppingCart className="h-4 w-4 text-muted-foreground" />;
			}
		};

		const getConversionColor = (rate?: number) => {
			if (!rate) return "text-muted-foreground";
			if (rate >= 5) return "text-green-500";
			if (rate >= 2) return "text-yellow-500";
			return "text-red-500";
		};

		const formatValue = (value: number, isCurrency = false) => {
			if (isCurrency) {
				return currencyFormatter.format(value);
			}
			return numberFormatter.format(value);
		};

		return (
			<div
				ref={ref}
				className={cn(
					"w-full max-w-sm rounded-2xl bg-card text-card-foreground p-6 shadow-lg font-sans flex flex-col gap-6 border",
					className,
				)}
				aria-labelledby="ecommerce-stats-card-title"
			>
				{/* Card Header */}
				<header className="flex justify-between items-center">
					<h2
						id="ecommerce-stats-card-title"
						className="text-xl font-bold flex items-center gap-2"
					>
						<ShoppingCart className="h-5 w-5" />
						{title}
					</h2>
					<div className="text-sm font-medium px-3 py-1 rounded-md bg-muted text-muted-foreground">
						{timeFrame}
					</div>
				</header>

				{/* Main E-commerce Metric */}
				<section aria-label="Main E-commerce Metric">
					<p className="text-sm text-muted-foreground">{mainMetric.label}</p>
					<h3 className="text-5xl font-bold tracking-tighter mt-1">
						{formatValue(
							mainMetric.value,
							mainMetric.label.toLowerCase().includes("revenue") ||
								mainMetric.label.toLowerCase().includes("sales"),
						)}
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
							{formatValue(
								mainMetric.change,
								mainMetric.label.toLowerCase().includes("revenue") ||
									mainMetric.label.toLowerCase().includes("sales"),
							)}{" "}
							{mainMetric.changePeriod}
						</p>
					</div>
				</section>

				{/* Sub-E-commerce Stats Grid */}
				<section
					className="grid grid-cols-2 gap-4"
					aria-label="E-commerce Breakdown"
				>
					{subStats.map((stat, index) => (
						<div
							key={`ecommerce-stat-${stat.label}-${index}`}
							className="bg-muted rounded-lg p-4"
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
						</div>
					))}
				</section>

				{/* Sales Performance Ranking */}
				<section
					className={cn(
						"flex items-center justify-between p-4 rounded-lg",
						ranking.trend === "up"
							? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
							: ranking.trend === "down"
								? "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
								: "bg-primary-foreground text-primary",
					)}
					aria-label={`Sales Performance: ${ranking.score}`}
				>
					<div>
						<h4 className="text-xl font-bold">{ranking.score}</h4>
						<p className="text-sm opacity-80">{ranking.category}</p>
					</div>
					{ranking.icon && <div aria-hidden="true">{ranking.icon}</div>}
				</section>

				{/* Sales Performance Visualization */}
				<section aria-labelledby="performance-title">
					<div className="flex items-center justify-between mb-3">
						<h4 id="performance-title" className="text-md font-semibold">
							{performance.title}
						</h4>
						{performance.conversionRate && (
							<div className="flex items-center gap-1">
								<Star className="h-4 w-4" />
								<span
									className={cn(
										"text-sm font-medium",
										getConversionColor(performance.conversionRate),
									)}
								>
									{performance.conversionRate}%
								</span>
							</div>
						)}
					</div>
					<motion.div
						className="flex items-end gap-1 h-12 mt-3"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						aria-label="Sales performance chart"
					>
						{performance.bars.map((bar, index) => {
							const color = getBarColor(bar.level, index);

							return (
								<div
									key={`ecommerce-bar-${index}-${bar.level}`}
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

EcommerceStatsCard.displayName = "EcommerceStatsCard";
