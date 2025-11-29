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

		const healthScore = await FinancialIntelligenceService.analyzeFinancialHealth(userId);

		return NextResponse.json({ healthScore });
	} catch (error) {
		logger.error('Error analyzing financial health:', error);
		return NextResponse.json(
			{ error: 'Failed to analyze financial health' },
			{ status: 500 }
		);
	}
}
