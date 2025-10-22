import OpenAI from 'openai';
import type {
	AgentResponse,
	FinancbaseGPTConfig,
	HealthResponse,
	QueryRequest,
	FinancialContext,
	ConversationSession,
	GPTAnalysisResult,
} from "./types/financbase-gpt-types";
import { db } from '@/lib/db';
import { NotificationService } from '@/lib/services/notification-service';

export class FinancbaseGPTService {
	private openai: OpenAI;
	private config: FinancbaseGPTConfig;
	private conversationSessions: Map<string, ConversationSession> = new Map();

	constructor(config?: Partial<FinancbaseGPTConfig>) {
		this.config = {
			serviceUrl: process.env.FINANCBASE_GPT_SERVICE_URL || "http://localhost:8001",
			maxRetries: 3,
			timeout: 30000,
			enableLogging: process.env.NODE_ENV === "development",
			model: "gpt-4-turbo-preview",
			temperature: 0.7,
			maxTokens: 2000,
			...config,
		};

		this.openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});
	}

	/**
	 * Process a financial query using FinancbaseGPT with full context
	 */
	async query(request: QueryRequest): Promise<AgentResponse> {
		const startTime = Date.now();

		try {
			// Get user's financial context
			const context = request.context || await this.getFinancialContext(request.query);

			// Create or update conversation session
			const session = this.getOrCreateSession(request.query, context);

			// Generate AI response with financial context
			const response = await this.generateAIResponse(request, context, session);

			// Update session with new message
			this.updateSession(session, request, response);

			// Log if enabled
			if (this.config.enableLogging) {
				console.log(`FinancbaseGPT query processed in ${Date.now() - startTime}ms`);
			}

			// Send notification for important insights
			if (response.analysis?.insights?.some(i => i.includes('urgent') || i.includes('critical'))) {
				await this.sendInsightNotification(context.userId, response);
			}

			return response;
		} catch (error) {
			throw this.handleError(error, "Failed to process query");
		}
	}

	/**
	 * Get comprehensive financial context for a user
	 */
	private async getFinancialContext(userId: string): Promise<FinancialContext> {
		try {
			// This would fetch real financial data from the database
			// For now, returning mock data structure
			return {
				userId,
				totalRevenue: 45000,
				totalExpenses: 32000,
				cashFlow: 13000,
				outstandingInvoices: 8,
				overdueInvoices: 2,
				monthlyGrowth: 12.5,
				topExpenses: [
					{ category: 'Software', amount: 8500, percentage: 26.6 },
					{ category: 'Marketing', amount: 6200, percentage: 19.4 },
					{ category: 'Office', amount: 4800, percentage: 15.0 },
				],
				recentTransactions: [
					{ id: '1', amount: 2500, category: 'Invoice Payment', date: '2024-11-15', description: 'Client payment received' },
					{ id: '2', amount: -1200, category: 'Software', date: '2024-11-14', description: 'Monthly subscription' },
				],
				budgetStatus: {
					totalBudget: 40000,
					spent: 32000,
					remaining: 8000,
					overBudgetCategories: ['Marketing'],
				},
				performance: {
					profitMargin: 28.9,
					burnRate: 32000,
					runway: 15.6, // months
				},
			};
		} catch (error) {
			console.error('Error getting financial context:', error);
			throw new Error('Failed to retrieve financial context');
		}
	}

	/**
	 * Generate AI response with financial context
	 */
	private async generateAIResponse(
		request: QueryRequest,
		context: FinancialContext,
		session: ConversationSession
	): Promise<AgentResponse> {
		try {
			// Build comprehensive prompt with financial context
			const systemPrompt = this.buildSystemPrompt(context, request.analysisType);
			const conversationHistory = this.formatConversationHistory(session);

			const completion = await this.openai.chat.completions.create({
				model: this.config.model || "gpt-4-turbo-preview",
				messages: [
					{ role: 'system', content: systemPrompt },
					...conversationHistory,
					{ role: 'user', content: request.query },
				],
				temperature: this.config.temperature,
				max_tokens: this.config.maxTokens,
				functions: this.getAvailableFunctions(),
				function_call: 'auto',
			});

			const choice = completion.choices[0];
			const content = choice.message?.content || '';
			const functionCall = choice.message?.function_call;

			// Parse response and add financial analysis
			const analysis = await this.parseAndEnhanceResponse(content, context, request);

			return {
				response: content,
				confidence: this.calculateConfidence(choice.finish_reason),
				analysis,
				data: await this.generateChartsAndMetrics(context, request.analysisType),
				metadata: {
					processingTime: Date.now() - Date.now(),
					model: this.config.model || "gpt-4-turbo-preview",
					tokens: {
						input: completion.usage?.prompt_tokens || 0,
						output: completion.usage?.completion_tokens || 0,
					},
				},
			};
		} catch (error) {
			console.error('Error generating AI response:', error);
			throw new Error('Failed to generate AI response');
		}
	}

	/**
	 * Build comprehensive system prompt with financial context
	 */
	private buildSystemPrompt(context: FinancialContext, analysisType?: string): string {
		return `You are Financbase GPT, an advanced AI financial assistant specializing in small business financial management.

CURRENT FINANCIAL CONTEXT:
- Total Revenue: $${context.totalRevenue.toLocaleString()}
- Total Expenses: $${context.totalExpenses.toLocaleString()}
- Cash Flow: $${context.cashFlow.toLocaleString()}
- Outstanding Invoices: ${context.outstandingInvoices}
- Overdue Invoices: ${context.overdueInvoices}
- Monthly Growth: ${context.monthlyGrowth}%
- Top Expenses: ${context.topExpenses.map(e => `${e.category} ($${e.amount.toLocaleString()}, ${e.percentage}%)`).join(', ')}
- Budget Status: $${context.budgetStatus.spent.toLocaleString()} of $${context.budgetStatus.totalBudget.toLocaleString()} spent
- Performance: ${context.performance.profitMargin}% profit margin, ${context.performance.runway} months runway

${analysisType ? `FOCUS AREA: ${analysisType.toUpperCase()}` : ''}

Your expertise includes:
- Financial analysis and insights
- Cash flow management and forecasting
- Invoice and expense optimization
- Budget planning and monitoring
- Business growth strategies
- Risk assessment and mitigation
- Tax planning and compliance
- Investment recommendations

Always provide:
1. Actionable insights based on their data
2. Specific recommendations with priorities
3. Risk assessments when relevant
4. Follow-up questions to gather more context

Format responses professionally and conversationally. Use the financial data to provide personalized advice.`;
	}

	/**
	 * Format conversation history for AI context
	 */
	private formatConversationHistory(session: ConversationSession) {
		return session.messages.slice(-10).map(msg => ({
			role: msg.role,
			content: msg.content,
		}));
	}

	/**
	 * Parse and enhance AI response with financial analysis
	 */
	private async parseAndEnhanceResponse(
		content: string,
		context: FinancialContext,
		request: QueryRequest
	): Promise<GPTAnalysisResult> {
		try {
			// Enhanced analysis based on context and query
			const insights = this.extractInsights(content, context);
			const recommendations = this.generateRecommendations(content, context);
			const actions = this.suggestActions(request.query, context);
			const questions = this.generateFollowUpQuestions(request.query, context);

			return {
				insights,
				recommendations,
				actions,
				questions,
			};
		} catch (error) {
			console.error('Error parsing AI response:', error);
			return {
				insights: [],
				recommendations: [],
				actions: [],
				questions: [],
			};
		}
	}

	/**
	 * Extract insights from AI response
	 */
	private extractInsights(content: string, context: FinancialContext) {
		const insights = [];

		// Analyze based on context
		if (context.cashFlow < 0) {
			insights.push({
				type: 'risk' as const,
				title: 'Negative Cash Flow Detected',
				description: 'Your current cash flow is negative. Consider reducing expenses or accelerating invoice collections.',
				confidence: 0.9,
				impact: 'high' as const,
			});
		}

		if (context.overdueInvoices > 0) {
			insights.push({
				type: 'opportunity' as const,
				title: 'Overdue Invoices',
				description: `${context.overdueInvoices} invoices are overdue. Following up could improve cash flow by $${context.overdueInvoices * 1500}.`,
				confidence: 0.85,
				impact: 'medium' as const,
			});
		}

		if (context.monthlyGrowth > 10) {
			insights.push({
				type: 'trend' as const,
				title: 'Strong Growth Trend',
				description: `Your business is growing at ${context.monthlyGrowth}% monthly. Consider scaling operations.`,
				confidence: 0.8,
				impact: 'high' as const,
			});
		}

		return insights;
	}

	/**
	 * Generate actionable recommendations
	 */
	private generateRecommendations(content: string, context: FinancialContext) {
		const recommendations = [];

		// Budget recommendations
		if (context.budgetStatus.overBudgetCategories.length > 0) {
			recommendations.push({
				category: 'cost_saving' as const,
				title: 'Budget Optimization',
				description: `Reduce spending in ${context.budgetStatus.overBudgetCategories.join(', ')} categories by 15-20%.`,
				priority: 'high' as const,
				effort: 'medium' as const,
				impact: 'high' as const,
			});
		}

		// Cash flow recommendations
		if (context.performance.runway < 6) {
			recommendations.push({
				category: 'risk_mitigation' as const,
				title: 'Cash Flow Improvement',
				description: 'Focus on collecting outstanding invoices and reducing payment terms.',
				priority: 'high' as const,
				effort: 'medium' as const,
				impact: 'high' as const,
			});
		}

		// Growth recommendations
		if (context.performance.profitMargin > 25) {
			recommendations.push({
				category: 'revenue_growth' as const,
				title: 'Scale Operations',
				description: 'With strong profit margins, consider investing in marketing or hiring.',
				priority: 'medium' as const,
				effort: 'high' as const,
				impact: 'high' as const,
			});
		}

		return recommendations;
	}

	/**
	 * Suggest specific actions based on query
	 */
	private suggestActions(query: string, context: FinancialContext) {
		const actions = [];

		if (query.toLowerCase().includes('invoice')) {
			actions.push({
				type: 'navigate' as const,
				title: 'View Invoice Dashboard',
				description: 'Check invoice status and create new invoices',
				url: '/invoices',
				priority: 'high' as const,
			});
		}

		if (query.toLowerCase().includes('expense')) {
			actions.push({
				type: 'analyze' as const,
				title: 'Review Expense Trends',
				description: 'Analyze spending patterns and identify savings opportunities',
				url: '/expenses/reports',
				priority: 'medium' as const,
			});
		}

		if (query.toLowerCase().includes('budget')) {
			actions.push({
				type: 'create' as const,
				title: 'Create New Budget',
				description: 'Set up a new budget based on your financial goals',
				url: '/budget/create',
				priority: 'medium' as const,
			});
		}

		return actions;
	}

	/**
	 * Generate follow-up questions
	 */
	private generateFollowUpQuestions(query: string, context: FinancialContext): string[] {
		const questions = [];

		if (query.toLowerCase().includes('forecast') || query.toLowerCase().includes('future')) {
			questions.push('What are your growth targets for the next quarter?');
			questions.push('Are you planning any major investments or expansions?');
		}

		if (query.toLowerCase().includes('expense') || query.toLowerCase().includes('cost')) {
			questions.push('Which expense categories are most important to your business?');
			questions.push('Are there any expenses you\'d like to reduce or eliminate?');
		}

		if (query.toLowerCase().includes('revenue') || query.toLowerCase().includes('income')) {
			questions.push('What are your main revenue streams?');
			questions.push('Are you looking to diversify your income sources?');
		}

		return questions.slice(0, 3); // Limit to 3 questions
	}

	/**
	 * Generate charts and metrics based on context
	 */
	private async generateChartsAndMetrics(context: FinancialContext, analysisType?: string) {
		// Generate relevant charts and metrics based on the analysis type
		const charts = [];
		const metrics = {
			profitMargin: context.performance.profitMargin,
			burnRate: context.performance.burnRate,
			runway: context.performance.runway,
			cashFlow: context.cashFlow,
			growthRate: context.monthlyGrowth,
		};

		if (analysisType === 'forecast') {
			charts.push({
				type: 'line' as const,
				title: 'Revenue Forecast',
				data: {
					labels: ['Current', 'Next Month', 'Next Quarter', 'Next Year'],
					datasets: [{
						label: 'Projected Revenue',
						data: [context.totalRevenue, context.totalRevenue * 1.1, context.totalRevenue * 1.3, context.totalRevenue * 1.5],
					}],
				},
			});
		}

		return { charts, metrics };
	}

	/**
	 * Get or create conversation session
	 */
	private getOrCreateSession(userId: string, context: FinancialContext): ConversationSession {
		const sessionId = `session_${userId}_${Date.now()}`;
		const existingSession = this.conversationSessions.get(sessionId);

		if (existingSession) {
			return existingSession;
		}

		const newSession: ConversationSession = {
			id: sessionId,
			userId: context.userId,
			startTime: new Date().toISOString(),
			messages: [],
			context,
		};

		this.conversationSessions.set(sessionId, newSession);
		return newSession;
	}

	/**
	 * Update session with new message
	 */
	private updateSession(session: ConversationSession, request: QueryRequest, response: AgentResponse) {
		session.messages.push({
			role: 'user',
			content: request.query,
			timestamp: new Date().toISOString(),
		});

		session.messages.push({
			role: 'assistant',
			content: response.response,
			timestamp: new Date().toISOString(),
			metadata: response.metadata,
		});

		// Keep only last 20 messages to manage memory
		if (session.messages.length > 20) {
			session.messages = session.messages.slice(-20);
		}
	}

	/**
	 * Send insight notification for important findings
	 */
	private async sendInsightNotification(userId: string, response: AgentResponse) {
		try {
			await NotificationService.createSystemAlert(
				userId,
				'AI Financial Insight',
				'Financbase GPT found important insights about your finances. Check your dashboard for details.',
				'normal',
				'/dashboard'
			);
		} catch (error) {
			console.error('Error sending insight notification:', error);
		}
	}

	/**
	 * Calculate confidence based on AI response
	 */
	private calculateConfidence(finishReason: string | null | undefined): number {
		switch (finishReason) {
			case 'stop':
				return 0.9;
			case 'length':
				return 0.7;
			default:
				return 0.5;
		}
	}

	/**
	 * Get available AI functions
	 */
	private getAvailableFunctions() {
		return [
			{
				name: 'get_financial_data',
				description: 'Get current financial data and metrics',
				parameters: {
					type: 'object',
					properties: {
						metric: {
							type: 'string',
							description: 'The financial metric to retrieve',
						},
					},
				},
			},
			{
				name: 'create_budget_analysis',
				description: 'Create a budget analysis report',
				parameters: {
					type: 'object',
					properties: {
						category: {
							type: 'string',
							description: 'Budget category to analyze',
						},
						timeframe: {
							type: 'string',
							description: 'Time period for analysis',
						},
					},
				},
			},
		];
	}

	/**
	 * Make HTTP request with retry logic
	 */
	private async makeRequest<T>(endpoint: string, options: RequestInit): Promise<T> {
		let lastError: Error | null = null;

		for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

				const response = await fetch(`${this.baseUrl}${endpoint}`, {
					...options,
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}

				return await response.json();
			} catch (error) {
				lastError = error as Error;

				if (attempt === this.config.maxRetries) {
					break;
				}

				// Wait before retry (exponential backoff)
				await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
			}
		}

		throw lastError;
	}

	/**
	 * Handle errors consistently
	 */
	private handleError(error: any, defaultMessage: string): Error {
		if (this.config.enableLogging) {
			console.error('FinancbaseGPT Error:', error);
		}

		if (error instanceof Error) {
			return error;
		}

		return new Error(defaultMessage);
	}

	/**
	 * Health check for the service
	 */
	async health(): Promise<HealthResponse> {
		try {
			const startTime = Date.now();
			await this.makeRequest('/health', { method: 'GET' });
			const responseTime = Date.now() - startTime;

			return {
				status: 'healthy',
				uptime: process.uptime(),
				responseTime,
				errorRate: 0,
				lastQuery: new Date().toISOString(),
			};
		} catch (error) {
			return {
				status: 'unhealthy',
				uptime: process.uptime(),
				responseTime: -1,
				errorRate: 1,
				lastQuery: new Date().toISOString(),
			};
		}
	}
}
