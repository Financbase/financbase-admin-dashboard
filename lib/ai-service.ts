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

export interface AIAnalysisResult {
  category: string;
  confidence: number;
  reasoning: string;
  suggestions?: string[];
}

export interface FinancialInsight {
  type: 'trend' | 'anomaly' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export class AIService {
  /**
   * Categorize a transaction using AI
   */
  static async categorizeTransaction(
    description: string,
    amount: number,
    merchant?: string
  ): Promise<AIAnalysisResult> {
    try {
      const prompt = `
        Categorize this financial transaction:
        Description: ${description}
        Amount: $${amount}
        ${merchant ? `Merchant: ${merchant}` : ''}
        
        Return a JSON response with:
        - category: The most appropriate category (e.g., "Food & Dining", "Transportation", "Entertainment", "Business Expenses", "Utilities")
        - confidence: A number between 0 and 1
        - reasoning: Brief explanation of why this category was chosen
        - suggestions: Optional array of alternative categories
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a financial categorization expert. Analyze transactions and provide accurate categorization with confidence scores.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        category: result.category || 'Uncategorized',
        confidence: result.confidence || 0.5,
        reasoning: result.reasoning || 'No reasoning provided',
        suggestions: result.suggestions || []
      };
    } catch (error) {
      console.error('AI categorization error:', error);
      return {
        category: 'Uncategorized',
        confidence: 0,
        reasoning: 'AI service unavailable',
        suggestions: []
      };
    }
  }

  /**
   * Generate financial insights from transaction data
   */
  static async generateFinancialInsights(
    transactions: Array<{
      description: string;
      amount: number;
      category: string;
      date: string;
    }>
  ): Promise<FinancialInsight[]> {
    try {
      const prompt = `
        Analyze these financial transactions and provide insights:
        ${JSON.stringify(transactions, null, 2)}
        
        Return a JSON array of insights with:
        - type: "trend", "anomaly", "prediction", or "recommendation"
        - title: Short descriptive title
        - description: Detailed explanation
        - confidence: Number between 0 and 1
        - impact: "low", "medium", or "high"
        - actionable: Boolean indicating if user can act on this insight
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a financial advisor AI. Analyze transaction patterns and provide actionable insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1000,
      });

      const insights = JSON.parse(response.choices[0].message.content || '[]');
      return Array.isArray(insights) ? insights : [];
    } catch (error) {
      console.error('AI insights generation error:', error);
      return [];
    }
  }

  /**
   * Generate predictive analytics
   */
  static async generatePredictions(
    historicalData: Array<{
      date: string;
      amount: number;
      category: string;
    }>
  ): Promise<{
    nextMonthPrediction: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
    recommendations: string[];
  }> {
    try {
      const prompt = `
        Based on this historical financial data, predict next month's spending:
        ${JSON.stringify(historicalData, null, 2)}
        
        Return JSON with:
        - nextMonthPrediction: Predicted total spending for next month
        - trend: "increasing", "decreasing", or "stable"
        - confidence: Number between 0 and 1
        - recommendations: Array of spending optimization suggestions
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a financial forecasting AI. Analyze spending patterns and predict future trends.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        nextMonthPrediction: result.nextMonthPrediction || 0,
        trend: result.trend || 'stable',
        confidence: result.confidence || 0.5,
        recommendations: result.recommendations || []
      };
    } catch (error) {
      console.error('AI prediction error:', error);
      return {
        nextMonthPrediction: 0,
        trend: 'stable',
        confidence: 0,
        recommendations: []
      };
    }
  }

  /**
   * Chat with Financbase GPT
   */
  static async chatWithGPT(
    message: string,
    context?: {
      userData?: any;
      recentTransactions?: any[];
      financialGoals?: any[];
    }
  ): Promise<{
    response: string;
    suggestions: string[];
    relatedActions: string[];
  }> {
    try {
      const systemPrompt = `
        You are Financbase GPT, an AI financial assistant. Help users with:
        - Financial planning and budgeting
        - Expense tracking and categorization
        - Investment advice and analysis
        - Tax planning and optimization
        - Business financial management
        
        Be helpful, accurate, and professional. Provide actionable advice.
      `;

      const userPrompt = context 
        ? `${message}\n\nContext: ${JSON.stringify(context, null, 2)}`
        : message;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const aiResponse = response.choices[0].message.content || 'I apologize, but I cannot process your request at the moment.';

      return {
        response: aiResponse,
        suggestions: [
          'View your spending trends',
          'Set up a budget',
          'Review your investments',
          'Plan for taxes'
        ],
        relatedActions: [
          'Create expense report',
          'Update budget goals',
          'Review categories',
          'Export data'
        ]
      };
    } catch (error) {
      console.error('GPT chat error:', error);
      return {
        response: 'I apologize, but I\'m experiencing technical difficulties. Please try again later.',
        suggestions: [],
        relatedActions: []
      };
    }
  }

  /**
   * Generate AI response from a prompt (generic method)
   */
  async generateResponse(prompt: string, options?: { maxTokens?: number; temperature?: number }): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000,
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('AI generateResponse error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Process a request with AI (generic method)
   */
  async processRequest(request: { prompt: string; type?: string; maxTokens?: number }): Promise<{ success: boolean; result?: string; error?: string }> {
    try {
      const response = await this.generateResponse(request.prompt, { maxTokens: request.maxTokens });
      return {
        success: true,
        result: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default AIService;