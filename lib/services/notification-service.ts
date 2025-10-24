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

			// Send real-time update via PartyKit
			await this.sendRealTimeUpdate(input.userId, createdNotification);

			// Check if user wants email notifications
			await this.checkEmailNotification(input.userId, createdNotification);

			return createdNotification;
	} catch (error) {
		console.error('Error creating notification:', error);
			throw new Error('Failed to create notification');
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

			let query = db
				.select()
				.from(notifications)
				.where(eq(notifications.userId, userId))
				.orderBy(desc(notifications.createdAt))
				.limit(limit)
				.offset(offset);

			if (unreadOnly) {
				query = query.where(eq(notifications.read, false));
			}

			if (type) {
				query = query.where(eq(notifications.type, type));
			}

			if (priority) {
				query = query.where(eq(notifications.priority, priority));
			}

			return await query;
		} catch (error) {
			console.error('Error fetching notifications:', error);
			throw new Error('Failed to fetch notifications');
		}
	}

	/**
	 * Get unread count for a user
	 */
	static async getUnreadCount(userId: string): Promise<number> {
		try {
			const result = await db
				.select({ count: sql<number>`count(*)` })
				.from(notifications)
				.where(and(eq(notifications.userId, userId), eq(notifications.read, false)));

			return result[0]?.count || 0;
		} catch (error) {
			console.error('Error getting unread count:', error);
			return 0;
		}
	}

	/**
	 * Mark a notification as read
	 */
	static async markAsRead(notificationId: number, userId: string): Promise<boolean> {
		try {
			const result = await db
				.update(notifications)
			.set({
				read: true,
					updatedAt: sql`NOW()`,
			})
				.where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
			.returning();

			return result.length > 0;
		} catch (error) {
			console.error('Error marking notification as read:', error);
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
				read: true,
					updatedAt: sql`NOW()`,
				})
				.where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
				.returning();

			return result.length > 0;
		} catch (error) {
			console.error('Error marking all notifications as read:', error);
			return false;
		}
	}

	/**
	 * Delete a notification
	 */
	static async delete(notificationId: number, userId: string): Promise<boolean> {
		try {
			const result = await db
				.delete(notifications)
				.where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
			.returning();

			return result.length > 0;
		} catch (error) {
			console.error('Error deleting notification:', error);
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