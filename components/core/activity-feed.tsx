"use client";

import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/core/ui/layout/user-avatar";
import { useActivityFeed } from "@/hooks/use-dashboard-data-optimized";
import { formatRelativeTime } from "@/lib/format-utils";
import {
	Clock,
	CreditCard,
	Key,
	LayoutDashboard,
	Package,
	ShoppingCart,
	Star,
	User,
	XCircle,
} from "lucide-react";
import { memo } from "react";
import EmptyState, { EmptyStates } from "./empty-state";
import DashboardErrorBoundary from "./error-boundary";

interface Activity {
	id: string;
	type: "order" | "user" | "product" | "payment" | "review";
	title: string;
	description: string;
	time: string;
	user?: {
		name: string;
		avatar?: string;
	};
	metadata?: {
		amount?: string;
		rating?: number;
		status?: string;
	};
}

const getActivityIcon = (type: Activity["type"]) => {
	switch (type) {
		case "order":
			return <ShoppingCart className="h-4 w-4" />;
		case "user":
			return <User className="h-4 w-4" />;
		case "product":
			return <Package className="h-4 w-4" />;
		case "payment":
			return <CreditCard className="h-4 w-4" />;
		case "review":
			return <Star className="h-4 w-4" />;
		default:
			return <Package className="h-4 w-4" />;
	}
};

const getActivityColor = (type: Activity["type"]) => {
	switch (type) {
		case "order":
			return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
		case "user":
			return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
		case "product":
			return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400";
		case "payment":
			return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
		case "review":
			return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
		default:
			return "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400";
	}
};

const ActivityFeed = memo(function ActivityFeed() {
	const { data: activities, loading, error } = useActivityFeed(10);

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
						title="Failed to load activity"
						description="Unable to fetch recent activity. Please try refreshing the page."
					/>
				</div>
			</DashboardErrorBoundary>
		);
	}

	if (!activities || activities.length === 0) {
		return (
			<div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
				<EmptyState {...EmptyStates.activity} />
			</div>
		);
	}

	return (
		<DashboardErrorBoundary>
			<div
				className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]"
				data-testid="activity-feed"
			>
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
						Recent Activity
					</h3>
					<button
						type="button"
						onClick={() => (window.location.href = "/activity-logs")}
						className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
						data-testid="view-all-activity"
					>
						View all
					</button>
				</div>

				<div className="space-y-4" data-testid="activity-list">
					{activities.map((activity) => (
						<div
							key={activity.id}
							className="flex items-start space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
							data-testid="activity-item"
						>
							<div
								className={`p-2 rounded-full ${getActivityColor(activity.type)}`}
							>
								{getActivityIcon(activity.type)}
							</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between">
									<p className="text-sm font-medium text-gray-900 dark:text-white">
										{activity.title}
									</p>
									<span className="text-xs text-gray-500 dark:text-gray-400">
										{formatRelativeTime(new Date(activity.time))}
									</span>
								</div>

								<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
									{activity.description}
								</p>

								<div className="flex items-center justify-between mt-2">
									<div className="flex items-center space-x-2">
										{activity.user && (
											<div className="flex items-center space-x-2">
												<UserAvatar
													name={activity.user.name}
													imageUrl={activity.user.avatar}
													size={24}
												/>
												<span className="text-xs text-gray-500 dark:text-gray-400">
													{activity.user.name}
												</span>
											</div>
										)}
									</div>

									<div className="flex items-center space-x-2">
										{activity.metadata?.amount && (
											<Badge variant="outline" className="text-xs">
												{activity.metadata.amount}
											</Badge>
										)}
										{activity.metadata?.rating && (
											<div className="flex items-center">
												{[...new Array(activity.metadata.rating)].map(
													(_, i) => (
														<Star
															key={i}
															className="h-3 w-3 fill-yellow-400 text-yellow-400"
														/>
													),
												)}
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</DashboardErrorBoundary>
	);
});

export default ActivityFeed;
