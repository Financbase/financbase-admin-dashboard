/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { BYOKService } from '@/lib/services/byok-service';
import { logger } from '@/lib/logger';

/**
 * GET /api/byok/api-keys
 * Get all user's API keys
 */
export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const byokService = new BYOKService();
		const apiKeys = await byokService.getUserApiKeys(userId);

		// Remove sensitive information before sending to client
		const sanitizedKeys = apiKeys.map(key => ({
			id: key.id,
			provider: key.provider,
			providerName: key.providerName,
			keyName: key.keyName,
			keyType: key.keyType,
			isActive: key.isActive,
			isValid: key.isValid,
			lastValidated: key.lastValidated,
			lastUsed: key.lastUsed,
			createdAt: key.createdAt,
			updatedAt: key.updatedAt,
			monthlyLimit: key.monthlyLimit,
			currentUsage: key.currentUsage,
			allowedModels: key.allowedModels,
		}));

		return NextResponse.json({ apiKeys: sanitizedKeys });

	} catch (error) {
		logger.error('Error fetching API keys:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch API keys' },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/byok/api-keys
 * Store a new API key
 */
export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { provider, apiKey, keyName, keyType = 'primary' } = body;

		if (!provider || !apiKey) {
			return NextResponse.json(
				{ error: 'Provider and API key are required' },
				{ status: 400 }
			);
		}

		const byokService = new BYOKService();

		// Validate the API key first
		const validation = await byokService.validateApiKey(provider, apiKey);
		if (!validation.isValid) {
			return NextResponse.json(
				{
					error: 'Invalid API key',
					details: validation.error
				},
				{ status: 400 }
			);
		}

		// Store the API key
		const keyId = await byokService.storeUserApiKey(userId, provider, apiKey, keyName, keyType);

		return NextResponse.json({
			success: true,
			message: 'API key stored successfully',
			keyId,
			validation
		});

	} catch (error) {
		logger.error('Error storing API key:', error);
		return NextResponse.json(
			{ error: 'Failed to store API key' },
			{ status: 500 }
		);
	}
}
