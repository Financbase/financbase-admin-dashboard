import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';
import { checkPermission } from '@/lib/auth/financbase-rbac';
import { FINANCIAL_PERMISSIONS } from '@/types/auth';
import type { FinancbaseUserMetadata } from '@/types/auth';

const updatePermissionsSchema = z.object({
	permissions: z.array(z.string()).optional(),
	role: z.enum(['admin', 'user', 'viewer', 'manager']).optional(),
});

// PUT /api/admin/users/[id]/permissions - Update user permissions
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check if user has permission to manage roles
		const hasPermission = await checkPermission(FINANCIAL_PERMISSIONS.ROLES_MANAGE);
		if (!hasPermission) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const { id: targetUserId } = await params;
		const body = await request.json();
		const validatedData = updatePermissionsSchema.parse(body);

		// Get Clerk client
		const clerk = await clerkClient();
		
		// Get current user metadata
		const clerkUser = await clerk.users.getUser(targetUserId);
		const currentMetadata = (clerkUser.publicMetadata as FinancbaseUserMetadata) || {};

		// Build updated metadata
		const updatedMetadata: FinancbaseUserMetadata = {
			...currentMetadata,
			role: validatedData.role || currentMetadata.role || 'user',
			permissions: validatedData.permissions || currentMetadata.permissions || [],
			financialAccess: currentMetadata.financialAccess || {},
		};

		// Update user metadata in Clerk
		await clerk.users.updateUserMetadata(targetUserId, {
			publicMetadata: updatedMetadata,
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
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Invalid request data', details: error.errors },
				{ status: 400 }
			);
		}

		console.error('Error updating user permissions:', error);
		return NextResponse.json(
			{ error: 'Failed to update user permissions' },
			{ status: 500 }
		);
	}
}
