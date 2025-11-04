/**
 * Public Feature Flag Check API
 * Check if a feature flag is enabled for the current user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FeatureFlagsService } from '@/lib/services/feature-flags-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

// GET /api/feature-flags/check?key=... - Check if a feature flag is enabled
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId, orgId } = await auth();
		const { searchParams } = new URL(request.url);
		const key = searchParams.get('key');

		if (!key) {
			return ApiErrorHandler.badRequest('Feature flag key is required');
		}

		// Extract organization from Clerk auth
		const organizationId = orgId || undefined;

		// Check flag status
		const isEnabled = await FeatureFlagsService.isEnabled(key, {
			userId: userId || undefined,
			organizationId,
		});

		return NextResponse.json({
			key,
			enabled: isEnabled,
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

