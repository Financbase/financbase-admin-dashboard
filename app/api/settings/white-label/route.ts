/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { whiteLabelService } from '@/lib/services/white-label-service';
import { WorkspaceService } from '@/lib/services/platform/workspace.service';
import type { WhiteLabelBranding } from '@/types/white-label';

/**
 * GET /api/settings/white-label
 * Fetch branding configuration for current workspace/organization
 */
export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const searchParams = request.nextUrl.searchParams;
		const workspaceId = searchParams.get('workspaceId') || undefined;
		const organizationId = searchParams.get('organizationId') || undefined;

		// If workspaceId provided, verify user has access
		if (workspaceId) {
			const workspaceService = new WorkspaceService();
			try {
				await workspaceService.getWorkspaceById(workspaceId);
			} catch {
				return NextResponse.json(
					{ error: 'Workspace not found or access denied' },
					{ status: 403 }
				);
			}
		}

		const branding = await whiteLabelService.getBranding(workspaceId, organizationId);

		return NextResponse.json(branding);
	} catch (error) {
		console.error('Error fetching white label branding:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch branding configuration' },
			{ status: 500 }
		);
	}
}

/**
 * PUT /api/settings/white-label
 * Update branding configuration for a workspace
 */
export async function PUT(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { workspaceId, branding } = body as {
			workspaceId: string;
			branding: Partial<WhiteLabelBranding>;
		};

		if (!workspaceId) {
			return NextResponse.json(
				{ error: 'Workspace ID is required' },
				{ status: 400 }
			);
		}

		// Verify user has access to workspace and is owner/admin
		const workspaceService = new WorkspaceService();
		let workspace;
		try {
			workspace = await workspaceService.getWorkspaceById(workspaceId);
		} catch {
			return NextResponse.json(
				{ error: 'Workspace not found or access denied' },
				{ status: 403 }
			);
		}

		// Check if workspace is enterprise plan
		if (workspace.plan !== 'enterprise') {
			return NextResponse.json(
				{ error: 'White label is only available for enterprise plans' },
				{ status: 403 }
			);
		}

		// Check if user is owner (only owners can update branding)
		if (workspace.ownerId !== userId) {
			return NextResponse.json(
				{ error: 'Only workspace owners can update branding' },
				{ status: 403 }
			);
		}

		// Validate branding
		try {
			whiteLabelService.validateBranding(branding);
		} catch (validationError) {
			return NextResponse.json(
				{ error: (validationError as Error).message },
				{ status: 400 }
			);
		}

		// Update branding
		const updatedBranding = await whiteLabelService.updateBranding(workspaceId, branding);

		return NextResponse.json(updatedBranding);
	} catch (error) {
		console.error('Error updating white label branding:', error);
		return NextResponse.json(
			{ error: 'Failed to update branding configuration' },
			{ status: 500 }
		);
	}
}

