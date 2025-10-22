/**
 * Enhanced Financbase GPT Types
 * Comprehensive type definitions for the AI assistant with financial context
 */

export interface FinancbaseGPTConfig {
	serviceUrl?: string;
	maxRetries: number;
	timeout: number;
	enableLogging: boolean;
	model?: string;
	temperature?: number;
	maxTokens?: number;
}

export interface FinancialContext {
	userId: string;
	totalRevenue: number;
	totalExpenses: number;
	cashFlow: number;
	outstandingInvoices: number;
	overdueInvoices: number;
	monthlyGrowth: number;
	topExpenses: Array<{
		category: string;
		amount: number;
		percentage: number;
	}>;
	recentTransactions: Array<{
		id: string;
		amount: number;
		category: string;
		date: string;
		description: string;
	}>;
	budgetStatus: {
		totalBudget: number;
		spent: number;
		remaining: number;
		overBudgetCategories: string[];
	};
	performance: {
		profitMargin: number;
		burnRate: number;
		runway: number; // months
	};
}

export interface QueryRequest {
	query: string;
	context?: FinancialContext;
	conversationHistory?: Array<{
		role: 'user' | 'assistant';
		content: string;
		timestamp: string;
	}>;
	analysisType?: 'general' | 'invoice' | 'expense' | 'report' | 'forecast' | 'budget';
	urgency?: 'low' | 'medium' | 'high' | 'urgent';
	userPreferences?: {
		responseStyle: 'brief' | 'detailed' | 'technical';
		language: string;
		currency: string;
		timezone: string;
	};
}

export interface AgentResponse {
	response: string;
	confidence: number;
	analysis: {
		type: string;
		insights: string[];
		recommendations: string[];
		actions: Array<{
			type: 'navigate' | 'create' | 'update' | 'analyze';
			description: string;
			url?: string;
			priority: 'low' | 'medium' | 'high';
		}>;
	};
	data?: {
		charts?: Array<{
			type: 'line' | 'bar' | 'pie' | 'area';
			title: string;
			data: any;
		}>;
		metrics?: Record<string, number>;
		forecast?: {
			nextMonth: number;
			nextQuarter: number;
			nextYear: number;
		};
	};
	metadata: {
		processingTime: number;
		model: string;
		tokens: {
			input: number;
			output: number;
		};
	};
}

export interface HealthResponse {
	status: 'healthy' | 'degraded' | 'unhealthy';
	uptime: number;
	responseTime: number;
	errorRate: number;
	lastQuery: string;
}

export interface ConversationSession {
	id: string;
	userId: string;
	startTime: string;
	endTime?: string;
	messages: Array<{
		role: 'user' | 'assistant' | 'system';
		content: string;
		timestamp: string;
		metadata?: Record<string, any>;
	}>;
	context: FinancialContext;
	summary?: string;
}

export interface GPTAnalysisResult {
	insights: Array<{
		type: 'trend' | 'anomaly' | 'opportunity' | 'risk';
		title: string;
		description: string;
		confidence: number;
		impact: 'low' | 'medium' | 'high';
	}>;
	recommendations: Array<{
		category: 'cost_saving' | 'revenue_growth' | 'efficiency' | 'risk_mitigation';
		title: string;
		description: string;
		priority: 'low' | 'medium' | 'high';
		effort: 'low' | 'medium' | 'high';
		impact: 'low' | 'medium' | 'high';
	}>;
	actions: Array<{
		type: 'immediate' | 'short_term' | 'long_term';
		title: string;
		description: string;
		url?: string;
		automation?: boolean;
	}>;
	questions: string[]; // Follow-up questions to ask the user
}
