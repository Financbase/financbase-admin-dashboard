/**
 * API Key Regeneration API Route
 * Generates a new API key while preserving existing configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { userApiKeys } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

// POST /api/settings/security/api-keys/[id]/regenerate
// Regenerate an API key (creates new key with same settings)
export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check if user owns this API key
		const existingKey = await db
			.select()
			.from(userApiKeys)
			.where(eq(userApiKeys.id, params.id))
			.limit(1);

		if (!existingKey.length || existingKey[0].userId !== userId) {
			return NextResponse.json({ error: 'API key not found' }, { status: 404 });
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
			.where(eq(userApiKeys.id, params.id))
			.returning({
				id: userApiKeys.id,
				name: userApiKeys.name,
				description: userApiKeys.description,
				type: userApiKeys.type,
				scopes: userApiKeys.scopes,
				status: userApiKeys.status,
				expiresAt: userApiKeys.expiresAt,
				createdAt: userApiKeys.createdAt,
				updatedAt: userApiKeys.updatedAt,
				keyPrefix: userApiKeys.keyPrefix,
				keySuffix: userApiKeys.keySuffix,
				rateLimitPerMinute: userApiKeys.rateLimitPerMinute,
				rateLimitPerHour: userApiKeys.rateLimitPerHour,
			});

		// Return the full key only once (on regeneration)
		return NextResponse.json({
			key: updatedKey[0],
			apiKey: fullKey, // Only returned on regeneration for security
		});
	} catch (error) {
		console.error('Error regenerating API key:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
