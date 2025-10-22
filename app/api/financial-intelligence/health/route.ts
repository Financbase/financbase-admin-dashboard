import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FinancialIntelligenceService } from '@/lib/services/ai/financial-intelligence-service';

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const healthScore = await FinancialIntelligenceService.analyzeFinancialHealth(userId);

		return NextResponse.json({ healthScore });
	} catch (error) {
		console.error('Error analyzing financial health:', error);
		return NextResponse.json(
			{ error: 'Failed to analyze financial health' },
			{ status: 500 }
		);
	}
}
