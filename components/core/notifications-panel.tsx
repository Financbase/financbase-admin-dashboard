"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
	AlertCircle,
	AlertTriangle,
	ArrowUp,
	Bell,
	Check,
	CheckCircle,
	Filter,
	Info,
	Key,
	MessageCircle,
	Settings,
	X,
	XCircle,
} from "lucide-react";
import { useState } from "react";

export interface Notification {
	id: string;
	title: string;
	message: string;
	type: "info" | "success" | "warning" | "error";
	timestamp: Date;
	read: boolean;
	actions?: Array<{
		label: string;
		action: () => void;
	}>;
}

interface NotificationsPanelProps {
	notifications: Notification[];
	onMarkAsRead?: (id: string) => void;
	onMarkAllAsRead?: () => void;
	onDelete?: (id: string) => void;
	onClearAll?: () => void;
	className?: string;
	maxHeight?: string;
}

const notificationIcons = {
	info: Info,
	success: CheckCircle,
	warning: AlertTriangle,
	error: AlertCircle,
};

const notificationColors = {
	info: "text-blue-600 dark:text-blue-400",
	success: "text-green-600 dark:text-green-400",
	warning: "text-yellow-600 dark:text-yellow-400",
	error: "text-red-600 dark:text-red-400",
};

const notificationBgColors = {
	info: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
	success:
		"bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
	warning:
		"bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
	error: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
};

export function NotificationsPanel({
	notifications,
	onMarkAsRead,
	onMarkAllAsRead,
	onDelete,
	onClearAll,
	className,
	maxHeight = "400px",
}: NotificationsPanelProps) {
	const [filter, setFilter] = useState<"all" | "unread">("all");

	const filteredNotifications = notifications.filter((notification) => {
		if (filter === "unread") {
			return !notification.read;
		}
		return true;
	});

	const unreadCount = notifications.filter((n) => !n.read).length;

	return (
		<Card className={cn("w-full max-w-md", className)}>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg font-semibold flex items-center gap-2">
						<Bell className="h-5 w-5" />
						Notifications
						{unreadCount > 0 && (
							<Badge variant="destructive" className="ml-2">
								{unreadCount}
							</Badge>
						)}
					</CardTitle>
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setFilter(filter === "all" ? "unread" : "all")}
							className="h-8 w-8 p-0"
						>
							<Filter className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onMarkAllAsRead?.()}
							className="h-8 w-8 p-0"
							disabled={unreadCount === 0}
						>
							<Check className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				{filteredNotifications.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p>No notifications</p>
						<p className="text-sm">
							{filter === "unread" ? "All caught up!" : "You're all set."}
						</p>
					</div>
				) : (
					<ScrollArea style={{ height: maxHeight }}>
						<div className="space-y-3">
							{filteredNotifications.map((notification) => {
								const Icon = notificationIcons[notification.type];
								return (
									<div
										key={notification.id}
										className={cn(
											"p-3 rounded-lg border transition-colors",
											notificationBgColors[notification.type],
											!notification.read && "ring-2 ring-primary/20",
										)}
									>
										<div className="flex items-start gap-3">
											<Icon
												className={cn(
													"h-5 w-5 mt-0.5 flex-shrink-0",
													notificationColors[notification.type],
												)}
											/>
											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between gap-2">
													<h4 className="text-sm font-medium leading-tight">
														{notification.title}
													</h4>
													<div className="flex items-center gap-1 flex-shrink-0">
														{!notification.read && (
															<Button
																variant="ghost"
																size="sm"
																onClick={() => onMarkAsRead?.(notification.id)}
																className="h-6 w-6 p-0"
															>
																<Check className="h-3 w-3" />
															</Button>
														)}
														<Button
															variant="ghost"
															size="sm"
															onClick={() => onDelete?.(notification.id)}
															className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
														>
															<X className="h-3 w-3" />
														</Button>
													</div>
												</div>
												<p className="text-sm text-muted-foreground mt-1 leading-relaxed">
													{notification.message}
												</p>
												<div className="flex items-center justify-between mt-2">
													<span className="text-xs text-muted-foreground">
														{formatDistanceToNow(notification.timestamp, {
															addSuffix: true,
														})}
													</span>
													{notification.actions &&
														notification.actions.length > 0 && (
															<div className="flex gap-1">
																{notification.actions.map((action, index) => (
																	<Button
																		key={index}
																		variant="outline"
																		size="sm"
																		className="h-6 px-2 text-xs"
																		onClick={action.action}
																	>
																		{action.label}
																	</Button>
																))}
															</div>
														)}
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</ScrollArea>
				)}
				{filteredNotifications.length > 0 && (
					<div className="mt-4 pt-3 border-t">
						<Button
							variant="outline"
							size="sm"
							onClick={onClearAll}
							className="w-full text-xs"
						>
							Clear All Notifications
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export default NotificationsPanel;
