/**
 * Notification Settings API Routes
 * GET - Fetch user notification preferences
 * PUT - Update user notification preferences
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notificationPreferences } from '@/lib/db/schema/settings';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export async function GET() {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		// Fetch preferences
		const prefs = await db.query.notificationPreferences.findFirst({
			where: eq(notificationPreferences.userId, userId),
		});

		// Return defaults if not found
		if (!prefs) {
			return NextResponse.json({
				emailInvoices: true,
				emailExpenses: true,
				emailReports: true,
				emailAlerts: true,
				emailWeeklySummary: true,
				emailMonthlySummary: true,
				pushRealtime: false,
				pushDaily: true,
				pushWeekly: false,
				inAppInvoices: true,
				inAppExpenses: true,
				inAppAlerts: true,
				slackEnabled: false,
			});
		}

		return NextResponse.json(prefs);
	} catch (error) {
		logger.error('Error fetching notification preferences:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function PUT(req: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const body = await req.json();

		// Update or insert preferences
		const [updated] = await db
			.insert(notificationPreferences)
			.values({
				userId,
				...body,
				updatedAt: new Date(),
			})
			.onConflictDoUpdate({
				target: notificationPreferences.userId,
				set: {
					...body,
					updatedAt: new Date(),
				},
			})
			.returning();

		return NextResponse.json(updated);
	} catch (error) {
		logger.error('Error updating notification preferences:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

