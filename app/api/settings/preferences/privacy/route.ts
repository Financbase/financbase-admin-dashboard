/**
 * Privacy Settings API Routes
 * Handles privacy settings and data control preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { privacySettings } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';

// GET /api/settings/preferences/privacy
// Get user's privacy settings
export async function GET() {
	try {
		const { userId } = auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get privacy settings
		const settings = await db
			.select({
				id: privacySettings.id,
				userId: privacySettings.userId,
				analyticsTracking: privacySettings.analyticsTracking,
				errorReporting: privacySettings.errorReporting,
				performanceMonitoring: privacySettings.performanceMonitoring,
				usageStatistics: privacySettings.usageStatistics,
				crashReports: privacySettings.crashReports,
				shareWithPartners: privacySettings.shareWithPartners,
				shareForResearch: privacySettings.shareForResearch,
				shareForMarketing: privacySettings.shareForMarketing,
				allowPersonalization: privacySettings.allowPersonalization,
				dataRetentionPeriod: privacySettings.dataRetentionPeriod,
				autoDeleteInactive: privacySettings.autoDeleteInactive,
				downloadData: privacySettings.downloadData,
				deleteAccount: privacySettings.deleteAccount,
				allowThirdPartyIntegrations: privacySettings.allowThirdPartyIntegrations,
				requireConsentForNewIntegrations: privacySettings.requireConsentForNewIntegrations,
				createdAt: privacySettings.createdAt,
				updatedAt: privacySettings.updatedAt,
			})
			.from(privacySettings)
			.where(eq(privacySettings.userId, userId))
			.limit(1);

		if (!settings.length) {
			// Return default privacy settings if none exist
			return NextResponse.json({
				settings: null,
				defaults: {
					analyticsTracking: true,
					errorReporting: true,
					performanceMonitoring: true,
					usageStatistics: false,
					crashReports: true,
					shareWithPartners: false,
					shareForResearch: false,
					shareForMarketing: false,
					allowPersonalization: true,
					dataRetentionPeriod: '5years',
					autoDeleteInactive: false,
					downloadData: true,
					deleteAccount: false,
					allowThirdPartyIntegrations: true,
					requireConsentForNewIntegrations: true,
				},
			});
		}

		return NextResponse.json({ settings: settings[0] });
	} catch (error) {
		console.error('Error fetching privacy settings:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

// PUT /api/settings/preferences/privacy
// Update user's privacy settings
export async function PUT(request: NextRequest) {
	try {
		const { userId } = auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();

		// Validate required fields if any
		const allowedFields = [
			'analyticsTracking', 'errorReporting', 'performanceMonitoring', 'usageStatistics', 'crashReports',
			'shareWithPartners', 'shareForResearch', 'shareForMarketing', 'allowPersonalization',
			'dataRetentionPeriod', 'autoDeleteInactive', 'downloadData', 'deleteAccount',
			'allowThirdPartyIntegrations', 'requireConsentForNewIntegrations'
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

		// Check if privacy settings exist
		const existingSettings = await db
			.select()
			.from(privacySettings)
			.where(eq(privacySettings.userId, userId))
			.limit(1);

		const now = new Date();
		updateData.updatedAt = now;

		if (existingSettings.length) {
			// Update existing privacy settings
			const updatedSettings = await db
				.update(privacySettings)
				.set(updateData)
				.where(eq(privacySettings.userId, userId))
				.returning({
					id: privacySettings.id,
					userId: privacySettings.userId,
					analyticsTracking: privacySettings.analyticsTracking,
					errorReporting: privacySettings.errorReporting,
					performanceMonitoring: privacySettings.performanceMonitoring,
					usageStatistics: privacySettings.usageStatistics,
					crashReports: privacySettings.crashReports,
					shareWithPartners: privacySettings.shareWithPartners,
					shareForResearch: privacySettings.shareForResearch,
					shareForMarketing: privacySettings.shareForMarketing,
					allowPersonalization: privacySettings.allowPersonalization,
					dataRetentionPeriod: privacySettings.dataRetentionPeriod,
					autoDeleteInactive: privacySettings.autoDeleteInactive,
					downloadData: privacySettings.downloadData,
					deleteAccount: privacySettings.deleteAccount,
					allowThirdPartyIntegrations: privacySettings.allowThirdPartyIntegrations,
					requireConsentForNewIntegrations: privacySettings.requireConsentForNewIntegrations,
					createdAt: privacySettings.createdAt,
					updatedAt: privacySettings.updatedAt,
				});

			return NextResponse.json({ settings: updatedSettings[0] });
		} else {
			// Create new privacy settings
			const newSettings = await db
				.insert(privacySettings)
				.values({
					userId,
					...updateData,
				})
				.returning({
					id: privacySettings.id,
					userId: privacySettings.userId,
					analyticsTracking: privacySettings.analyticsTracking,
					errorReporting: privacySettings.errorReporting,
					performanceMonitoring: privacySettings.performanceMonitoring,
					usageStatistics: privacySettings.usageStatistics,
					crashReports: privacySettings.crashReports,
					shareWithPartners: privacySettings.shareWithPartners,
					shareForResearch: privacySettings.shareForResearch,
					shareForMarketing: privacySettings.shareForMarketing,
					allowPersonalization: privacySettings.allowPersonalization,
					dataRetentionPeriod: privacySettings.dataRetentionPeriod,
					autoDeleteInactive: privacySettings.autoDeleteInactive,
					downloadData: privacySettings.downloadData,
					deleteAccount: privacySettings.deleteAccount,
					allowThirdPartyIntegrations: privacySettings.allowThirdPartyIntegrations,
					requireConsentForNewIntegrations: privacySettings.requireConsentForNewIntegrations,
					createdAt: privacySettings.createdAt,
					updatedAt: privacySettings.updatedAt,
				});

			return NextResponse.json({ settings: newSettings[0] });
		}
	} catch (error) {
		console.error('Error updating privacy settings:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
