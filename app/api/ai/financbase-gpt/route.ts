/**
 * Financbase GPT API Route
 * Handles AI chat requests with financial context
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { db } from '@/lib/db';
import { eq, and, gte } from 'drizzle-orm';

// Create OpenAI client
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// Edge runtime for better performance
export const runtime = 'edge';

/**
 * Get financial context for the user
 */
async function getFinancialContext(userId: string) {
	try {
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		// Note: Adjust table names based on your actual schema
		// This is a placeholder - replace with your actual tables
		
		// Example: Fetch invoices (if you have an invoices table)
		// const invoices = await db.query.invoices.findMany({
		// 	where: and(
		// 		eq(invoices.userId, userId),
		// 		gte(invoices.createdAt, thirtyDaysAgo),
		// 	),
		// });

		// Example: Fetch expenses (if you have an expenses table)
		// const expenses = await db.query.expenses.findMany({
		// 	where: and(
		// 		eq(expenses.userId, userId),
		// 		gte(expenses.createdAt, thirtyDaysAgo),
		// 	),
		// });

		// Placeholder data - replace with actual queries
		const context = {
			revenue: 0,
			expenses: 0,
			outstandingInvoices: 0,
			cashFlow: 0,
			period: '30 days',
			// Add more financial metrics as needed
		};

		return context;
	} catch (error) {
		console.error('Error fetching financial context:', error);
		return {
			revenue: 0,
			expenses: 0,
			outstandingInvoices: 0,
			cashFlow: 0,
			period: '30 days',
		};
	}
}

export async function POST(req: NextRequest) {
	try {
		// Authenticate user
		const { userId } = await auth();

		if (!userId) {
			return new Response('Unauthorized', { status: 401 });
		}

		// Parse request body
		const { messages } = await req.json();

		if (!messages || !Array.isArray(messages)) {
			return new Response('Invalid request body', { status: 400 });
		}

		// Get user's financial context
		const financialContext = await getFinancialContext(userId);

		// Build system prompt with financial context
		const systemPrompt = `You are Financbase GPT, an expert AI financial assistant integrated into the Financbase platform.

Your role is to help users understand and manage their finances by:
- Analyzing financial data and trends
- Providing actionable insights and recommendations
- Answering questions about their financial health
- Explaining financial concepts in simple terms
- Suggesting optimization strategies

User's Financial Overview (Last ${financialContext.period}):
- Total Revenue: $${financialContext.revenue.toLocaleString()}
- Total Expenses: $${financialContext.expenses.toLocaleString()}
- Outstanding Invoices: ${financialContext.outstandingInvoices}
- Net Cash Flow: $${financialContext.cashFlow.toLocaleString()}

Guidelines:
1. Be conversational, friendly, and professional
2. Provide specific, actionable advice based on the user's actual data
3. Use clear formatting (bullet points, numbered lists) for complex information
4. Always base recommendations on the user's current financial situation
5. If you need more information to give accurate advice, ask clarifying questions
6. Highlight both opportunities and risks in the user's finances
7. Keep responses concise but thorough (2-4 paragraphs for most queries)
8. Use the dollar sign ($) for currency and format numbers with commas

Remember: You have access to the user's real financial data shown above. Reference specific numbers and trends when relevant.`;

		// Prepare messages for OpenAI
		const openAIMessages = [
			{
				role: 'system' as const,
				content: systemPrompt,
			},
			...messages.map((msg: { role: string; content: string }) => ({
				role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
				content: msg.content,
			})),
		];

		// Create streaming response
		const response = await openai.chat.completions.create({
			model: 'gpt-4-turbo-preview',
			stream: true,
			messages: openAIMessages,
			temperature: 0.7,
			max_tokens: 1000,
		});

		// Convert to streaming text response
		const stream = OpenAIStream(response);
		return new StreamingTextResponse(stream);
	} catch (error) {
		console.error('Error in Financbase GPT route:', error);
		
		if (error instanceof Error) {
			return new Response(error.message, { status: 500 });
		}
		
		return new Response('Internal server error', { status: 500 });
	}
}

