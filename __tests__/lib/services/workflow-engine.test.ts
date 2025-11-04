import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WorkflowEngine } from '@/lib/services/workflow-engine'
import { db } from '@/lib/db'
import { workflows, workflowSteps, workflowExecutions } from '@/lib/db/schemas'

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock email service
vi.mock('@/lib/services/email-service', () => ({
  sendEmail: vi.fn(),
}))

// Mock webhook service
vi.mock('@/lib/services/webhook-service', () => ({
  WebhookService: {
    deliverEvent: vi.fn(),
  },
}))

describe('WorkflowEngine', () => {
  let workflowEngine: WorkflowEngine
  let mockDb: any

  beforeEach(() => {
    vi.clearAllMocks()
    workflowEngine = new WorkflowEngine()
    mockDb = db as any
  })

  describe('executeWorkflow', () => {
    it('should execute a simple workflow successfully', async () => {
      const workflowId = 'test-workflow-1'
      const mockWorkflow = {
        id: workflowId,
        name: 'Test Workflow',
        description: 'A test workflow',
        isActive: true,
        triggerType: 'manual' as const,
        triggerConfig: {},
        steps: [
          {
            id: 'step-1',
            type: 'email' as const,
            config: {
              to: 'test@example.com',
              subject: 'Test Email',
              body: 'This is a test email',
            },
            order: 1,
          },
        ],
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockWorkflow]),
        }),
      })

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue({ insertId: 'execution-1' }),
      })

      const result = await workflowEngine.executeWorkflow(workflowId, {})

      expect(result.success).toBe(true)
      expect(result.executionId).toBeDefined()
      expect(mockDb.insert).toHaveBeenCalled()
    })

    it('should handle workflow execution errors gracefully', async () => {
      const workflowId = 'test-workflow-2'
      
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      })

      const result = await workflowEngine.executeWorkflow(workflowId, {})

      expect(result.success).toBe(false)
      expect(result.error).toContain('Database error')
    })

    it('should execute workflow steps in correct order', async () => {
      const workflowId = 'test-workflow-3'
      const mockWorkflow = {
        id: workflowId,
        name: 'Sequential Workflow',
        description: 'A workflow with multiple steps',
        isActive: true,
        triggerType: 'manual' as const,
        triggerConfig: {},
        steps: [
          {
            id: 'step-1',
            type: 'email' as const,
            config: { to: 'test1@example.com', subject: 'Step 1' },
            order: 1,
          },
          {
            id: 'step-2',
            type: 'webhook' as const,
            config: { url: 'https://api.example.com/webhook' },
            order: 2,
          },
        ],
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockWorkflow]),
        }),
      })

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockResolvedValue({ insertId: 'execution-1' }),
      })

      const result = await workflowEngine.executeWorkflow(workflowId, {})

      expect(result.success).toBe(true)
      // Verify steps were executed in order
      expect(mockDb.insert).toHaveBeenCalledTimes(2) // Once for execution, once for logs
    })
  })

  describe('testWorkflow', () => {
    it('should perform dry-run execution without side effects', async () => {
      const workflowId = 'test-workflow-4'
      const mockWorkflow = {
        id: workflowId,
        name: 'Test Workflow',
        description: 'A test workflow',
        isActive: true,
        triggerType: 'manual' as const,
        triggerConfig: {},
        steps: [
          {
            id: 'step-1',
            type: 'email' as const,
            config: {
              to: 'test@example.com',
              subject: 'Test Email',
              body: 'This is a test email',
            },
            order: 1,
          },
        ],
      }

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockWorkflow]),
        }),
      })

      const result = await workflowEngine.testWorkflow(workflowId, {})

      expect(result.success).toBe(true)
      expect(result.dryRun).toBe(true)
      // Verify no actual execution was recorded
      expect(mockDb.insert).not.toHaveBeenCalled()
    })
  })

  describe('executeStepsParallel', () => {
    it('should execute steps in parallel when configured', async () => {
      const steps = [
        {
          id: 'step-1',
          type: 'email' as const,
          config: { to: 'test1@example.com', subject: 'Parallel Step 1' },
          order: 1,
        },
        {
          id: 'step-2',
          type: 'email' as const,
          config: { to: 'test2@example.com', subject: 'Parallel Step 2' },
          order: 2,
        },
      ]

      const result = await workflowEngine.executeStepsParallel(steps, {})

      expect(result.length).toBe(2)
      expect(result.every(r => r.success)).toBe(true)
    })
  })

  describe('evaluateCondition', () => {
    it('should evaluate simple conditions correctly', () => {
      const condition = 'amount > 100'
      const variables = { amount: 150 }

      const result = workflowEngine.evaluateCondition(condition, variables)

      expect(result).toBe(true)
    })

    it('should handle complex conditions with multiple variables', () => {
      const condition = 'status === "paid" && amount > 100'
      const variables = { status: 'paid', amount: 150 }

      const result = workflowEngine.evaluateCondition(condition, variables)

      expect(result).toBe(true)
    })

    it('should return false for invalid conditions', () => {
      const condition = 'invalid > syntax'
      const variables = { amount: 150 }

      const result = workflowEngine.evaluateCondition(condition, variables)

      expect(result).toBe(false)
    })
  })

  describe('interpolateVariables', () => {
    it('should replace variables in strings', () => {
      const template = 'Hello {{name}}, your invoice {{invoiceId}} is ready'
      const variables = { name: 'John', invoiceId: 'INV-001' }

      const result = workflowEngine.interpolateVariables(template, variables)

      expect(result).toBe('Hello John, your invoice INV-001 is ready')
    })

    it('should handle missing variables gracefully', () => {
      const template = 'Hello {{name}}, your invoice {{invoiceId}} is ready'
      const variables = { name: 'John' }

      const result = workflowEngine.interpolateVariables(template, variables)

      expect(result).toBe('Hello John, your invoice {{invoiceId}} is ready')
    })
  })
})
