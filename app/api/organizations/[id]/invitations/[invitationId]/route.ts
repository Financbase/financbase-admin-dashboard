/**
 * Organization Invitation Detail API Routes
 * PATCH - Accept/decline invitation
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
import { acceptInvitation, declineInvitation } from '@/lib/services/organization.service';
import { logger } from '@/lib/logger';

/**
 * PATCH /api/organizations/[id]/invitations/[invitationId]
 * Accept or decline invitation
 */
export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string; invitationId: string } }
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

			const body = await request.json();
			const { action } = body; // 'accept' or 'decline'

			if (!action || !['accept', 'decline'].includes(action)) {
				return NextResponse.json(
					{ error: 'Action must be "accept" or "decline"' },
					{ status: 400 }
				);
			}

			// Get invitation token from invitationId
			const { db } = await import('@/lib/db');
			const { organizationInvitations } = await import('@/lib/db/schemas');
			const { eq } = await import('drizzle-orm');

			const invitation = await db
				.select()
				.from(organizationInvitations)
				.where(eq(organizationInvitations.id, params.invitationId))
				.limit(1);

			if (invitation.length === 0) {
				return NextResponse.json(
					{ error: 'Invitation not found' },
					{ status: 404 }
				);
			}

			if (action === 'accept') {
				const organization = await acceptInvitation(invitation[0].token, userId);
				return NextResponse.json({
					success: true,
					data: organization,
					message: 'Invitation accepted successfully',
				});
			} else {
				await declineInvitation(invitation[0].token);
				return NextResponse.json({
					success: true,
					message: 'Invitation declined',
				});
			}
		} catch (error) {
			logger.error('[Organizations API] Error processing invitation', { error, invitationId: params.invitationId });
			return NextResponse.json(
				{ error: error instanceof Error ? error.message : 'Failed to process invitation' },
				{ status: 500 }
			);
		}
	}, { request });
}

