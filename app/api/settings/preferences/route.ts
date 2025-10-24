/**
 * User Preferences API Routes
 * Handles user preferences, notification settings, and privacy controls
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { userPreferences } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';

// GET /api/settings/preferences
// Get user's current preferences
export async function GET() {
	try {
		const { userId } = auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get user preferences
		const preferences = await db
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
		console.error('Error fetching user preferences:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

// PUT /api/settings/preferences
// Update user's preferences
export async function PUT(request: NextRequest) {
	try {
		const { userId } = auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();

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
			return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
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
				.returning({
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
				});

			return NextResponse.json({ preferences: updatedPreferences[0] });
		} else {
			// Create new preferences
			const newPreferences = await db
				.insert(userPreferences)
				.values({
					userId,
					...updateData,
				})
				.returning({
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
				});

			return NextResponse.json({ preferences: newPreferences[0] });
		}
	} catch (error) {
		console.error('Error updating user preferences:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
