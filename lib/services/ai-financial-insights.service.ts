/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { AIService } from "@/lib/ai-service";
import {} from "lucide-react";

export interface FinancialData {
	revenue: number;
	expenses: number;
	profit: number;
	cashFlow: number;
	trends: {
		revenueGrowth: number;
		expenseGrowth: number;
		profitMargin: number;
	};
}

export interface FinancialInsights {
	insights: string[];
	recommendations: string[];
	riskFactors: string[];
	opportunities: string[];
}

export class AIFinancialInsightsService {
	private aiService: AIService;

	constructor() {
		this.aiService = new AIService();
	}

	/**
	 * Generate financial insights and recommendations
	 */
	async generateInsights(
		userId: string,
		financialData: FinancialData,
	): Promise<FinancialInsights> {
		try {
			const prompt = `Analyze this financial data and provide insights:
Revenue: $${financialData.revenue}
Expenses: $${financialData.expenses}
Profit: $${financialData.profit}
Cash Flow: $${financialData.cashFlow}
Revenue Growth: ${(financialData.trends.revenueGrowth * 100).toFixed(1)}%
Expense Growth: ${(financialData.trends.expenseGrowth * 100).toFixed(1)}%
Profit Margin: ${(financialData.trends.profitMargin * 100).toFixed(1)}%

Please respond with a JSON object containing:
- insights: array of key financial insights
- recommendations: array of actionable recommendations
- riskFactors: array of potential risks to watch
- opportunities: array of growth opportunities

Example response:
{
  "insights": [
    "Strong revenue growth of 15% indicates healthy business expansion"
  ],
  "recommendations": [
    "Consider increasing marketing budget to capitalize on growth momentum"
  ],
  "riskFactors": [
    "Monitor cash flow to ensure adequate working capital"
  ],
  "opportunities": [
    "Expand into new markets with current profit margins"
  ]
}`;

			const response = await this.aiService.processRequest({
				prompt,
				type: "summarize",
				maxTokens: 800,
			});

			if (!response.success || !response.result) {
				throw new Error("AI service failed");
			}

			return JSON.parse(response.result);
		} catch (error) {
			// Fallback insights
			return {
				insights: [
					"Financial analysis completed with basic metrics",
					`Revenue: $${financialData.revenue.toLocaleString()}`,
					`Expenses: $${financialData.expenses.toLocaleString()}`,
					`Profit: $${financialData.profit.toLocaleString()}`,
				],
				recommendations: [
					"Review financial data regularly",
					"Consider professional financial consultation",
				],
				riskFactors: [
					"Monitor cash flow regularly",
					"Watch for expense growth trends",
				],
				opportunities: [
					"Explore growth opportunities",
					"Consider cost optimization",
				],
			};
		}
	}
}
