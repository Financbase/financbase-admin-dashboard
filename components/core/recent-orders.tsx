"use client";

import { Clock, Key, LayoutDashboard, RefreshCw, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/core/ui/layout/user-avatar";
import { useRecentOrders } from "@/hooks/use-dashboard-data-optimized";
import { formatRelativeTime } from "@/lib/format-utils";
import EmptyState, { EmptyStates } from "./empty-state";
import DashboardErrorBoundary from "./error-boundary";

interface Order {
	id: string;
	orderNumber: string;
	customerName: string;
	customerEmail: string;
	total: number;
	status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
	createdAt: string;
	items: Array<{
		name: string;
		quantity: number;
		price: number;
	}>;
}

const statusColors = {
	pending:
		"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
	processing:
		"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
	shipped:
		"bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
	delivered:
		"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function RecentOrders() {
	const { data: orders, loading, error } = useRecentOrders(10);

	if (loading) {
		return (
			<div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
				<div className="animate-pulse">
					<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
					<div className="space-y-4">
						{[...new Array(5)].map((_, i) => (
							<div key={i} className="flex items-center space-x-4">
								<div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
								<div className="flex-1 space-y-2">
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
									<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<DashboardErrorBoundary>
				<div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
					<EmptyState
						title="Failed to load orders"
						description="Unable to fetch recent orders. Please try refreshing the page."
					/>
				</div>
			</DashboardErrorBoundary>
		);
	}

	if (!orders || orders.length === 0) {
		return (
			<div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
				<EmptyState {...EmptyStates.orders} />
			</div>
		);
	}

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount);
	};

	return (
		<DashboardErrorBoundary>
			<div
				className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]"
				data-testid="recent-orders"
			>
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
						Recent Orders
					</h3>
					<button
						type="button"
						onClick={() => (window.location.href = "/orders")}
						className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
						data-testid="view-all-orders"
					>
						View all
					</button>
				</div>
				<div className="space-y-4" data-testid="orders-list">
					{orders.map((order) => (
						<div
							key={order.id}
							className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
							data-testid="order-item"
						>
							<div className="flex items-center space-x-4">
								<UserAvatar name={order.customerName} size={40} />
								<div>
									<div className="flex items-center space-x-2">
										<p className="text-sm font-medium text-gray-900 dark:text-white">
											{order.customerName}
										</p>
										<span className="text-xs text-gray-500 dark:text-gray-400">
											{order.orderNumber}
										</span>
									</div>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										{order.items.length > 0
											? order.items[0].name
											: "Multiple items"}
										{order.items.length > 1 &&
											` +${order.items.length - 1} more`}
									</p>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<Badge className={`${statusColors[order.status]} border-0`}>
									{order.status}
								</Badge>
								<div className="text-right">
									<p className="text-sm font-medium text-gray-900 dark:text-white">
										{formatCurrency(order.total)}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										{formatRelativeTime(new Date(order.createdAt))}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</DashboardErrorBoundary>
	);
}
