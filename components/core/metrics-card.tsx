/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Activity, Key, Minus, TrendingDown, TrendingUp } from "lucide-react";

export interface MetricData {
	title: string;
	value: string | number;
	previousValue?: string | number;
	change?: number;
	changeType?: "increase" | "decrease" | "neutral";
	format?: "number" | "currency" | "percentage";
	icon?: React.ReactNode;
	color?: "blue" | "green" | "red" | "yellow" | "purple" | "gray";
}

interface MetricsCardProps {
	title: string;
	metrics: MetricData[];
	className?: string;
	columns?: 1 | 2 | 3 | 4;
}

const colorClasses = {
	blue: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
	green:
		"bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
	red: "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
	yellow:
		"bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300",
	purple:
		"bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300",
	gray: "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-300",
};

const formatValue = (value: string | number, format?: MetricData["format"]) => {
	if (typeof value === "number") {
		switch (format) {
			case "currency":
				return new Intl.NumberFormat("en-US", {
					style: "currency",
					currency: "USD",
				}).format(value);
			case "percentage":
				return `${value.toFixed(1)}%`;
			default:
				return value.toLocaleString();
		}
	}
	return value;
};

const getChangeIcon = (changeType?: MetricData["changeType"]) => {
	switch (changeType) {
		case "increase":
			return <TrendingUp className="h-4 w-4" />;
		case "decrease":
			return <TrendingDown className="h-4 w-4" />;
		default:
			return <Minus className="h-4 w-4" />;
	}
};

const getChangeColor = (changeType?: MetricData["changeType"]) => {
	switch (changeType) {
		case "increase":
			return "text-green-600 dark:text-green-400";
		case "decrease":
			return "text-red-600 dark:text-red-400";
		default:
			return "text-gray-600 dark:text-gray-400";
	}
};

export function MetricsCard({
	title,
	metrics,
	className,
	columns = 2,
}: MetricsCardProps) {
	const gridCols = {
		1: "grid-cols-1",
		2: "grid-cols-1 md:grid-cols-2",
		3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
		4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
	};

	return (
		<Card className={cn("w-full", className)}>
			<CardHeader className="pb-3">
				<CardTitle className="text-lg font-semibold flex items-center gap-2">
					<Activity className="h-5 w-5" />
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className={cn("grid gap-4", gridCols[columns])}>
					{metrics.map((metric, index) => (
						<div
							key={index}
							className={cn(
								"p-4 rounded-lg border transition-colors",
								colorClasses[metric.color || "blue"],
							)}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									{metric.icon}
									<span className="text-sm font-medium text-muted-foreground">
										{metric.title}
									</span>
								</div>
								{metric.change !== undefined && (
									<Badge
										variant="secondary"
										className={cn(
											"text-xs flex items-center gap-1",
											getChangeColor(metric.changeType),
										)}
									>
										{getChangeIcon(metric.changeType)}
										{Math.abs(metric.change)}%
									</Badge>
								)}
							</div>
							<div className="mt-2">
								<div className="text-2xl font-bold">
									{formatValue(metric.value, metric.format)}
								</div>
								{metric.previousValue && (
									<div className="text-xs text-muted-foreground mt-1">
										Previous: {formatValue(metric.previousValue, metric.format)}
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export default MetricsCard;
