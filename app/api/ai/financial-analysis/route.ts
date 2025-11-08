/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AIFinancialService } from '@/lib/ai/financial-service';
import { withAIDecisionLogging } from '@/lib/middleware/ai-decision-logger';

/**
 * @swagger
 * /api/ai/financial-analysis:
 *   post:
 *     summary: AI-powered financial analysis
 *     description: Analyzes financial data using AI to provide insights, trends, and recommendations
 *     tags:
 *       - AI
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - revenue
 *               - expenses
 *               - budget
 *             properties:
 *               revenue:
 *                 type: number
 *                 example: 125000.50
 *                 description: Total revenue amount
 *               expenses:
 *                 type: number
 *                 example: 45000.25
 *                 description: Total expenses amount
 *               budget:
 *                 type: number
 *                 example: 150000.00
 *                 description: Budgeted amount
 *               transactions:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: Optional array of transaction details for deeper analysis
 *     responses:
 *       200:
 *         description: Financial analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     insights:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Revenue increased 15% month-over-month", "Expenses are 8% under budget"]
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: string
 *                     trends:
 *                       type: object
 *       400:
 *         description: Bad request - Missing required fields
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
/**
 * POST /api/ai/financial-analysis
 * Analyze financial data and provide insights
 */
export async function POST(request: NextRequest) {
	try {
		const { userId, orgId } = await auth();
		if (!userId || !orgId) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { revenue, expenses, transactions, budget } = body;

		if (!revenue || !expenses || !budget) {
			return NextResponse.json(
				{ error: 'Missing required fields: revenue, expenses, budget' },
				{ status: 400 }
			);
		}

		// Use AI decision logging wrapper
		const analysis = await withAIDecisionLogging(
			orgId,
			userId,
			'financial-analysis-model',
			body,
			async () => {
				return await AIFinancialService.analyzeFinancialData({
					revenue,
					expenses,
					transactions: transactions || [],
					budget,
				});
			},
			{
				useCase: 'financial_analysis',
				decisionType: 'financial_analysis',
			}
		);

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
