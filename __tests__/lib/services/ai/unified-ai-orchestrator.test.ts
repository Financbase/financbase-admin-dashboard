/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UnifiedAIOrchestrator, AIProvider, AICapability } from '@/lib/services/ai/unified-ai-orchestrator'
import { db } from '@/lib/db'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}))

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: vi.fn(),
        },
      }
    },
  }
})

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: vi.fn(),
      }
    },
  }
})

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class MockGoogleGenerativeAI {
      getGenerativeModel = vi.fn(() => ({
        generateContent: vi.fn(),
      }))
    },
  }
})

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

// Unmock unified AI orchestrator to test actual implementation
vi.unmock('@/lib/services/ai/unified-ai-orchestrator')

describe('UnifiedAIOrchestrator', () => {
  let orchestrator: UnifiedAIOrchestrator
  let mockDb: any
  let mockOpenAI: any
  let mockClaude: any
  let mockGoogle: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = db as any
    orchestrator = new UnifiedAIOrchestrator()
    mockOpenAI = (orchestrator as any).openai
    mockClaude = (orchestrator as any).claude
    mockGoogle = (orchestrator as any).google
  })

  describe('categorizeTransaction', () => {
    it('should categorize transaction with rule-based categorization', async () => {
      // Mock rule-based categorization to return high confidence result
      const mockRuleResult = {
        category: 'office_supplies',
        subcategory: 'stationery',
        confidence: 0.95,
        explanation: {
          reasoning: 'Matched rule pattern',
          evidence: [],
          confidence: 0.95,
          sources: [],
          timestamp: new Date(),
          model: 'rule-engine',
          provider: AIProvider.OPENAI,
        },
        rules: [],
        metadata: {
          processingTime: 0,
          model: 'rule-engine',
          provider: AIProvider.OPENAI,
          version: '1.0',
        },
      }

      // Mock applyRuleBasedCategorization to return high confidence
      vi.spyOn(orchestrator as any, 'applyRuleBasedCategorization').mockResolvedValue(mockRuleResult)

      const transactionData = {
        description: 'Office Depot Purchase',
        amount: 50,
        date: new Date(),
      }

      const result = await orchestrator.categorizeTransaction('user-123', transactionData)

      expect(result).toBeDefined()
      expect(result.category).toBe('office_supplies')
      expect(result.confidence).toBeGreaterThan(0.9)
    })

    it('should fallback to AI categorization when rules fail', async () => {
      // Mock rule-based categorization to return null (no match)
      vi.spyOn(orchestrator as any, 'applyRuleBasedCategorization').mockResolvedValue(null)

      // Mock getUserCategorizationHistory
      vi.spyOn(orchestrator as any, 'getUserCategorizationHistory').mockResolvedValue([])

      // Mock selectProvider
      vi.spyOn(orchestrator as any, 'selectProvider').mockReturnValue(AIProvider.OPENAI)

      // Mock performAICategorization
      const mockAIResult = {
        category: 'marketing',
        subcategory: 'advertising',
        confidence: 0.85,
        explanation: {
          reasoning: 'AI analysis',
          evidence: [],
          confidence: 0.85,
          sources: [],
          timestamp: new Date(),
          model: 'gpt-4',
          provider: AIProvider.OPENAI,
        },
        rules: [],
        metadata: {
          processingTime: 100,
          model: 'gpt-4',
          provider: AIProvider.OPENAI,
          version: '1.0',
        },
      }

      vi.spyOn(orchestrator as any, 'performAICategorization').mockResolvedValue(mockAIResult)
      vi.spyOn(orchestrator as any, 'storeCategorizationAttempt').mockResolvedValue(undefined)
      vi.spyOn(orchestrator as any, 'enhanceWithExplanation').mockReturnValue(mockAIResult)

      const transactionData = {
        description: 'Google Ads Payment',
        amount: 500,
        date: new Date(),
      }

      const result = await orchestrator.categorizeTransaction('user-123', transactionData)

      expect(result).toBeDefined()
      expect(result.category).toBe('marketing')
    })

    it('should use fallback categorization on error', async () => {
      vi.spyOn(orchestrator as any, 'applyRuleBasedCategorization').mockRejectedValue(
        new Error('Rule engine error')
      )

      vi.spyOn(orchestrator as any, 'fallbackCategorization').mockReturnValue({
        category: 'other',
        confidence: 0.5,
        explanation: {
          reasoning: 'Fallback categorization',
          evidence: [],
          confidence: 0.5,
          sources: [],
          timestamp: new Date(),
          model: 'fallback',
          provider: AIProvider.OPENAI,
        },
        rules: [],
        metadata: {
          processingTime: 0,
          model: 'fallback',
          provider: AIProvider.OPENAI,
          version: '1.0',
        },
      })

      const transactionData = {
        description: 'Unknown Transaction',
        amount: 100,
        date: new Date(),
      }

      const result = await orchestrator.categorizeTransaction('user-123', transactionData)

      expect(result).toBeDefined()
      expect(result.category).toBe('other')
    })
  })

  describe('generateExplainableInsights', () => {
    it('should generate explainable insights', async () => {
      vi.spyOn(orchestrator as any, 'selectProvider').mockReturnValue(AIProvider.CLAUDE)
      vi.spyOn(orchestrator as any, 'gatherFinancialData').mockResolvedValue({
        revenue: 10000,
        expenses: 5000,
        cashflow: 5000,
        profitability: 0.5,
      })

      const mockInsights = {
        insights: [
          {
            title: 'Revenue Growth',
            description: 'Revenue increased by 20%',
            impact: 'high' as const,
            explanation: {
              reasoning: 'Strong revenue growth',
              evidence: ['Revenue data'],
              confidence: 0.9,
              sources: [],
              timestamp: new Date(),
              model: 'claude-3',
              provider: AIProvider.CLAUDE,
            },
          },
        ],
        confidence: 0.9,
      }

      vi.spyOn(orchestrator as any, 'performAIInsights').mockResolvedValue(mockInsights)

      const result = await orchestrator.generateExplainableInsights(
        'user-123',
        'revenue',
        {
          start: new Date('2025-01-01'),
          end: new Date('2025-01-31'),
        }
      )

      expect(result).toBeDefined()
      expect(result.insights).toBeDefined()
      expect(result.insights.length).toBeGreaterThan(0)
      expect(result.confidence).toBe(0.9)
    })

    it('should return fallback insights on error', async () => {
      vi.spyOn(orchestrator as any, 'selectProvider').mockReturnValue(AIProvider.CLAUDE)
      vi.spyOn(orchestrator as any, 'gatherFinancialData').mockRejectedValue(
        new Error('Data gathering failed')
      )

      vi.spyOn(orchestrator as any, 'getFallbackInsights').mockReturnValue({
        insights: [
          {
            title: 'Default Insight',
            description: 'Unable to generate insights',
            impact: 'low' as const,
            explanation: {
              reasoning: 'Fallback',
              evidence: [],
              confidence: 0.5,
              sources: [],
              timestamp: new Date(),
              model: 'fallback',
              provider: AIProvider.OPENAI,
            },
          },
        ],
        confidence: 0.5,
      })

      const result = await orchestrator.generateExplainableInsights(
        'user-123',
        'expenses',
        {
          start: new Date('2025-01-01'),
          end: new Date('2025-01-31'),
        }
      )

      expect(result).toBeDefined()
      expect(result.insights.length).toBeGreaterThan(0)
    })
  })

  describe('processFeedback', () => {
    it('should process user feedback', async () => {
      const feedback = {
        userId: 'user-123',
        transactionId: 'trans-1',
        originalPrediction: 'office_supplies',
        userCorrection: 'marketing',
        reasoning: 'User knows better',
        confidence: 0.9,
        accepted: false,
      }

      vi.spyOn(orchestrator as any, 'storeFeedback').mockResolvedValue(undefined)
      vi.spyOn(orchestrator as any, 'improveModelsFromFeedback').mockResolvedValue(undefined)
      vi.spyOn(orchestrator as any, 'updateCategorizationRules').mockResolvedValue(undefined)

      await orchestrator.processFeedback('user-123', feedback)

      expect((orchestrator as any).storeFeedback).toHaveBeenCalled()
      expect((orchestrator as any).improveModelsFromFeedback).toHaveBeenCalled()
    })

    it('should update categorization rules when transaction ID provided', async () => {
      const feedback = {
        userId: 'user-123',
        transactionId: 'trans-1',
        originalPrediction: 'office_supplies',
        userCorrection: 'marketing',
        reasoning: 'User correction',
        confidence: 0.9,
        accepted: false,
      }

      vi.spyOn(orchestrator as any, 'storeFeedback').mockResolvedValue(undefined)
      vi.spyOn(orchestrator as any, 'improveModelsFromFeedback').mockResolvedValue(undefined)
      vi.spyOn(orchestrator as any, 'updateCategorizationRules').mockResolvedValue(undefined)

      await orchestrator.processFeedback('user-123', feedback)

      expect((orchestrator as any).updateCategorizationRules).toHaveBeenCalled()
    })
  })

  describe('getExplanation', () => {
    it('should retrieve explanation for decision', async () => {
      const mockExplanation = {
        reasoning: 'Transaction categorized based on description',
        evidence: ['Keyword matching', 'Amount analysis'],
        confidence: 0.9,
        sources: ['transaction_description'],
        timestamp: new Date(),
        model: 'gpt-4',
        provider: AIProvider.OPENAI,
      }

      vi.spyOn(orchestrator as any, 'retrieveExplanation').mockResolvedValue(mockExplanation)

      const result = await orchestrator.getExplanation('decision-123', AICapability.CATEGORIZATION)

      expect(result).toBeDefined()
      expect(result?.reasoning).toBeDefined()
      expect(result?.confidence).toBe(0.9)
    })

    it('should return null when explanation not found', async () => {
      vi.spyOn(orchestrator as any, 'retrieveExplanation').mockResolvedValue(null)

      const result = await orchestrator.getExplanation('decision-999', AICapability.INSIGHTS)

      expect(result).toBeNull()
    })
  })

  describe('selectProvider', () => {
    it('should select OpenAI for categorization', () => {
      const provider = (orchestrator as any).selectProvider(AICapability.CATEGORIZATION)

      expect([AIProvider.OPENAI, AIProvider.CLAUDE, AIProvider.GOOGLE]).toContain(provider)
    })

    it('should select provider based on capability', () => {
      const provider = (orchestrator as any).selectProvider(AICapability.INSIGHTS)

      expect([AIProvider.OPENAI, AIProvider.CLAUDE]).toContain(provider)
    })
  })

  describe('AI Provider Calls', () => {
    it('should call OpenAI for categorization', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                category: 'office_supplies',
                subcategory: 'stationery',
                confidence: 0.9,
                reasoning: 'Office supply purchase',
                evidence: ['Office Depot'],
                alternatives: [],
                rules: [],
              }),
            },
          },
        ],
      }

      vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(mockResponse as any)

      const result = await (orchestrator as any).callOpenAI('Test prompt')

      expect(result).toBeDefined()
      expect(result.category).toBe('office_supplies')
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalled()
    })

    it('should call Claude for categorization', async () => {
      const mockResponse = {
        content: [
          {
            text: JSON.stringify({
              category: 'marketing',
              subcategory: 'advertising',
              confidence: 0.85,
              reasoning: 'Marketing expense',
              evidence: ['Google Ads'],
              alternatives: [],
              rules: [],
            }),
          },
        ],
      }

      vi.mocked(mockClaude.messages.create).mockResolvedValue(mockResponse as any)

      const result = await (orchestrator as any).callClaude('Test prompt')

      expect(result).toBeDefined()
      expect(result.category).toBe('marketing')
      expect(mockClaude.messages.create).toHaveBeenCalled()
    })

    it('should call Google for categorization', async () => {
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: vi.fn().mockReturnValue(
              JSON.stringify({
                category: 'travel',
                subcategory: 'transportation',
                confidence: 0.8,
                reasoning: 'Travel expense',
                evidence: ['Uber'],
                alternatives: [],
                rules: [],
              })
            ),
          },
        }),
      }

      vi.mocked(mockGoogle.getGenerativeModel).mockReturnValue(mockModel as any)

      const result = await (orchestrator as any).callGoogle('Test prompt')

      expect(result).toBeDefined()
      expect(result.category).toBe('travel')
    })
  })

  describe('Rule-based Categorization', () => {
    it('should test rule against transaction data', () => {
      const rule = {
        id: 'rule-1',
        pattern: 'Office.*',
        category: 'office_supplies',
        confidence: 0.9,
        usage: 0,
        accuracy: 0.95,
        createdBy: 'user' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const transactionData = {
        description: 'Office Depot Purchase',
        amount: 50,
        date: new Date(),
      }

      const result = (orchestrator as any).testRule(rule, transactionData)

      expect(result).toBe(true)
    })

    it('should return false when rule does not match', () => {
      const rule = {
        id: 'rule-1',
        pattern: 'Restaurant.*',
        category: 'meals',
        confidence: 0.9,
        usage: 0,
        accuracy: 0.95,
        createdBy: 'user' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const transactionData = {
        description: 'Office Depot Purchase',
        amount: 50,
        date: new Date(),
      }

      const result = (orchestrator as any).testRule(rule, transactionData)

      expect(result).toBe(false)
    })
  })

  describe('Evidence Generation', () => {
    it('should generate evidence for categorization', () => {
      const transactionData = {
        description: 'Office Depot Purchase',
        amount: 1500,
        date: new Date(),
      }

      const result = {
        category: 'office_supplies',
        confidence: 0.9,
        explanation: {
          reasoning: 'Office supply purchase',
          evidence: [],
          confidence: 0.9,
          sources: [],
          timestamp: new Date(),
          model: 'gpt-4',
          provider: AIProvider.OPENAI,
        },
      }

      const evidence = (orchestrator as any).generateEvidence(transactionData, result)

      expect(evidence).toBeDefined()
      expect(Array.isArray(evidence)).toBe(true)
      expect(evidence.length).toBeGreaterThan(0)
    })

    it('should include high amount evidence for large transactions', () => {
      const transactionData = {
        description: 'Large Purchase',
        amount: 5000,
        date: new Date(),
      }

      const result = {
        category: 'equipment',
        confidence: 0.9,
        explanation: {
          reasoning: 'Equipment purchase',
          evidence: [],
          confidence: 0.9,
          sources: [],
          timestamp: new Date(),
          model: 'gpt-4',
          provider: AIProvider.OPENAI,
        },
      }

      const evidence = (orchestrator as any).generateEvidence(transactionData, result)

      expect(evidence.some((e: string) => e.includes('High amount'))).toBe(true)
    })
  })

  describe('Fallback Categorization', () => {
    it('should return fallback categorization', () => {
      const transactionData = {
        description: 'Unknown Transaction',
        amount: 100,
        date: new Date(),
      }

      const result = (orchestrator as any).fallbackCategorization(transactionData)

      expect(result).toBeDefined()
      expect(result.category).toBe('other')
      expect(result.confidence).toBe(0.5)
      expect(result.explanation.reasoning).toContain('Fallback')
    })
  })
})

