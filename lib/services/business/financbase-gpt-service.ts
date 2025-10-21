import type {
	AgentResponse,
	FinancbaseGPTConfig,
	HealthResponse,
	QueryRequest,
} from "./types/financbase-gpt-types";

export class FinancbaseGPTService {
	private config: FinancbaseGPTConfig;
	private baseUrl: string;

	constructor(config?: Partial<FinancbaseGPTConfig>) {
		this.config = {
			serviceUrl:
				process.env.FINANCBASE_GPT_SERVICE_URL || "http://localhost:8001",
			maxRetries: 3,
			timeout: 30000, // 30 seconds
			enableLogging: process.env.NODE_ENV === "development",
			...config,
		};
		this.baseUrl = this.config.serviceUrl;
	}

	/**
	 * Process a financial query using FinancbaseGPT
	 */
	async query(request: QueryRequest): Promise<AgentResponse> {
		const startTime = Date.now();

		try {
			const response = await this.makeRequest<AgentResponse>(
				"/api/agent/query",
				{
					method: "POST",
					body: JSON.stringify(request),
				},
			);

			if (this.config.enableLogging) {
				console.log(
					`FinancbaseGPT query processed in ${Date.now() - startTime}ms`,
				);
			}

			return response;
		} catch (error) {
			throw this.handleError(error, "Failed to process query");
		}
	}

	/**
	 * Get financial summary for a user
	 */
	async getUserSummary(
		userId: string,
		period = "all",
	): Promise<FinancialSummary> {
		try {
			const response = await this.makeRequest<{
				success: boolean;
				data: FinancialSummary;
			}>(`/api/user/${userId}/summary?period=${period}`, { method: "GET" });

			if (!response.success) {
				throw new Error("Failed to get user summary");
			}

			return response.data;
		} catch (error) {
			throw this.handleError(error, "Failed to get user summary");
		}
	}

	/**
	 * Get health status of the FinancbaseGPT service
	 */
	async getHealth(): Promise<HealthResponse> {
		try {
			return await this.makeRequest<HealthResponse>("/health", {
				method: "GET",
			});
		} catch (error) {
			throw this.handleError(error, "Failed to get health status");
		}
	}

	/**
	 * Get available tools
	 */
	async getAvailableTools(): Promise<ToolInfo[]> {
		try {
			const response = await this.makeRequest<{
				success: boolean;
				tools: ToolInfo[];
			}>("/api/tools", { method: "GET" });

			if (!response.success) {
				throw new Error("Failed to get available tools");
			}

			return response.tools;
		} catch (error) {
			throw this.handleError(error, "Failed to get available tools");
		}
	}

	/**
	 * Get agent status
	 */
	async getAgentStatus(): Promise<AgentStatus> {
		try {
			return await this.makeRequest<AgentStatus>("/api/agent/status", {
				method: "GET",
			});
		} catch (error) {
			throw this.handleError(error, "Failed to get agent status");
		}
	}

	/**
	 * Get example queries
	 */
	async getExampleQueries(): Promise<string[]> {
		try {
			const response = await this.makeRequest<ExampleQueries>("/api/examples", {
				method: "GET",
			});
			return response.examples;
		} catch (error) {
			throw this.handleError(error, "Failed to get example queries");
		}
	}

	/**
	 * Create a chat session
	 */
	async createChatSession(userId: string): Promise<ChatSession> {
		const sessionId = `session_${userId}_${Date.now()}`;

		return {
			id: sessionId,
			user_id: userId,
			messages: [],
			created_at: new Date(),
			updated_at: new Date(),
			status: "active",
		};
	}

	/**
	 * Send a message in a chat session
	 */
	async sendMessage(
		sessionId: string,
		userId: string,
		content: string,
	): Promise<ChatMessage> {
		try {
			const response = await this.query({
				query: content,
				user_id: userId,
				session_id: sessionId,
			});

			const message: ChatMessage = {
				id: `msg_${Date.now()}`,
				role: "assistant",
				content: response.answer || "No response generated",
				timestamp: new Date(),
				session_id: sessionId,
				processing_time: response.processing_time,
				tasks: response.tasks,
				error: response.error,
			};

			return message;
		} catch (error) {
			const errorMessage: ChatMessage = {
				id: `msg_${Date.now()}`,
				role: "assistant",
				content: "Sorry, I encountered an error processing your request.",
				timestamp: new Date(),
				session_id: sessionId,
				error: error instanceof Error ? error.message : "Unknown error",
			};

			return errorMessage;
		}
	}

	/**
	 * Get query suggestions based on category
	 */
	getQuerySuggestions(category?: string): QuerySuggestion[] {
		const suggestions: QuerySuggestion[] = [
			{
				id: "income_analysis",
				text: "What's my total income this month compared to last month?",
				category: "income",
				description: "Compare monthly income trends",
			},
			{
				id: "expense_breakdown",
				text: "Show me my top 5 expense categories this quarter",
				category: "expenses",
				description: "Analyze spending patterns by category",
			},
			{
				id: "budget_performance",
				text: "Compare my actual spending vs budgets across all categories",
				category: "budgets",
				description: "Check budget adherence and performance",
			},
			{
				id: "property_roi",
				text: "Which properties have the best ROI?",
				category: "properties",
				description: "Analyze real estate investment performance",
			},
			{
				id: "freelance_profitability",
				text: "Analyze my freelance project profitability",
				category: "freelance",
				description: "Evaluate freelance project earnings and efficiency",
			},
			{
				id: "cash_flow",
				text: "What's my current cash flow situation?",
				category: "general",
				description: "Get overall financial health overview",
			},
		];

		return category
			? suggestions.filter((s) => s.category === category)
			: suggestions;
	}

	/**
	 * Make HTTP request with retry logic
	 */
	private async makeRequest<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		let lastError: Error | null = null;

		for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(
					() => controller.abort(),
					this.config.timeout,
				);

				const response = await fetch(url, {
					...options,
					headers: {
						"Content-Type": "application/json",
						...options.headers,
					},
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}

				const data = await response.json();
				return data;
			} catch (error) {
				lastError = error as Error;

				if (this.config.enableLogging) {
					console.warn(
						`FinancbaseGPT request attempt ${attempt} failed:`,
						error,
					);
				}

				if (attempt < this.config.maxRetries) {
					// Exponential backoff
					const delay = Math.pow(2, attempt) * 1000;
					await new Promise((resolve) => setTimeout(resolve, delay));
				}
			}
		}

		throw lastError || new Error("Request failed after all retries");
	}

	/**
	 * Handle and format errors
	 */
	private handleError(error: unknown, context: string): FinancbaseGPTError {
		const timestamp = new Date();

		if (error instanceof Error) {
			return {
				code: "SERVICE_ERROR",
				message: `${context}: ${error.message}`,
				details: {
					stack: error.stack,
					context,
				},
				timestamp,
			};
		}

		return {
			code: "UNKNOWN_ERROR",
			message: `${context}: Unknown error occurred`,
			details: { originalError: error },
			timestamp,
		};
	}

	/**
	 * Check if the service is available
	 */
	async isAvailable(): Promise<boolean> {
		try {
			await this.getHealth();
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Get service configuration
	 */
	getConfig(): FinancbaseGPTConfig {
		return { ...this.config };
	}

	/**
	 * Update service configuration
	 */
	updateConfig(newConfig: Partial<FinancbaseGPTConfig>): void {
		this.config = { ...this.config, ...newConfig };
		this.baseUrl = this.config.serviceUrl;
	}
}

// Export singleton instance
export const financbaseGPTService = new FinancbaseGPTService();
