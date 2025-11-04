/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import React, { useState, useMemo } from "react";
import {
	LineChart,
	Line,
	AreaChart,
	Area,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Tooltip,
	Legend,
	XAxis,
	YAxis,
	CartesianGrid,
	ReferenceLine,
	ComposedChart,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, Target } from "lucide-react";

// Types for chart data and configuration
export interface ChartDataPoint {
	[key: string]: string | number | Date;
}

export interface ChartConfig {
	type: "line" | "area" | "bar" | "pie" | "composed";
	data: ChartDataPoint[];
	xAxisKey: string;
	yAxisKeys: string[];
	colors?: string[];
	title?: string;
	description?: string;
	showGrid?: boolean;
	showTooltip?: boolean;
	showLegend?: boolean;
	referenceLines?: Array<{
		value: number;
		label?: string;
		color?: string;
	}>;
	confidenceIntervals?: Array<{
		upper: string;
		lower: string;
		color?: string;
	}>;
}

export interface InteractiveChartProps {
	config: ChartConfig;
	height?: number;
	onDataPointClick?: (data: ChartDataPoint) => void;
	drillDown?: boolean;
	period?: string;
	onPeriodChange?: (period: string) => void;
	loading?: boolean;
}

// Color palettes for different chart types
const CHART_COLORS = {
	primary: ["#3b82f6", "#1d4ed8", "#1e40af", "#1e3a8a"],
	secondary: ["#10b981", "#059669", "#047857", "#065f46"],
	accent: ["#f59e0b", "#d97706", "#b45309", "#92400e"],
	danger: ["#ef4444", "#dc2626", "#b91c1c", "#991b1b"],
	purple: ["#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6"],
	pink: ["#ec4899", "#db2777", "#be185d", "#9d174d"],
	gray: ["#6b7280", "#4b5563", "#374151", "#1f2937"],
};

const DEFAULT_COLORS = CHART_COLORS.primary;

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
	if (active && payload && payload.length) {
		return (
			<div className="bg-background border border-border rounded-lg p-3 shadow-lg">
				<p className="font-medium text-foreground mb-2">{`${label}`}</p>
				{payload.map((entry: any, index: number) => (
					<div key={index} className="flex items-center gap-2 text-sm">
						<div
							className="w-3 h-3 rounded-full"
							style={{ backgroundColor: entry.color }}
						/>
						<span className="text-muted-foreground">{entry.dataKey}:</span>
						<span className="font-medium">
							{typeof entry.value === "number"
								? entry.value.toLocaleString()
								: entry.value}
						</span>
					</div>
				))}
			</div>
		);
	}
	return null;
};

// Confidence interval area component
const ConfidenceInterval = ({ data, upperKey, lowerKey, color = "#3b82f6" }: any) => {
	return (
		<Area
			dataKey={upperKey}
			stackId="confidence"
			fill={color}
			fillOpacity={0.1}
			stroke="none"
		/>
	);
};

// Main interactive chart component
export function InteractiveChart({
	config,
	height = 400,
	onDataPointClick,
	drillDown = false,
	period,
	onPeriodChange,
	loading = false,
}: InteractiveChartProps) {
	const [selectedPeriod, setSelectedPeriod] = useState(period || "12m");
	const colors = config.colors || DEFAULT_COLORS;

	const handlePeriodChange = (value: string) => {
		setSelectedPeriod(value);
		onPeriodChange?.(value);
	};

	const handleDataPointClick = (data: any) => {
		if (onDataPointClick) {
			onDataPointClick(data);
		}
	};

	const renderChart = () => {
		const commonProps = {
			data: config.data,
			margin: { top: 20, right: 30, left: 20, bottom: 5 },
			onClick: drillDown ? handleDataPointClick : undefined,
			cursor: drillDown ? "pointer" : "default",
		};

		switch (config.type) {
			case "line":
				return (
					<LineChart {...commonProps}>
						{config.showGrid !== false && (
							<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
						)}
						<XAxis
							dataKey={config.xAxisKey}
							className="text-muted-foreground"
							fontSize={12}
						/>
						<YAxis className="text-muted-foreground" fontSize={12} />
						{config.showTooltip !== false && (
							<Tooltip content={<CustomTooltip />} />
						)}
						{config.showLegend !== false && <Legend />}
						{config.referenceLines?.map((line, index) => (
							<ReferenceLine
								key={index}
								y={line.value}
								stroke={line.color || "#ef4444"}
								strokeDasharray="5 5"
								label={line.label}
							/>
						))}
						{config.yAxisKeys.map((key, index) => (
							<Line
								key={key}
								type="monotone"
								dataKey={key}
								stroke={colors[index % colors.length]}
								strokeWidth={2}
								dot={{ fill: colors[index % colors.length], strokeWidth: 2 }}
								activeDot={{ r: 6 }}
							/>
						))}
					</LineChart>
				);

			case "area":
				return (
					<AreaChart {...commonProps}>
						{config.showGrid !== false && (
							<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
						)}
						<XAxis
							dataKey={config.xAxisKey}
							className="text-muted-foreground"
							fontSize={12}
						/>
						<YAxis className="text-muted-foreground" fontSize={12} />
						{config.showTooltip !== false && (
							<Tooltip content={<CustomTooltip />} />
						)}
						{config.showLegend !== false && <Legend />}
						{config.confidenceIntervals?.map((interval, index) => (
							<ConfidenceInterval
								key={index}
								upperKey={interval.upper}
								lowerKey={interval.lower}
								color={interval.color || colors[index]}
							/>
						))}
						{config.yAxisKeys.map((key, index) => (
							<Area
								key={key}
								type="monotone"
								dataKey={key}
								stackId="1"
								stroke={colors[index % colors.length]}
								fill={colors[index % colors.length]}
								fillOpacity={0.6}
							/>
						))}
					</AreaChart>
				);

			case "bar":
				return (
					<BarChart {...commonProps}>
						{config.showGrid !== false && (
							<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
						)}
						<XAxis
							dataKey={config.xAxisKey}
							className="text-muted-foreground"
							fontSize={12}
						/>
						<YAxis className="text-muted-foreground" fontSize={12} />
						{config.showTooltip !== false && (
							<Tooltip content={<CustomTooltip />} />
						)}
						{config.showLegend !== false && <Legend />}
						{config.yAxisKeys.map((key, index) => (
							<Bar
								key={key}
								dataKey={key}
								fill={colors[index % colors.length]}
								radius={[4, 4, 0, 0]}
							/>
						))}
					</BarChart>
				);

			case "pie":
				return (
					<PieChart>
						<Pie
							data={config.data}
							cx="50%"
							cy="50%"
							outerRadius={120}
							dataKey={config.yAxisKeys[0]}
							label={({ name, percent }) =>
								`${name} ${(percent * 100).toFixed(0)}%`
							}
							onClick={drillDown ? handleDataPointClick : undefined}
							cursor={drillDown ? "pointer" : "default"}
						>
							{config.data.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={colors[index % colors.length]}
								/>
							))}
						</Pie>
						{config.showTooltip !== false && (
							<Tooltip content={<CustomTooltip />} />
						)}
						{config.showLegend !== false && <Legend />}
					</PieChart>
				);

			case "composed":
				return (
					<ComposedChart {...commonProps}>
						{config.showGrid !== false && (
							<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
						)}
						<XAxis
							dataKey={config.xAxisKey}
							className="text-muted-foreground"
							fontSize={12}
						/>
						<YAxis className="text-muted-foreground" fontSize={12} />
						{config.showTooltip !== false && (
							<Tooltip content={<CustomTooltip />} />
						)}
						{config.showLegend !== false && <Legend />}
						{config.yAxisKeys.map((key, index) => {
							// Alternate between bars and lines for composed chart
							const isBar = index % 2 === 0;
							return isBar ? (
								<Bar
									key={key}
									dataKey={key}
									fill={colors[index]}
									radius={[4, 4, 0, 0]}
								/>
							) : (
								<Line
									key={key}
									type="monotone"
									dataKey={key}
									stroke={colors[index]}
									strokeWidth={2}
									dot={{ fill: colors[index], strokeWidth: 2 }}
								/>
							);
						})}
					</ComposedChart>
				);

			default:
				return <div>Unsupported chart type</div>;
		}
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>{config.title || "Loading Chart..."}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-64">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div>
					<CardTitle className="text-lg">{config.title || "Chart"}</CardTitle>
					{config.description && (
						<CardDescription>{config.description}</CardDescription>
					)}
				</div>
				{onPeriodChange && (
					<Select value={selectedPeriod} onValueChange={handlePeriodChange}>
						<SelectTrigger className="w-32">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="1m">1 Month</SelectItem>
							<SelectItem value="3m">3 Months</SelectItem>
							<SelectItem value="6m">6 Months</SelectItem>
							<SelectItem value="12m">12 Months</SelectItem>
							<SelectItem value="24m">24 Months</SelectItem>
						</SelectContent>
					</Select>
				)}
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={height}>
					{renderChart()}
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}

// Specialized chart components for common financial metrics
export function RevenueChart({ data, loading }: { data: ChartDataPoint[]; loading?: boolean }) {
	const config: ChartConfig = {
		type: "area",
		data,
		xAxisKey: "month",
		yAxisKeys: ["revenue", "target"],
		colors: CHART_COLORS.primary,
		title: "Revenue Trend",
		description: "Monthly revenue with target comparison",
		showGrid: true,
		showTooltip: true,
		showLegend: true,
		referenceLines: [
			{
				value: data.reduce((sum, item) => sum + (item.target as number || 0), 0) / data.length,
				label: "Average Target",
				color: "#ef4444",
			},
		],
	};

	return <InteractiveChart config={config} height={350} loading={loading} />;
}

export function ExpenseBreakdownChart({ data, loading }: { data: ChartDataPoint[]; loading?: boolean }) {
	const config: ChartConfig = {
		type: "pie",
		data,
		xAxisKey: "category",
		yAxisKeys: ["amount"],
		colors: Object.values(CHART_COLORS),
		title: "Expense Breakdown",
		description: "Distribution of expenses by category",
		showTooltip: true,
		showLegend: true,
	};

	return <InteractiveChart config={config} height={350} loading={loading} />;
}

export function KPIOverviewCards({ metrics }: { metrics: Record<string, number> }) {
	const cards = [
		{
			title: "Total Revenue",
			value: metrics.totalRevenue || 0,
			change: metrics.revenueGrowth || 0,
			icon: DollarSign,
			color: "text-green-600",
		},
		{
			title: "Active Clients",
			value: metrics.activeClients || 0,
			change: metrics.clientGrowth || 0,
			icon: Users,
			color: "text-blue-600",
		},
		{
			title: "Profit Margin",
			value: `${metrics.profitMargin || 0}%`,
			change: metrics.marginChange || 0,
			icon: TrendingUp,
			color: "text-purple-600",
		},
		{
			title: "Conversion Rate",
			value: `${metrics.conversionRate || 0}%`,
			change: metrics.conversionChange || 0,
			icon: Target,
			color: "text-orange-600",
		},
	];

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{cards.map((card, index) => (
				<Card key={index}>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							{card.title}
						</CardTitle>
						<card.icon className={`h-4 w-4 ${card.color}`} />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{typeof card.value === "number"
								? card.value.toLocaleString()
								: card.value}
						</div>
						<div className="flex items-center gap-1 text-xs text-muted-foreground">
							{card.change >= 0 ? (
								<TrendingUp className="h-3 w-3 text-green-600" />
							) : (
								<TrendingDown className="h-3 w-3 text-red-600" />
							)}
							<span className={card.change >= 0 ? "text-green-600" : "text-red-600"}>
								{card.change >= 0 ? "+" : ""}
								{card.change.toFixed(1)}%
							</span>
							<span>from last month</span>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
