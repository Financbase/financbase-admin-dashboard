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
import { FinancialIntelligenceService } from '@/lib/services/ai/financial-intelligence-service';
import { logger } from '@/lib/logger';

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const insights = await FinancialIntelligenceService.generateFinancialInsights(userId);

		return NextResponse.json({ insights });
	} catch (error) {
		logger.error('Error generating financial insights:', error);
		return NextResponse.json(
			{ error: 'Failed to generate financial insights' },
			{ status: 500 }
		);
	}
}
