/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BarChart3, XCircle } from "lucide-react";

interface ChartContainerProps {
	title?: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
	loading?: boolean;
	error?: string;
	actions?: React.ReactNode;
}

export function ChartContainer({
	title,
	description,
	children,
	className,
	loading = false,
	error,
	actions,
}: ChartContainerProps) {
	return (
		<Card className={className}>
			{(title || description || actions) && (
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<div>
						{title && <CardTitle className="text-base">{title}</CardTitle>}
						{description && <CardDescription>{description}</CardDescription>}
					</div>
					{actions && (
						<div className="flex items-center space-x-2">{actions}</div>
					)}
				</CardHeader>
			)}
			<CardContent>
				{loading ? (
					<div className="flex h-[300px] items-center justify-center">
						<div className="animate-pulse text-muted-foreground">
							Loading chart...
						</div>
					</div>
				) : error ? (
					<div className="flex h-[300px] items-center justify-center">
						<div className="text-center">
							<div className="text-destructive mb-2">Chart Error</div>
							<div className="text-sm text-muted-foreground">{error}</div>
						</div>
					</div>
				) : (
					<div className={cn("w-full", className)}>{children}</div>
				)}
			</CardContent>
		</Card>
	);
}

interface MetricCardProps {
	title: string;
	value: string | number;
	description?: string;
	trend?: {
		value: number;
		label: string;
		isPositive?: boolean;
	};
	icon?: React.ComponentType<{ className?: string }>;
	className?: string;
}

export function MetricCard({
	title,
	value,
	description,
	trend,
	icon: Icon,
	className,
}: MetricCardProps) {
	return (
		<Card className={className}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				{Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				{description && (
					<p className="text-xs text-muted-foreground">{description}</p>
				)}
				{trend && (
					<p className="text-xs text-muted-foreground">
						<span
							className={
								trend.isPositive !== false && trend.value > 0
									? "text-green-600"
									: "text-red-600"
							}
						>
							{trend.value > 0 ? "+" : ""}
							{trend.value}%
						</span>{" "}
						{trend.label}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
