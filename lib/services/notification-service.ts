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
			if (!userId || typeof userId !== 'string') {
				throw new Error('Invalid userId provided to getForUser');
			}

			const {
				limit = 50,
				offset = 0,
				unreadOnly = false,
				type,
				priority,
			} = filters;

			console.log('[NotificationService] getForUser called', { userId, filters });

			// Build where conditions array
			const conditions = [eq(notifications.userId, userId)];
			
			if (unreadOnly) {
				conditions.push(eq(notifications.isRead, false));
			}
			
			if (type) {
				conditions.push(eq(notifications.type, type));
			}
			
			// Add priority filter if provided
			if (priority) {
				conditions.push(eq(notifications.priority, priority));
			}

			const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

			console.log('[NotificationService] Executing query', { userId, conditionCount: conditions.length });

			// Explicitly select columns to avoid issues with missing columns
			const result = await db
				.select({
					id: notifications.id,
					userId: notifications.userId,
					type: notifications.type,
					category: notifications.category,
					priority: notifications.priority,
					title: notifications.title,
					message: notifications.message,
					actionUrl: notifications.actionUrl,
					actionLabel: notifications.actionLabel,
					data: notifications.data,
					metadata: notifications.metadata,
					isRead: notifications.isRead,
					isArchived: notifications.isArchived,
					expiresAt: notifications.expiresAt,
					readAt: notifications.readAt,
					archivedAt: notifications.archivedAt,
					createdAt: notifications.createdAt,
					updatedAt: notifications.updatedAt,
				})
				.from(notifications)
				.where(whereClause)
				.orderBy(desc(notifications.createdAt))
				.limit(limit)
				.offset(offset);

			// Validate result is an array
			if (!Array.isArray(result)) {
				console.error('[NotificationService] Query returned non-array result', { userId, result });
				return [];
			}

			console.log('[NotificationService] Query successful', { userId, resultCount: result.length });

			return result;
		} catch (error) {
			// If error is about missing columns, retry with minimal columns
			const errorMessage = error instanceof Error ? error.message : String(error);
			if (errorMessage.includes('column "action_url" does not exist') || 
			    errorMessage.includes('column "priority" does not exist') ||
			    errorMessage.includes('column "data" does not exist') ||
			    errorMessage.includes('column "category" does not exist') ||
			    errorMessage.includes('column "metadata" does not exist') ||
			    errorMessage.includes('column "read_at" does not exist') ||
			    errorMessage.includes('column "archived_at" does not exist') ||
			    errorMessage.includes('column "action_label" does not exist') ||
			    errorMessage.includes('column "expires_at" does not exist')) {
				console.warn('[NotificationService] Retrying with minimal columns due to missing columns', { userId, error: errorMessage });
				// Retry with minimal column set (only columns that definitely exist)
				const minimalConditions = [eq(notifications.userId, userId)];
				
				if (filters.unreadOnly) {
					minimalConditions.push(eq(notifications.isRead, false));
				}
				
				if (filters.type) {
					minimalConditions.push(eq(notifications.type, filters.type));
				}

				const minimalWhereClause = minimalConditions.length > 1 ? and(...minimalConditions) : minimalConditions[0];

				return await db
					.select({
						id: notifications.id,
						userId: notifications.userId,
						type: notifications.type,
						title: notifications.title,
						message: notifications.message,
						isRead: notifications.isRead,
						createdAt: notifications.createdAt,
						updatedAt: notifications.updatedAt,
					})
					.from(notifications)
					.where(minimalWhereClause)
					.orderBy(desc(notifications.createdAt))
					.limit(filters.limit || 50)
					.offset(filters.offset || 0);
			}
			
			// Handle database connection errors
			if (errorMessage.includes('connection') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('timeout')) {
				console.error('[NotificationService] Database connection error:', {
					userId,
					filters,
					error: errorMessage,
				});
				throw new Error(`Database connection failed: ${errorMessage}`);
			}

			// Handle column/schema errors
			if (errorMessage.includes('column') || errorMessage.includes('does not exist')) {
				console.error('[NotificationService] Database schema error:', {
					userId,
					filters,
					error: errorMessage,
				});
				throw new Error(`Database schema mismatch: ${errorMessage}`);
			}
			
			console.error('[NotificationService] Error fetching notifications:', {
				userId,
				filters,
				error: errorMessage,
				stack: error instanceof Error ? error.stack : undefined,
			});
			throw new Error(`Failed to fetch notifications: ${errorMessage}`);
		}
	}

	/**
	 * Get unread count for a user
	 */
	static async getUnreadCount(userId: string): Promise<number> {
		try {
			if (!userId || typeof userId !== 'string') {
				console.warn('[NotificationService] Invalid userId provided to getUnreadCount', { userId });
				return 0;
			}

			console.log('[NotificationService] getUnreadCount called', { userId });

			const result = await db
				.select({ count: sql<number>`count(*)::int` })
				.from(notifications)
				.where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

			// Validate result structure
			if (!result || !Array.isArray(result) || result.length === 0) {
				console.warn('[NotificationService] Empty result from unread count query', { userId });
				return 0;
			}

			// Handle both number and bigint return types
			const count = result[0]?.count;
			if (count === undefined || count === null) {
				console.warn('[NotificationService] Count is undefined/null', { userId });
				return 0;
			}

			// Convert bigint to number if needed
			const numericCount = typeof count === 'bigint' ? Number(count) : count;
			
			if (typeof numericCount !== 'number' || isNaN(numericCount)) {
				console.warn('[NotificationService] Invalid count value', { userId, count, numericCount });
				return 0;
			}

			console.log('[NotificationService] Unread count retrieved', { userId, count: numericCount });

			return numericCount;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			
			// Log error but don't throw - return 0 as fallback
			console.error('[NotificationService] Error getting unread count:', {
				userId,
				error: errorMessage,
				stack: error instanceof Error ? error.stack : undefined,
			});
			
			// Return 0 as a safe fallback - this allows the notifications list to still load
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
			const errorMessage = error instanceof Error ? error.message : String(error);
			
			// If read_at column doesn't exist, retry without it
			if (errorMessage.includes('column "read_at" does not exist')) {
				console.warn('[NotificationService] read_at column missing, retrying without it', { notificationId, userId });
				try {
					const result = await db
						.update(notifications)
						.set({
							isRead: true,
							updatedAt: sql`NOW()`,
						})
						.where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
						.returning();

					return result.length > 0;
				} catch (retryError) {
					console.error('[NotificationService] Error marking notification as read (retry):', {
						notificationId,
						userId,
						error: retryError instanceof Error ? retryError.message : String(retryError),
					});
					return false;
				}
			}
			
			console.error('[NotificationService] Error marking notification as read:', {
				notificationId,
				userId,
				error: errorMessage,
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
			const errorMessage = error instanceof Error ? error.message : String(error);
			
			// If read_at column doesn't exist, retry without it
			if (errorMessage.includes('column "read_at" does not exist')) {
				console.warn('[NotificationService] read_at column missing, retrying without it', { userId });
				try {
					const result = await db
						.update(notifications)
						.set({
							isRead: true,
							updatedAt: sql`NOW()`,
						})
						.where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
						.returning();

					return result.length > 0;
				} catch (retryError) {
					console.error('[NotificationService] Error marking all notifications as read (retry):', {
						userId,
						error: retryError instanceof Error ? retryError.message : String(retryError),
					});
					return false;
				}
			}
			
			console.error('[NotificationService] Error marking all notifications as read:', {
				userId,
				error: errorMessage,
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
	 * Supports Cloudflare-hosted PartyKit deployments
	 */
	private static async sendRealTimeUpdate(userId: string, notification: any) {
		try {
			const partykitHost = process.env.NEXT_PUBLIC_PARTYKIT_HOST;
			if (!partykitHost) {
				console.warn('PartyKit host not configured - skipping real-time notification');
				return;
			}

			// Use https for production, http for localhost
			const protocol = partykitHost.includes('localhost') || partykitHost.includes('127.0.0.1') ? 'http' : 'https';
			
			// PartyKit HTTP API format: https://host/parties/party-name/room-id
			const apiUrl = `${protocol}://${partykitHost}/parties/financbase-partykit/notifications-${userId}`;

			await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(process.env.PARTYKIT_SECRET && {
						'Authorization': `Bearer ${process.env.PARTYKIT_SECRET}`,
					}),
				},
				body: JSON.stringify({
					type: 'notification',
					data: notification,
				}),
			});
		} catch (error) {
			console.error('Error sending PartyKit notification:', error);
			// Don't throw - real-time updates are non-critical
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