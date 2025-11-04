/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export interface AIFinancialAnalysis {
	insights: string[];
	recommendations: string[];
	riskAssessment: string;
	forecast: {
		nextMonth: number;
		nextQuarter: number;
		nextYear: number;
	};
}

export interface AITransactionCategorization {
	category: string;
	confidence: number;
	suggestedBudget: string;
}

export class AIFinancialService {
	/**
	 * Analyze financial data and provide insights
	 */
	static async analyzeFinancialData(data: {
		revenue: number[];
		expenses: number[];
		transactions: any[];
		budget: any;
	}): Promise<AIFinancialAnalysis> {
		try {
			const prompt = `
Analyze the following financial data and provide strategic insights:

Revenue Trend: ${JSON.stringify(data.revenue)}
Expense Trend: ${JSON.stringify(data.expenses)}
Recent Transactions: ${JSON.stringify(data.transactions.slice(0, 10))}
Current Budget: ${JSON.stringify(data.budget)}

Please provide:
1. Key financial insights (3-5 points)
2. Specific recommendations (3-5 actionable items)
3. Risk assessment (low/medium/high with reasoning)
4. Financial forecast for next month, quarter, and year

Format your response as JSON with the following structure:
{
	"insights": ["insight1", "insight2", ...],
	"recommendations": ["recommendation1", "recommendation2", ...],
	"riskAssessment": "Assessment with reasoning",
	"forecast": {
		"nextMonth": number,
		"nextQuarter": number,
		"nextYear": number
	}
}
			`;

			const response = await openai.chat.completions.create({
				model: 'gpt-4-turbo-preview',
				messages: [
					{
						role: 'system',
						content: 'You are a senior financial analyst providing strategic insights for business optimization.'
					},
					{
						role: 'user',
						content: prompt
					}
				],
				temperature: 0.7,
				max_tokens: 1000,
			});

			const content = response.choices[0]?.message?.content;
			if (!content) {
				throw new Error('No response from OpenAI');
			}

			const analysis = JSON.parse(content) as AIFinancialAnalysis;
			return analysis;

		} catch (error) {
			console.error('AI Financial Analysis Error:', error);
			// Return fallback analysis
			return {
				insights: [
					'Revenue shows steady growth pattern',
					'Expense management appears consistent',
					'Budget utilization is within acceptable range'
				],
				recommendations: [
					'Continue monitoring cash flow trends',
					'Review expense categories for optimization opportunities',
					'Consider increasing marketing spend if ROI is positive'
				],
				riskAssessment: 'Medium - Standard business operational risks identified',
				forecast: {
					nextMonth: data.revenue[data.revenue.length - 1] || 0,
					nextQuarter: (data.revenue[data.revenue.length - 1] || 0) * 3,
					nextYear: (data.revenue[data.revenue.length - 1] || 0) * 12
				}
			};
		}
	}

	/**
	 * Categorize transactions using AI
	 */
	static async categorizeTransaction(transaction: {
		description: string;
		amount: number;
		type: string;
	}): Promise<AITransactionCategorization> {
		try {
			const prompt = `
Categorize this financial transaction:

Description: "${transaction.description}"
Amount: $${transaction.amount}
Type: ${transaction.type}

Please determine:
1. Most appropriate category (Housing, Transportation, Food, Entertainment, Healthcare, Utilities, Business, Other)
2. Confidence level (0-100%)
3. Suggested budget category for similar transactions

Respond in JSON format:
{
	"category": "category_name",
	"confidence": 85,
	"suggestedBudget": "budget_category"
}
			`;

			const response = await openai.chat.completions.create({
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'system',
						content: 'You are a financial categorization expert.'
					},
					{
						role: 'user',
						content: prompt
					}
				],
				temperature: 0.3,
				max_tokens: 200,
			});

			const content = response.choices[0]?.message?.content;
			if (!content) {
				throw new Error('No response from OpenAI');
			}

			return JSON.parse(content) as AITransactionCategorization;

		} catch (error) {
			console.error('AI Categorization Error:', error);
			// Return fallback categorization
			return {
				category: 'Other',
				confidence: 50,
				suggestedBudget: 'Miscellaneous'
			};
		}
	}

	/**
	 * Generate financial insights for dashboard
	 */
	static async generateDashboardInsights(metrics: {
		totalRevenue: number;
		totalExpenses: number;
		netIncome: number;
		budgetUtilization: number;
		topExpenseCategory: string;
	}): Promise<string[]> {
		try {
			const prompt = `
Generate 3-5 concise, actionable financial insights based on these metrics:

- Total Revenue: $${metrics.totalRevenue.toLocaleString()}
- Total Expenses: $${metrics.totalExpenses.toLocaleString()}
- Net Income: $${metrics.netIncome.toLocaleString()}
- Budget Utilization: ${metrics.budgetUtilization}%
- Top Expense Category: ${metrics.topExpenseCategory}

Focus on:
- Spending patterns and trends
- Budget efficiency opportunities
- Revenue optimization suggestions
- Financial health indicators

Provide insights as a simple array of strings.
			`;

			const response = await openai.chat.completions.create({
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'system',
						content: 'You are a financial advisor providing concise, actionable insights.'
					},
					{
						role: 'user',
						content: prompt
					}
				],
				temperature: 0.7,
				max_tokens: 300,
			});

			const content = response.choices[0]?.message?.content;
			if (!content) {
				throw new Error('No response from OpenAI');
			}

			// Parse the response as JSON array or fallback to text lines
			try {
				return JSON.parse(content);
			} catch {
				return content.split('\n').filter(line => line.trim().length > 0);
			}

		} catch (error) {
			console.error('Dashboard Insights Error:', error);
			// Return fallback insights
			return [
				'Monitor expense trends to optimize budget allocation',
				'Review top expense categories for potential savings',
				'Consider revenue growth strategies to improve net income',
				'Maintain current budget utilization levels for financial stability'
			];
		}
	}
}

export default AIFinancialService;
