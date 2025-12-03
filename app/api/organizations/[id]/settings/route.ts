/**
 * Organization Settings API Routes
 * GET - Get organization settings
 * PATCH - Update organization settings
 * 
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRLS } from '@/lib/api/with-rls';
import { getCurrentUserId } from '@/lib/api/with-rls';
import { getOrganizationSettings, updateOrganizationSettings } from '@/lib/services/organization.service';
import { logger } from '@/lib/logger';

/**
 * GET /api/organizations/[id]/settings
 * Get organization settings
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	return withRLS<{ success: boolean; data: unknown } | { error: string }>(async (clerkId, clerkUser, req) => {
		try {
			const userId = await getCurrentUserId();
			if (!userId) {
				return NextResponse.json(
					{ error: 'User not found in database' },
					{ status: 404 }
				);
			}

			const settings = await getOrganizationSettings(params.id, userId);

			return NextResponse.json({
				success: true,
				data: settings,
			});
		} catch (error) {
			logger.error('[Organizations API] Error getting settings', { error, organizationId: params.id });
			return NextResponse.json(
				{ error: error instanceof Error ? error.message : 'Failed to fetch settings' },
				{ status: 500 }
			);
		}
	}, { request });
}

/**
 * PATCH /api/organizations/[id]/settings
 * Update organization settings
 */
export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	return withRLS<{ success: boolean; data: unknown } | { error: string }>(async (clerkId, clerkUser, req) => {
		try {
			const userId = await getCurrentUserId();
			if (!userId) {
				return NextResponse.json(
					{ error: 'User not found in database' },
					{ status: 404 }
				);
			}

			const body = await request.json();
			const { settings, branding, integrations, features, notifications, security, compliance } = body;

			const updatedSettings = await updateOrganizationSettings(
				params.id,
				{
					settings,
					branding,
					integrations,
					features,
					notifications,
					security,
					compliance,
				},
				userId
			);

			return NextResponse.json({
				success: true,
				data: updatedSettings,
			});
		} catch (error) {
			logger.error('[Organizations API] Error updating settings', { error, organizationId: params.id });
			return NextResponse.json(
				{ error: error instanceof Error ? error.message : 'Failed to update settings' },
				{ status: 500 }
			);
		}
	}, { request });
}

