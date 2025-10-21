import { NextRequest, NextResponse } from 'next/server';
import { AIFinancialService } from '@/lib/ai/financial-service';

/**
 * POST /api/ai/categorize
 * Categorize a transaction using AI
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { description, amount, type } = body;

		if (!description || !amount) {
			return NextResponse.json(
				{ error: 'Missing required fields: description, amount' },
				{ status: 400 }
			);
		}

		const categorization = await AIFinancialService.categorizeTransaction({
			description,
			amount,
			type: type || 'expense',
		});

		return NextResponse.json({
			success: true,
			data: categorization,
		});

	} catch (error) {
		console.error('Transaction Categorization API Error:', error);
		return NextResponse.json(
			{ error: 'Failed to categorize transaction' },
			{ status: 500 }
		);
	}
}
