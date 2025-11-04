/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from '@/lib/db';
import { notifications, notificationPreferences } from '@/lib/db/schemas/index';
import { eq, desc, and, sql } from 'drizzle-orm';
import { sendNotificationEmail } from './email-templates';

export interface CreateNotificationInput {
	userId: string;
	type: 'invoice' | 'expense' | 'alert' | 'report' | 'system';
	category?: 'financial' | 'system' | 'security' | 'general';
	priority?: 'low' | 'normal' | 'high' | 'urgent';
	title: string;
	message: string;
	data?: Record<string, any>;
	actionUrl?: string;
	actionLabel?: string;
	expiresAt?: Date;
	metadata?: Record<string, any>;
}

export interface NotificationFilters {
	limit?: number;
	offset?: number;
	unreadOnly?: boolean;
	type?: string;
	priority?: string;
}

export class NotificationService {
/**
 * Create a new notification
 */
	static async create(input: CreateNotificationInput) {
		try {
			const notification = await db
				.insert(notifications)
				.values({
					userId: input.userId,
					type: input.type,
					category: input.category || 'general',
					priority: input.priority || 'normal',
					title: input.title,
					message: input.message,
					data: input.data || {},
					actionUrl: input.actionUrl,
					expiresAt: input.expiresAt,
				})
				.returning();

			const createdNotification = notification[0];

			if (!createdNotification) {
				throw new Error('Failed to create notification: no notification returned');
			}

			// Send real-time update via PartyKit (non-blocking)
			this.sendRealTimeUpdate(input.userId, createdNotification).catch((error) => {
				console.error('[NotificationService] Error sending real-time update:', error);
			});

			// Check if user wants email notifications (non-blocking)
			this.checkEmailNotification(input.userId, createdNotification).catch((error) => {
				console.error('[NotificationService] Error checking email notification:', error);
			});

			return createdNotification;
		} catch (error) {
			console.error('[NotificationService] Error creating notification:', {
				input: { userId: input.userId, type: input.type, title: input.title },
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			throw new Error(`Failed to create notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	/**
	 * Get notifications for a user
	 */
	static async getForUser(userId: string, filters: NotificationFilters = {}) {
		try {
			const {
				limit = 50,
				offset = 0,
				unreadOnly = false,
				type,
				priority,
			} = filters;

			// Build where conditions array
			const conditions = [eq(notifications.userId, userId)];
			
			if (unreadOnly) {
				conditions.push(eq(notifications.isRead, false));
			}
			
			if (type) {
				conditions.push(eq(notifications.type, type));
			}
			
			if (priority) {
				conditions.push(eq(notifications.priority, priority));
			}

			const result = await db
				.select()
				.from(notifications)
				.where(conditions.length > 1 ? and(...conditions) : conditions[0])
				.orderBy(desc(notifications.createdAt))
				.limit(limit)
				.offset(offset);

			return result;
		} catch (error) {
			console.error('[NotificationService] Error fetching notifications:', {
				userId,
				filters,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			throw new Error(`Failed to fetch notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	/**
	 * Get unread count for a user
	 */
	static async getUnreadCount(userId: string): Promise<number> {
		try {
			const result = await db
				.select({ count: sql<number>`count(*)::int` })
				.from(notifications)
				.where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

			// Handle both number and bigint return types
			const count = result[0]?.count;
			if (count === undefined || count === null) {
				return 0;
			}
			// Convert bigint to number if needed
			return typeof count === 'bigint' ? Number(count) : count;
		} catch (error) {
			console.error('[NotificationService] Error getting unread count:', {
				userId,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			return 0;
		}
	}

	/**
	 * Mark a notification as read
	 * @param notificationId - The notification ID (integer, serial type)
	 * @param userId - The user ID
	 */
	static async markAsRead(notificationId: number, userId: string): Promise<boolean> {
		try {
			const result = await db
				.update(notifications)
				.set({
					isRead: true,
					readAt: sql`NOW()`,
					updatedAt: sql`NOW()`,
				})
				.where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
				.returning();

			return result.length > 0;
		} catch (error) {
			console.error('[NotificationService] Error marking notification as read:', {
				notificationId,
				userId,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			return false;
		}
	}

	/**
	 * Mark all notifications as read for a user
	 */
	static async markAllAsRead(userId: string): Promise<boolean> {
		try {
			const result = await db
				.update(notifications)
				.set({
					isRead: true,
					readAt: sql`NOW()`,
					updatedAt: sql`NOW()`,
				})
				.where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
				.returning();

			return result.length > 0;
		} catch (error) {
			console.error('[NotificationService] Error marking all notifications as read:', {
				userId,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			return false;
		}
	}

	/**
	 * Delete a notification
	 * @param notificationId - The notification ID (integer, serial type)
	 * @param userId - The user ID
	 */
	static async delete(notificationId: number, userId: string): Promise<boolean> {
		try {
			const result = await db
				.delete(notifications)
				.where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
				.returning();

			return result.length > 0;
		} catch (error) {
			console.error('[NotificationService] Error deleting notification:', {
				notificationId,
				userId,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});
			return false;
		}
	}

	/**
	 * Get user notification preferences
	 */
	static async getUserPreferences(userId: string) {
		try {
			const result = await db
				.select()
				.from(notificationPreferences)
				.where(eq(notificationPreferences.userId, userId))
				.limit(1);

			return result[0] || null;
		} catch (error) {
			console.error('Error getting user preferences:', error);
			return null;
		}
	}

	/**
	 * Update user notification preferences
	 */
	static async updateUserPreferences(userId: string, preferences: Partial<typeof notificationPreferences.$inferInsert>) {
		try {
			const result = await db
				.insert(notificationPreferences)
				.values({ userId, ...preferences })
				.onConflictDoUpdate({
					target: notificationPreferences.userId,
					set: preferences,
				})
				.returning();

			return result[0];
		} catch (error) {
			console.error('Error updating user preferences:', error);
			throw new Error('Failed to update preferences');
		}
	}

	/**
	 * Send real-time update via PartyKit
	 */
	private static async sendRealTimeUpdate(userId: string, notification: any) {
		try {
			if (!process.env.NEXT_PUBLIC_PARTYKIT_HOST) {
				return;
			}

			await fetch(`${process.env.NEXT_PUBLIC_PARTYKIT_HOST}/party/notifications-${userId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${process.env.PARTYKIT_SECRET}`,
				},
				body: JSON.stringify({
					type: 'notification',
					data: notification,
				}),
			});
		} catch (error) {
			console.error('Error sending PartyKit notification:', error);
	}
}

/**
	 * Check if user wants email notification and send if needed
	 */
	private static async checkEmailNotification(userId: string, notification: any) {
		try {
			const preferences = await this.getUserPreferences(userId);

			if (!preferences) {
				return;
			}

			const shouldEmail = this.shouldSendEmail(preferences, notification);

			if (shouldEmail) {
				// Send email notification using templates
				await sendNotificationEmail(userId, notification);
			}
		} catch (error) {
			console.error('Error checking email notification:', error);
		}
	}

	/**
	 * Check if email should be sent based on preferences and notification
	 */
	private static shouldSendEmail(preferences: any, notification: any): boolean {
		switch (notification.type) {
			case 'invoice':
				return preferences.emailInvoices;
			case 'expense':
				return preferences.emailExpenses;
			case 'report':
				return preferences.emailReports;
			case 'alert':
				return preferences.emailAlerts;
			default:
				return notification.priority === 'urgent' || notification.priority === 'high';
		}
	}

	/**
	 * Create a financial notification (convenience method)
	 */
	static async createFinancialNotification(
		userId: string,
		type: 'invoice' | 'expense' | 'report',
		title: string,
		message: string,
		data?: any,
		actionUrl?: string
	) {
		return this.create({
			userId,
			type,
			category: 'financial',
			title,
			message,
			data,
			actionUrl,
			priority: data?.urgent ? 'urgent' : 'normal',
		});
	}

	/**
	 * Create a system alert notification
	 */
	static async createSystemAlert(
		userId: string,
		title: string,
		message: string,
		priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
		actionUrl?: string
	) {
		return this.create({
			userId,
			type: 'alert',
			category: 'system',
			title,
			message,
			actionUrl,
			priority,
		});
	}
}

// Export helper functions for backward compatibility
export const NotificationHelpers = {
	createFinancialNotification: NotificationService.createFinancialNotification,
	createSystemAlert: NotificationService.createSystemAlert,
	getForUser: NotificationService.getForUser,
	markAsRead: NotificationService.markAsRead,
	markAllAsRead: NotificationService.markAllAsRead,
	delete: NotificationService.delete,
	getUnreadCount: NotificationService.getUnreadCount,
};