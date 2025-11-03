/**
 * Admin Feature Flag by Key API Routes
 * Get, update, or delete a specific feature flag
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FeatureFlagsService } from '@/lib/services/feature-flags-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { isAdmin } from '@/lib/auth/financbase-rbac';
import { z } from 'zod';

const updateFeatureFlagSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	enabled: z.boolean().optional(),
	rolloutPercentage: z.number().min(0).max(100).optional(),
	targetOrganizations: z.array(z.string()).optional(),
	targetUsers: z.array(z.string()).optional(),
	conditions: z.record(z.unknown()).optional(),
	metadata: z.record(z.unknown()).optional(),
});

// GET /api/admin/feature-flags/[key] - Get a specific feature flag
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ key: string }> }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Check admin access
		const adminStatus = await isAdmin();
		if (!adminStatus) {
			return ApiErrorHandler.forbidden('Admin access required');
		}

		const { key } = await params;
		const flag = await FeatureFlagsService.getByKey(key);

		if (!flag) {
			return ApiErrorHandler.notFound(`Feature flag with key "${key}" not found`);
		}

		return NextResponse.json({ flag });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

// PATCH /api/admin/feature-flags/[key] - Update a feature flag
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ key: string }> }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Check admin access
		const adminStatus = await isAdmin();
		if (!adminStatus) {
			return ApiErrorHandler.forbidden('Admin access required');
		}

		const { key } = await params;

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		const validatedData = updateFeatureFlagSchema.parse(body);

		const flag = await FeatureFlagsService.update(key, {
			name: validatedData.name,
			description: validatedData.description,
			enabled: validatedData.enabled,
			rolloutPercentage: validatedData.rolloutPercentage,
			targetOrganizations: validatedData.targetOrganizations,
			targetUsers: validatedData.targetUsers,
			conditions: validatedData.conditions as any,
			metadata: validatedData.metadata,
		});

		return NextResponse.json({ flag });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

// DELETE /api/admin/feature-flags/[key] - Delete a feature flag
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ key: string }> }
) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Check admin access
		const adminStatus = await isAdmin();
		if (!adminStatus) {
			return ApiErrorHandler.forbidden('Admin access required');
		}

		const { key } = await params;

		// Check if flag exists
		const existing = await FeatureFlagsService.getByKey(key);
		if (!existing) {
			return ApiErrorHandler.notFound(`Feature flag with key "${key}" not found`);
		}

		await FeatureFlagsService.delete(key);

		return NextResponse.json({ message: `Feature flag "${key}" deleted successfully` });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

