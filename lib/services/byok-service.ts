import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { db } from '@/lib/db';
import { userApiKeys, userAiPreferences, aiUsageTracking, aiProviderConfigs, supportedAiProviders } from '@/lib/db/schemas/byok-api-keys';
import { eq, and, desc } from 'drizzle-orm';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

const scryptAsync = promisify(scrypt);

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// AI Response interfaces
interface AIResponse {
  content: string;
  tokensUsed?: number;
  tokensInput?: number;
  tokensOutput?: number;
  model: string;
  provider: string;
  finishReason?: string;
}

interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Provider validation interfaces
interface ProviderValidation {
  provider: string;
  isValid: boolean;
  error?: string;
  quotaInfo?: {
    used: number;
    limit?: number;
    resetDate?: Date;
  };
}

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  costPer1kTokens?: {
    input: number;
    output: number;
  };
  supportsStreaming?: boolean;
  supportsVision?: boolean;
  supportsFunctionCalling?: boolean;
}

interface AIProviderClient {
  chat: (messages: AIChatMessage[], options?: { model?: string; maxTokens?: number; temperature?: number }) => Promise<AIResponse>;
  models?: () => Promise<any[]>;
}

export class BYOKService {
  private encryptionKey: Buffer | null = null;
  private providerClients: Map<string, OpenAI | Anthropic | GoogleGenerativeAI | AIProviderClient> = new Map();
  private userId: string;

  constructor(userId?: string) {
    this.userId = userId || '';
    this.initializeEncryption();
  }

  /**
   * Initialize provider client for a specific provider
   */
  private async initializeProviderClient(provider: string): Promise<OpenAI | Anthropic | GoogleGenerativeAI | AIProviderClient | null> {
    try {
      const apiKey = await this.getUserApiKey(this.userId, provider);
      if (!apiKey) {
        // Fallback to environment variables for testing
        switch (provider) {
          case 'openai':
            return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          case 'anthropic':
            return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
          case 'google':
            return new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
          default:
            return null;
        }
      }

      switch (provider) {
        case 'openai':
          return new OpenAI({ apiKey });
        case 'anthropic':
          return new Anthropic({ apiKey });
        case 'google':
          return new GoogleGenerativeAI(apiKey);
        case 'grok':
          return this.createGrokClient(apiKey);
        case 'openrouter':
          return this.createOpenRouterClient(apiKey);
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error initializing ${provider} client:`, error);
      return null;
    }
  }

  /**
   * Create HTTP-based client for xAI (Grok)
   */
  private createGrokClient(apiKey: string): AIProviderClient {
    return {
      chat: async (messages: AIChatMessage[], options?: any): Promise<AIResponse> => {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: options?.model || 'grok-1',
            messages,
            max_tokens: options?.maxTokens || 1000,
            temperature: options?.temperature || 0.7
          })
        });

        if (!response.ok) {
          throw new Error(`Grok API error: ${response.status}`);
        }

        const data = await response.json();
        return {
          content: data.choices[0].message.content,
          tokensUsed: data.usage?.total_tokens,
          tokensInput: data.usage?.prompt_tokens,
          tokensOutput: data.usage?.completion_tokens,
          model: data.model,
          provider: 'grok',
          finishReason: data.choices[0].finish_reason
        };
      }
    };
  }

  /**
   * Create HTTP-based client for OpenRouter
   */
  private createOpenRouterClient(apiKey: string): AIProviderClient {
    return {
      chat: async (messages: AIChatMessage[], options?: any): Promise<AIResponse> => {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: options?.model || 'auto',
            messages,
            max_tokens: options?.maxTokens || 1000,
            temperature: options?.temperature || 0.7
          })
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        return {
          content: data.choices[0].message.content,
          tokensUsed: data.usage?.total_tokens,
          tokensInput: data.usage?.prompt_tokens,
          tokensOutput: data.usage?.completion_tokens,
          model: data.model,
          provider: 'openrouter',
          finishReason: data.choices[0].finish_reason
        };
      }
    };
  }

  /**
   * Get provider client (cached)
   */
  private async getProviderClient(provider: string): Promise<OpenAI | Anthropic | GoogleGenerativeAI | AIProviderClient | null> {
    if (this.providerClients.has(provider)) {
      return this.providerClients.get(provider)!;
    }

    const client = await this.initializeProviderClient(provider);
    if (client) {
      this.providerClients.set(provider, client);
    }
    return client;
  }

  /**
   * Universal AI chat method supporting all providers
   */
  async chat(
    messages: AIChatMessage[],
    options: {
      provider?: string;
      model?: string;
      maxTokens?: number;
      temperature?: number;
      userId?: string;
    } = {}
  ): Promise<AIResponse> {
    const { provider = 'openai', model, maxTokens = 1000, temperature = 0.7, userId } = options;
    const requestUserId = userId || this.userId;

    const startTime = Date.now();

    try {
      const client = await this.getProviderClient(provider);
      if (!client) {
        throw new Error(`Provider ${provider} not available or not configured`);
      }

      let response: AIResponse;

      if (client instanceof OpenAI) {
        response = await this.chatWithOpenAI(client, messages, { model, maxTokens, temperature });
      } else if (client instanceof Anthropic) {
        response = await this.chatWithAnthropic(client, messages, { model, maxTokens, temperature });
      } else if (client instanceof GoogleGenerativeAI) {
        response = await this.chatWithGoogle(client, messages, { model, maxTokens, temperature });
      } else {
        // HTTP-based clients (Grok, OpenRouter)
        response = await this.chatWithHTTPClient(client as AIProviderClient, messages, { model, maxTokens, temperature });
      }

      // Track usage
      await this.trackUsage(
        requestUserId,
        provider,
        response.model,
        response.tokensUsed || 0,
        response.tokensInput || 0,
        response.tokensOutput || 0,
        Date.now() - startTime,
        'chat',
        true,
        undefined,
        undefined
      );

      return response;

    } catch (error) {
      // Track failed request
      await this.trackUsage(
        requestUserId,
        provider,
        model || 'unknown',
        0,
        0,
        0,
        Date.now() - startTime,
        'chat',
        false,
        undefined,
        undefined
      );

      throw error;
    }
  }

  /**
   * OpenAI chat implementation
   */
  private async chatWithOpenAI(
    client: OpenAI,
    messages: AIChatMessage[],
    options: { model?: string; maxTokens?: number; temperature?: number }
  ): Promise<AIResponse> {
    const response = await client.chat.completions.create({
      model: options.model || 'gpt-3.5-turbo',
      messages: messages as any,
      max_tokens: options.maxTokens,
      temperature: options.temperature
    });

    return {
      content: response.choices[0].message.content || '',
      tokensUsed: response.usage?.total_tokens,
      tokensInput: response.usage?.prompt_tokens,
      tokensOutput: response.usage?.completion_tokens,
      model: response.model,
      provider: 'openai',
      finishReason: response.choices[0].finish_reason
    };
  }

  /**
   * Anthropic chat implementation
   */
  private async chatWithAnthropic(
    client: Anthropic,
    messages: AIChatMessage[],
    options: { model?: string; maxTokens?: number; temperature?: number }
  ): Promise<AIResponse> {
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await client.messages.create({
      model: options.model || 'claude-3-haiku-20240307',
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature,
      system: systemMessage?.content,
      messages: userMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      })) as any
    });

    return {
      content: response.content[0].text,
      tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens,
      tokensInput: response.usage?.input_tokens,
      tokensOutput: response.usage?.output_tokens,
      model: response.model,
      provider: 'anthropic',
      finishReason: response.stop_reason
    };
  }

  /**
   * Google Gemini chat implementation
   */
  private async chatWithGoogle(
    client: GoogleGenerativeAI,
    messages: AIChatMessage[],
    options: { model?: string; maxTokens?: number; temperature?: number }
  ): Promise<AIResponse> {
    const model = client.getGenerativeModel({ model: options.model || 'gemini-pro' });

    // Combine all messages into a single prompt for Gemini
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');

    const response = await model.generateContent(prompt);
    const text = response.response.text();

    return {
      content: text,
      model: options.model || 'gemini-pro',
      provider: 'google',
      // Gemini doesn't provide detailed token counts in the basic API
      tokensUsed: undefined,
      tokensInput: undefined,
      tokensOutput: undefined
    };
  }

  /**
   * HTTP client chat wrapper
   */
  private async chatWithHTTPClient(
    client: AIProviderClient,
    messages: AIChatMessage[],
    options: { model?: string; maxTokens?: number; temperature?: number }
  ): Promise<AIResponse> {
    return client.chat(messages, options);
  }

  private async initializeEncryption() {
    const password = process.env.BYOK_ENCRYPTION_PASSWORD || 'default-password-change-in-production';
    const salt = process.env.BYOK_ENCRYPTION_SALT || 'default-salt-change-in-production';

    this.encryptionKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  }

  /**
   * Encrypt API key before storing
   */
  private async encryptApiKey(apiKey: string): Promise<{ encrypted: string; iv: string }> {
    if (!this.encryptionKey) {
      await this.initializeEncryption();
    }

    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.encryptionKey!, iv);

    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = (cipher as any).getAuthTag();

    return {
      encrypted: encrypted + tag.toString('hex'),
      iv: iv.toString('hex')
    };
  }

  /**
   * Decrypt API key for use
   */
  private async decryptApiKey(encryptedKey: string, iv: string): Promise<string> {
    if (!this.encryptionKey) {
      await this.initializeEncryption();
    }

    const ivBuffer = Buffer.from(iv, 'hex');
    const decipher = createDecipheriv(ALGORITHM, this.encryptionKey!, ivBuffer);

    // Extract auth tag from encrypted data
    const encryptedBuffer = Buffer.from(encryptedKey.slice(0, -TAG_LENGTH * 2), 'hex');
    const tag = Buffer.from(encryptedKey.slice(-TAG_LENGTH * 2), 'hex');

    (decipher as any).setAuthTag(tag);

    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  }

  /**
   * Validate API key with provider
   */
  async validateApiKey(provider: string, apiKey: string): Promise<ProviderValidation> {
    try {
      const providerConfig = supportedAiProviders.find(p => p.provider === provider);
      if (!providerConfig) {
        return {
          provider,
          isValid: false,
          error: 'Provider not supported'
        };
      }

      // Test the API key by making a simple request
      const isValid = await this.testProviderConnection(provider, apiKey);

      if (isValid) {
        // Try to get quota information if available
        const quotaInfo = await this.getProviderQuota(provider, apiKey);

        return {
          provider,
          isValid: true,
          quotaInfo
        };
      } else {
        return {
          provider,
          isValid: false,
          error: 'Invalid API key or connection failed'
        };
      }
    } catch (error) {
      return {
        provider,
        isValid: false,
        error: error instanceof Error ? error.message : 'Validation failed'
      };
    }
  }

  /**
   * Test connection to provider API
   */
  private async testProviderConnection(provider: string, apiKey: string): Promise<boolean> {
    try {
      const providerConfig = supportedAiProviders.find(p => p.provider === provider);
      if (!providerConfig) return false;

      // Make a minimal test request based on provider
      switch (provider) {
        case 'openai':
          return await this.testOpenAIConnection(apiKey);
        case 'anthropic':
          return await this.testAnthropicConnection(apiKey);
        case 'google':
          return await this.testGoogleConnection(apiKey);
        case 'grok':
          return await this.testGrokConnection(apiKey);
        case 'openrouter':
          return await this.testOpenRouterConnection(apiKey);
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error testing ${provider} connection:`, error);
      return false;
    }
  }

  private async testOpenAIConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async testAnthropicConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hello' }]
        })
      });
      return response.status !== 401; // 401 means invalid key, other errors might be rate limits
    } catch {
      return false;
    }
  }

  private async testGoogleConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  private async testGrokConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.x.ai/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async testOpenRouterConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async getProviderQuota(provider: string, apiKey: string): Promise<any> {
    // This would depend on each provider's API for quota information
    // For now, return basic info - this can be expanded based on provider APIs
    return {
      used: 0,
      limit: undefined, // Unknown for most providers
      resetDate: undefined
    };
  }

  /**
   * Store user API key
   */
  async storeUserApiKey(
    userId: string,
    provider: string,
    apiKey: string,
    keyName?: string,
    keyType: string = 'primary'
  ): Promise<any> {
    // Validate the key first
    const validation = await this.validateApiKey(provider, apiKey);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid API key');
    }

    // Encrypt the API key
    const { encrypted, iv } = await this.encryptApiKey(apiKey);

    // Get provider info
    const providerInfo = supportedAiProviders.find(p => p.provider === provider);
    if (!providerInfo) {
      throw new Error('Provider not supported');
    }

    // Check if user already has a key for this provider
    const existingKeys = await db
      .select()
      .from(userApiKeys)
      .where(and(
        eq(userApiKeys.userId, userId),
        eq(userApiKeys.provider, provider)
      ));

    // Store or update the key
    if (existingKeys.length > 0) {
      // Update existing key
      await db
        .update(userApiKeys)
        .set({
          encryptedApiKey: encrypted,
          apiKeyIv: iv,
          keyName: keyName || `Updated ${provider} key`,
          keyType,
          isValid: true,
          lastValidated: new Date(),
          updatedAt: new Date()
        })
        .where(eq(userApiKeys.id, existingKeys[0].id));

      return existingKeys[0].id;
    } else {
      // Create new key
      const newKey = await db.insert(userApiKeys).values({
        userId,
        provider,
        providerName: providerInfo.displayName,
        encryptedApiKey: encrypted,
        apiKeyIv: iv,
        keyName: keyName || `${provider} API Key`,
        keyType,
        isValid: true,
        lastValidated: new Date()
      }).returning();

      return newKey[0].id;
    }
  }

  /**
   * Get user's API key for a provider
   */
  async getUserApiKey(userId: string, provider: string): Promise<string | null> {
    const keys = await db
      .select()
      .from(userApiKeys)
      .where(and(
        eq(userApiKeys.userId, userId),
        eq(userApiKeys.provider, provider),
        eq(userApiKeys.isActive, true)
      ))
      .orderBy(desc(userApiKeys.createdAt))
      .limit(1);

    if (keys.length === 0) {
      return null;
    }

    try {
      return await this.decryptApiKey(keys[0].encryptedApiKey, keys[0].apiKeyIv);
    } catch (error) {
      console.error('Error decrypting API key:', error);
      return null;
    }
  }

  /**
   * Get all user's API keys
   */
  async getUserApiKeys(userId: string) {
    return await db
      .select()
      .from(userApiKeys)
      .where(eq(userApiKeys.userId, userId))
      .orderBy(desc(userApiKeys.createdAt));
  }

  /**
   * Delete user's API key
   */
  async deleteUserApiKey(userId: string, keyId: number): Promise<void> {
    await db
      .delete(userApiKeys)
      .where(and(
        eq(userApiKeys.id, keyId),
        eq(userApiKeys.userId, userId)
      ));
  }

  /**
   * Update API key status
   */
  async updateApiKeyStatus(userId: string, keyId: number, isActive: boolean): Promise<void> {
    await db
      .update(userApiKeys)
      .set({
        isActive,
        updatedAt: new Date()
      })
      .where(and(
        eq(userApiKeys.id, keyId),
        eq(userApiKeys.userId, userId)
      ));
  }

  /**
   * Get user's AI preferences
   */
  async getUserAiPreferences(userId: string) {
    const preferences = await db
      .select()
      .from(userAiPreferences)
      .where(eq(userAiPreferences.userId, userId))
      .limit(1);

    if (preferences.length > 0) {
      return preferences[0];
    }

    // Return default preferences
    return {
      userId,
      defaultProvider: 'openai',
      autoSwitchProvider: false,
      maxTokensPerRequest: 4000,
      maxRequestsPerMinute: 60,
      enableCostOptimization: true,
      preferredCostModel: 'balanced',
      storeConversationHistory: true,
      allowAnalytics: true,
      notifyOnQuotaLow: true,
      quotaWarningThreshold: 80
    };
  }

  /**
   * Update user's AI preferences
   */
  async updateUserAiPreferences(userId: string, preferences: Partial<typeof userAiPreferences.$inferInsert>): Promise<void> {
    await db
      .insert(userAiPreferences)
      .values({ userId, ...preferences })
      .onConflictDoUpdate({
        target: userAiPreferences.userId,
        set: preferences
      });
  }

  /**
   * Track AI usage for cost monitoring
   */
  async trackUsage(
    userId: string,
    provider: string,
    model: string,
    tokensUsed: number,
    tokensInput: number,
    tokensOutput: number,
    responseTime: number,
    requestType: string = 'chat',
    success: boolean = true,
    requestId?: string,
    sessionId?: string
  ): Promise<void> {
    // Calculate estimated cost
    const providerInfo = supportedAiProviders.find(p => p.provider === provider);
    let estimatedCost = '0';

    if (providerInfo?.costPer1kTokens?.[model]) {
      const costInfo = providerInfo.costPer1kTokens[model];
      const inputCost = (tokensInput / 1000) * costInfo.input;
      const outputCost = (tokensOutput / 1000) * costInfo.output;
      estimatedCost = (inputCost + outputCost).toFixed(6);
    }

    await db.insert(aiUsageTracking).values({
      userId,
      provider,
      model,
      endpoint: `/v1/chat/completions`, // Default endpoint
      tokensUsed,
      tokensInput,
      tokensOutput,
      estimatedCost,
      requestType,
      success,
      responseTime,
      requestId,
      sessionId,
      timestamp: new Date()
    });
  }

  /**
   * Get available models for a provider
   */
  getProviderModels(provider: string): ModelInfo[] {
    const providerInfo = supportedAiProviders.find(p => p.provider === provider);
    if (!providerInfo) return [];

    return providerInfo.supportedModels.map(modelId => ({
      id: modelId,
      name: this.getModelDisplayName(modelId),
      provider,
      costPer1kTokens: providerInfo.costPer1kTokens?.[modelId],
      supportsStreaming: providerInfo.provider !== 'anthropic', // Claude doesn't support streaming well
      supportsVision: modelId.includes('vision'),
      supportsFunctionCalling: true // Most modern models support this
    }));
  }

  /**
   * Get model display name
   */
  private getModelDisplayName(modelId: string): string {
    const modelNames: Record<string, string> = {
      'gpt-4': 'GPT-4',
      'gpt-4-turbo': 'GPT-4 Turbo',
      'gpt-3.5-turbo': 'GPT-3.5 Turbo',
      'claude-3-opus': 'Claude 3 Opus',
      'claude-3-sonnet': 'Claude 3 Sonnet',
      'claude-3-haiku': 'Claude 3 Haiku',
      'gemini-pro': 'Gemini Pro',
      'gemini-pro-vision': 'Gemini Pro Vision',
      'grok-1': 'Grok-1',
      'auto': 'Auto (OpenRouter)'
    };

    return modelNames[modelId] || modelId;
  }

  /**
   * Get all supported providers
   */
  getSupportedProviders() {
    return supportedAiProviders.map(provider => ({
      id: provider.provider,
      name: provider.displayName,
      baseUrl: provider.baseUrl,
      models: this.getProviderModels(provider.provider),
      features: {
        streaming: provider.provider !== 'anthropic',
        vision: provider.supportedModels.some(m => m.includes('vision')),
        functionCalling: true
      }
    }));
  }

  /**
   * Get user's current usage for a provider
   */
  async getUserUsage(userId: string, provider?: string) {
    let whereConditions = [eq(aiUsageTracking.userId, userId)];

    if (provider) {
      whereConditions.push(eq(aiUsageTracking.provider, provider));
    }

    // Get current month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usage = await db
      .select({
        totalTokens: db.fn.sum(aiUsageTracking.tokensUsed).as('totalTokens'),
        totalCost: db.fn.sum(aiUsageTracking.estimatedCost).as('totalCost'),
        requestCount: db.fn.count().as('requestCount')
      })
      .from(aiUsageTracking)
      .where(and(
        ...whereConditions,
        db.gte(aiUsageTracking.timestamp, startOfMonth)
      ));

    return {
      totalTokens: Number(usage[0]?.totalTokens) || 0,
      totalCost: parseFloat(usage[0]?.totalCost || '0'),
      requestCount: Number(usage[0]?.requestCount) || 0,
      monthStart: startOfMonth
    };
  }
}
