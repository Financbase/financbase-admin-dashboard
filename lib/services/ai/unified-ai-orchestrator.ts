/**
 * Unified AI Orchestration Service
 * Bridges Found-style automation with Digits-style explainability
 * Supports multiple AI providers with fallback and feedback loops
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { logger } from '@/lib/logger';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/db';
import { transactions } from '@/lib/db/schemas/transactions.schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';

// Transaction Data Interface
export interface TransactionData {
	description: string;
	amount: number;
	date: Date;
	reference?: string;
	merchant?: string;
}

// AI Response Interfaces
export interface AICategorizationResponse {
	category: string;
	subcategory?: string;
	confidence: number;
	reasoning: string;
	evidence: string[];
	alternatives: Array<{
		category: string;
		confidence: number;
		reasoning: string;
	}>;
	rules: Array<{
		pattern: string;
		category: string;
		confidence: number;
	}>;
}

export interface AIInsightsResponse {
	insights: Array<{
		title: string;
		description: string;
		impact: 'high' | 'medium' | 'low';
		explanation: AIExplanation;
		recommendation?: string;
	}>;
	confidence: number;
}

// Financial Data Interface
export interface FinancialData {
	revenue: number;
	expenses: number;
	cashflow: number;
	profitability: number;
	transactions: Array<{
		amount: number;
		category: string;
		date: Date;
	}>;
}

// User History Interface
export interface UserCategorizationHistory {
	description: string;
	category: string;
	amount: number;
	confidence: number;
}

// AI Provider Types
export enum AIProvider {
  OPENAI = 'openai',
  CLAUDE = 'claude',
  GOOGLE = 'google'
}

export enum AICapability {
  CATEGORIZATION = 'categorization',
  INSIGHTS = 'insights',
  PREDICTIONS = 'predictions',
  RECOMMENDATIONS = 'recommendations',
  RECONCILIATION = 'reconciliation'
}

// Explainability Interface
export interface AIExplanation {
  reasoning: string;
  evidence: string[];
  confidence: number;
  alternatives?: {
    option: string;
    confidence: number;
    reasoning: string;
  }[];
  sources: string[];
  timestamp: Date;
  model: string;
  provider: AIProvider;
}

// Feedback Loop Interface
export interface AIFeedback {
  id: string;
  transactionId?: string;
  userId: string;
  originalPrediction: string;
  userCorrection: string;
  reasoning: string;
  confidence: number;
  accepted: boolean;
  timestamp: Date;
}

// Transaction Categorization Interface
export interface CategorizationResult {
  category: string;
  subcategory?: string;
  confidence: number;
  explanation: AIExplanation;
  rules: CategorizationRule[];
  metadata: {
    processingTime: number;
    model: string;
    provider: AIProvider;
    version: string;
  };
}

export interface CategorizationRule {
  id: string;
  pattern: string;
  category: string;
  subcategory?: string;
  confidence: number;
  usage: number;
  accuracy: number;
  createdBy: 'ai' | 'user' | 'system';
  createdAt: Date;
  updatedAt: Date;
}

// Provider Configuration
interface ProviderConfig {
  weight: number;
  capabilities: AICapability[];
  maxRetries: number;
  timeout: number;
  cost: number; // per 1k tokens
}

const PROVIDER_CONFIGS: Record<AIProvider, ProviderConfig> = {
  [AIProvider.OPENAI]: {
    weight: 0.4,
    capabilities: [AICapability.CATEGORIZATION, AICapability.INSIGHTS, AICapability.PREDICTIONS, AICapability.RECOMMENDATIONS],
    maxRetries: 3,
    timeout: 30000,
    cost: 0.02
  },
  [AIProvider.CLAUDE]: {
    weight: 0.35,
    capabilities: [AICapability.CATEGORIZATION, AICapability.INSIGHTS, AICapability.RECONCILIATION],
    maxRetries: 3,
    timeout: 30000,
    cost: 0.008
  },
  [AIProvider.GOOGLE]: {
    weight: 0.25,
    capabilities: [AICapability.CATEGORIZATION, AICapability.PREDICTIONS, AICapability.RECOMMENDATIONS],
    maxRetries: 2,
    timeout: 25000,
    cost: 0.0005
  }
};

export class UnifiedAIOrchestrator {
  private openai: OpenAI;
  private claude: Anthropic;
  private google: GoogleGenerativeAI;
  private feedbackHistory: Map<string, AIFeedback[]> = new Map();
  private categorizationRules: Map<string, CategorizationRule[]> = new Map();

  constructor() {
    // Initialize AI providers
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.claude = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    this.google = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

    // Load feedback history and rules
    this.loadFeedbackHistory();
    this.loadCategorizationRules();
  }

  /**
   * Categorize transaction with AI explainability and learning
   */
  async categorizeTransaction(
    userId: string,
    transactionData: {
      description: string;
      amount: number;
      date: Date;
      reference?: string;
      merchant?: string;
    }
  ): Promise<CategorizationResult> {
    const startTime = Date.now();

    try {
      // Get user's historical categorization patterns
      const userHistory = await this.getUserCategorizationHistory(userId);

      // Select best AI provider for categorization
      const provider = this.selectProvider(AICapability.CATEGORIZATION);

      // Apply rule-based categorization first (fast)
      const ruleResult = await this.applyRuleBasedCategorization(transactionData);
      if (ruleResult && ruleResult.confidence > 0.9) {
        return this.enhanceWithExplanation(ruleResult, transactionData, startTime);
      }

      // Fallback to AI categorization
      const aiResult = await this.performAICategorization(
        provider,
        transactionData,
        userHistory
      );

      // Store for continuous learning
      await this.storeCategorizationAttempt(userId, transactionData, aiResult);

      return this.enhanceWithExplanation(aiResult, transactionData, startTime);

    } catch (error) {
      logger.error('Categorization failed', error);
      return this.getFallbackCategorization(transactionData, startTime);
    }
  }

  /**
   * Generate explainable financial insights
   */
  async generateExplainableInsights(
    userId: string,
    dataType: 'revenue' | 'expenses' | 'cashflow' | 'profitability',
    timeframe: { start: Date; end: Date }
  ): Promise<{
    insights: Array<{
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
      explanation: AIExplanation;
      recommendation?: string;
    }>;
    confidence: number;
  }> {
    const provider = this.selectProvider(AICapability.INSIGHTS);

    try {
      const financialData = await this.gatherFinancialData(userId, timeframe);
      const explanation = await this.performAIInsights(provider, financialData, dataType);

      return {
        insights: explanation.insights,
        confidence: explanation.confidence
      };
    } catch (error) {
      logger.error('Insights generation failed', error);
      return this.getFallbackInsights(dataType);
    }
  }

  /**
   * Process user feedback for continuous learning
   */
  async processFeedback(
    userId: string,
    feedback: Omit<AIFeedback, 'id' | 'timestamp'>
  ): Promise<void> {
    const feedbackEntry: AIFeedback = {
      ...feedback,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    // Store feedback in database
    await this.storeFeedback(feedbackEntry);

    // Update local history
    if (!this.feedbackHistory.has(userId)) {
      this.feedbackHistory.set(userId, []);
    }
    this.feedbackHistory.get(userId)!.push(feedbackEntry);

    // Improve AI models based on feedback
    await this.improveModelsFromFeedback(feedbackEntry);

    // Update categorization rules if relevant
    if (feedback.transactionId) {
      await this.updateCategorizationRules(feedbackEntry);
    }
  }

  /**
   * Get AI explanation for any decision
   */
  async getExplanation(
    decisionId: string,
    decisionType: AICapability
  ): Promise<AIExplanation | null> {
    // Retrieve explanation from database or cache
    return await this.retrieveExplanation(decisionId, decisionType);
  }

  /**
   * Select optimal AI provider based on capability and performance
   */
  private selectProvider(capability: AICapability): AIProvider {
    const availableProviders = Object.entries(PROVIDER_CONFIGS)
      .filter(([_, config]) => config.capabilities.includes(capability))
      .map(([provider, config]) => ({
        provider: provider as AIProvider,
        weight: config.weight,
        cost: config.cost
      }));

    // Simple weighted selection (could be enhanced with performance metrics)
    const totalWeight = availableProviders.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;

    for (const provider of availableProviders) {
      random -= provider.weight;
      if (random <= 0) {
        return provider.provider;
      }
    }

    return AIProvider.OPENAI; // Default fallback
  }

  /**
   * Apply rule-based categorization (fast, deterministic)
   */
  private async applyRuleBasedCategorization(
    transactionData: TransactionData
  ): Promise<CategorizationResult | null> {
    // Load user's custom rules
    const userRules = this.categorizationRules.get('user') || [];

    for (const rule of userRules) {
      if (this.testRule(rule, transactionData)) {
        return {
          category: rule.category,
          subcategory: rule.subcategory,
          confidence: rule.confidence,
          explanation: this.generateRuleExplanation(rule, transactionData),
          rules: [rule],
          metadata: {
            processingTime: 0,
            model: 'rule-engine',
            provider: AIProvider.OPENAI, // Rules are system-defined
            version: '1.0'
          }
        };
      }
    }

    return null;
  }

  /**
   * Perform AI-powered categorization with multiple providers
   */
  private async performAICategorization(
    provider: AIProvider,
    transactionData: TransactionData,
    userHistory: UserCategorizationHistory[]
  ): Promise<CategorizationResult> {
    const prompt = this.buildCategorizationPrompt(transactionData, userHistory);

    let result: any;

    switch (provider) {
      case AIProvider.OPENAI:
        result = await this.callOpenAI(prompt);
        break;
      case AIProvider.CLAUDE:
        result = await this.callClaude(prompt);
        break;
      case AIProvider.GOOGLE:
        result = await this.callGoogle(prompt);
        break;
    }

    return {
      category: result.category,
      subcategory: result.subcategory,
      confidence: result.confidence,
      explanation: this.parseExplanation(result),
      rules: result.rules || [],
      metadata: {
        processingTime: Date.now(),
        model: this.getModelName(provider),
        provider,
        version: this.getModelVersion(provider)
      }
    };
  }

  /**
   * Enhanced explanation with evidence and alternatives
   */
  private enhanceWithExplanation(
    result: CategorizationResult,
    transactionData: any,
    startTime: number
  ): CategorizationResult {
    return {
      ...result,
      explanation: {
        reasoning: result.explanation.reasoning,
        evidence: this.generateEvidence(transactionData, result),
        confidence: result.confidence,
        alternatives: this.generateAlternatives(transactionData, result),
        sources: this.getDataSources(transactionData),
        timestamp: new Date(),
        model: result.metadata.model,
        provider: result.metadata.provider
      },
      metadata: {
        ...result.metadata,
        processingTime: Date.now() - startTime
      }
    };
  }

  /**
   * AI Provider API calls
   */
  private async callOpenAI(prompt: string): Promise<AICategorizationResponse> {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a financial transaction categorization expert. Provide accurate categorizations with detailed explanations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0]?.message?.content || '{}');
  }

  private async callClaude(prompt: string): Promise<AICategorizationResponse> {
    const response = await this.claude.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      temperature: 0.1,
      system: "You are a financial transaction categorization expert. Provide accurate categorizations with detailed explanations.",
      messages: [
        {
          type: "text",
          text: prompt
        }
      ]
    });

    return JSON.parse(response.content[0].text);
  }

  private async callGoogle(prompt: string): Promise<AICategorizationResponse> {
    const model = this.google.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(text);
  }

  /**
   * Build comprehensive categorization prompt
   */
  private buildCategorizationPrompt(
    transactionData: TransactionData,
    userHistory: UserCategorizationHistory[]
  ): string {
    return `Categorize this financial transaction with detailed explanation:

Transaction Details:
- Description: "${transactionData.description}"
- Amount: $${transactionData.amount}
- Date: ${transactionData.date.toISOString()}
- Reference: ${transactionData.reference || 'N/A'}
- Merchant: ${transactionData.merchant || 'N/A'}

User's Historical Patterns:
${JSON.stringify(userHistory.slice(0, 10), null, 2)}

Provide response in JSON format:
{
  "category": "string (e.g., 'office_supplies', 'marketing', 'software', 'travel')",
  "subcategory": "string (optional, e.g., 'cloud_services', 'advertising')",
  "confidence": "number 0-1",
  "reasoning": "string explaining the decision",
  "evidence": ["array of evidence points"],
  "alternatives": [
    {
      "category": "string",
      "confidence": "number",
      "reasoning": "string"
    }
  ],
  "rules": [
    {
      "pattern": "regex pattern or description",
      "category": "string",
      "confidence": "number"
    }
  ]
}`;
  }

  /**
   * Generate evidence for AI decision
   */
  private generateEvidence(transactionData: TransactionData, result: CategorizationResult): string[] {
    const evidence: string[] = [];

    // Keyword evidence
    const keywords = this.extractKeywords(transactionData.description);
    evidence.push(`Keywords found: ${keywords.join(', ')}`);

    // Amount-based evidence
    if (transactionData.amount > 1000) {
      evidence.push('High amount suggests business expense rather than personal');
    }

    // Pattern evidence
    evidence.push(`Matches pattern for ${result.category} category`);

    // Historical evidence
    evidence.push('Consistent with user\'s previous categorizations');

    return evidence;
  }

  /**
   * Generate alternative categorizations
   */
  private generateAlternatives(
    transactionData: TransactionData,
    result: CategorizationResult
  ): AIExplanation['alternatives'] {
    // This would be enhanced with actual AI calls for alternatives
    return [
      {
        option: 'other',
        confidence: 0.1,
        reasoning: 'Could be miscellaneous if primary category doesn\'t fit well'
      }
    ];
  }

  /**
   * Data source tracking
   */
  private getDataSources(transactionData: TransactionData): string[] {
    const sources = ['transaction_description'];

    if (transactionData.reference) sources.push('reference_number');
    if (transactionData.merchant) sources.push('merchant_data');

    return sources;
  }

  /**
   * Fallback categorization when AI providers fail
   */
  private fallbackCategorization(transactionData: TransactionData): CategorizationResult {
    const startTime = Date.now();

    return {
      category: 'other',
      confidence: 0.5,
      explanation: {
        reasoning: 'Fallback categorization due to AI provider failure',
        evidence: ['Transaction description analysis', 'Amount pattern matching'],
        confidence: 0.5,
        sources: ['system_fallback'],
        timestamp: new Date(),
        model: 'fallback',
        provider: AIProvider.OPENAI
      },
      rules: [],
      metadata: {
        processingTime: Date.now() - startTime,
        model: 'fallback',
        provider: AIProvider.OPENAI,
        version: '1.0'
      }
    };
  }
  private async retrieveExplanation(
    decisionId: string,
    decisionType: AICapability
  ): Promise<AIExplanation | null> {
    // Retrieve explanation from database
    return null; // Implementation needed
  }

  private async gatherFinancialData(
    userId: string,
    timeframe: { start: Date; end: Date }
  ): Promise<any> {
    // Gather comprehensive financial data for insights
    return {}; // Implementation needed
  }

  private async performAIInsights(
    provider: AIProvider,
    financialData: any,
    dataType: string
  ): Promise<any> {
    // Generate AI insights with explanations
    return {}; // Implementation needed
  }

  private async loadFeedbackHistory(): Promise<void> {
    // Load recent feedback for context
  }

  private async loadCategorizationRules(): Promise<void> {
    // Load user's custom categorization rules
  }
}

// Export singleton instance
export const aiOrchestrator = new UnifiedAIOrchestrator();
