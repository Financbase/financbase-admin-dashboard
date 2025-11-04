/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

/**
 * Enhanced Notifications Panel
 * Real-time notification system with PartyKit integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
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
import { isSafeRedirectUrl, validateSafeUrl } from '@/lib/utils/security';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Notification {
	id: string; // UUID from database
	userId: string;
	type: string;
	category?: string;
	priority: 'low' | 'normal' | 'high' | 'urgent';
	title: string;
	message: string;
	data?: Record<string, unknown>;
	actionUrl?: string;
	actionLabel?: string;
	isRead: boolean; // Matches database schema field name
	readAt?: Date | string;
	isArchived: boolean; // Matches database schema field name
	createdAt: Date | string;
}

export function EnhancedNotificationsPanel() {
	const queryClient = useQueryClient();
	const { user, isLoaded } = useUser();
	const router = useRouter();

	// Fetch notifications
	const { data, isLoading, error } = useQuery({
		queryKey: ['notifications'],
		queryFn: async () => {
			const response = await fetch('/api/notifications');
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error('[Notifications] API Error:', response.status, errorData);
				throw new Error(errorData.error || `Failed to fetch notifications: ${response.status}`);
			}
			const result = await response.json();
			console.log('[Notifications] Fetched:', result);
			return result;
		},
		refetchInterval: 30000, // Refetch every 30 seconds
		enabled: isLoaded && !!user?.id, // Only fetch when user is loaded and available
	});

	const notifications: Notification[] = data?.notifications || [];
	const unreadCount = data?.unreadCount || 0;

	// Debug logging
	useEffect(() => {
		console.log('[Notifications] State:', {
			userLoaded: isLoaded,
			userId: user?.id,
			isLoading,
			error: error?.message,
			unreadCount,
			notificationsCount: notifications.length,
		});
	}, [isLoaded, user?.id, isLoading, error, unreadCount, notifications.length]);

	// Mark as read mutation
	const markAsReadMutation = useMutation({
		mutationFn: async (id: string) => {
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

	// Real-time updates via PartyKit
	useEffect(() => {
		if (!user?.id) return;

		// Use PartySocket for real-time notifications
		let socket: WebSocket | null = null;

		try {
			const wsUrl = `${process.env.NEXT_PUBLIC_PARTYKIT_HOST}/party/notifications-${user.id}`;
			socket = new WebSocket(wsUrl);

			socket.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					if (data.type === 'notification') {
						queryClient.invalidateQueries({ queryKey: ['notifications'] });

						// Show toast for new notification
						const toastOptions: any = {
							description: data.data.message,
						};

						if (data.data.actionUrl) {
							// Security: Validate action URL before using in toast
							const safeUrl = validateSafeUrl(data.data.actionUrl);
							if (safeUrl) {
								toastOptions.action = {
									label: 'View',
									onClick: () => {
										if (safeUrl.startsWith('/')) {
											router.push(safeUrl);
										} else {
											window.location.href = safeUrl;
										}
									},
								};
							}
						}

						toast.info(data.data.title, toastOptions);
					}
				} catch (error) {
					console.error('Error parsing notification data:', error);
				}
			};

			socket.onerror = (error) => {
				console.error('WebSocket error:', error);
			};

		} catch (error) {
			console.error('Error setting up WebSocket:', error);
		}

		return () => {
			if (socket) {
				socket.close();
			}
		};
	}, [queryClient, user?.id]);

	const handleNotificationClick = (notification: Notification) => {
		// Mark as read
		if (!notification.isRead) {
			markAsReadMutation.mutate(notification.id);
		}

		// Navigate to action URL if provided
		if (notification.actionUrl) {
			// Security: Validate URL to prevent open redirect vulnerability
			const safeUrl = validateSafeUrl(notification.actionUrl);
			
			if (!safeUrl) {
				console.warn('Blocked redirect to unsafe URL:', notification.actionUrl);
				toast.error('Invalid redirect URL');
				return;
			}
			
			// Use Next.js router for internal routes, window.location for same-origin absolute URLs
			// Security: safeUrl is validated by validateSafeUrl() which ensures same-origin or relative paths
			if (safeUrl.startsWith('/')) {
				router.push(safeUrl);
			} else {
				// safeUrl is guaranteed to be same-origin by validateSafeUrl()
				window.location.href = safeUrl;
			}
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

	// Don't render if user isn't loaded yet
	if (!isLoaded) {
		return (
			<Button variant="ghost" size="icon" className="relative" disabled>
				<Bell className="h-5 w-5 opacity-50" />
			</Button>
		);
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white border-2 border-background z-10">
							{unreadCount > 99 ? '99+' : unreadCount}
						</span>
					)}
					{error && (
						<span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-orange-500 z-10" title="Error loading notifications" />
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
					{error ? (
						<div className="flex flex-col items-center justify-center p-8 text-center">
							<Bell className="h-12 w-12 text-muted-foreground mb-4" />
							<p className="text-sm text-muted-foreground mb-2">
								Error loading notifications
							</p>
							<p className="text-xs text-muted-foreground">
								{error instanceof Error ? error.message : 'Unknown error'}
							</p>
						</div>
					) : isLoading ? (
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
							router.push('/dashboard/notifications');
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
				!notification.isRead && 'bg-accent/50'
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
								!notification.isRead && 'font-semibold'
							)}>
								{notification.title}
							</p>
						</div>
						{!notification.isRead && (
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
				{!notification.isRead && (
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

