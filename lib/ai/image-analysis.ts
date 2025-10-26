import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Anthropic } from '@anthropic-ai/sdk';

// AI Provider types
export type AIProvider = 'openai' | 'google' | 'anthropic' | 'claude';

// Image analysis result
export interface ImageAnalysis {
  tags: string[];
  category?: string;
  description?: string;
  confidence: number;
  objects?: string[];
  colors?: string[];
  mood?: string;
  setting?: string;
}

// AI service configuration
export interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  maxRetries?: number;
  timeout?: number;
}

export class AITaggingService {
  private config: AIServiceConfig;
  private openai?: OpenAI;
  private googleAI?: GoogleGenerativeAI;
  private anthropic?: Anthropic;

  constructor(config: AIServiceConfig) {
    this.config = {
      maxRetries: 3,
      timeout: 30000,
      ...config
    };

    this.initializeProvider();
  }

  private initializeProvider() {
    switch (this.config.provider) {
      case 'openai':
        this.openai = new OpenAI({ apiKey: this.config.apiKey });
        break;
      case 'google':
        this.googleAI = new GoogleGenerativeAI(this.config.apiKey);
        break;
      case 'anthropic':
      case 'claude':
        this.anthropic = new Anthropic({ apiKey: this.config.apiKey });
        break;
    }
  }

  async analyzeImage(imageBuffer: Buffer, filename?: string): Promise<ImageAnalysis> {
    const retries = this.config.maxRetries || 3;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        switch (this.config.provider) {
          case 'openai':
            return await this.analyzeWithOpenAI(imageBuffer, filename);
          case 'google':
            return await this.analyzeWithGoogle(imageBuffer, filename);
          case 'anthropic':
          case 'claude':
            return await this.analyzeWithAnthropic(imageBuffer, filename);
          default:
            throw new Error(`Unsupported AI provider: ${this.config.provider}`);
        }
      } catch (error) {
        console.error(`AI analysis attempt ${attempt} failed:`, error);

        if (attempt === retries) {
          // Return fallback analysis if all attempts fail
          return this.getFallbackAnalysis(filename);
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    // This should never be reached, but TypeScript requires it
    return this.getFallbackAnalysis(filename);
  }

  private async analyzeWithOpenAI(imageBuffer: Buffer, filename?: string): Promise<ImageAnalysis> {
    if (!this.openai) throw new Error('OpenAI not initialized');

    const base64Image = imageBuffer.toString('base64');
    const mimeType = this.getMimeType(filename);

    const response = await this.openai.chat.completions.create({
      model: this.config.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: this.getAnalysisPrompt(filename)
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 300,
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    return this.parseAIResponse(content);
  }

  private async analyzeWithGoogle(imageBuffer: Buffer, filename?: string): Promise<ImageAnalysis> {
    if (!this.googleAI) throw new Error('Google AI not initialized');

    const model = this.googleAI.getGenerativeModel({
      model: this.config.model || 'gemini-1.5-flash'
    });

    const base64Image = imageBuffer.toString('base64');
    const mimeType = this.getMimeType(filename);

    const prompt = this.getAnalysisPrompt(filename);

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      }
    ]);

    const response = await result.response;
    const content = response.text();

    if (!content) throw new Error('No response from Google AI');

    return this.parseAIResponse(content);
  }

  private async analyzeWithAnthropic(imageBuffer: Buffer, filename?: string): Promise<ImageAnalysis> {
    if (!this.anthropic) throw new Error('Anthropic not initialized');

    const base64Image = imageBuffer.toString('base64');
    const mimeType = this.getMimeType(filename);

    const response = await this.anthropic.messages.create({
      model: this.config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: this.getAnalysisPrompt(filename)
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: base64Image
              }
            }
          ]
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type from Anthropic');

    return this.parseAIResponse(content.text);
  }

  private getAnalysisPrompt(filename?: string): string {
    const context = filename ? `for file "${filename}"` : '';

    return `Analyze this image ${context} and provide a JSON response with the following structure:
{
  "tags": ["tag1", "tag2", "tag3"],
  "category": "main category (e.g., 'Receipt', 'Invoice', 'Document', 'Meeting', 'Office', 'Personal')",
  "description": "brief description of what's in the image",
  "confidence": 0.95,
  "objects": ["detected objects"],
  "colors": ["dominant colors"],
  "mood": "overall mood or atmosphere",
  "setting": "where the image appears to be taken"
}

Focus on:
- Business/financial context (receipts, invoices, documents, meetings)
- Professional setting indicators
- Document types and categories
- Visual elements that help with organization
- Keep tags concise and relevant (max 10 tags)
- Category should be specific but useful for organization`;
  }

  private parseAIResponse(content: string): ImageAnalysis {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 10) : [],
        category: typeof parsed.category === 'string' ? parsed.category : undefined,
        description: typeof parsed.description === 'string' ? parsed.description : undefined,
        confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5,
        objects: Array.isArray(parsed.objects) ? parsed.objects : [],
        colors: Array.isArray(parsed.colors) ? parsed.colors : [],
        mood: typeof parsed.mood === 'string' ? parsed.mood : undefined,
        setting: typeof parsed.setting === 'string' ? parsed.setting : undefined,
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Invalid JSON response from AI service');
    }
  }

  private getFallbackAnalysis(filename?: string): ImageAnalysis {
    // Extract basic info from filename as fallback
    const fallbackTags: string[] = [];
    const fallbackCategory = this.guessCategoryFromFilename(filename);

    if (filename) {
      const name = filename.toLowerCase();
      if (name.includes('receipt')) {
        fallbackTags.push('receipt', 'expense');
      } else if (name.includes('invoice')) {
        fallbackTags.push('invoice', 'billing');
      } else if (name.includes('document')) {
        fallbackTags.push('document');
      } else if (name.includes('meeting') || name.includes('team')) {
        fallbackTags.push('meeting', 'team');
      }
    }

    return {
      tags: fallbackTags,
      category: fallbackCategory,
      description: filename ? `Image: ${filename}` : 'Unknown image',
      confidence: 0.1,
      objects: [],
      colors: [],
    };
  }

  private guessCategoryFromFilename(filename?: string): string | undefined {
    if (!filename) return undefined;

    const name = filename.toLowerCase();

    if (name.includes('receipt')) return 'Receipts';
    if (name.includes('invoice')) return 'Invoices';
    if (name.includes('document')) return 'Documents';
    if (name.includes('meeting') || name.includes('team')) return 'Meetings';
    if (name.includes('office') || name.includes('workspace')) return 'Workspace';
    if (name.includes('personal') || name.includes('profile')) return 'Personal';

    return 'General';
  }

  private getMimeType(filename?: string): string {
    if (!filename) return 'image/jpeg';

    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'png': return 'image/png';
      case 'gif': return 'image/gif';
      case 'webp': return 'image/webp';
      case 'jpg':
      case 'jpeg':
      default: return 'image/jpeg';
    }
  }

  // Batch analysis for multiple images
  async analyzeBatch(images: { buffer: Buffer; filename?: string }[]): Promise<ImageAnalysis[]> {
    const results: ImageAnalysis[] = [];

    for (const image of images) {
      try {
        const analysis = await this.analyzeImage(image.buffer, image.filename);
        results.push(analysis);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Batch analysis failed for image:', image.filename, error);
        results.push(this.getFallbackAnalysis(image.filename));
      }
    }

    return results;
  }

  // Get available models for the current provider
  getAvailableModels(): string[] {
    switch (this.config.provider) {
      case 'openai':
        return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'];
      case 'google':
        return ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'];
      case 'anthropic':
      case 'claude':
        return ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240307', 'claude-3-haiku-20240307'];
      default:
        return [];
    }
  }
}
