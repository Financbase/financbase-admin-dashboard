/**
 * Accept Invitation API Route
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
import { acceptInvitation } from '@/lib/services/organization.service';
import { logger } from '@/lib/logger';

/**
 * POST /api/organizations/invitations/accept
 * Accept invitation by token
 */
export async function POST(request: NextRequest) {
	return withRLS(async (clerkId, clerkUser, req) => {
		try {
			const userId = await getCurrentUserId();
			if (!userId) {
				return NextResponse.json(
					{ error: 'User not found in database' },
					{ status: 404 }
				);
			}

			const body = await request.json();
			const { token } = body;

			if (!token || typeof token !== 'string') {
				return NextResponse.json(
					{ error: 'Invitation token is required' },
					{ status: 400 }
				);
			}

			const organization = await acceptInvitation(token, userId);

			return NextResponse.json({
				success: true,
				data: organization,
				message: 'Invitation accepted successfully',
			});
		} catch (error) {
			logger.error('[Organizations API] Error accepting invitation', { error });
			return NextResponse.json(
				{ error: error instanceof Error ? error.message : 'Failed to accept invitation' },
				{ status: 500 }
			);
		}
	}, { request });
}

