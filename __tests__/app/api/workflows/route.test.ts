import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/workflows/route'
import { db } from '@/lib/db'

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock authentication
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'user-123' }),
}))

describe('/api/workflows', () => {
  let mockDb: {
    select: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = db as {
      select: ReturnType<typeof vi.fn>;
      insert: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    }
  })

  describe('GET /api/workflows', () => {
    it('should return list of workflows for authenticated user', async () => {
      const mockWorkflows = [
        {
          id: 'workflow-1',
          name: 'Invoice Reminder',
          description: 'Send reminder emails for overdue invoices',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'workflow-2',
          name: 'Payment Confirmation',
          description: 'Send confirmation emails for received payments',
          isActive: false,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ]

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue(mockWorkflows),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/workflows')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toEqual(mockWorkflows)
    })

    it('should handle database errors gracefully', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockRejectedValue(new Error('Database error')),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/workflows')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      // ApiErrorHandler returns { error: {...} } format, not { success: false }
      expect(data).toHaveProperty('error')
      expect(data.error).toHaveProperty('message')
      expect(data.error.message).toContain('Database error')
    })

    it('should filter workflows by status', async () => {
      const mockWorkflows = [
        {
          id: 'workflow-1',
          name: 'Active Workflow',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockWorkflows),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/workflows?status=active')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toEqual(mockWorkflows)
    })
  })

  describe('POST /api/workflows', () => {
    it('should create a new workflow successfully', async () => {
      const workflowData = {
        name: 'Test Workflow',
        description: 'A test workflow',
        organizationId: null,
        triggerConfig: { type: 'manual', config: {} },
        actions: [
          {
            id: 'action-1',
            type: 'send_email',
            config: {
              to: 'test@example.com',
              subject: 'Test',
              body: 'Test body',
            },
          },
        ],
        conditions: null,
        status: 'draft',
        metadata: null,
      }

      const mockWorkflow = {
        id: 1,
        userId: 'user-123',
        name: workflowData.name,
        description: workflowData.description,
        category: workflowData.category,
        type: 'sequential',
        status: 'draft',
        isActive: false,
        steps: [],
        triggers: [],
        variables: {},
        settings: {},
        executionCount: 0,
        successCount: 0,
        failureCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockWorkflow]),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')
      expect(data.name).toBe(workflowData.name)
    })

    it('should validate required fields', async () => {
      const invalidWorkflowData = {
        // Missing required fields
        description: 'A test workflow',
      }

      const request = new NextRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidWorkflowData),
      })

      const response = await POST(request)
      
      expect(response.status).toBe(400)
      // ApiErrorHandler returns error object
      if (response.status === 400) {
        const data = await response.json()
        expect(data).toHaveProperty('error')
      }
    })

    it('should validate workflow name length', async () => {
      const workflowData = {
        name: '', // Empty name
        description: 'A test workflow',
        triggerType: 'manual',
        triggerConfig: {},
        steps: [],
      }

      const request = new NextRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData),
      })

      const response = await POST(request)
      
      expect(response.status).toBe(400)
      if (response.status === 400) {
        const data = await response.json()
        expect(data).toHaveProperty('error')
      }
    })

    it('should validate trigger configuration', async () => {
      const workflowData = {
        name: 'Test Workflow',
        description: 'A test workflow',
        triggerType: 'schedule',
        triggerConfig: {}, // Missing required schedule config
        steps: [],
      }

      const request = new NextRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData),
      })

      const response = await POST(request)
      
      expect(response.status).toBe(400)
      if (response.status === 400) {
        const data = await response.json()
        expect(data).toHaveProperty('error')
      }
    })

    it('should handle database insertion errors', async () => {
      const workflowData = {
        name: 'Test Workflow',
        description: 'A test workflow',
        organizationId: null,
        triggerConfig: { type: 'manual', config: {} },
        actions: [
          {
            id: 'action-1',
            type: 'send_email',
            config: {
              to: 'test@example.com',
              subject: 'Test',
              body: 'Test body',
            },
          },
        ],
        conditions: null,
        status: 'draft',
        metadata: null,
      }

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockRejectedValue(new Error('Database error')),
      })

      const request = new NextRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData),
      })

      const response = await POST(request)
      
      expect(response.status).toBe(500)
      if (response.status === 500) {
        const data = await response.json()
        expect(data).toHaveProperty('error')
      }
    })

    it('should validate workflow steps', async () => {
      const workflowData = {
        name: 'Test Workflow',
        description: 'A test workflow',
        triggerType: 'manual',
        triggerConfig: {},
        steps: [
          {
            id: 'step-1',
            type: 'email',
            config: {
              to: 'invalid-email', // Invalid email format
              subject: 'Test',
              body: 'Test body',
            },
            order: 1,
          },
        ],
      }

      const request = new NextRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData),
      })

      const response = await POST(request)
      
      expect(response.status).toBe(400)
      if (response.status === 400) {
        const data = await response.json()
        expect(data).toHaveProperty('error')
      }
    })
  })
})
