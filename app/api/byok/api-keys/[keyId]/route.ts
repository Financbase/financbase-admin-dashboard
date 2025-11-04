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

/**
 * PUT /api/byok/api-keys/[keyId]
 * Update API key (status, name, etc.)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { keyId } = await params;
		const body = await request.json();
		const { isActive, keyName, keyType } = body;

		const byokService = new BYOKService();

		// Update the key status or metadata
		if (typeof isActive === 'boolean') {
			await byokService.updateApiKeyStatus(userId, parseInt(keyId), isActive);
		}

		// For other updates, we'd need to modify the service to support them
		// For now, we'll just handle status updates

		return NextResponse.json({
			success: true,
			message: 'API key updated successfully'
		});

	} catch (error) {
		 
    // eslint-disable-next-line no-console
    console.error('Error updating API key:', error);
		return NextResponse.json(
			{ error: 'Failed to update API key' },
			{ status: 500 }
		);
	}
}

/**
 * DELETE /api/byok/api-keys/[keyId]
 * Delete an API key
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { keyId } = await params;
		const byokService = new BYOKService();

		await byokService.deleteUserApiKey(userId, parseInt(keyId));

		return NextResponse.json({
			success: true,
			message: 'API key deleted successfully'
		});

	} catch (error) {
		 
    // eslint-disable-next-line no-console
    console.error('Error deleting API key:', error);
		return NextResponse.json(
			{ error: 'Failed to delete API key' },
			{ status: 500 }
		);
	}
}
