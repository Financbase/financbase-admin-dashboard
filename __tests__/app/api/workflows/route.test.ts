import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/workflows/route'
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

// Mock authentication
jest.mock('@clerk/nextjs/server', () => ({
  auth: () => Promise.resolve({ userId: 'user-123' }),
}))

describe('/api/workflows', () => {
  let mockDb: {
    select: jest.MockedFunction<any>;
    insert: jest.MockedFunction<any>;
    update: jest.MockedFunction<any>;
    delete: jest.MockedFunction<any>;
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb = db as {
      select: jest.MockedFunction<any>;
      insert: jest.MockedFunction<any>;
      update: jest.MockedFunction<any>;
      delete: jest.MockedFunction<any>;
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
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue(mockWorkflows),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/workflows')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.workflows).toEqual(mockWorkflows)
    })

    it('should handle database errors gracefully', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockRejectedValue(new Error('Database error')),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/workflows')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Database error')
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
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockWorkflows),
          }),
        }),
      })

      const request = new NextRequest('http://localhost:3000/api/workflows?status=active')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.workflows).toEqual(mockWorkflows)
    })
  })

  describe('POST /api/workflows', () => {
    it('should create a new workflow successfully', async () => {
      const workflowData = {
        name: 'Test Workflow',
        description: 'A test workflow',
        triggerType: 'manual',
        triggerConfig: {},
        steps: [],
      }

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue({ insertId: 'workflow-1' }),
      })

      const request = new NextRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.workflowId).toBe('workflow-1')
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
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Missing required fields')
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
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Workflow name must be between 1 and 100 characters')
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
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid trigger configuration')
    })

    it('should handle database insertion errors', async () => {
      const workflowData = {
        name: 'Test Workflow',
        description: 'A test workflow',
        triggerType: 'manual',
        triggerConfig: {},
        steps: [],
      }

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockRejectedValue(new Error('Database error')),
      })

      const request = new NextRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Database error')
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
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid step configuration')
    })
  })
})
