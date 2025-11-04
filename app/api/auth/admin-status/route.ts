import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/auth/financbase-rbac';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

/**
 * GET /api/auth/admin-status
 * Check if the current user is an admin
 */
export async function GET(_request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const adminStatus = await isAdmin();

		return NextResponse.json({ isAdmin: adminStatus });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
