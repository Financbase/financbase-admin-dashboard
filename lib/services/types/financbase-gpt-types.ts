// FinancbaseGPT TypeScript Type Definitions
// These types match the Python Pydantic models and FastAPI responses

export interface QueryRequest {
	query: string;
	user_id: string;
	session_id?: string;
}

export interface TaskProgress {
	task_id: number;
	description: string;
	status: "pending" | "in_progress" | "completed" | "failed";
	progress: number; // 0.0 to 1.0
}

export interface AgentResponse {
	success: boolean;
	answer?: string;
	tasks?: Task[];
	progress?: TaskProgress[];
	error?: string;
	session_id?: string;
	processing_time?: number;
}

export interface Task {
	id: number;
	description: string;
	done: boolean;
}

export interface TaskList {
	tasks: Task[];
}

export interface IsDone {
	done: boolean;
}

export interface Answer {
	answer: string;
}

export interface OptimizedToolArgs {
	arguments: Record<string, any>;
}

// Financial Data Types
export interface FinancialTransaction {
	id: string;
	amount: number;
	description?: string;
	category?: string;
	date: string;
	vendor?: string;
	source?: string;
}

export interface IncomeData {
	total_income: number;
	income_sources: Record<string, number>;
	transactions: FinancialTransaction[];
	period: string;
	record_count: number;
}

export interface ExpenseData {
	total_expenses: number;
	expense_categories: Record<string, number>;
	transactions: FinancialTransaction[];
	period: string;
	record_count: number;
}

export interface BudgetData {
	total_budget: number;
	total_spent: number;
	budget_utilization_percent: number;
	budgets: Array<{
		id: string;
		category: string;
		amount: number;
		spent?: number;
		period: string;
		date: string;
		description?: string;
	}>;
	period: string;
	record_count: number;
}

export interface PropertyData {
	total_property_value: number;
	total_monthly_rent: number;
	total_purchase_price: number;
	appreciation: number;
	properties: Array<{
		id: string;
		address: string;
		property_type: string;
		purchase_price?: number;
		current_value?: number;
		monthly_rent?: number;
		date: string;
		description?: string;
	}>;
	record_count: number;
}

export interface FreelanceProjectData {
	total_earnings: number;
	completed_earnings: number;
	completed_projects: number;
	total_projects: number;
	projects: Array<{
		id: string;
		project_name: string;
		client_name: string;
		amount?: number;
		status: string;
		created_at: string;
		completed_at?: string;
		description?: string;
	}>;
	period: string;
	record_count: number;
}

export interface FinancialSummary {
	period: string;
	total_income: number;
	total_expenses: number;
	net_income: number;
	income_breakdown: IncomeData;
	expense_breakdown: ExpenseData;
	budget_performance: BudgetData;
	property_portfolio: PropertyData;
	freelance_earnings: FreelanceProjectData;
	financial_health_score: number;
}

// API Response Types
export interface HealthResponse {
	status: string;
	version: string;
	agent_configured: boolean;
	database_connected: boolean;
}

export interface ToolInfo {
	name: string;
	description: string;
	args_schema: Record<string, any>;
}

export interface AgentStatus {
	success: boolean;
	agent: {
		max_steps: number;
		max_steps_per_task: number;
		available_tools: number;
	};
}

export interface ExampleQueries {
	success: boolean;
	examples: string[];
}

// Service Configuration
export interface FinancbaseGPTConfig {
	serviceUrl: string;
	maxRetries: number;
	timeout: number;
	enableLogging: boolean;
}

// Chat Message Types
export interface ChatMessage {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	timestamp: Date;
	session_id?: string;
	processing_time?: number;
	tasks?: Task[];
	error?: string;
}

export interface ChatSession {
	id: string;
	user_id: string;
	messages: ChatMessage[];
	created_at: Date;
	updated_at: Date;
	status: "active" | "completed" | "error";
}

// Error Types
export interface FinancbaseGPTError {
	code: string;
	message: string;
	details?: Record<string, any>;
	timestamp: Date;
}

// Query Suggestions
export interface QuerySuggestion {
	id: string;
	text: string;
	category:
		| "income"
		| "expenses"
		| "budgets"
		| "properties"
		| "freelance"
		| "general";
	description: string;
}

// Analytics Types
export interface UsageAnalytics {
	total_queries: number;
	successful_queries: number;
	failed_queries: number;
	average_processing_time: number;
	most_common_queries: Array<{
		query: string;
		count: number;
	}>;
	user_engagement: {
		active_sessions: number;
		total_sessions: number;
		average_session_duration: number;
	};
}
