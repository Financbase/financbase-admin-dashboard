/**
 * Organizations API Routes
 * GET - List user's organizations
 * POST - Create new organization
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
import { getUserOrganizations, createOrganization } from '@/lib/services/organization.service';
import { logger } from '@/lib/logger';

/**
 * GET /api/organizations
 * List all organizations the current user belongs to
 */
export async function GET(request: NextRequest) {
	return withRLS<{ success: boolean; data: unknown[] } | { error: string }>(async (clerkId, clerkUser, req) => {
		try {
			const userId = await getCurrentUserId();
			if (!userId) {
				return NextResponse.json(
					{ error: 'User not found in database' },
					{ status: 404 }
				);
			}

			const organizations = await getUserOrganizations(userId);

			return NextResponse.json({
				success: true,
				data: organizations,
			});
		} catch (error) {
			logger.error('[Organizations API] Error listing organizations', { error });
			return NextResponse.json(
				{ error: 'Failed to fetch organizations' },
				{ status: 500 }
			);
		}
	}, { request });
}

/**
 * POST /api/organizations
 * Create a new organization
 */
export async function POST(request: NextRequest) {
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
			const { name, description, slug, logo, billingEmail, taxId, address, phone } = body;

			if (!name || typeof name !== 'string' || name.trim().length === 0) {
				return NextResponse.json(
					{ error: 'Organization name is required' },
					{ status: 400 }
				);
			}

			const organization = await createOrganization(
				{
					name: name.trim(),
					description,
					slug,
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
			}, { status: 201 });
		} catch (error) {
			logger.error('[Organizations API] Error creating organization', { error });
			return NextResponse.json(
				{ error: error instanceof Error ? error.message : 'Failed to create organization' },
				{ status: 500 }
			);
		}
	}, { request });
}

