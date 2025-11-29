/**
 * Decline Invitation API Route
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
import { declineInvitation } from '@/lib/services/organization.service';
import { logger } from '@/lib/logger';

/**
 * POST /api/organizations/invitations/decline
 * Decline invitation by token
 */
export async function POST(request: NextRequest) {
	return withRLS(async (clerkId, clerkUser, req) => {
		try {
			const body = await request.json();
			const { token } = body;

			if (!token || typeof token !== 'string') {
				return NextResponse.json(
					{ error: 'Invitation token is required' },
					{ status: 400 }
				);
			}

			await declineInvitation(token);

			return NextResponse.json({
				success: true,
				message: 'Invitation declined',
			});
		} catch (error) {
			logger.error('[Organizations API] Error declining invitation', { error });
			return NextResponse.json(
				{ error: error instanceof Error ? error.message : 'Failed to decline invitation' },
				{ status: 500 }
			);
		}
	}, { request });
}

