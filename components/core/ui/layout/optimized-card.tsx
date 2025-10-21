import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import React, { memo } from "react";

interface OptimizedCardProps {
	title: string;
	description?: string;
	value: string;
	change?: string;
	changeType?: "positive" | "negative" | "neutral";
	icon?: LucideIcon;
	badge?: string;
	onClick?: () => void;
	className?: string;
}

/**
 * Optimized Card component with React.memo for performance
 * Only re-renders when props actually change
 */
export const OptimizedCard = memo<OptimizedCardProps>(
	({
		title,
		description,
		value,
		change,
		changeType = "neutral",
		icon: Icon,
		badge,
		onClick,
		className,
	}) => {
		const getChangeColor = () => {
			switch (changeType) {
				case "positive":
					return "text-green-600";
				case "negative":
					return "text-red-600";
				default:
					return "text-slate-600";
			}
		};

		return (
			<Card
				className={`cursor-pointer hover:shadow-md transition-shadow ${className || ""}`}
				onClick={onClick}
			>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium text-slate-600">
						{title}
					</CardTitle>
					{Icon && <Icon className="h-4 w-4 text-slate-600" />}
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-slate-900">{value}</div>
					{description && (
						<p className="text-xs text-slate-600 mt-1">{description}</p>
					)}
					{change && (
						<div className="flex items-center text-xs mt-1">
							<span className={getChangeColor()}>{change}</span>
							<span className="ml-1 text-slate-500">from last period</span>
						</div>
					)}
					{badge && (
						<Badge variant="secondary" className="mt-2">
							{badge}
						</Badge>
					)}
				</CardContent>
			</Card>
		);
	},
);

OptimizedCard.displayName = "OptimizedCard";
