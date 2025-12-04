/**
 * Individual API Key Management API Routes
 * Handles update, delete, and regenerate operations for specific API keys
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { userApiKeys } from '@/lib/db/schemas';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

// PUT /api/settings/security/api-keys/[id]
// Update an existing API key
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id: idParam } = await params;
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}
		const { name, description, status, scopes, expiresAt, rateLimitPerMinute, rateLimitPerHour } = body;

		// Check if user owns this API key
		const existingKey = await db
			.select()
			.from(userApiKeys)
			.where(eq(userApiKeys.id, idParam))
			.limit(1);

		if (!existingKey.length || existingKey[0].userId !== userId) {
			return NextResponse.json({ error: 'API key not found' }, { status: 404 });
		}

		// Update the API key
		const updatedKey = await db
			.update(userApiKeys)
			.set({
				...(name && { name }),
				...(description !== undefined && { description }),
				...(status && { status }),
				...(scopes && { scopes }),
				...(expiresAt && { expiresAt: new Date(expiresAt) }),
				...(rateLimitPerMinute && { rateLimitPerMinute }),
				...(rateLimitPerHour && { rateLimitPerHour }),
				updatedAt: new Date(),
			})
			.where(eq(userApiKeys.id, idParam))
			.returning();

		return NextResponse.json({ key: updatedKey[0] });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

// DELETE /api/settings/security/api-keys/[id]
// Delete an API key
export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id: idParam } = await params;
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Check if user owns this API key
		const existingKey = await db
			.select()
			.from(userApiKeys)
			.where(eq(userApiKeys.id, idParam))
			.limit(1);

		if (!existingKey.length || existingKey[0].userId !== userId) {
			return ApiErrorHandler.notFound('API key not found');
		}

		// Soft delete by setting status to revoked
		await db
			.update(userApiKeys)
			.set({
				status: 'revoked',
				updatedAt: new Date(),
			})
			.where(eq(userApiKeys.id, idParam));

		return NextResponse.json({ message: 'API key revoked successfully' });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
