/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { AIService } from "@/lib/ai-service";
import {
	Bot,
	CheckCircle,
	MessageCircle,
	Tag,
	TrendingDown,
	XCircle,
} from "lucide-react";

export interface ExpenseData {
	description: string;
	merchant?: string;
	amount: number;
	date?: Date;
}

export interface CategorizationResult {
	category: string;
	confidence: number;
	reasoning: string;
}

export class AIExpenseCategorizationService {
	private aiService: AIService;

	constructor() {
		this.aiService = new AIService();
	}

	/**
	 * Categorize an expense using AI
	 */
	async categorizeExpense(
		expenseData: ExpenseData,
	): Promise<CategorizationResult> {
		try {
			const prompt = `Categorize this expense:
Description: ${expenseData.description}
Merchant: ${expenseData.merchant || "Unknown"}
Amount: $${expenseData.amount}
Date: ${expenseData.date?.toISOString() || "Unknown"}

Please respond with a JSON object containing:
- category: one of the following: office_supplies, meals, travel, marketing, software, equipment, utilities, rent, insurance, professional_services, other
- confidence: a number between 0 and 1
- reasoning: brief explanation of the categorization

Example response:
{
  "category": "office_supplies",
  "confidence": 0.95,
  "reasoning": "Office supplies purchase from office supply store"
}`;

			const response = await this.aiService.processRequest({
				prompt,
				type: "tag",
				maxTokens: 200,
			});

			if (!response.success || !response.result) {
				throw new Error("AI service failed");
			}

			const result = JSON.parse(response.result);
			return {
				category: result.category || "other",
				confidence: result.confidence || 0.1,
				reasoning: result.reasoning || "Unable to categorize with confidence",
			};
		} catch (error) {
			// Fallback categorization
			return {
				category: "other",
				confidence: 0.1,
				reasoning: `Fallback categorization due to error: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	}
}
