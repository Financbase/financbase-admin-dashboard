/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WorkflowService } from '@/lib/services/workflow-service'
import { db } from '@/lib/db'
import { workflows, workflowExecutions, workflowTemplates } from '@/lib/db/schemas'

// Unmock workflow service to test actual implementation
vi.unmock('@/lib/services/workflow-service')

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: {
      workflows: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
  },
}))

describe('Workflow Service', () => {
  let mockDb: any

  // Helper to create a thenable query builder
  const createThenableQuery = (result: any[]) => {
    const query: any = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
    }
    query.then = vi.fn((onResolve?: (value: any[]) => any) => {
      const promise = Promise.resolve(result)
      return onResolve ? promise.then(onResolve) : promise
    })
    query.catch = vi.fn((onReject?: (error: any) => any) => {
      const promise = Promise.resolve(result)
      return onReject ? promise.catch(onReject) : promise
    })
    Object.defineProperty(query, Symbol.toStringTag, { value: 'Promise' })
    return query
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = db as any
    mockDb.select.mockReturnValue(createThenableQuery([]))
  })

  describe('getWorkflows', () => {
    it('should retrieve all workflows for a user', async () => {
      const mockWorkflows = [
        { id: 1, userId: 'user-123', name: 'Workflow 1', status: 'active' },
        { id: 2, userId: 'user-123', name: 'Workflow 2', status: 'draft' },
      ]

      mockDb.select.mockImplementationOnce(() => createThenableQuery(mockWorkflows))

      const result = await WorkflowService.getWorkflows('user-123')

      expect(result).toEqual(mockWorkflows)
      expect(mockDb.select).toHaveBeenCalled()
    })

    it('should filter workflows by organization', async () => {
      const mockWorkflows = [
        { id: 1, userId: 'user-123', organizationId: 'org-123', name: 'Workflow 1' },
      ]

      mockDb.select.mockImplementationOnce(() => createThenableQuery(mockWorkflows))

      const result = await WorkflowService.getWorkflows('user-123', {
        organizationId: 'org-123',
      })

      expect(result).toEqual(mockWorkflows)
    })

    it('should filter workflows by status', async () => {
      const mockWorkflows = [
        { id: 1, userId: 'user-123', status: 'active', name: 'Active Workflow' },
      ]

      mockDb.select.mockImplementationOnce(() => createThenableQuery(mockWorkflows))

      const result = await WorkflowService.getWorkflows('user-123', {
        status: 'active',
      })

      expect(result).toEqual(mockWorkflows)
    })

    it('should search workflows by name or description', async () => {
      const mockWorkflows = [
        { id: 1, userId: 'user-123', name: 'Invoice Workflow', description: 'Handles invoices' },
      ]

      mockDb.select.mockImplementationOnce(() => createThenableQuery(mockWorkflows))

      const result = await WorkflowService.getWorkflows('user-123', {
        search: 'Invoice',
      })

      expect(result).toEqual(mockWorkflows)
    })

    it('should support pagination', async () => {
      const mockWorkflows = [
        { id: 1, userId: 'user-123', name: 'Workflow 1' },
        { id: 2, userId: 'user-123', name: 'Workflow 2' },
      ]

      mockDb.select.mockImplementationOnce(() => createThenableQuery(mockWorkflows))

      const result = await WorkflowService.getWorkflows('user-123', {
        limit: 10,
        offset: 0,
      })

      expect(result).toEqual(mockWorkflows)
    })
  })

  describe('getWorkflow', () => {
    it('should retrieve workflow by ID', async () => {
      const mockWorkflow = {
        id: 1,
        userId: 'user-123',
        name: 'Test Workflow',
        status: 'active',
      }

      mockDb.select.mockImplementationOnce(() => createThenableQuery([mockWorkflow]))

      const result = await WorkflowService.getWorkflow(1, 'user-123')

      expect(result).toEqual(mockWorkflow)
    })

    it('should return null if workflow not found', async () => {
      mockDb.select.mockImplementationOnce(() => createThenableQuery([]))

      const result = await WorkflowService.getWorkflow(999, 'user-123')

      expect(result).toBeNull()
    })

    it('should only return workflows for the specified user', async () => {
      mockDb.select.mockImplementationOnce(() => createThenableQuery([]))

      const result = await WorkflowService.getWorkflow(1, 'user-123')

      expect(result).toBeNull()
      expect(mockDb.select).toHaveBeenCalled()
    })
  })

  describe('createWorkflow', () => {
    it('should create a new workflow', async () => {
      const workflowData = {
        name: 'New Workflow',
        description: 'Test workflow',
        triggerConfig: {
          type: 'event' as const,
          config: { eventType: 'invoice.created' },
        },
        actions: [
          {
            id: 'action-1',
            type: 'send_email' as const,
            config: { template: 'invoice-notification' },
          },
        ],
        status: 'draft' as const,
      }

      const mockWorkflow = {
        id: 1,
        userId: 'user-123',
        ...workflowData,
        createdAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockWorkflow]),
        }),
      })

      const result = await WorkflowService.createWorkflow('user-123', workflowData)

      expect(result).toEqual(mockWorkflow)
      expect(mockDb.insert).toHaveBeenCalled()
    })

    it('should create workflow with default status if not provided', async () => {
      const workflowData = {
        name: 'New Workflow',
        triggerConfig: {
          type: 'event' as const,
          config: { eventType: 'invoice.created' },
        },
        actions: [
          {
            id: 'action-1',
            type: 'send_email' as const,
            config: {},
          },
        ],
      }

      const mockWorkflow = {
        id: 1,
        userId: 'user-123',
        ...workflowData,
        status: 'draft', // Default status
        createdAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockWorkflow]),
        }),
      })

      const result = await WorkflowService.createWorkflow('user-123', workflowData)

      expect(result.status).toBe('draft')
    })

    it('should create workflow with conditions', async () => {
      const workflowData = {
        name: 'Conditional Workflow',
        triggerConfig: {
          type: 'event' as const,
          config: { eventType: 'invoice.created' },
        },
        actions: [
          {
            id: 'action-1',
            type: 'send_email' as const,
            config: {},
          },
        ],
        conditions: [
          {
            field: 'amount',
            operator: 'greater_than' as const,
            value: 1000,
          },
        ],
      }

      const mockWorkflow = {
        id: 1,
        userId: 'user-123',
        ...workflowData,
        status: 'draft',
        createdAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockWorkflow]),
        }),
      })

      const result = await WorkflowService.createWorkflow('user-123', workflowData)

      expect(result.conditions).toEqual(workflowData.conditions)
    })
  })

  describe('updateWorkflow', () => {
    it('should update workflow successfully', async () => {
      const updateData = {
        name: 'Updated Workflow Name',
        status: 'active' as const,
      }

      const mockUpdatedWorkflow = {
        id: 1,
        userId: 'user-123',
        ...updateData,
        updatedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedWorkflow]),
          }),
        }),
      })

      const result = await WorkflowService.updateWorkflow(1, 'user-123', updateData)

      expect(result).toEqual(mockUpdatedWorkflow)
      expect(result.name).toBe('Updated Workflow Name')
    })

    it('should return null if workflow not found', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await WorkflowService.updateWorkflow(999, 'user-123', {
        name: 'Updated',
      })

      expect(result).toBeNull()
    })

    it('should update workflow actions', async () => {
      const updateData = {
        actions: [
          {
            id: 'action-1',
            type: 'send_email' as const,
            config: { template: 'updated-template' },
          },
        ],
      }

      const mockUpdatedWorkflow = {
        id: 1,
        userId: 'user-123',
        ...updateData,
        updatedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedWorkflow]),
          }),
        }),
      })

      const result = await WorkflowService.updateWorkflow(1, 'user-123', updateData)

      expect(result?.actions).toEqual(updateData.actions)
    })
  })

  describe('deleteWorkflow', () => {
    it('should delete workflow successfully', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 1 }]), // Returns deleted workflow
        }),
      })

      const result = await WorkflowService.deleteWorkflow(1, 'user-123')

      expect(result).toBe(true)
      expect(mockDb.delete).toHaveBeenCalled()
    })

    it('should return false if workflow not found', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]), // No workflow deleted
        }),
      })

      const result = await WorkflowService.deleteWorkflow(999, 'user-123')

      expect(result).toBe(false)
    })
  })

  describe('getWorkflowExecutions', () => {
    it('should retrieve workflow executions', async () => {
      const mockExecutions = [
        { id: 1, workflowId: 1, userId: 'user-123', status: 'completed' },
        { id: 2, workflowId: 1, userId: 'user-123', status: 'failed' },
      ]

      mockDb.select.mockImplementationOnce(() => createThenableQuery(mockExecutions))

      const result = await WorkflowService.getWorkflowExecutions(1, 'user-123')

      expect(result).toEqual(mockExecutions)
    })

    it('should filter executions by status', async () => {
      const mockExecutions = [
        { id: 1, workflowId: 1, userId: 'user-123', status: 'completed' },
      ]

      mockDb.select.mockImplementationOnce(() => createThenableQuery(mockExecutions))

      const result = await WorkflowService.getWorkflowExecutions(1, 'user-123', {
        status: 'completed',
      })

      expect(result).toEqual(mockExecutions)
    })
  })

  describe('createWorkflowExecution', () => {
    it('should create workflow execution record', async () => {
      const executionData = {
        triggeredBy: 'user' as const,
        triggerData: { invoiceId: 'inv-123' },
        status: 'pending' as const,
      }

      const mockExecution = {
        id: 1,
        workflowId: 1,
        userId: 'user-123',
        ...executionData,
        createdAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockExecution]),
        }),
      })

      const result = await WorkflowService.createWorkflowExecution(1, 'user-123', executionData)

      expect(result).toEqual(mockExecution)
      expect(mockDb.insert).toHaveBeenCalled()
    })
  })

  describe('updateWorkflowExecution', () => {
    it('should update workflow execution status', async () => {
      const updateData = {
        status: 'completed' as const,
        results: { output: 'Success' },
      }

      const mockUpdatedExecution = {
        id: 1,
        workflowId: 1,
        userId: 'user-123',
        ...updateData,
        completedAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedExecution]),
          }),
        }),
      })

      const result = await WorkflowService.updateWorkflowExecution(1, 'user-123', updateData)

      expect(result).toEqual(mockUpdatedExecution)
      expect(result?.status).toBe('completed')
    })

    it('should return null if execution not found', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await WorkflowService.updateWorkflowExecution(999, 'user-123', {
        status: 'completed',
      })

      expect(result).toBeNull()
    })
  })
})

