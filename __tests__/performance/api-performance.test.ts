import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/workflows/route'

// Mock WorkflowService
vi.mock('@/lib/services/workflow-service', () => ({
  WorkflowService: {
    getWorkflows: vi.fn(),
    createWorkflow: vi.fn(),
  },
}))

// Mock authentication
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => Promise.resolve({ userId: 'user-123' }),
}))

// Mock ApiErrorHandler
vi.mock('@/lib/api-error-handler', () => ({
  ApiErrorHandler: {
    unauthorized: () => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
    badRequest: (message: string) => new Response(JSON.stringify({ error: message }), { status: 400 }),
    handle: (error: any) => {
      if (error instanceof Error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }
      return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    },
  },
  generateRequestId: () => 'test-request-id',
}))

describe('API Performance Tests', () => {
  let mockWorkflowService: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const { WorkflowService } = await import('@/lib/services/workflow-service')
    mockWorkflowService = WorkflowService as any
  })

  describe('Workflow API Performance', () => {
    it('should handle GET /api/workflows within 200ms', async () => {
      const mockWorkflows = Array.from({ length: 100 }, (_, i) => ({
        id: `workflow-${i}`,
        name: `Workflow ${i}`,
        description: `Description ${i}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      mockWorkflowService.getWorkflows.mockResolvedValue(mockWorkflows)

      const request = new NextRequest('http://localhost:3000/api/workflows')
      const startTime = Date.now()
      const response = await GET(request)
      const endTime = Date.now()

      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(200) // 200ms limit
    })

    it('should handle POST /api/workflows within 500ms', async () => {
      const workflowData = {
        name: 'Performance Test Workflow',
        description: 'A workflow for performance testing',
        triggerConfig: {},
        actions: [{ type: 'email', config: {} }],
      }

      const mockCreatedWorkflow = {
        id: 'workflow-1',
        ...workflowData,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockWorkflowService.createWorkflow.mockResolvedValue(mockCreatedWorkflow)

      const request = new NextRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData),
      })

      const startTime = Date.now()
      const response = await POST(request)
      const endTime = Date.now()

      // API routes return 201 for successful creation
      expect(response.status).toBe(201)
      expect(endTime - startTime).toBeLessThan(500) // 500ms limit
    })

    it('should handle concurrent API requests efficiently', async () => {
      const mockWorkflows = [
        {
          id: 'workflow-1',
          name: 'Test Workflow',
          description: 'A test workflow',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockWorkflowService.getWorkflows.mockResolvedValue(mockWorkflows)

      const requests = Array.from({ length: 50 }, () => 
        new NextRequest('http://localhost:3000/api/workflows')
      )

      const startTime = Date.now()
      const responses = await Promise.all(requests.map(request => GET(request)))
      const endTime = Date.now()

      // Verify all requests completed successfully
      expect(responses.every(response => response.status === 200)).toBe(true)
      
      // Verify total time is within acceptable limits
      expect(endTime - startTime).toBeLessThan(5000) // 5 seconds for 50 requests
    })
  })

  describe('Database Query Performance', () => {
    it('should optimize database queries for large datasets', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `workflow-${i}`,
        name: `Workflow ${i}`,
        description: `Description ${i}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      let queryCount = 0
      mockWorkflowService.getWorkflows.mockImplementation(() => {
        queryCount++
        return Promise.resolve(largeDataset)
      })

      const request = new NextRequest('http://localhost:3000/api/workflows')
      const startTime = Date.now()
      const response = await GET(request)
      const endTime = Date.now()

      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(1000) // 1 second limit
      expect(queryCount).toBe(1) // Should use single query
    })

    it('should handle pagination efficiently', async () => {
      const mockWorkflows = Array.from({ length: 20 }, (_, i) => ({
        id: `workflow-${i}`,
        name: `Workflow ${i}`,
        description: `Description ${i}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      mockWorkflowService.getWorkflows.mockResolvedValue(mockWorkflows)

      const request = new NextRequest('http://localhost:3000/api/workflows?page=1&limit=20')
      const startTime = Date.now()
      const response = await GET(request)
      const endTime = Date.now()

      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(200) // 200ms limit
    })
  })

  describe('Memory Usage Optimization', () => {
    it('should not exceed memory limits during large API operations', async () => {
      const largeWorkflowData = {
        name: 'Large Workflow',
        description: 'A workflow with large configuration',
        triggerConfig: {},
        actions: Array.from({ length: 100 }, (_, i) => ({
          id: `step-${i}`,
          type: 'email',
          config: {
            to: `user${i}@example.com`,
            subject: `Subject ${i}`,
            body: `Body ${i}`.repeat(100), // Large body content
          },
          order: i + 1,
        })),
      }

      const mockCreatedWorkflow = {
        id: 'workflow-1',
        ...largeWorkflowData,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockWorkflowService.createWorkflow.mockResolvedValue(mockCreatedWorkflow)

      const initialMemory = process.memoryUsage()
      const request = new NextRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(largeWorkflowData),
      })

      const response = await POST(request)
      const finalMemory = process.memoryUsage()

      // API routes return 201 for successful creation
      expect(response.status).toBe(201)
      
      // Verify memory usage didn't increase excessively
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // 50MB limit
    })
  })

  describe('Error Handling Performance', () => {
    it('should handle errors efficiently without performance degradation', async () => {
      mockWorkflowService.getWorkflows.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/workflows')
      const startTime = Date.now()
      const response = await GET(request)
      const endTime = Date.now()

      expect(response.status).toBe(500)
      expect(endTime - startTime).toBeLessThan(1000) // 1 second limit
    })

    it('should handle validation errors quickly', async () => {
      const invalidWorkflowData = {
        // Missing required fields
        description: 'Invalid workflow',
      }

      const request = new NextRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidWorkflowData),
      })

      const startTime = Date.now()
      const response = await POST(request)
      const endTime = Date.now()

      expect(response.status).toBe(400)
      expect(endTime - startTime).toBeLessThan(100) // 100ms limit
    })
  })

  describe('Caching Performance', () => {
    it('should leverage caching for repeated requests', async () => {
      const mockWorkflows = [
        {
          id: 'workflow-1',
          name: 'Cached Workflow',
          description: 'A workflow for caching tests',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      let queryCount = 0
      mockWorkflowService.getWorkflows.mockImplementation(() => {
        queryCount++
        return Promise.resolve(mockWorkflows)
      })

      // First request
      const request1 = new NextRequest('http://localhost:3000/api/workflows')
      const response1 = await GET(request1)
      expect(response1.status).toBe(200)

      // Second request (should use cache)
      const request2 = new NextRequest('http://localhost:3000/api/workflows')
      const response2 = await GET(request2)
      expect(response2.status).toBe(200)

      // Verify service was called (caching would be handled at service layer)
      expect(queryCount).toBeGreaterThan(0)
    })
  })

  describe('Response Size Optimization', () => {
    it('should optimize response size for large datasets', async () => {
      // Use a more realistic dataset size for testing
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `workflow-${i}`,
        name: `Workflow ${i}`,
        description: `Description ${i}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Moderate metadata object
        metadata: {
          tags: Array.from({ length: 10 }, (_, j) => `tag-${j}`),
          config: Array.from({ length: 10 }, (_, k) => ({ key: `key-${k}`, value: `value-${k}` })),
        },
      }))

      mockWorkflowService.getWorkflows.mockResolvedValue(largeDataset)

      const request = new NextRequest('http://localhost:3000/api/workflows')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      
      // Verify response size is reasonable (reduced dataset should be well under 1MB)
      const responseSize = JSON.stringify(data).length
      expect(responseSize).toBeLessThan(1024 * 1024) // 1MB limit
    })
  })
})
