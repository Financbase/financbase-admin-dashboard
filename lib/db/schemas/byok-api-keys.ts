import { pgTable, serial, text, timestamp, jsonb, boolean, integer } from 'drizzle-orm/pg-core';

// User API Keys Schema for BYOK (Bring Your Own Key)
export const userApiKeys = pgTable('user_api_keys', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),

	// Provider information
	provider: text('provider').notNull(), // 'openai', 'anthropic', 'google', 'grok', 'openrouter'
	providerName: text('provider_name').notNull(), // Display name

	// API key details (encrypted)
	encryptedApiKey: text('encrypted_api_key').notNull(),
	apiKeyIv: text('api_key_iv').notNull(), // Initialization vector for encryption

	// Key metadata
	keyName: text('key_name'), // User-defined name for the key
	keyType: text('key_type').default('primary'), // 'primary', 'backup', 'test'

	// Usage limits and quotas
	monthlyLimit: text('monthly_limit'), // User's monthly spending limit
	currentUsage: text('current_usage').default('0'), // Current month usage

	// Status and validation
	isActive: boolean('is_active').default(true),
	isValid: boolean('is_valid').default(true),
	lastValidated: timestamp('last_validated'),

	// Provider-specific settings
	providerSettings: jsonb('provider_settings'), // Model preferences, endpoints, etc.

	// Security and access
	allowedModels: text('allowed_models').array(), // Specific models user can access
	allowedEndpoints: text('allowed_endpoints').array(), // API endpoints this key can access

	// Audit trail
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
	lastUsed: timestamp('last_used'),
});

// User AI Provider Preferences
export const userAiPreferences = pgTable('user_ai_preferences', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),

	// Default provider selection
	defaultProvider: text('default_provider').notNull(), // Which provider to use by default
	fallbackProvider: text('fallback_provider'), // Backup provider if primary fails

	// Model preferences
	preferredModels: jsonb('preferred_models'), // { provider: { model: priority } }

	// Usage preferences
	autoSwitchProvider: boolean('auto_switch_provider').default(false), // Auto-switch if quota exceeded
	maxTokensPerRequest: integer('max_tokens_per_request').default(4000),
	maxRequestsPerMinute: integer('max_requests_per_minute').default(60),

	// Cost optimization
	enableCostOptimization: boolean('enable_cost_optimization').default(true),
	preferredCostModel: text('preferred_cost_model').default('balanced'), // 'speed', 'cost', 'quality', 'balanced'

	// Privacy settings
	storeConversationHistory: boolean('store_conversation_history').default(true),
	allowAnalytics: boolean('allow_analytics').default(true),

	// Notification preferences
	notifyOnQuotaLow: boolean('notify_on_quota_low').default(true),
	quotaWarningThreshold: integer('quota_warning_threshold').default(80), // Percentage

	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// AI Usage Tracking
export const aiUsageTracking = pgTable('ai_usage_tracking', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),

	// Request details
	provider: text('provider').notNull(),
	model: text('model').notNull(),
	endpoint: text('endpoint').notNull(),

	// Usage metrics
	tokensUsed: integer('tokens_used'),
	tokensInput: integer('tokens_input'),
	tokensOutput: integer('tokens_output'),

	// Cost tracking
	estimatedCost: text('estimated_cost'), // Cost in USD as string for precision

	// Request metadata
	requestType: text('request_type'), // 'completion', 'chat', 'embedding', etc.
	success: boolean('success').default(true),

	// Performance metrics
	responseTime: integer('response_time'), // in milliseconds
	timestamp: timestamp('timestamp').defaultNow().notNull(),

	// Context
	sessionId: text('session_id'), // Link to conversation session
	requestId: text('request_id'), // Provider's request ID
});

// AI Provider Configurations (for validation and settings)
export const aiProviderConfigs = pgTable('ai_provider_configs', {
	id: serial('id').primaryKey(),
	provider: text('provider').notNull().unique(),

	// Provider details
	displayName: text('display_name').notNull(),
	description: text('description'),

	// API configuration
	baseUrl: text('base_url').notNull(),
	apiVersion: text('api_version'),
	supportedModels: text('supported_models').array(),

	// Authentication
	authType: text('auth_type').default('bearer'), // 'bearer', 'api_key', 'oauth'
	keyHeaderName: text('key_header_name').default('Authorization'),

	// Cost information (for estimation)
	costPer1kTokens: jsonb('cost_per_1k_tokens'), // { model: { input: cost, output: cost } }
	currency: text('currency').default('USD'),

	// Rate limits (for validation)
	rateLimits: jsonb('rate_limits'), // { requests_per_minute, tokens_per_minute }

	// Features support
	supportsStreaming: boolean('supports_streaming').default(true),
	supportsFunctionCalling: boolean('supports_function_calling').default(false),
	supportsVision: boolean('supports_vision').default(false),
	supportsAudio: boolean('supports_audio').default(false),

	// Status
	isActive: boolean('is_active').default(true),
	lastUpdated: timestamp('last_updated').defaultNow().notNull(),

	createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Supported AI Providers Data
export const supportedAiProviders = [
	{
		provider: 'openai',
		displayName: 'OpenAI',
		baseUrl: 'https://api.openai.com/v1',
		supportedModels: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
		costPer1kTokens: {
			'gpt-4': { input: 0.03, output: 0.06 },
			'gpt-4-turbo': { input: 0.01, output: 0.03 },
			'gpt-3.5-turbo': { input: 0.0015, output: 0.002 }
		}
	},
	{
		provider: 'anthropic',
		displayName: 'Anthropic (Claude)',
		baseUrl: 'https://api.anthropic.com/v1',
		supportedModels: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
		costPer1kTokens: {
			'claude-3-opus': { input: 0.015, output: 0.075 },
			'claude-3-sonnet': { input: 0.003, output: 0.015 },
			'claude-3-haiku': { input: 0.00025, output: 0.00125 }
		}
	},
	{
		provider: 'google',
		displayName: 'Google (Gemini)',
		baseUrl: 'https://generativelanguage.googleapis.com/v1',
		supportedModels: ['gemini-pro', 'gemini-pro-vision'],
		costPer1kTokens: {
			'gemini-pro': { input: 0.0005, output: 0.0015 },
			'gemini-pro-vision': { input: 0.0005, output: 0.0015 }
		}
	},
	{
		provider: 'grok',
		displayName: 'Grok (xAI)',
		baseUrl: 'https://api.x.ai/v1',
		supportedModels: ['grok-1'],
		costPer1kTokens: {
			'grok-1': { input: 0.005, output: 0.015 }
		}
	},
	{
		provider: 'openrouter',
		displayName: 'OpenRouter',
		baseUrl: 'https://openrouter.ai/api/v1',
		supportedModels: ['auto', 'anthropic/claude-3-opus', 'openai/gpt-4'],
		costPer1kTokens: {
			'auto': { input: 0.001, output: 0.003 },
			'anthropic/claude-3-opus': { input: 0.015, output: 0.075 },
			'openai/gpt-4': { input: 0.03, output: 0.06 }
		}
	}
];
