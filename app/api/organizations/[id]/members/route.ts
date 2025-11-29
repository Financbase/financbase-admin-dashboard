/**
 * Organization Members API Routes
 * GET - List organization members
 * POST - Add member (via invitation - handled by invitations endpoint)
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
import { getOrganizationMembers } from '@/lib/services/organization.service';
import { logger } from '@/lib/logger';

/**
 * GET /api/organizations/[id]/members
 * List organization members
 */
export async function GET(
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

			const members = await getOrganizationMembers(params.id, userId);

			return NextResponse.json({
				success: true,
				data: members,
			});
		} catch (error) {
			logger.error('[Organizations API] Error getting members', { error, organizationId: params.id });
			return NextResponse.json(
				{ error: error instanceof Error ? error.message : 'Failed to fetch members' },
				{ status: 500 }
			);
		}
	}, { request });
}

