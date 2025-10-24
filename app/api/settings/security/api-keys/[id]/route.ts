/**
 * Individual API Key Management API Routes
 * Handles update, delete, and regenerate operations for specific API keys
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { userApiKeys } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

// PUT /api/settings/security/api-keys/[id]
// Update an existing API key
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { userId } = auth();

		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;
		const body = await request.json();
		const { name, description, status, scopes, expiresAt, rateLimitPerMinute, rateLimitPerHour } = body;

		// Check if user owns this API key
		const existingKey = await db
			.select()
			.from(userApiKeys)
			.where(eq(userApiKeys.id, params.id))
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

		return NextResponse.json({ key: updatedKey[0] });
	} catch (error) {
		console.error('Error updating API key:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

// DELETE /api/settings/security/api-keys/[id]
// Delete an API key
export async function DELETE(
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

		// Soft delete by setting status to revoked
		await db
			.update(userApiKeys)
			.set({
				status: 'revoked',
				updatedAt: new Date(),
			})
			.where(eq(userApiKeys.id, params.id));

		return NextResponse.json({ message: 'API key revoked successfully' });
	} catch (error) {
		console.error('Error deleting API key:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
