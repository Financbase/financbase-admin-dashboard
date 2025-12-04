/**
 * User Preferences API Routes
 * Handles user preferences, notification settings, and privacy controls
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { userPreferences } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

// GET /api/settings/preferences
// Get user's current preferences
export async function GET() {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Get user preferences
		// Note: Some columns may not exist in the database yet (e.g., sidebarCollapsed, compact_mode)
		// We'll select them conditionally and handle missing columns gracefully
		let preferences;
		try {
			preferences = await db
				.select({
					id: userPreferences.id,
					userId: userPreferences.userId,
					theme: userPreferences.theme,
					sidebarCollapsed: userPreferences.sidebarCollapsed,
					compactMode: userPreferences.compactMode,
					highContrast: userPreferences.highContrast,
					fontSize: userPreferences.fontSize,
					language: userPreferences.language,
					timezone: userPreferences.timezone,
					dateFormat: userPreferences.dateFormat,
					timeFormat: userPreferences.timeFormat,
					currency: userPreferences.currency,
					numberFormat: userPreferences.numberFormat,
					defaultDashboard: userPreferences.defaultDashboard,
					chartsEnabled: userPreferences.chartsEnabled,
					analyticsEnabled: userPreferences.analyticsEnabled,
					autoRefresh: userPreferences.autoRefresh,
					refreshInterval: userPreferences.refreshInterval,
					emailNotifications: userPreferences.emailNotifications,
					pushNotifications: userPreferences.pushNotifications,
					desktopNotifications: userPreferences.desktopNotifications,
					notificationSounds: userPreferences.notificationSounds,
					weeklyDigest: userPreferences.weeklyDigest,
					monthlyReport: userPreferences.monthlyReport,
					analyticsTracking: userPreferences.analyticsTracking,
					errorReporting: userPreferences.errorReporting,
					usageStats: userPreferences.usageStats,
					marketingEmails: userPreferences.marketingEmails,
					dataExport: userPreferences.dataExport,
					betaFeatures: userPreferences.betaFeatures,
					experimentalFeatures: userPreferences.experimentalFeatures,
					developerMode: userPreferences.developerMode,
					apiAccess: userPreferences.apiAccess,
					customPreferences: userPreferences.customPreferences,
					createdAt: userPreferences.createdAt,
					updatedAt: userPreferences.updatedAt,
				})
				.from(userPreferences)
				.where(eq(userPreferences.userId, userId))
				.limit(1);
		} catch (selectError) {
			// If error is about missing columns, retry without them
			const errorMessage = selectError instanceof Error ? selectError.message : String(selectError);
			if (errorMessage.includes('column "sidebar_collapsed" does not exist') || 
			    errorMessage.includes('column "compact_mode" does not exist') ||
			    errorMessage.includes('column "time_format" does not exist') ||
			    errorMessage.includes('column "currency" does not exist')) {
				logger.warn('[Preferences API] Retrying without problematic columns due to missing columns');
				// Retry with a minimal select that excludes problematic columns
				preferences = await db
					.select({
						id: userPreferences.id,
						userId: userPreferences.userId,
						theme: userPreferences.theme,
						// sidebarCollapsed, compactMode, timeFormat, and currency excluded
						language: userPreferences.language,
						timezone: userPreferences.timezone,
						dateFormat: userPreferences.dateFormat,
						numberFormat: userPreferences.numberFormat,
						defaultDashboard: userPreferences.defaultDashboard,
						createdAt: userPreferences.createdAt,
						updatedAt: userPreferences.updatedAt,
					})
					.from(userPreferences)
					.where(eq(userPreferences.userId, userId))
					.limit(1);
				
				// Add default values for missing columns
				if (preferences.length > 0) {
					// Remove sidebarCollapsed as it doesn't exist in the schema
					preferences[0] = {
						...preferences[0],
						compactMode: false,
						highContrast: false,
						fontSize: 'medium',
						timeFormat: '12h',
						currency: 'USD',
						chartsEnabled: true,
						analyticsEnabled: true,
						autoRefresh: true,
						refreshInterval: '5m',
						emailNotifications: true,
						pushNotifications: true,
						desktopNotifications: false,
						notificationSounds: true,
						weeklyDigest: true,
						monthlyReport: true,
						analyticsTracking: true,
						errorReporting: true,
						usageStats: false,
						marketingEmails: false,
						dataExport: true,
						betaFeatures: false,
						experimentalFeatures: false,
						developerMode: false,
						apiAccess: false,
						customPreferences: {},
					};
				}
			} else {
				// Re-throw if it's a different error
				throw selectError;
			}
		}

		if (!preferences.length) {
			// Return default preferences if none exist
			return NextResponse.json({
				preferences: null,
				defaults: {
					theme: 'system',
					language: 'en',
					timezone: 'UTC',
					dateFormat: 'MM/DD/YYYY',
					timeFormat: '12h',
					currency: 'USD',
					numberFormat: '1,234.56',
					sidebarCollapsed: false,
					compactMode: false,
					highContrast: false,
					fontSize: 'medium',
					defaultDashboard: 'overview',
					chartsEnabled: true,
					analyticsEnabled: true,
					autoRefresh: true,
					refreshInterval: '5m',
					emailNotifications: true,
					pushNotifications: true,
					desktopNotifications: false,
					notificationSounds: true,
					weeklyDigest: true,
					monthlyReport: true,
					analyticsTracking: true,
					errorReporting: true,
					usageStats: false,
					marketingEmails: false,
					dataExport: true,
					betaFeatures: false,
					experimentalFeatures: false,
					developerMode: false,
					apiAccess: false,
					customPreferences: {},
				},
			});
		}

		return NextResponse.json({ preferences: preferences[0] });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

// PUT /api/settings/preferences
// Update user's preferences
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
			'theme', 'sidebarCollapsed', 'compactMode', 'highContrast', 'fontSize',
			'language', 'timezone', 'dateFormat', 'timeFormat', 'currency', 'numberFormat',
			'defaultDashboard', 'chartsEnabled', 'analyticsEnabled', 'autoRefresh', 'refreshInterval',
			'emailNotifications', 'pushNotifications', 'desktopNotifications', 'notificationSounds',
			'weeklyDigest', 'monthlyReport', 'analyticsTracking', 'errorReporting', 'usageStats',
			'marketingEmails', 'dataExport', 'betaFeatures', 'experimentalFeatures', 'developerMode',
			'apiAccess', 'customPreferences'
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

		// Check if preferences exist
		const existingPreferences = await db
			.select()
			.from(userPreferences)
			.where(eq(userPreferences.userId, userId))
			.limit(1);

		const now = new Date();
		updateData.updatedAt = now;

		if (existingPreferences.length) {
			// Update existing preferences
			const updatedPreferences = await db
				.update(userPreferences)
				.set(updateData)
				.where(eq(userPreferences.userId, userId))
				.returning();

			return NextResponse.json({ preferences: updatedPreferences[0] });
		} else {
			// Create new preferences
			const newPreferences = await db
				.insert(userPreferences)
				.values({
					userId,
					...updateData,
				})
				.returning();

			return NextResponse.json({ preferences: newPreferences[0] });
		}
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
