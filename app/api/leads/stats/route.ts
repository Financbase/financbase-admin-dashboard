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
import { LeadManagementService } from '@/lib/services/lead-management-service';
import { logger } from '@/lib/logger';

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const stats = await LeadManagementService.getLeadStats(userId);

		return NextResponse.json({ stats });
	} catch (error) {
		logger.error('Error fetching lead stats:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch lead stats' },
			{ status: 500 }
		);
	}
}
