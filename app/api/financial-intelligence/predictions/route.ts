import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FinancialIntelligenceService } from '@/lib/services/ai/financial-intelligence-service';

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const predictions = await FinancialIntelligenceService.generateFinancialPredictions(userId);

		return NextResponse.json({ predictions });
	} catch (error) {
		console.error('Error generating financial predictions:', error);
		return NextResponse.json(
			{ error: 'Failed to generate financial predictions' },
			{ status: 500 }
		);
	}
}
