/**
 * API Keys Management API Routes
 * Handles CRUD operations for user API keys
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
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import crypto from 'crypto';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

// GET /api/settings/security/api-keys
// List all API keys for the authenticated user
export async function GET() {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();

		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const keys = await db
			.select({
				id: userApiKeys.id,
				name: userApiKeys.name,
				description: userApiKeys.description,
				type: userApiKeys.type,
				scopes: userApiKeys.scopes,
				status: userApiKeys.status,
				lastUsedAt: userApiKeys.lastUsedAt,
				expiresAt: userApiKeys.expiresAt,
				usageCount: userApiKeys.usageCount,
				usageToday: userApiKeys.usageToday,
				usageThisMonth: userApiKeys.usageThisMonth,
				createdAt: userApiKeys.createdAt,
				updatedAt: userApiKeys.updatedAt,
				keyPrefix: userApiKeys.keyPrefix,
				keySuffix: userApiKeys.keySuffix,
				rateLimitPerMinute: userApiKeys.rateLimitPerMinute,
				rateLimitPerHour: userApiKeys.rateLimitPerHour,
			})
			.from(userApiKeys)
			.where(eq(userApiKeys.userId, userId))
			.orderBy(desc(userApiKeys.createdAt));

		return NextResponse.json({ keys });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

// POST /api/settings/security/api-keys
// Create a new API key for the authenticated user
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
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

		const { name, description, type, scopes, expiresAt, rateLimitPerMinute, rateLimitPerHour } = body;

		// Validate required fields
		if (!name) {
			return ApiErrorHandler.badRequest('Name is required');
		}

		// Generate API key
		const keyId = nanoid(16); // 16 character key ID
		const keySecret = nanoid(32); // 32 character secret
		const fullKey = `fb_${keyId}_${keySecret}`;

		// Hash the full key for storage
		const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex');

		// Store key prefix and suffix for display purposes
		const keyPrefix = `fb_${keyId.slice(0, 4)}`;
		const keySuffix = keySecret.slice(-4);

		// Set default expiration (1 year from now) if not provided
		const defaultExpiration = new Date();
		defaultExpiration.setFullYear(defaultExpiration.getFullYear() + 1);

		const newKey = await db.insert(userApiKeys).values({
			userId,
			name,
			description: description || null,
			keyHash,
			keyPrefix,
			keySuffix,
			type: type || 'production',
			scopes: scopes || ['read', 'write'],
			status: 'active',
			expiresAt: expiresAt ? new Date(expiresAt) : defaultExpiration,
			rateLimitPerMinute: rateLimitPerMinute || 1000,
			rateLimitPerHour: rateLimitPerHour || 10000,
			createdBy: userId,
		}).returning();

		// Return the full key only once (on creation)
		return NextResponse.json({
			key: newKey[0],
			apiKey: fullKey, // Only returned on creation for security
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
