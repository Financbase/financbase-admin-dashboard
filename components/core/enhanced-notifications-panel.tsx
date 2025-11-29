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
import { validateSafeUrl } from '@/lib/utils/security';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';

interface Notification {
	id: string | number; // Serial ID from database (integer, but can be string in JS)
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
			try {
				const response = await fetch('/api/notifications');
				
				if (!response.ok) {
					let errorData: { error?: { message?: string; code?: string }; message?: string } = {};
					let errorMessage = `Failed to fetch notifications: ${response.status}`;
					
					try {
						errorData = await response.json();
						// ApiErrorHandler returns { error: { message, code, ... } }
						if (errorData?.error) {
							errorMessage = errorData.error.message || errorData.error.code || errorMessage;
						} else if (errorData?.message) {
							errorMessage = errorData.message;
						}
					} catch (jsonError) {
						// If JSON parsing fails, use status text or default message
						logger.error('[Notifications] Failed to parse error response:', jsonError);
						errorMessage = response.statusText || `Server error (${response.status})`;
					}
					
					logger.error('[Notifications] API Error:', {
						status: response.status,
						statusText: response.statusText,
						errorData,
						errorMessage,
					});
					
					throw new Error(errorMessage);
				}
				
				const result = await response.json();
				logger.info('[Notifications] Fetched:', result);
				return result;
			} catch (fetchError) {
				// Handle network errors or other fetch failures
				if (fetchError instanceof Error) {
					throw fetchError;
				}
				throw new Error('Network error: Unable to fetch notifications');
			}
		},
		refetchInterval: 30000, // Refetch every 30 seconds
		enabled: isLoaded && !!user?.id, // Only fetch when user is loaded and available
		retry: 2, // Retry failed requests up to 2 times
		retryDelay: 1000, // Wait 1 second between retries
	});

	const notifications: Notification[] = data?.notifications || [];
	const unreadCount = data?.unreadCount || 0;

	// Debug logging
	useEffect(() => {
		logger.info('[Notifications] State:', {
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
		mutationFn: async (id: string | number) => {
			const response = await fetch(`/api/notifications/${id}/read`, {
				method: 'POST',
			});
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				const errorMessage = errorData?.error?.message || errorData?.message || 'Failed to mark as read';
				throw new Error(errorMessage);
			}
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

		// Check if PartyKit host is configured
		const partyKitHost = process.env.NEXT_PUBLIC_PARTYKIT_HOST;
		if (!partyKitHost) {
			logger.warn('[Notifications] NEXT_PUBLIC_PARTYKIT_HOST is not configured. Real-time notifications disabled.');
			return;
		}

		// Use WebSocket for real-time notifications
		let socket: WebSocket | null = null;
		let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
		let reconnectAttempts = 0;
		let isMounted = true; // Track if component is still mounted
		const MAX_RECONNECT_ATTEMPTS = 5;
		const RECONNECT_DELAY = 3000; // 3 seconds

		const connect = () => {
			// Don't connect if component is unmounted
			if (!isMounted) return;

			try {
				const wsUrl = `${partyKitHost}/party/notifications-${user.id}`;
				socket = new WebSocket(wsUrl);

				socket.onopen = () => {
					if (!isMounted) {
						socket?.close();
						return;
					}
					logger.info('[Notifications] WebSocket connected');
					reconnectAttempts = 0; // Reset reconnect attempts on successful connection
				};

				socket.onmessage = (event) => {
					if (!isMounted) return;
					
					try {
						const data = JSON.parse(event.data);
						if (data.type === 'notification') {
							queryClient.invalidateQueries({ queryKey: ['notifications'] });

							// Show toast for new notification
							const toastOptions: {
								description: string;
								action?: { label: string; onClick: () => void };
							} = {
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
						logger.error('[Notifications] Error parsing notification data:', error);
					}
				};

				socket.onerror = () => {
					// WebSocket error events don't provide detailed error information
					// Log what we can - the error object itself is empty, so we log context
					logger.error('[Notifications] WebSocket error occurred', {
						url: wsUrl,
						readyState: socket?.readyState,
						reconnectAttempts,
					});
				};

				socket.onclose = (event) => {
					if (!isMounted) return;

					logger.info('[Notifications] WebSocket closed', {
						code: event.code,
						reason: event.reason || 'No reason provided',
						wasClean: event.wasClean,
					});

					// Attempt reconnection if not a clean close and we haven't exceeded max attempts
					if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS && isMounted) {
						reconnectAttempts++;
						logger.info(`[Notifications] Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
						
						reconnectTimeout = setTimeout(() => {
							if (isMounted) {
								connect();
							}
						}, RECONNECT_DELAY);
					} else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
						logger.error('[Notifications] Max reconnection attempts reached. WebSocket connection failed.');
					}
				};

			} catch (error) {
				logger.error('[Notifications] Error setting up WebSocket:', error);
				if (error instanceof Error) {
					logger.error('[Notifications] Error details:', {
						message: error.message,
						stack: error.stack,
					});
				}
			}
		};

		// Initial connection
		connect();

		return () => {
			isMounted = false; // Mark as unmounted to prevent reconnection attempts
			
			if (reconnectTimeout) {
				clearTimeout(reconnectTimeout);
				reconnectTimeout = null;
			}
			
			if (socket) {
				// Remove event listeners to prevent reconnection attempts
				socket.onclose = null;
				socket.onerror = null;
				// Close with code 1000 (normal closure) to indicate intentional disconnect
				if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
					socket.close(1000, 'Component unmounted');
				}
				socket = null;
			}
		};
	}, [queryClient, user?.id, router]);

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
				logger.warn('Blocked redirect to unsafe URL:', notification.actionUrl);
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

		const getTypeIcon = (_type: string) => {
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
							<p className="text-xs text-muted-foreground mb-4">
								{error instanceof Error ? error.message : 'Unknown error occurred'}
							</p>
							<Button
								variant="outline"
								size="sm"
								onClick={() => queryClient.invalidateQueries({ queryKey: ['notifications'] })}
							>
								Retry
							</Button>
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

