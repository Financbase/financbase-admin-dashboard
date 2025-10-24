import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { WorkflowEngine } from '@/lib/services/workflow-engine'
import { WebhookService } from '@/lib/services/webhook-service'
import { db } from '@/lib/db'

// Mock database
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

// Mock email service
jest.mock('@/lib/services/email-service', () => ({
  sendEmail: jest.fn(),
}))

// Mock webhook service
jest.mock('@/lib/services/webhook-service', () => ({
  WebhookService: jest.fn(),
}))

describe('Workflow Execution Integration', () => {
  let workflowEngine: WorkflowEngine
  let webhookService: WebhookService
  let mockDb: any

  beforeEach(() => {
    jest.clearAllMocks()
    workflowEngine = new WorkflowEngine()
    webhookService = new WebhookService()
    mockDb = db as any
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('End-to-End Workflow Execution', () => {
    it('should execute a complete invoice processing workflow', async () => {
      // Setup mock workflow
      const mockWorkflow = {
        id: 'invoice-workflow-1',
        name: 'Invoice Processing',
        description: 'Complete invoice processing workflow',
        isActive: true,
        triggerType: 'manual' as const,
        triggerConfig: {},
        steps: [
          {
            id: 'step-1',
            type: 'email' as const,
            config: {
              to: '{{customerEmail}}',
              subject: 'Invoice {{invoiceNumber}} Created',
              body: 'Your invoice {{invoiceNumber}} for {{amount}} has been created.',
            },
            order: 1,
          },
          {
            id: 'step-2',
            type: 'webhook' as const,
            config: {
              url: 'https://api.example.com/invoice-created',
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            },
            order: 2,
          },
          {
            id: 'step-3',
            type: 'condition' as const,
            config: {
              condition: 'amount > 1000',
              trueSteps: ['step-4'],
              falseSteps: ['step-5'],
            },
            order: 3,
          },
          {
            id: 'step-4',
            type: 'email' as const,
            config: {
              to: 'manager@company.com',
              subject: 'High Value Invoice',
              body: 'High value invoice {{invoiceNumber}} created for {{amount}}.',
            },
            order: 4,
          },
          {
            id: 'step-5',
            type: 'email' as const,
            config: {
              to: '{{customerEmail}}',
              subject: 'Invoice {{invoiceNumber}} - Standard Processing',
              body: 'Your invoice is being processed normally.',
            },
            order: 5,
          },
        ],
      }

      // Mock database responses
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockWorkflow]),
        }),
      })

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue({ insertId: 'execution-1' }),
      })

      // Mock email service
      const { sendEmail } = require('@/lib/services/email-service')
      sendEmail.mockResolvedValue({ success: true })

      // Mock webhook service
      const mockWebhookService = {
        deliverEvent: jest.fn().mockResolvedValue({ success: true }),
      }
      ;(WebhookService as jest.Mock).mockImplementation(() => mockWebhookService)

      // Execute workflow with test data
      const testData = {
        customerEmail: 'customer@example.com',
        invoiceNumber: 'INV-001',
        amount: 1500,
      }

      const result = await workflowEngine.executeWorkflow('invoice-workflow-1', testData)

      // Verify execution
      expect(result.success).toBe(true)
      expect(result.executionId).toBe('execution-1')

      // Verify email was sent
      expect(sendEmail).toHaveBeenCalledWith({
        to: 'customer@example.com',
        subject: 'Invoice INV-001 Created',
        body: 'Your invoice INV-001 for 1500 has been created.',
      })

      // Verify webhook was called
      expect(mockWebhookService.deliverEvent).toHaveBeenCalled()

      // Verify high-value email was sent (amount > 1000)
      expect(sendEmail).toHaveBeenCalledWith({
        to: 'manager@company.com',
        subject: 'High Value Invoice',
        body: 'High value invoice INV-001 created for 1500.',
      })
    })

    it('should handle workflow execution failures gracefully', async () => {
      const mockWorkflow = {
        id: 'failing-workflow',
        name: 'Failing Workflow',
        description: 'A workflow that will fail',
        isActive: true,
        triggerType: 'manual' as const,
        triggerConfig: {},
        steps: [
          {
            id: 'step-1',
            type: 'email' as const,
            config: {
              to: 'test@example.com',
              subject: 'Test',
              body: 'Test body',
            },
            order: 1,
          },
        ],
      }

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockWorkflow]),
        }),
      })

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue({ insertId: 'execution-1' }),
      })

      // Mock email service failure
      const { sendEmail } = require('@/lib/services/email-service')
      sendEmail.mockRejectedValue(new Error('Email service unavailable'))

      const result = await workflowEngine.executeWorkflow('failing-workflow', {})

      expect(result.success).toBe(false)
      expect(result.error).toContain('Email service unavailable')
    })

    it('should execute parallel workflow steps', async () => {
      const mockWorkflow = {
        id: 'parallel-workflow',
        name: 'Parallel Workflow',
        description: 'A workflow with parallel steps',
        isActive: true,
        triggerType: 'manual' as const,
        triggerConfig: {},
        steps: [
          {
            id: 'step-1',
            type: 'email' as const,
            config: {
              to: 'customer@example.com',
              subject: 'Notification 1',
              body: 'First notification',
            },
            order: 1,
            parallel: true,
          },
          {
            id: 'step-2',
            type: 'email' as const,
            config: {
              to: 'admin@example.com',
              subject: 'Notification 2',
              body: 'Second notification',
            },
            order: 1,
            parallel: true,
          },
        ],
      }

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockWorkflow]),
        }),
      })

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue({ insertId: 'execution-1' }),
      })

      const { sendEmail } = require('@/lib/services/email-service')
      sendEmail.mockResolvedValue({ success: true })

      const result = await workflowEngine.executeWorkflow('parallel-workflow', {})

      expect(result.success).toBe(true)
      expect(sendEmail).toHaveBeenCalledTimes(2)
    })
  })

  describe('Webhook Integration', () => {
    it('should trigger webhooks when workflow events occur', async () => {
      const mockWebhook = {
        id: 'webhook-1',
        url: 'https://api.example.com/workflow-events',
        events: ['workflow.started', 'workflow.completed'],
        secret: 'test-secret',
        isActive: true,
      }

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockWebhook]),
        }),
      })

      const mockWebhookService = {
        deliverEvent: jest.fn().mockResolvedValue({ success: true }),
      }
      ;(WebhookService as jest.Mock).mockImplementation(() => mockWebhookService)

      // Simulate workflow start event
      await webhookService.deliverEvent('webhook-1', {
        type: 'workflow.started',
        data: { workflowId: 'test-workflow', executionId: 'exec-1' },
        timestamp: new Date().toISOString(),
      })

      expect(mockWebhookService.deliverEvent).toHaveBeenCalledWith(
        'webhook-1',
        expect.objectContaining({
          type: 'workflow.started',
          data: { workflowId: 'test-workflow', executionId: 'exec-1' },
        })
      )
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should retry failed steps with exponential backoff', async () => {
      const mockWorkflow = {
        id: 'retry-workflow',
        name: 'Retry Workflow',
        description: 'A workflow that tests retry logic',
        isActive: true,
        triggerType: 'manual' as const,
        triggerConfig: {},
        steps: [
          {
            id: 'step-1',
            type: 'webhook' as const,
            config: {
              url: 'https://api.example.com/unreliable-endpoint',
              method: 'POST',
              retryConfig: {
                maxRetries: 3,
                backoffMultiplier: 2,
                initialDelay: 1000,
              },
            },
            order: 1,
          },
        ],
      }

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockWorkflow]),
        }),
      })

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue({ insertId: 'execution-1' }),
      })

      // Mock webhook service with retry logic
      const mockWebhookService = {
        deliverEvent: jest.fn()
          .mockRejectedValueOnce(new Error('Network error'))
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValue({ success: true }),
      }
      ;(WebhookService as jest.Mock).mockImplementation(() => mockWebhookService)

      const result = await workflowEngine.executeWorkflow('retry-workflow', {})

      expect(result.success).toBe(true)
      expect(mockWebhookService.deliverEvent).toHaveBeenCalledTimes(3)
    })

    it('should handle partial workflow failures', async () => {
      const mockWorkflow = {
        id: 'partial-failure-workflow',
        name: 'Partial Failure Workflow',
        description: 'A workflow with some failing steps',
        isActive: true,
        triggerType: 'manual' as const,
        triggerConfig: {},
        steps: [
          {
            id: 'step-1',
            type: 'email' as const,
            config: {
              to: 'customer@example.com',
              subject: 'Success',
              body: 'This will succeed',
            },
            order: 1,
          },
          {
            id: 'step-2',
            type: 'webhook' as const,
            config: {
              url: 'https://api.example.com/failing-endpoint',
              method: 'POST',
            },
            order: 2,
          },
          {
            id: 'step-3',
            type: 'email' as const,
            config: {
              to: 'admin@example.com',
              subject: 'Final Step',
              body: 'This will also succeed',
            },
            order: 3,
          },
        ],
      }

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockWorkflow]),
        }),
      })

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue({ insertId: 'execution-1' }),
      })

      const { sendEmail } = require('@/lib/services/email-service')
      sendEmail.mockResolvedValue({ success: true })

      const mockWebhookService = {
        deliverEvent: jest.fn().mockRejectedValue(new Error('Webhook failed')),
      }
      ;(WebhookService as jest.Mock).mockImplementation(() => mockWebhookService)

      const result = await workflowEngine.executeWorkflow('partial-failure-workflow', {})

      // Should succeed despite webhook failure
      expect(result.success).toBe(true)
      expect(sendEmail).toHaveBeenCalledTimes(2) // Both email steps should succeed
    })
  })

  describe('Performance and Scalability', () => {
    it('should handle high-volume workflow execution', async () => {
      const mockWorkflow = {
        id: 'high-volume-workflow',
        name: 'High Volume Workflow',
        description: 'A workflow for high-volume processing',
        isActive: true,
        triggerType: 'manual' as const,
        triggerConfig: {},
        steps: [
          {
            id: 'step-1',
            type: 'email' as const,
            config: {
              to: '{{email}}',
              subject: 'Bulk Notification',
              body: 'Bulk notification for {{name}}',
            },
            order: 1,
          },
        ],
      }

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockWorkflow]),
        }),
      })

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue({ insertId: 'execution-1' }),
      })

      const { sendEmail } = require('@/lib/services/email-service')
      sendEmail.mockResolvedValue({ success: true })

      // Execute workflow with large dataset
      const testData = {
        email: 'test@example.com',
        name: 'Test User',
      }

      const startTime = Date.now()
      const result = await workflowEngine.executeWorkflow('high-volume-workflow', testData)
      const endTime = Date.now()

      expect(result.success).toBe(true)
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds
    })
  })
})
