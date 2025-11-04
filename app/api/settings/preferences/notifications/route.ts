/**
 * Notification Preferences API Routes
 * Handles detailed notification settings for users
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { notificationPreferences } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

// GET /api/settings/preferences/notifications
// Get user's notification preferences
export async function GET() {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Get notification preferences
		const preferences = await db
			.select({
				id: notificationPreferences.id,
				userId: notificationPreferences.userId,
				emailInvoices: notificationPreferences.emailInvoices,
				emailPayments: notificationPreferences.emailPayments,
				emailReports: notificationPreferences.emailReports,
				emailSecurity: notificationPreferences.emailSecurity,
				emailUpdates: notificationPreferences.emailUpdates,
				emailMarketing: notificationPreferences.emailMarketing,
				pushInvoices: notificationPreferences.pushInvoices,
				pushPayments: notificationPreferences.pushPayments,
				pushReports: notificationPreferences.pushReports,
				pushSecurity: notificationPreferences.pushSecurity,
				pushUpdates: notificationPreferences.pushUpdates,
				inAppInvoices: notificationPreferences.inAppInvoices,
				inAppPayments: notificationPreferences.inAppPayments,
				inAppReports: notificationPreferences.inAppReports,
				inAppSecurity: notificationPreferences.inAppSecurity,
				inAppUpdates: notificationPreferences.inAppUpdates,
				inAppComments: notificationPreferences.inAppComments,
				inAppMentions: notificationPreferences.inAppMentions,
				quietHoursEnabled: notificationPreferences.quietHoursEnabled,
				quietHoursStart: notificationPreferences.quietHoursStart,
				quietHoursEnd: notificationPreferences.quietHoursEnd,
				quietHoursTimezone: notificationPreferences.quietHoursTimezone,
				createdAt: notificationPreferences.createdAt,
				updatedAt: notificationPreferences.updatedAt,
			})
			.from(notificationPreferences)
			.where(eq(notificationPreferences.userId, userId))
			.limit(1);

		if (!preferences.length) {
			// Return default notification preferences if none exist
			return NextResponse.json({
				preferences: null,
				defaults: {
					emailInvoices: true,
					emailPayments: true,
					emailReports: true,
					emailSecurity: true,
					emailUpdates: true,
					emailMarketing: false,
					pushInvoices: false,
					pushPayments: true,
					pushReports: false,
					pushSecurity: true,
					pushUpdates: false,
					inAppInvoices: true,
					inAppPayments: true,
					inAppReports: true,
					inAppSecurity: true,
					inAppUpdates: true,
					inAppComments: true,
					inAppMentions: true,
					quietHoursEnabled: false,
					quietHoursStart: '22:00',
					quietHoursEnd: '08:00',
					quietHoursTimezone: 'UTC',
				},
			});
		}

		return NextResponse.json({ preferences: preferences[0] });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

// PUT /api/settings/preferences/notifications
// Update user's notification preferences
export async function PUT(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		// Validate required fields if any
		const allowedFields = [
			'emailInvoices', 'emailPayments', 'emailReports', 'emailSecurity', 'emailUpdates', 'emailMarketing',
			'pushInvoices', 'pushPayments', 'pushReports', 'pushSecurity', 'pushUpdates',
			'inAppInvoices', 'inAppPayments', 'inAppReports', 'inAppSecurity', 'inAppUpdates', 'inAppComments', 'inAppMentions',
			'quietHoursEnabled', 'quietHoursStart', 'quietHoursEnd', 'quietHoursTimezone'
		];

		// Filter only allowed fields
		const updateData: Record<string, any> = {};
		Object.keys(body).forEach(key => {
			if (allowedFields.includes(key)) {
				updateData[key] = body[key];
			}
		});

		if (Object.keys(updateData).length === 0) {
			return ApiErrorHandler.badRequest('No valid fields to update');
		}

		// Check if notification preferences exist
		const existingPreferences = await db
			.select()
			.from(notificationPreferences)
			.where(eq(notificationPreferences.userId, userId))
			.limit(1);

		const now = new Date();
		updateData.updatedAt = now;

		if (existingPreferences.length) {
			// Update existing notification preferences
			const updatedPreferences = await db
				.update(notificationPreferences)
				.set(updateData)
				.where(eq(notificationPreferences.userId, userId))
				.returning({
					id: notificationPreferences.id,
					userId: notificationPreferences.userId,
					emailInvoices: notificationPreferences.emailInvoices,
					emailPayments: notificationPreferences.emailPayments,
					emailReports: notificationPreferences.emailReports,
					emailSecurity: notificationPreferences.emailSecurity,
					emailUpdates: notificationPreferences.emailUpdates,
					emailMarketing: notificationPreferences.emailMarketing,
					pushInvoices: notificationPreferences.pushInvoices,
					pushPayments: notificationPreferences.pushPayments,
					pushReports: notificationPreferences.pushReports,
					pushSecurity: notificationPreferences.pushSecurity,
					pushUpdates: notificationPreferences.pushUpdates,
					inAppInvoices: notificationPreferences.inAppInvoices,
					inAppPayments: notificationPreferences.inAppPayments,
					inAppReports: notificationPreferences.inAppReports,
					inAppSecurity: notificationPreferences.inAppSecurity,
					inAppUpdates: notificationPreferences.inAppUpdates,
					inAppComments: notificationPreferences.inAppComments,
					inAppMentions: notificationPreferences.inAppMentions,
					quietHoursEnabled: notificationPreferences.quietHoursEnabled,
					quietHoursStart: notificationPreferences.quietHoursStart,
					quietHoursEnd: notificationPreferences.quietHoursEnd,
					quietHoursTimezone: notificationPreferences.quietHoursTimezone,
					createdAt: notificationPreferences.createdAt,
					updatedAt: notificationPreferences.updatedAt,
				});

			return NextResponse.json({ preferences: updatedPreferences[0] });
		} else {
			// Create new notification preferences
			const newPreferences = await db
				.insert(notificationPreferences)
				.values({
					userId,
					...updateData,
				})
				.returning({
					id: notificationPreferences.id,
					userId: notificationPreferences.userId,
					emailInvoices: notificationPreferences.emailInvoices,
					emailPayments: notificationPreferences.emailPayments,
					emailReports: notificationPreferences.emailReports,
					emailSecurity: notificationPreferences.emailSecurity,
					emailUpdates: notificationPreferences.emailUpdates,
					emailMarketing: notificationPreferences.emailMarketing,
					pushInvoices: notificationPreferences.pushInvoices,
					pushPayments: notificationPreferences.pushPayments,
					pushReports: notificationPreferences.pushReports,
					pushSecurity: notificationPreferences.pushSecurity,
					pushUpdates: notificationPreferences.pushUpdates,
					inAppInvoices: notificationPreferences.inAppInvoices,
					inAppPayments: notificationPreferences.inAppPayments,
					inAppReports: notificationPreferences.inAppReports,
					inAppSecurity: notificationPreferences.inAppSecurity,
					inAppUpdates: notificationPreferences.inAppUpdates,
					inAppComments: notificationPreferences.inAppComments,
					inAppMentions: notificationPreferences.inAppMentions,
					quietHoursEnabled: notificationPreferences.quietHoursEnabled,
					quietHoursStart: notificationPreferences.quietHoursStart,
					quietHoursEnd: notificationPreferences.quietHoursEnd,
					quietHoursTimezone: notificationPreferences.quietHoursTimezone,
					createdAt: notificationPreferences.createdAt,
					updatedAt: notificationPreferences.updatedAt,
				});

			return NextResponse.json({ preferences: newPreferences[0] });
		}
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
