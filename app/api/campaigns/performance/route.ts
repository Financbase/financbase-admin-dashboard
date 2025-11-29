/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AdboardService } from '@/lib/services/adboard-service';
import { getCurrentUserId } from '@/lib/api/with-rls';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
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

		const { searchParams } = new URL(request.url);
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');

		if (!startDate || !endDate) {
			return NextResponse.json(
				{ error: 'Start date and end date are required' },
				{ status: 400 }
			);
		}

		const metrics = await AdboardService.getPerformanceMetrics(
			dbUserId,
			new Date(startDate),
			new Date(endDate)
		);

		return NextResponse.json({ metrics });
	} catch (error) {
		logger.error('Error fetching performance metrics:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch performance metrics' },
			{ status: 500 }
		);
	}
}
