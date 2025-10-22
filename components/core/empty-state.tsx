"use client";

import * as React from "react";
import {
	BarChart3,
	Briefcase,
	LayoutDashboard,
	TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
	icon?: LucideIcon;
	title: string;
	description: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	className?: string;
}

export default function EmptyState({
	icon: Icon,
	title,
	description,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
		>
			{Icon && (
				<div className="mb-4 p-3 rounded-full bg-gray-100 dark:bg-gray-800">
					<Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
				</div>
			)}

			<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
				{title}
			</h3>

			<p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
				{description}
			</p>

			{action && (
				<Button onClick={action.onClick} size="sm">
					{action.label}
				</Button>
			)}
		</div>
	);
}

// Predefined empty states for common dashboard widgets
export const EmptyStates = {
	orders: {
		icon: undefined, // Will use default
		title: "No orders yet",
		description: "Orders will appear here once customers start placing them.",
		action: {
			label: "View all orders",
			onClick: () => (window.location.href = "/orders"),
		},
	},

	products: {
		icon: undefined,
		title: "No products found",
		description: "Add some products to see them in your dashboard.",
		action: {
			label: "Add product",
			onClick: () => (window.location.href = "/products/new"),
		},
	},

	customers: {
		icon: undefined,
		title: "No customers yet",
		description: "Customer analytics will appear here once you have customers.",
		action: {
			label: "View customers",
			onClick: () => (window.location.href = "/customers"),
		},
	},

	activity: {
		icon: undefined,
		title: "No recent activity",
		description: "Activity will appear here as your business grows.",
		action: {
			label: "View activity logs",
			onClick: () => (window.location.href = "/activity-logs"),
		},
	},

	charts: {
		icon: undefined,
		title: "No data to display",
		description: "Charts will populate once you have sales data.",
		action: {
			label: "View reports",
			onClick: () => (window.location.href = "/reports"),
		},
	},

	transactions: {
		icon: undefined,
		title: "No transactions yet",
		description: "Financial transactions will appear here once recorded.",
		action: {
			label: "View transactions",
			onClick: () => (window.location.href = "/transactions"),
		},
	},
};
