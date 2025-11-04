/**
 * Admin Feature Flags API Routes
 * CRUD operations for managing feature flags
 */

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
import { FeatureFlagsService } from '@/lib/services/feature-flags-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { isAdmin } from '@/lib/auth/financbase-rbac';
import { z } from 'zod';

const createFeatureFlagSchema = z.object({
	key: z.string().min(1, 'Key is required').regex(/^[a-z0-9_]+$/, 'Key must be lowercase alphanumeric with underscores'),
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	enabled: z.boolean().optional(),
	rolloutPercentage: z.number().min(0).max(100).optional(),
	targetOrganizations: z.array(z.string()).optional(),
	targetUsers: z.array(z.string()).optional(),
	conditions: z.record(z.unknown()).optional(),
	metadata: z.record(z.unknown()).optional(),
});

// GET /api/admin/feature-flags - List all feature flags
export async function GET(request: NextRequest) {
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

		const flags = await FeatureFlagsService.getAll();

		return NextResponse.json({ flags });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

// POST /api/admin/feature-flags - Create a new feature flag
export async function POST(request: NextRequest) {
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

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		const validatedData = createFeatureFlagSchema.parse(body);

		// Check if flag with key already exists
		const existing = await FeatureFlagsService.getByKey(validatedData.key);
		if (existing) {
			return ApiErrorHandler.conflict(`Feature flag with key "${validatedData.key}" already exists`);
		}

		const flag = await FeatureFlagsService.create({
			key: validatedData.key,
			name: validatedData.name,
			description: validatedData.description,
			enabled: validatedData.enabled ?? false,
			rolloutPercentage: validatedData.rolloutPercentage ?? 0,
			targetOrganizations: validatedData.targetOrganizations,
			targetUsers: validatedData.targetUsers,
			conditions: validatedData.conditions as any,
			metadata: validatedData.metadata,
		});

		return NextResponse.json({ flag }, { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

