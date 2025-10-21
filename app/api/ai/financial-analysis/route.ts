import { NextRequest, NextResponse } from 'next/server';
import { AIFinancialService } from '@/lib/ai/financial-service';

/**
 * POST /api/ai/financial-analysis
 * Analyze financial data and provide insights
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { revenue, expenses, transactions, budget } = body;

		if (!revenue || !expenses || !budget) {
			return NextResponse.json(
				{ error: 'Missing required fields: revenue, expenses, budget' },
				{ status: 400 }
			);
		}

		const analysis = await AIFinancialService.analyzeFinancialData({
			revenue,
			expenses,
			transactions: transactions || [],
			budget,
		});

		return NextResponse.json({
			success: true,
			data: analysis,
		});

	} catch (error) {
		console.error('Financial Analysis API Error:', error);
		return NextResponse.json(
			{ error: 'Failed to analyze financial data' },
			{ status: 500 }
		);
	}
}
