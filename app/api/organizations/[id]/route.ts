/**
 * Organization Detail API Routes
 * GET - Get organization details
 * PATCH - Update organization
 * DELETE - Delete organization (soft delete)
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
import { getOrganizationById, updateOrganization, deleteOrganization } from '@/lib/services/organization.service';
import { logger } from '@/lib/logger';

/**
 * GET /api/organizations/[id]
 * Get organization details
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

			const organization = await getOrganizationById(params.id, userId);

			if (!organization) {
				return NextResponse.json(
					{ error: 'Organization not found or access denied' },
					{ status: 404 }
				);
			}

			return NextResponse.json({
				success: true,
				data: organization,
			});
		} catch (error) {
			logger.error('[Organizations API] Error getting organization', { error, organizationId: params.id });
			return NextResponse.json(
				{ error: 'Failed to fetch organization' },
				{ status: 500 }
			);
		}
	}, { request });
}

/**
 * PATCH /api/organizations/[id]
 * Update organization
 */
export async function PATCH(
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
			const { name, description, logo, billingEmail, taxId, address, phone } = body;

			const organization = await updateOrganization(
				{
					id: params.id,
					name,
					description,
					logo,
					billingEmail,
					taxId,
					address,
					phone,
				},
				userId
			);

			return NextResponse.json({
				success: true,
				data: organization,
			});
		} catch (error) {
			logger.error('[Organizations API] Error updating organization', { error, organizationId: params.id });
			return NextResponse.json(
				{ error: error instanceof Error ? error.message : 'Failed to update organization' },
				{ status: 500 }
			);
		}
	}, { request });
}

/**
 * DELETE /api/organizations/[id]
 * Delete organization (soft delete)
 */
export async function DELETE(
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

			await deleteOrganization(params.id, userId);

			return NextResponse.json({
				success: true,
				message: 'Organization deleted successfully',
			});
		} catch (error) {
			logger.error('[Organizations API] Error deleting organization', { error, organizationId: params.id });
			return NextResponse.json(
				{ error: error instanceof Error ? error.message : 'Failed to delete organization' },
				{ status: 500 }
			);
		}
	}, { request });
}

