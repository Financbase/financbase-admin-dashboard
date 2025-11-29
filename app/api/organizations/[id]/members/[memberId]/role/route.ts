/**
 * Organization Member Role API Routes
 * PATCH - Update member role
 * DELETE - Remove member
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
import { updateMemberRole, removeMember } from '@/lib/services/organization.service';
import { logger } from '@/lib/logger';

/**
 * PATCH /api/organizations/[id]/members/[memberId]/role
 * Update member role
 */
export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string; memberId: string } }
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
			const { role } = body;

			if (!role || !['owner', 'admin', 'member', 'viewer'].includes(role)) {
				return NextResponse.json(
					{ error: 'Valid role is required (owner, admin, member, viewer)' },
					{ status: 400 }
				);
			}

			const member = await updateMemberRole(
				params.id,
				params.memberId,
				role,
				userId
			);

			return NextResponse.json({
				success: true,
				data: member,
			});
		} catch (error) {
			logger.error('[Organizations API] Error updating member role', { error, organizationId: params.id, memberId: params.memberId });
			return NextResponse.json(
				{ error: error instanceof Error ? error.message : 'Failed to update member role' },
				{ status: 500 }
			);
		}
	}, { request });
}

/**
 * DELETE /api/organizations/[id]/members/[memberId]/role
 * Remove member from organization
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string; memberId: string } }
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

			await removeMember(params.id, params.memberId, userId);

			return NextResponse.json({
				success: true,
				message: 'Member removed successfully',
			});
		} catch (error) {
			logger.error('[Organizations API] Error removing member', { error, organizationId: params.id, memberId: params.memberId });
			return NextResponse.json(
				{ error: error instanceof Error ? error.message : 'Failed to remove member' },
				{ status: 500 }
			);
		}
	}, { request });
}

