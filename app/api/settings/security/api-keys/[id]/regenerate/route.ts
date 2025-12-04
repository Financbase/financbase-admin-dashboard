/**
 * API Key Regeneration API Route
 * Generates a new API key while preserving existing configuration
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
import { db } from '@/lib/db';
import { userApiKeys } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import crypto from 'crypto';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

// POST /api/settings/security/api-keys/[id]/regenerate
// Regenerate an API key (creates new key with same settings)
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id } = await params;
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Check if user owns this API key
		const existingKey = await db
			.select()
			.from(userApiKeys)
			.where(eq(userApiKeys.id, id))
			.limit(1);

		if (!existingKey.length || existingKey[0].userId !== userId) {
			return ApiErrorHandler.notFound('API key not found');
		}

		// Generate new API key
		const keyId = nanoid(16); // 16 character key ID
		const keySecret = nanoid(32); // 32 character secret
		const fullKey = `fb_${keyId}_${keySecret}`;

		// Hash the full key for storage
		const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex');

		// Store key prefix and suffix for display purposes
		const keyPrefix = `fb_${keyId.slice(0, 4)}`;
		const keySuffix = keySecret.slice(-4);

		// Update the API key with new values
		const updatedKey = await db
			.update(userApiKeys)
			.set({
				keyHash,
				keyPrefix,
				keySuffix,
				status: 'active',
				updatedAt: new Date(),
				// Reset usage counters on regeneration
				usageCount: 0,
				usageToday: 0,
				usageThisMonth: 0,
				lastUsedAt: null,
				lastUsedIp: null,
				lastUsedUserAgent: null,
			})
			.where(eq(userApiKeys.id, id))
			.returning();

		// Return the full key only once (on regeneration)
		return NextResponse.json({
			key: updatedKey[0],
			apiKey: fullKey, // Only returned on regeneration for security
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
