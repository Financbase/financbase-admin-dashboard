import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';
import { checkPermission } from '@/lib/auth/financbase-rbac';
import { FINANCIAL_PERMISSIONS } from '@/types/auth';
import type { FinancbaseUserMetadata } from '@/types/auth';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

const updatePermissionsSchema = z.object({
	permissions: z.array(z.string()).optional(),
	role: z.enum(['admin', 'user', 'viewer', 'manager']).optional(),
});

// PUT /api/admin/users/[id]/permissions - Update user permissions
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id: targetUserId } = await params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Check if user has permission to manage roles
		const hasPermission = await checkPermission(FINANCIAL_PERMISSIONS.ROLES_MANAGE);
		if (!hasPermission) {
			return ApiErrorHandler.forbidden('You do not have permission to manage user roles');
		}

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}
		const validatedData = updatePermissionsSchema.parse(body);

		// Get Clerk client
		const clerk = await clerkClient();
		
		// Get current user metadata
		const clerkUser = await clerk.users.getUser(targetUserId);
		const currentMetadata = (clerkUser.publicMetadata as unknown as FinancbaseUserMetadata) || {};

		// Build updated metadata
		const updatedMetadata: FinancbaseUserMetadata = {
			...currentMetadata,
			role: validatedData.role || currentMetadata.role || 'user',
			permissions: validatedData.permissions || currentMetadata.permissions || [],
			financialAccess: currentMetadata.financialAccess || {},
		};

		// Update user metadata in Clerk
		await clerk.users.updateUserMetadata(targetUserId, {
			publicMetadata: updatedMetadata as unknown as Record<string, unknown>,
		});

		return NextResponse.json({
			success: true,
			message: 'User permissions updated successfully',
			user: {
				id: targetUserId,
				role: updatedMetadata.role,
				permissions: updatedMetadata.permissions,
			},
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
