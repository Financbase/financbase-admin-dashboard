/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AdboardService } from '@/lib/services/adboard-service';
import { getCurrentUserId } from '@/lib/api/with-rls';
import { logger } from '@/lib/logger';

export async function GET() {
	try {
		const { userId: clerkId } = await auth();
		if (!clerkId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Convert Clerk ID to database user ID (UUID)
		const dbUserId = await getCurrentUserId();
		if (!dbUserId) {
			return NextResponse.json(
				{ error: 'User not found in database' },
				{ status: 400 }
			);
		}

		const stats = await AdboardService.getCampaignStats(dbUserId);

		return NextResponse.json({ stats });
	} catch (error) {
		logger.error('Error fetching campaign stats:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch campaign stats' },
			{ status: 500 }
		);
	}
}
