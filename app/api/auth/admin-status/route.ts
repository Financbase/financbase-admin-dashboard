import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/auth/financbase-rbac';

/**
 * GET /api/auth/admin-status
 * Check if the current user is an admin
 */
export async function GET(_request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const adminStatus = await isAdmin();

		return NextResponse.json({ isAdmin: adminStatus });
	} catch (error) {
		console.error('Error checking admin status:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
