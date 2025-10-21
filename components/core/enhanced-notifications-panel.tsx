"use client";

/**
 * Enhanced Notifications Panel
 * Real-time notification system with PartyKit integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Notification {
	id: number;
	userId: string;
	type: string;
	category?: string;
	priority: 'low' | 'normal' | 'high' | 'urgent';
	title: string;
	message: string;
	data?: Record<string, unknown>;
	actionUrl?: string;
	actionLabel?: string;
	read: boolean;
	readAt?: Date;
	archived: boolean;
	createdAt: Date;
}

export function EnhancedNotificationsPanel() {
	const queryClient = useQueryClient();

	// Fetch notifications
	const { data, isLoading } = useQuery({
		queryKey: ['notifications'],
		queryFn: async () => {
			const response = await fetch('/api/notifications');
			if (!response.ok) throw new Error('Failed to fetch notifications');
			return response.json();
		},
		refetchInterval: 30000, // Refetch every 30 seconds
	});

	const notifications: Notification[] = data?.notifications || [];
	const unreadCount = data?.unreadCount || 0;

	// Mark as read mutation
	const markAsReadMutation = useMutation({
		mutationFn: async (id: number) => {
			const response = await fetch(`/api/notifications/${id}/read`, {
				method: 'POST',
			});
			if (!response.ok) throw new Error('Failed to mark as read');
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['notifications'] });
		},
	});

	// Mark all as read mutation
	const markAllAsReadMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch('/api/notifications/mark-all-read', {
				method: 'POST',
			});
			if (!response.ok) throw new Error('Failed to mark all as read');
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['notifications'] });
			toast.success('All notifications marked as read');
		},
	});

	// Real-time updates via PartyKit (if available)
	// TODO: Implement PartyKit WebSocket connection
	// This is a placeholder for real-time notification updates
	// Uncomment when PartyKit is properly configured
	
	/*
	useEffect(() => {
		if (!user?.id) return;

		const socket = new WebSocket(`${process.env.NEXT_PUBLIC_PARTYKIT_HOST}/party/notifications-${user.id}`);
		
		socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.type === 'notification') {
				queryClient.invalidateQueries({ queryKey: ['notifications'] });
				
				// Show toast for new notification
				toast.info(data.data.title, {
					description: data.data.message,
				});
			}
		};

		return () => {
			socket.close();
		};
	}, [user?.id, queryClient]);
	*/

	const handleNotificationClick = (notification: Notification) => {
		// Mark as read
		if (!notification.read) {
			markAsReadMutation.mutate(notification.id);
		}

		// Navigate to action URL if provided
		if (notification.actionUrl) {
			window.location.href = notification.actionUrl;
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'urgent':
				return 'bg-red-500';
			case 'high':
				return 'bg-orange-500';
			case 'normal':
				return 'bg-blue-500';
			case 'low':
				return 'bg-gray-500';
			default:
				return 'bg-gray-500';
		}
	};

	const getTypeIcon = (type: string) => {
		// This can be expanded based on notification types
		return '📬';
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
							{unreadCount > 99 ? '99+' : unreadCount}
						</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-96 p-0" align="end">
				<div className="flex items-center justify-between border-b p-4">
					<h3 className="font-semibold">Notifications</h3>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => markAllAsReadMutation.mutate()}
							disabled={markAllAsReadMutation.isPending}
						>
							<CheckCheck className="mr-2 h-4 w-4" />
							Mark all read
						</Button>
					)}
				</div>

				<ScrollArea className="h-[400px]">
					{isLoading ? (
						<div className="flex items-center justify-center p-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						</div>
					) : notifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center p-8 text-center">
							<Bell className="h-12 w-12 text-muted-foreground mb-4" />
							<p className="text-sm text-muted-foreground">
								No notifications yet
							</p>
						</div>
					) : (
						<div className="divide-y">
							{notifications.map((notification) => (
								<NotificationItem
									key={notification.id}
									notification={notification}
									onClick={() => handleNotificationClick(notification)}
									onMarkAsRead={() => markAsReadMutation.mutate(notification.id)}
									getPriorityColor={getPriorityColor}
									getTypeIcon={getTypeIcon}
								/>
							))}
						</div>
					)}
				</ScrollArea>

				<div className="border-t p-2">
					<Button
						variant="ghost"
						className="w-full"
						onClick={() => {
							window.location.href = '/dashboard/notifications';
						}}
					>
						View all notifications
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}

interface NotificationItemProps {
	notification: Notification;
	onClick: () => void;
	onMarkAsRead: () => void;
	getPriorityColor: (_priority: string) => string;
	getTypeIcon: (_type: string) => string;
}

function NotificationItem({
	notification,
	onClick,
	onMarkAsRead,
	getPriorityColor,
	getTypeIcon,
}: NotificationItemProps) {
	const handleClick = () => {
		onClick();
	};


	return (
		<button
			type="button"
			className={cn(
				'w-full text-left p-4 hover:bg-accent cursor-pointer transition-colors',
				!notification.read && 'bg-accent/50'
			)}
			onClick={handleClick}
		>
			<div className="flex items-start gap-3">
				{/* Priority indicator */}
				<div className={cn('w-2 h-2 rounded-full mt-2', getPriorityColor(notification.priority))} />

				<div className="flex-1 space-y-1">
					{/* Title and time */}
					<div className="flex items-start justify-between gap-2">
						<div className="flex items-center gap-2">
							<span className="text-sm">{getTypeIcon(notification.type)}</span>
							<p className={cn(
								'text-sm font-medium',
								!notification.read && 'font-semibold'
							)}>
								{notification.title}
							</p>
						</div>
						{!notification.read && (
							<div className="h-2 w-2 rounded-full bg-blue-500" />
						)}
					</div>

					{/* Message */}
					<p className="text-sm text-muted-foreground line-clamp-2">
						{notification.message}
					</p>

					{/* Footer */}
					<div className="flex items-center justify-between pt-1">
						<span className="text-xs text-muted-foreground">
							{formatDistanceToNow(new Date(notification.createdAt), {
								addSuffix: true,
							})}
						</span>

						{notification.actionLabel && (
							<Badge variant="outline" className="text-xs">
								{notification.actionLabel}
							</Badge>
						)}
					</div>
				</div>

				{/* Actions */}
				{!notification.read && (
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={(e) => {
							e.stopPropagation();
							onMarkAsRead();
						}}
					>
						<Check className="h-4 w-4" />
					</Button>
				)}
			</div>
		</button>
	);
}

