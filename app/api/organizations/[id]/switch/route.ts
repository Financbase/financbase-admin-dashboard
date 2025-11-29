/**
 * Organization Switch API Route
 * POST - Switch active organization (session-based)
 * Updates session cookie and user preference
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
import { switchOrganization } from '@/lib/services/organization.service';
import { logger } from '@/lib/logger';

/**
 * POST /api/organizations/[id]/switch
 * Switch active organization
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	return withRLS(async (clerkId, clerkUser, req) => {
		try {
			const userId = await getCurrentUserId();
			if (!userId) {
				return NextResponse.json(
					{ error: 'User not found in database' },
					{ status: 404 }
				);
			}

			const organization = await switchOrganization(userId, params.id);

			// Create response with cookie set
			const response = NextResponse.json({
				success: true,
				data: organization,
				message: 'Organization switched successfully',
			});

			// Set cookie for active organization (30 days expiry)
			response.cookies.set('active_organization_id', params.id, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30, // 30 days
				path: '/',
			});

			return response;
		} catch (error) {
			logger.error('[Organizations API] Error switching organization', { error, organizationId: params.id });
			return NextResponse.json(
				{ error: error instanceof Error ? error.message : 'Failed to switch organization' },
				{ status: 500 }
			);
		}
	}, { request });
}

