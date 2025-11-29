/**
 * Organization Invitations API Routes
 * GET - List pending invitations
 * POST - Send invitation
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
import { createInvitation, getOrganizationInvitations } from '@/lib/services/organization.service';
import { sendEmail } from '@/lib/services/email-service';
import { logger } from '@/lib/logger';

/**
 * GET /api/organizations/[id]/invitations
 * List pending invitations
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

			const invitations = await getOrganizationInvitations(params.id, userId);

			return NextResponse.json({
				success: true,
				data: invitations,
			});
		} catch (error) {
			logger.error('[Organizations API] Error getting invitations', { error, organizationId: params.id });
			return NextResponse.json(
				{ error: error instanceof Error ? error.message : 'Failed to fetch invitations' },
				{ status: 500 }
			);
		}
	}, { request });
}

/**
 * POST /api/organizations/[id]/invitations
 * Send invitation
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

			const body = await request.json();
			const { email, role = 'member', message } = body;

			if (!email || typeof email !== 'string' || !email.includes('@')) {
				return NextResponse.json(
					{ error: 'Valid email address is required' },
					{ status: 400 }
				);
			}

			if (!['owner', 'admin', 'member', 'viewer'].includes(role)) {
				return NextResponse.json(
					{ error: 'Valid role is required (owner, admin, member, viewer)' },
					{ status: 400 }
				);
			}

			const invitation = await createInvitation(
				params.id,
				email,
				role,
				userId,
				message
			);

			// Send invitation email
			const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invitations/${invitation.token}`;
			const org = await import('@/lib/services/organization.service').then(m => 
				m.getOrganizationById(params.id, userId)
			);

			await sendEmail({
				to: email,
				subject: `You're invited to join ${org?.name || 'an organization'}`,
				html: `
					<h2>You're Invited!</h2>
					<p>You've been invited to join <strong>${org?.name || 'an organization'}</strong> on Financbase.</p>
					${message ? `<p>${message}</p>` : ''}
					<p>Click the link below to accept your invitation:</p>
					<p><a href="${invitationUrl}">${invitationUrl}</a></p>
					<p>This invitation will expire in 7 days.</p>
				`,
				text: `You've been invited to join ${org?.name || 'an organization'} on Financbase. ${message ? `\n\n${message}` : ''}\n\nAccept your invitation: ${invitationUrl}\n\nThis invitation will expire in 7 days.`,
			});

			return NextResponse.json({
				success: true,
				data: invitation,
			}, { status: 201 });
		} catch (error) {
			logger.error('[Organizations API] Error creating invitation', { error, organizationId: params.id });
			return NextResponse.json(
				{ error: error instanceof Error ? error.message : 'Failed to create invitation' },
				{ status: 500 }
			);
		}
	}, { request });
}

