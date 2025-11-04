import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schemas/users.schema';
import { eq, desc } from 'drizzle-orm';
import { checkPermission } from '@/lib/auth/financbase-rbac';
import { FINANCIAL_PERMISSIONS } from '@/types/auth';
import type { FinancbaseUserMetadata } from '@/types/auth';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

// GET /api/admin/users - Get all users with their permissions
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Check if user has permission to manage users
		const hasPermission = await checkPermission(FINANCIAL_PERMISSIONS.USERS_MANAGE);
		if (!hasPermission) {
			return ApiErrorHandler.forbidden('You do not have permission to manage users');
		}

		// Get users from database
		const dbUsers = await db
			.select()
			.from(users)
			.where(eq(users.isActive, true))
			.orderBy(desc(users.createdAt));

		// Fetch user metadata from Clerk
		const clerk = await clerkClient();
		const usersWithMetadata = await Promise.all(
			dbUsers.map(async (dbUser) => {
				try {
					const clerkUser = await clerk.users.getUser(dbUser.clerkId);
					const metadata = (clerkUser.publicMetadata as unknown as FinancbaseUserMetadata) || {};
					
					return {
						id: dbUser.clerkId, // Use Clerk ID for client compatibility
						email: dbUser.email,
						name: `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() || clerkUser.firstName || clerkUser.emailAddresses[0]?.emailAddress || dbUser.email,
						role: metadata.role || dbUser.role || 'user',
						permissions: metadata.permissions || [],
						financialAccess: metadata.financialAccess || {},
						lastActive: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt).toISOString() : undefined,
					};
				} catch (error) {
					console.error(`Error fetching Clerk user ${dbUser.clerkId}:`, error);
					// Return DB data if Clerk fetch fails
					return {
						id: dbUser.clerkId,
						email: dbUser.email,
						name: `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() || dbUser.email,
						role: dbUser.role || 'user',
						permissions: [],
						financialAccess: {},
						lastActive: undefined,
					};
				}
			})
		);

		return NextResponse.json(usersWithMetadata);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
