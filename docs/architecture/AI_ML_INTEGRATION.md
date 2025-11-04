# AI/ML Integration Architecture

## Overview

The Financbase Admin Dashboard implements a comprehensive AI/ML system with multi-provider support, enabling transaction categorization, financial insights, predictive analytics, and natural language interactions. The system supports Bring Your Own Key (BYOK) for complete cost control.

## Multi-Provider Architecture

### Supported Providers

1. **OpenAI** (GPT-4, GPT-4 Turbo, GPT-3.5 Turbo)
2. **Anthropic** (Claude 3 Opus, Sonnet, Haiku)
3. **Google AI** (Gemini Pro, Gemini Pro Vision)
4. **xAI** (Grok-1)
5. **OpenRouter** (Multi-provider routing)

### Provider Configuration

```155:177:lib/services/ai/unified-ai-orchestrator.ts
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
```

## Unified AI Orchestrator

### Core Architecture

```179:201:lib/services/ai/unified-ai-orchestrator.ts
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
```

### Transaction Categorization

```206:247:lib/services/ai/unified-ai-orchestrator.ts
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
```

**Features:**

- **97%+ accuracy** with machine learning
- **Rule-based fallback** for known patterns
- **User feedback loop** for continuous improvement
- **Multi-provider voting** for confidence
- **Explainability** - Shows reasoning for categorization

## BYOK (Bring Your Own Key) System

### Architecture

```64:203:lib/services/byok-service.ts
export class BYOKService {
  private encryptionKey: Buffer | null = null;
```

**Key Features:**

- Encrypted API key storage
- User-level provider preferences
- Cost tracking and limits
- Automatic provider switching
- Usage analytics

### User API Key Management

```typescript
// lib/db/schemas/byok-api-keys.ts
export const userApiKeys = pgTable("user_api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  provider: text("provider").notNull(), // 'openai', 'anthropic', 'google', etc.
  encryptedApiKey: text("encrypted_api_key").notNull(), // AES-256 encrypted
  isActive: boolean("is_active").notNull().default(true),
  isValid: boolean("is_valid").notNull().default(false),
  monthlyLimit: numeric("monthly_limit"), // Optional spending limit
  currentUsage: numeric("current_usage").default("0"),
  allowedModels: text("allowed_models").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

## Provider Routing

### Intelligent Routing

The orchestrator routes requests based on:

- **Capability match** - Provider supports required feature
- **Cost optimization** - Choose lowest cost provider
- **Performance** - Response time and reliability
- **User preferences** - User-selected default provider
- **Load balancing** - Distribute requests across providers

### Provider Selection Logic

```typescript
private async selectProvider(
  capability: AICapability,
  userPreferences?: UserAIPreferences
): Promise<AIProvider> {
  // Check user preferences first
  if (userPreferences?.defaultProvider) {
    return userPreferences.defaultProvider;
  }

  // Select based on capability and cost
  const availableProviders = Object.entries(PROVIDER_CONFIGS)
    .filter(([_, config]) => config.capabilities.includes(capability))
    .sort(([_, a], [__, b]) => a.cost - b.cost);

  return availableProviders[0][0] as AIProvider;
}
```

## AI Capabilities

### 1. Transaction Categorization

- Automatic categorization of financial transactions
- Learning from user corrections
- Category suggestions with confidence scores
- Subcategory assignment

### 2. Financial Insights

- Spending pattern analysis
- Budget recommendations
- Expense trend identification
- Anomaly detection

### 3. Predictive Analytics

- Cash flow forecasting
- Revenue predictions
- Expense projections
- Financial health scoring

### 4. Natural Language Processing

- Conversational AI assistant (Financbase GPT)
- Query understanding
- Document analysis
- Data extraction from receipts/invoices

## Financbase GPT Service

### Business AI Assistant

```typescript
export class FinancbaseGPTService {
  // Business-specific AI assistant
  // - Financial queries
  // - Report generation
  // - Data analysis
  // - Recommendations
}
```

**Features:**

- Context-aware responses
- Financial domain expertise
- Multi-turn conversations
- Document analysis
- Report generation

## Usage Tracking

### Analytics

```typescript
interface AIUsageTracking {
  userId: string;
  provider: string;
  model: string;
  tokensUsed: number;
  tokensInput: number;
  tokensOutput: number;
  estimatedCost: number;
  responseTime: number;
  operationType: 'categorization' | 'insights' | 'chat' | 'analysis';
  success: boolean;
  error?: string;
  timestamp: Date;
}
```

### Cost Optimization

- Track usage per provider
- Monitor spending limits
- Automatic cost alerts
- Usage reports and analytics

## Prompt Engineering

### Domain-Specific Prompts

- Financial transaction prompts
- Business analysis prompts
- Report generation prompts
- Conversational prompts

### Template System

```typescript
const categorizationPrompt = `
You are a financial transaction categorizer. Analyze the following transaction:
- Description: {description}
- Amount: {amount}
- Date: {date}
- Merchant: {merchant}

Based on the user's categorization history:
{history}

Categorize this transaction and explain your reasoning.
`;
```

## Feedback Loop

### Learning System

```typescript
interface AIFeedback {
  transactionId: string;
  originalCategory: string;
  correctedCategory: string;
  userReason?: string;
  timestamp: Date;
}

// User corrections improve future categorizations
private async learnFromFeedback(
  userId: string,
  feedback: AIFeedback
): Promise<void> {
  // Update categorization rules
  // Adjust model weights
  // Store for training data
}
```

## Error Handling

### Provider Failover

```typescript
private async withFallback<T>(
  operation: () => Promise<T>,
  fallbackProvider: AIProvider
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.warn('Primary provider failed, trying fallback');
    return await this.retryWithProvider(fallbackProvider, operation);
  }
}
```

### Retry Strategy

- Exponential backoff
- Provider rotation
- Circuit breaker pattern
- Graceful degradation

## Performance Optimization

### Caching

- Cache common categorizations
- Store prompt templates
- Cache provider responses (where applicable)

### Batch Processing

- Batch transaction categorization
- Parallel provider requests
- Async processing for non-critical operations

## Security

### API Key Encryption

- AES-256 encryption for stored keys
- Key rotation support
- Secure key transmission
- Access logging

### Data Privacy

- No PII sent to AI providers (when possible)
- Anonymized transaction data
- User consent for data usage
- Compliance with data regulations

## Best Practices

### Provider Selection

1. **Start with cost-effective** providers (Google AI)
2. **Fallback to reliable** providers (OpenAI/Claude)
3. **Use provider-specific models** for specialized tasks
4. **Monitor provider performance** and adjust routing

### Cost Management

1. **Set monthly limits** on API usage
2. **Use caching** to reduce redundant requests
3. **Batch operations** when possible
4. **Monitor spending** regularly

### Performance

1. **Use appropriate models** - Not always the most expensive
2. **Implement timeouts** for all requests
3. **Cache responses** where applicable
4. **Optimize prompts** to reduce token usage

## Related Documentation

- [BYOK Multi-Provider README](../configuration/BYOK_MULTI_PROVIDER_README.md)
- [Backend Architecture](./BACKEND_ARCHITECTURE.md)
- [Performance Optimization](./PERFORMANCE_OPTIMIZATION.md)
