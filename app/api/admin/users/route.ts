import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schemas/users.schema';
import { eq, desc } from 'drizzle-orm';
import { checkPermission } from '@/lib/auth/financbase-rbac';
import { FINANCIAL_PERMISSIONS } from '@/types/auth';
import type { FinancbaseUserMetadata } from '@/types/auth';

// GET /api/admin/users - Get all users with their permissions
export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check if user has permission to manage users
		const hasPermission = await checkPermission(FINANCIAL_PERMISSIONS.USERS_MANAGE);
		if (!hasPermission) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
					const metadata = (clerkUser.publicMetadata as FinancbaseUserMetadata) || {};
					
					return {
						id: dbUser.clerkId, // Use Clerk ID for client compatibility
						email: dbUser.email,
						name: `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() || clerkUser.firstName || clerkUser.emailAddresses[0]?.emailAddress || dbUser.email,
						role: metadata.role || dbUser.role || 'user',
						permissions: metadata.permissions || [],
						financialAccess: metadata.financialAccess || {},
						lastActive: clerkUser.lastSignInAt?.toISOString(),
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
		console.error('Error fetching users:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch users' },
			{ status: 500 }
		);
	}
}
