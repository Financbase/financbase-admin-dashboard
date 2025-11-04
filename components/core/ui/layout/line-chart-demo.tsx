/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
} from "@/components/core/ui/layout/chart";
import { cn } from "@/lib/utils";
import {
	AlertCircle,
	ArrowDown,
	ArrowUp,
	BarChart3,
	CheckCircle,
	Code,
	Filter,
	LayoutDashboard,
	Loader2,
	MessageCircle,
	XCircle,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";

// Analytics data types
interface AnalyticsMetrics {
	totalPageViews: number;
	totalEvents: number;
	totalAnalytics: number;
	uniqueUsers: number;
	averageSessionDuration: number;
	bounceRate: number;
}

interface ChartDataPoint {
	date: string;
	value: number;
	label?: string;
}

interface AnalyticsData {
	metrics: AnalyticsMetrics;
	pageViews: ChartDataPoint[];
	events: ChartDataPoint[];
	topPages: Array<{
		page: string;
		views: number;
		uniqueUsers: number;
	}>;
	topEvents: Array<{
		event: string;
		count: number;
	}>;
}

// Metric configurations
const metrics = [
	{
		key: "pageViews",
		label: "Page Views",
		format: (val: number) => val.toLocaleString(),
	},
	{
		key: "events",
		label: "Events",
		format: (val: number) => val.toLocaleString(),
	},
	{
		key: "uniqueUsers",
		label: "Unique Users",
		format: (val: number) => val.toLocaleString(),
	},
	{
		key: "averageSessionDuration",
		label: "Avg Session",
		format: (val: number) => `${val.toFixed(1)} min`,
	},
];

// Use custom colors from Tailwind
const chartConfig = {
	pageViews: {
		label: "Page Views",
		color: "var(--color-blue-500)",
	},
	events: {
		label: "Events",
		color: "var(--color-green-500)",
	},
	uniqueUsers: {
		label: "Unique Users",
		color: "var(--color-purple-500)",
	},
	averageSessionDuration: {
		label: "Avg Session",
		color: "var(--color-orange-500)",
	},
} satisfies ChartConfig;

// Reusable SimpleLineChart component
interface SimpleLineChartProps {
	data: Array<Record<string, any>>;
	index: string;
	categories: string[];
	colors?: string[];
	className?: string;
	height?: number;
	showGrid?: boolean;
	showTooltip?: boolean;
}

export function SimpleLineChart({
	data,
	index,
	categories,
	colors = ["#8b5cf6"],
	className,
	height = 300,
	showGrid = true,
	showTooltip = true,
}: SimpleLineChartProps) {
	return (
		<div className={cn("w-full", className)}>
			<ChartContainer config={chartConfig} className="w-full">
				<ResponsiveContainer width="100%" height={height}>
					<LineChart
						data={data}
						margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
					>
						{showGrid && (
							<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
						)}
						<XAxis
							dataKey={index}
							className="text-xs fill-muted-foreground"
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							className="text-xs fill-muted-foreground"
							tickLine={false}
							axisLine={false}
						/>
						{showTooltip && <ChartTooltip />}
						{categories.map((category, i) => (
							<Line
								key={category}
								type="monotone"
								dataKey={category}
								stroke={colors[i % colors.length]}
								strokeWidth={2}
								dot={false}
								activeDot={{ r: 4 }}
							/>
						))}
					</LineChart>
				</ResponsiveContainer>
			</ChartContainer>
		</div>
	);
}
interface TooltipProps {
	active?: boolean;
	payload?: Array<{
		dataKey: string;
		value: number;
		color: string;
	}>;
	label?: string;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
	if (active && payload && payload.length) {
		const entry = payload[0];
		const metric = metrics.find((m) => m.key === entry.dataKey);

		if (metric) {
			return (
				<div className="rounded-lg border bg-popover p-3 shadow-sm shadow-black/5 min-w-[120px]">
					<div className="flex items-center gap-2 text-sm">
						<div
							className="size-1.5 rounded-full"
							style={{ backgroundColor: entry.color }}
						/>
						<span className="text-muted-foreground">{metric.label}:</span>
						<span className="font-semibold text-popover-foreground">
							{metric.format(entry.value)}
						</span>
					</div>
				</div>
			);
		}
	}
	return null;
};

interface LineChartDemoProps {
	className?: string;
}

export default function LineChartDemo({ className }: LineChartDemoProps) {
	const [selectedMetric, setSelectedMetric] = useState<string>("pageViews");
	const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch analytics data
	useEffect(() => {
		const fetchAnalyticsData = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await fetch("/api/analytics/dashboard?days=30");

				if (!response.ok) {
					throw new Error(
						`Failed to fetch analytics data: ${response.statusText}`,
					);
				}

				const result = await response.json();

				if (result.success) {
					setAnalyticsData(result.data);
				} else {
					throw new Error(result.error || "Failed to fetch analytics data");
				}
			} catch (err) {
				console.error("Error fetching analytics data:", err);
				setError(
					err instanceof Error
						? err.message
						: "An error occurred while fetching data",
				);
			} finally {
				setLoading(false);
			}
		};

		fetchAnalyticsData();
	}, []);

	// Loading state
	if (loading) {
		return (
			<div
				className={cn(
					"w-full max-w-5xl min-h-screen flex items-center justify-center p-6 lg:p-8",
					className,
				)}
			>
				<Card className="w-full max-w-4xl">
					<CardContent className="flex items-center justify-center py-12">
						<div className="flex items-center gap-2">
							<Loader2 className="h-6 w-6 animate-spin" />
							<span className="text-muted-foreground">
								Loading analytics data...
							</span>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div
				className={cn(
					"w-full max-w-5xl min-h-screen flex items-center justify-center p-6 lg:p-8",
					className,
				)}
			>
				<Card className="w-full max-w-4xl">
					<CardContent className="flex items-center justify-center py-12">
						<div className="flex items-center gap-2 text-destructive">
							<AlertCircle className="h-6 w-6" />
							<span className="text-muted-foreground">Error: {error}</span>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// No data state
	if (!analyticsData) {
		return (
			<div
				className={cn(
					"w-full max-w-5xl min-h-screen flex items-center justify-center p-6 lg:p-8",
					className,
				)}
			>
				<Card className="w-full max-w-4xl">
					<CardContent className="flex items-center justify-center py-12">
						<span className="text-muted-foreground">
							No analytics data available
						</span>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Get chart data for selected metric
	const getChartData = () => {
		switch (selectedMetric) {
			case "pageViews":
				return analyticsData.pageViews;
			case "events":
				return analyticsData.events;
			case "uniqueUsers":
				// Transform page views data for unique users (approximation)
				return analyticsData.pageViews.map((item) => ({
					...item,
					value: Math.round(item.value * 0.7), // Rough approximation
					label: `${Math.round(item.value * 0.7)} users`,
				}));
			case "averageSessionDuration":
				// Mock session duration data since we don't have it in the current schema
				return analyticsData.pageViews.map((item) => ({
					...item,
					value: 2.3 + (Math.random() - 0.5) * 0.5, // Random variation around 2.3 minutes
					label: `${(2.3 + (Math.random() - 0.5) * 0.5).toFixed(1)} min`,
				}));
			default:
				return analyticsData.pageViews;
		}
	};

	// Get current metric value for display
	const getCurrentMetricValue = () => {
		switch (selectedMetric) {
			case "pageViews":
				return analyticsData.metrics.totalPageViews;
			case "events":
				return analyticsData.metrics.totalEvents;
			case "uniqueUsers":
				return analyticsData.metrics.uniqueUsers;
			case "averageSessionDuration":
				return analyticsData.metrics.averageSessionDuration;
			default:
				return 0;
		}
	};

	const chartData = getChartData();
	const currentValue = getCurrentMetricValue();
	const selectedMetricConfig = metrics.find((m) => m.key === selectedMetric);

	return (
		<div
			className={cn(
				"w-full max-w-5xl min-h-screen flex items-center justify-center p-6 lg:p-8",
				className,
			)}
		>
			<Card className="@container w-full max-w-4xl">
				<CardHeader className="p-0 mb-5">
					{/* Metrics Grid */}
					<div className="grid @2xl:grid-cols-2 @3xl:grid-cols-4 grow">
						{metrics.map((metric) => {
							const value =
								metric.key === "pageViews"
									? analyticsData.metrics.totalPageViews
									: metric.key === "events"
										? analyticsData.metrics.totalEvents
										: metric.key === "uniqueUsers"
											? analyticsData.metrics.uniqueUsers
											: analyticsData.metrics.averageSessionDuration;

							return (
								<button
									key={metric.key}
									onClick={() => setSelectedMetric(metric.key)}
									className={cn(
										"cursor-pointer flex-1 text-start p-4 last:border-b-0 border-b @2xl:border-b @2xl:even:border-e @3xl:border-b-0 @3xl:border-e @3xl:last:border-e-0 transition-all",
										selectedMetric === metric.key && "bg-muted/50",
									)}
								>
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm text-muted-foreground">
											{metric.label}
										</span>
									</div>
									<div className="text-2xl font-bold">
										{metric.format(value)}
									</div>
									<div className="text-xs text-muted-foreground mt-1">
										Last 30 days
									</div>
								</button>
							);
						})}
					</div>
				</CardHeader>

				<CardContent className="px-2.5 py-6">
					<div className="mb-4">
						<h3 className="text-lg font-semibold">
							{selectedMetricConfig?.label} Trend
						</h3>
						<p className="text-sm text-muted-foreground">
							Current value: {selectedMetricConfig?.format(currentValue)}
						</p>
					</div>

					<ChartContainer
						config={chartConfig}
						className="h-96 w-full overflow-visible [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial"
					>
						<LineChart
							data={chartData}
							margin={{
								top: 20,
								right: 20,
								left: 5,
								bottom: 20,
							}}
							style={{ overflow: "visible" }}
						>
							{/* Background pattern for chart area only */}
							<defs>
								<pattern
									id="dotGrid"
									x="0"
									y="0"
									width="20"
									height="20"
									patternUnits="userSpaceOnUse"
								>
									<circle
										cx="10"
										cy="10"
										r="1"
										fill="var(--input)"
										fillOpacity="1"
									/>
								</pattern>
								<filter
									id="lineShadow"
									x="-100%"
									y="-100%"
									width="300%"
									height="300%"
								>
									<feDropShadow
										dx="4"
										dy="6"
										stdDeviation="25"
										floodColor={`${chartConfig[selectedMetric as keyof typeof chartConfig]?.color}60`}
									/>
								</filter>
								<filter
									id="dotShadow"
									x="-50%"
									y="-50%"
									width="200%"
									height="200%"
								>
									<feDropShadow
										dx="2"
										dy="2"
										stdDeviation="3"
										floodColor="rgba(0,0,0,0.5)"
									/>
								</filter>
							</defs>

							<XAxis
								dataKey="date"
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
								tickMargin={10}
								tickFormatter={(value) => {
									const date = new Date(value);
									return date.toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
									});
								}}
							/>

							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
								tickMargin={10}
								tickCount={6}
								tickFormatter={(value) => {
									return (
										selectedMetricConfig?.format(value) || value.toString()
									);
								}}
							/>

							<ChartTooltip
								content={<CustomTooltip />}
								cursor={{ strokeDasharray: "3 3", stroke: "#9ca3af" }}
							/>

							{/* Background pattern for chart area only */}
							<rect
								x="60px"
								y="-20px"
								width="calc(100% - 75px)"
								height="calc(100% - 10px)"
								fill="url(#dotGrid)"
								style={{ pointerEvents: "none" }}
							/>

							<Line
								type="monotone"
								dataKey="value"
								stroke={
									chartConfig[selectedMetric as keyof typeof chartConfig]?.color
								}
								strokeWidth={2}
								filter="url(#lineShadow)"
								dot={false}
								activeDot={{
									r: 6,
									fill: chartConfig[selectedMetric as keyof typeof chartConfig]
										?.color,
									stroke: "white",
									strokeWidth: 2,
									filter: "url(#dotShadow)",
								}}
							/>
						</LineChart>
					</ChartContainer>
				</CardContent>
			</Card>
		</div>
	);
}
