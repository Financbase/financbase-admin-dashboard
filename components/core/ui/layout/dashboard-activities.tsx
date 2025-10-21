import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useActivities } from "@/hooks/use-activities";
import { cn } from "@/lib/utils"; // Assumes shadcn's utility for class merging
import { AnimatePresence, motion } from "framer-motion";
import {
	AlertCircle,
	Bell,
	Clock,
	FileText,
	Filter,
	Headphones,
	Key,
	LayoutDashboard,
	Loader2,
	MessageCircle,
	Puzzle,
	RefreshCw,
	Settings,
	Trash2,
	Upload,
	UserPlus,
	XCircle,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

// Define the icon type.
type IconType =
	| React.ElementType
	| React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

// --- 📦 API (Props) Definition ---
export interface ActivityItem {
	/** A unique ID for the activity item. */
	id: string;
	/** The icon representing the type of activity. */
	icon: IconType;
	/** The main message describing the activity. */
	message: React.ReactNode;
	/** The timestamp or relative time of the activity (e.g., "2 hours ago", "Just now"). */
	timestamp: string;
	/** Optional color class for the icon (e.g., "text-green-500", "text-red-500"). */
	iconColorClass?: string;
}

export interface RecentActivityFeedProps {
	/** Array of activity items to display. If not provided, will fetch from API. */
	activities?: ActivityItem[];
	/** Optional title for the activity feed card. */
	cardTitle?: string;
	/** Optional class name for the main card container. */
	className?: string;
	/** Whether to enable auto-refresh of activities. */
	autoRefresh?: boolean;
	/** Interval for auto-refresh in milliseconds. */
	refreshInterval?: number;
	/** Optional entity type filter. */
	entityType?: string;
	/** Optional entity ID filter. */
	entityId?: string;
	/** Whether to show "Load More" button. */
	showLoadMore?: boolean;
}

/**
 * A professional, animated component for displaying a feed of recent activities in an admin dashboard.
 * Uses Framer Motion for subtle entry/exit animations of individual activity items.
 */
const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
	activities: propActivities,
	cardTitle = "Recent Activity",
	className,
	autoRefresh = true,
	refreshInterval = 30000,
	entityType,
	entityId,
	showLoadMore = true,
}) => {
	// Use the activities hook for API integration
	const {
		activities: apiActivities,
		loading,
		error,
		refresh,
		hasMore,
		loadMore,
	} = useActivities({
		autoRefresh,
		refreshInterval,
		entityType,
		entityId,
	});

	// Use prop activities if provided, otherwise use API activities
	const activities = propActivities || apiActivities;

	return (
		<Card className={cn("h-full", className)}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-xl font-semibold text-foreground">
					{cardTitle}
				</CardTitle>
				<Button
					variant="outline"
					size="sm"
					onClick={refresh}
					disabled={loading}
					className="h-8 w-8 p-0"
				>
					<RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
				</Button>
			</CardHeader>
			<CardContent className="p-0">
				{error && (
					<div className="p-4">
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								Failed to load activities: {error}
							</AlertDescription>
						</Alert>
					</div>
				)}

				{loading && activities.length === 0 ? (
					<div className="p-6 text-center">
						<Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
						<p className="text-sm text-muted-foreground">
							Loading activities...
						</p>
					</div>
				) : activities.length === 0 ? (
					<div className="p-6 text-center text-muted-foreground text-sm">
						No recent activity to display.
					</div>
				) : (
					<motion.div layout className="divide-y divide-border">
						<AnimatePresence initial={false}>
							{activities.map((activity) => (
								<motion.div
									key={activity.id}
									variants={itemVariants}
									initial="hidden"
									animate="visible"
									exit="exit"
									layout // Enables smooth layout transitions for adding/removing items
									className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors duration-200"
								>
									{/* Icon */}
									<div
										className={cn(
											"flex-shrink-0 p-1 rounded-full",
											activity.iconColorClass ||
												"text-muted-foreground bg-muted", // Default styling
										)}
									>
										<activity.icon className="h-4 w-4" aria-hidden="true" />
									</div>

									{/* Message and Timestamp */}
									<div className="flex-grow flex flex-col">
										<p className="text-sm font-medium text-foreground leading-tight">
											{activity.message}
										</p>
										<p className="text-xs text-muted-foreground mt-0.5">
											{activity.timestamp}
										</p>
									</div>
								</motion.div>
							))}
						</AnimatePresence>
					</motion.div>
				)}

				{showLoadMore && hasMore && !loading && (
					<div className="p-4 border-t">
						<Button variant="outline" onClick={loadMore} className="w-full">
							Load More Activities
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

const initialActivities: ActivityItem[] = [
	{
		id: "1",
		icon: UserPlus,
		message: (
			<>
				New user <span className="font-bold text-foreground">John Doe</span>{" "}
				registered.
			</>
		),
		timestamp: "Just now",
		iconColorClass:
			"text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50",
	},
	{
		id: "2",
		icon: Settings,
		message: "System configuration updated by Admin.",
		timestamp: "5 minutes ago",
		iconColorClass:
			"text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50",
	},
	{
		id: "3",
		icon: FileText,
		message: (
			<>
				Report{" "}
				<span className="font-bold text-foreground">'Monthly Sales'</span>{" "}
				generated.
			</>
		),
		timestamp: "1 hour ago",
	},
	{
		id: "4",
		icon: Upload,
		message: "Data import from CRM completed successfully.",
		timestamp: "3 hours ago",
		iconColorClass:
			"text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50",
	},
];

const ExampleUsage = () => {
	const [activities, setActivities] =
		useState<ActivityItem[]>(initialActivities);

	// Simulate new activity being added
	useEffect(() => {
		const timer = setTimeout(() => {
			setActivities((prev) => [
				{
					id: "5",
					icon: Bell,
					message: "New support ticket #1234 assigned.",
					timestamp: "Just now",
					iconColorClass:
						"text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50",
				},
				...prev,
			]);
		}, 3000); // Add a new activity after 3 seconds

		const removeTimer = setTimeout(() => {
			setActivities((prev) => prev.filter((item) => item.id !== "3"));
		}, 6000); // Remove an activity after 6 seconds

		return () => {
			clearTimeout(timer);
			clearTimeout(removeTimer);
		};
	}, []);

	return (
		<div className="p-8 bg-background border rounded-lg max-w-lg mx-auto shadow-md">
			<h3 className="text-xl font-semibold text-foreground mb-4">
				Admin Dashboard Activities
			</h3>
			<RecentActivityFeed activities={activities} />
			<p className="mt-4 text-sm text-muted-foreground">
				(New activity will appear at the top in 3 seconds; an old one will
				disappear in 6 seconds.)
			</p>
		</div>
	);
};

export default ExampleUsage;
