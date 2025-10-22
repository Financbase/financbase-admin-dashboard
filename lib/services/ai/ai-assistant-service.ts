/**
 * AI Assistant Service
 * Chat interface with conversation history and context-aware responses
 */

import { db } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';

interface ChatMessage {
	id: string;
	conversationId: string;
	role: 'user' | 'assistant';
	content: string;
	metadata?: Record<string, unknown>;
	createdAt: string;
}

interface Conversation {
	id: string;
	userId: string;
	title: string;
	lastMessageAt: string;
	messageCount: number;
	createdAt: string;
}

interface AIResponse {
	message: string;
	suggestions?: string[];
	relatedData?: {
		invoices?: Array<{ id: string; amount: number; status: string }>;
		expenses?: Array<{ id: string; amount: number; category: string }>;
		clients?: Array<{ id: string; name: string; status: string }>;
	};
	confidence: number;
}

/**
 * Create a new conversation
 */
export async function createConversation(userId: string, title?: string): Promise<Conversation> {
	const conversation = await db.insert({
		table: 'ai_conversations',
		values: {
			userId,
			title: title || 'New Conversation',
			lastMessageAt: new Date(),
			messageCount: 0,
			createdAt: new Date(),
		}
	}).returning();

	return {
		id: conversation[0].id,
		userId: conversation[0].userId,
		title: conversation[0].title,
		lastMessageAt: conversation[0].lastMessageAt.toISOString(),
		messageCount: conversation[0].messageCount,
		createdAt: conversation[0].createdAt.toISOString(),
	};
}

/**
 * Get user's conversations
 */
export async function getConversations(userId: string, limit: number = 20): Promise<Conversation[]> {
	const conversations = await db.query.ai_conversations.findMany({
		where: eq('userId', userId),
		orderBy: [desc('lastMessageAt')],
		limit,
	});

	return conversations.map(conv => ({
		id: conv.id,
		userId: conv.userId,
		title: conv.title,
		lastMessageAt: conv.lastMessageAt.toISOString(),
		messageCount: conv.messageCount,
		createdAt: conv.createdAt.toISOString(),
	}));
}

/**
 * Get conversation messages
 */
export async function getConversationMessages(conversationId: string, userId: string): Promise<ChatMessage[]> {
	const messages = await db.query.ai_messages.findMany({
		where: and(
			eq('conversationId', conversationId),
			eq('userId', userId)
		),
		orderBy: [desc('createdAt')],
	});

	return messages.map(msg => ({
		id: msg.id,
		conversationId: msg.conversationId,
		role: msg.role as 'user' | 'assistant',
		content: msg.content,
		metadata: msg.metadata ? JSON.parse(msg.metadata) : undefined,
		createdAt: msg.createdAt.toISOString(),
	}));
}

/**
 * Send a message and get AI response
 */
export async function sendMessage(
	conversationId: string,
	userId: string,
	message: string
): Promise<{ userMessage: ChatMessage; aiResponse: ChatMessage }> {
	// Save user message
	const userMessage = await db.insert({
		table: 'ai_messages',
		values: {
			conversationId,
			userId,
			role: 'user',
			content: message,
			createdAt: new Date(),
		}
	}).returning();

	// Get conversation context
	const recentMessages = await getConversationMessages(conversationId, userId);
	const context = recentMessages.slice(0, 10).reverse(); // Last 10 messages for context

	// Get user's financial data for context
	const financialContext = await getUserFinancialContext(userId);

	// Generate AI response
	const aiResponse = await generateAIResponse(message, context, financialContext);

	// Save AI response
	const aiMessage = await db.insert({
		table: 'ai_messages',
		values: {
			conversationId,
			userId,
			role: 'assistant',
			content: aiResponse.message,
			metadata: JSON.stringify({
				suggestions: aiResponse.suggestions,
				relatedData: aiResponse.relatedData,
				confidence: aiResponse.confidence,
			}),
			createdAt: new Date(),
		}
	}).returning();

	// Update conversation
	await db.update({
		table: 'ai_conversations',
		set: {
			lastMessageAt: new Date(),
			messageCount: { increment: 2 },
		},
		where: eq('id', conversationId)
	});

	return {
		userMessage: {
			id: userMessage[0].id,
			conversationId: userMessage[0].conversationId,
			role: 'user',
			content: userMessage[0].content,
			createdAt: userMessage[0].createdAt.toISOString(),
		},
		aiResponse: {
			id: aiMessage[0].id,
			conversationId: aiMessage[0].conversationId,
			role: 'assistant',
			content: aiMessage[0].content,
			metadata: aiMessage[0].metadata ? JSON.parse(aiMessage[0].metadata) : undefined,
			createdAt: aiMessage[0].createdAt.toISOString(),
		},
	};
}

/**
 * Get user's financial context for AI responses
 */
async function getUserFinancialContext(userId: string) {
	// Get recent invoices
	const recentInvoices = await db.query.invoices.findMany({
		where: eq('userId', userId),
		orderBy: [desc('createdAt')],
		limit: 5,
	});

	// Get recent expenses
	const recentExpenses = await db.query.expenses.findMany({
		where: eq('userId', userId),
		orderBy: [desc('createdAt')],
		limit: 5,
	});

	// Get client count
	const clientCount = await db.query.clients.findMany({
		where: eq('userId', userId),
	});

	// Get financial summary
	const [revenueData] = await db
		.select({
			totalRevenue: sql<number>`sum(case when status = 'paid' then total::numeric else 0 end)`,
			pendingAmount: sql<number>`sum(case when status in ('sent', 'viewed') then total::numeric else 0 end)`,
		})
		.from('invoices')
		.where(eq('userId', userId));

	const [expenseData] = await db
		.select({
			totalExpenses: sql<number>`sum(amount::numeric)`,
		})
		.from('expenses')
		.where(eq('userId', userId));

	return {
		recentInvoices: recentInvoices.map(inv => ({
			id: inv.id,
			amount: Number(inv.total),
			status: inv.status,
			clientName: inv.clientName,
		})),
		recentExpenses: recentExpenses.map(exp => ({
			id: exp.id,
			amount: Number(exp.amount),
			category: exp.category,
			description: exp.description,
		})),
		clientCount: clientCount.length,
		totalRevenue: Number(revenueData?.totalRevenue || 0),
		pendingAmount: Number(revenueData?.pendingAmount || 0),
		totalExpenses: Number(expenseData?.totalExpenses || 0),
	};
}

/**
 * Generate AI response based on message and context
 */
async function generateAIResponse(
	message: string,
	context: ChatMessage[],
	financialContext: any
): Promise<AIResponse> {
	// Simple AI response logic (in production, this would connect to OpenAI/Anthropic)
	const lowerMessage = message.toLowerCase();

	// Financial analysis queries
	if (lowerMessage.includes('revenue') || lowerMessage.includes('income')) {
		return {
			message: `Your total revenue is $${financialContext.totalRevenue.toLocaleString()}, with $${financialContext.pendingAmount.toLocaleString()} in pending invoices. Your recent invoices show strong performance.`,
			suggestions: [
				"Show me my revenue trends",
				"How can I increase my revenue?",
				"What's my average invoice value?"
			],
			relatedData: {
				invoices: financialContext.recentInvoices,
			},
			confidence: 90,
		};
	}

	if (lowerMessage.includes('expense') || lowerMessage.includes('cost')) {
		return {
			message: `Your total expenses are $${financialContext.totalExpenses.toLocaleString()}. I can see your recent expenses and help you analyze spending patterns.`,
			suggestions: [
				"Show me my expense categories",
				"How can I reduce my expenses?",
				"What's my biggest expense?"
			],
			relatedData: {
				expenses: financialContext.recentExpenses,
			},
			confidence: 85,
		};
	}

	if (lowerMessage.includes('client') || lowerMessage.includes('customer')) {
		return {
			message: `You have ${financialContext.clientCount} clients in your system. I can help you manage client relationships and track their payment history.`,
			suggestions: [
				"Show me my top clients",
				"Which clients have overdue payments?",
				"How can I improve client retention?"
			],
			relatedData: {
				clients: financialContext.recentInvoices.map(inv => ({
					id: inv.id,
					name: inv.clientName,
					status: inv.status,
				})),
			},
			confidence: 80,
		};
	}

	if (lowerMessage.includes('profit') || lowerMessage.includes('margin')) {
		const profit = financialContext.totalRevenue - financialContext.totalExpenses;
		const margin = financialContext.totalRevenue > 0 ? (profit / financialContext.totalRevenue) * 100 : 0;
		
		return {
			message: `Your current profit is $${profit.toLocaleString()} with a ${margin.toFixed(1)}% profit margin. This is ${margin > 20 ? 'excellent' : margin > 10 ? 'good' : 'needs improvement'}.`,
			suggestions: [
				"How can I improve my profit margin?",
				"Show me my profitability trends",
				"What's affecting my profitability?"
			],
			confidence: 88,
		};
	}

	if (lowerMessage.includes('cash flow') || lowerMessage.includes('cashflow')) {
		const cashFlow = financialContext.totalRevenue - financialContext.totalExpenses;
		
		return {
			message: `Your current cash flow is $${cashFlow.toLocaleString()}. ${cashFlow > 0 ? 'You have positive cash flow, which is great!' : 'You have negative cash flow, which needs attention.'}`,
			suggestions: [
				"How can I improve my cash flow?",
				"Show me my cash flow trends",
				"What's affecting my cash flow?"
			],
			confidence: 85,
		};
	}

	// General financial advice
	if (lowerMessage.includes('help') || lowerMessage.includes('advice')) {
		return {
			message: `I can help you with your financial management! I can analyze your revenue, expenses, clients, and provide insights. What would you like to know about your finances?`,
			suggestions: [
				"Analyze my revenue performance",
				"Review my expense patterns",
				"Check my client relationships",
				"Assess my financial health"
			],
			confidence: 95,
		};
	}

	// Default response
	return {
		message: `I understand you're asking about "${message}". I can help you analyze your financial data, provide insights on revenue, expenses, clients, and cash flow. What specific aspect of your finances would you like me to help with?`,
		suggestions: [
			"Show me my financial overview",
			"Analyze my revenue trends",
			"Review my expense categories",
			"Check my client performance"
		],
		confidence: 70,
	};
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string, userId: string): Promise<void> {
	await db.delete('ai_messages').where(
		and(
			eq('conversationId', conversationId),
			eq('userId', userId)
		)
	);
	
	await db.delete('ai_conversations').where(
		and(
			eq('id', conversationId),
			eq('userId', userId)
		)
	);
}

/**
 * Get conversation suggestions based on user's financial data
 */
export async function getConversationSuggestions(userId: string): Promise<string[]> {
	const financialContext = await getUserFinancialContext(userId);
	const suggestions: string[] = [];

	if (financialContext.totalRevenue > 0) {
		suggestions.push("How is my revenue performing this month?");
		suggestions.push("What's my average invoice value?");
	}

	if (financialContext.pendingAmount > 0) {
		suggestions.push("Which clients have overdue payments?");
		suggestions.push("How can I improve my payment collection?");
	}

	if (financialContext.totalExpenses > 0) {
		suggestions.push("What are my biggest expense categories?");
		suggestions.push("How can I reduce my operating costs?");
	}

	if (financialContext.clientCount > 0) {
		suggestions.push("Who are my top-performing clients?");
		suggestions.push("How can I improve client retention?");
	}

	suggestions.push("What's my overall financial health?");
	suggestions.push("How can I improve my cash flow?");

	return suggestions.slice(0, 6); // Return top 6 suggestions
}

// Export all AI assistant service functions
export const AIAssistantService = {
	createConversation,
	getConversations,
	getConversationMessages,
	sendMessage,
	deleteConversation,
	getConversationSuggestions,
};
