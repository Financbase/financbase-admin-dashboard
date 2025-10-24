import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { WorkflowBuilder } from '@/components/workflows/workflow-builder'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/workflows',
}))

// Mock API calls
global.fetch = jest.fn()

// Mock workflow engine
jest.mock('@/lib/services/workflow-engine', () => ({
  WorkflowEngine: jest.fn().mockImplementation(() => ({
    executeWorkflow: jest.fn(),
    testWorkflow: jest.fn(),
  })),
}))

describe('WorkflowBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('should render workflow builder interface', () => {
    render(<WorkflowBuilder />)

    expect(screen.getByText('Workflow Builder')).toBeInTheDocument()
    expect(screen.getByText('Create New Workflow')).toBeInTheDocument()
    expect(screen.getByText('Quick Stats')).toBeInTheDocument()
  })

  it('should display workflow list', async () => {
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

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ workflows: mockWorkflows }),
    })

    render(<WorkflowBuilder />)

    await waitFor(() => {
      expect(screen.getByText('Invoice Reminder')).toBeInTheDocument()
      expect(screen.getByText('Payment Confirmation')).toBeInTheDocument()
    })
  })

  it('should open create workflow dialog', async () => {
    render(<WorkflowBuilder />)

    const createButton = screen.getByText('Create New Workflow')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Create Workflow')).toBeInTheDocument()
      expect(screen.getByLabelText('Workflow Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Description')).toBeInTheDocument()
    })
  })

  it('should create a new workflow', async () => {
    const mockWorkflow = {
      id: 'workflow-3',
      name: 'Test Workflow',
      description: 'A test workflow',
      isActive: true,
    }

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ workflows: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ workflow: mockWorkflow }),
      })

    render(<WorkflowBuilder />)

    // Open create dialog
    const createButton = screen.getByText('Create New Workflow')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Create Workflow')).toBeInTheDocument()
    })

    // Fill form
    const nameInput = screen.getByLabelText('Workflow Name')
    const descriptionInput = screen.getByLabelText('Description')

    fireEvent.change(nameInput, { target: { value: 'Test Workflow' } })
    fireEvent.change(descriptionInput, { target: { value: 'A test workflow' } })

    // Submit form
    const submitButton = screen.getByText('Create Workflow')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Workflow',
          description: 'A test workflow',
          triggerType: 'manual',
          triggerConfig: {},
          steps: [],
        }),
      })
    })
  })

  it('should display workflow templates', async () => {
    const mockTemplates = [
      {
        id: 'template-1',
        name: 'Invoice Approval',
        description: 'Automated invoice approval workflow',
        category: 'Finance',
        steps: 3,
      },
      {
        id: 'template-2',
        name: 'Payment Reminder',
        description: 'Send payment reminders to customers',
        category: 'Customer Service',
        steps: 2,
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ templates: mockTemplates }),
    })

    render(<WorkflowBuilder />)

    await waitFor(() => {
      expect(screen.getByText('Invoice Approval')).toBeInTheDocument()
      expect(screen.getByText('Payment Reminder')).toBeInTheDocument()
    })
  })

  it('should handle workflow execution', async () => {
    const mockWorkflow = {
      id: 'workflow-1',
      name: 'Test Workflow',
      isActive: true,
    }

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ workflows: [mockWorkflow] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, executionId: 'exec-1' }),
      })

    render(<WorkflowBuilder />)

    await waitFor(() => {
      expect(screen.getByText('Test Workflow')).toBeInTheDocument()
    })

    // Find and click execute button
    const executeButton = screen.getByRole('button', { name: /execute/i })
    fireEvent.click(executeButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/workflows/workflow-1/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
    })
  })

  it('should handle workflow testing', async () => {
    const mockWorkflow = {
      id: 'workflow-1',
      name: 'Test Workflow',
      isActive: true,
    }

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ workflows: [mockWorkflow] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, dryRun: true }),
      })

    render(<WorkflowBuilder />)

    await waitFor(() => {
      expect(screen.getByText('Test Workflow')).toBeInTheDocument()
    })

    // Find and click test button
    const testButton = screen.getByRole('button', { name: /test/i })
    fireEvent.click(testButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/workflows/workflow-1/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
    })
  })

  it('should display execution history', async () => {
    const mockExecutions = [
      {
        id: 'exec-1',
        workflowId: 'workflow-1',
        status: 'completed',
        startedAt: new Date('2024-01-01T10:00:00Z'),
        completedAt: new Date('2024-01-01T10:05:00Z'),
        stepsExecuted: 3,
        stepsSucceeded: 3,
        stepsFailed: 0,
      },
      {
        id: 'exec-2',
        workflowId: 'workflow-1',
        status: 'failed',
        startedAt: new Date('2024-01-02T10:00:00Z'),
        completedAt: new Date('2024-01-02T10:02:00Z'),
        stepsExecuted: 2,
        stepsSucceeded: 1,
        stepsFailed: 1,
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ executions: mockExecutions }),
    })

    render(<WorkflowBuilder />)

    // Switch to execution history tab
    const historyTab = screen.getByText('Execution History')
    fireEvent.click(historyTab)

    await waitFor(() => {
      expect(screen.getByText('exec-1')).toBeInTheDocument()
      expect(screen.getByText('exec-2')).toBeInTheDocument()
      expect(screen.getByText('completed')).toBeInTheDocument()
      expect(screen.getByText('failed')).toBeInTheDocument()
    })
  })

  it('should handle error states gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<WorkflowBuilder />)

    await waitFor(() => {
      expect(screen.getByText(/error loading workflows/i)).toBeInTheDocument()
    })
  })

  it('should filter workflows by status', async () => {
    const mockWorkflows = [
      { id: '1', name: 'Active Workflow', isActive: true },
      { id: '2', name: 'Inactive Workflow', isActive: false },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ workflows: mockWorkflows }),
    })

    render(<WorkflowBuilder />)

    await waitFor(() => {
      expect(screen.getByText('Active Workflow')).toBeInTheDocument()
      expect(screen.getByText('Inactive Workflow')).toBeInTheDocument()
    })

    // Filter by active status
    const activeFilter = screen.getByLabelText('Active')
    fireEvent.click(activeFilter)

    await waitFor(() => {
      expect(screen.getByText('Active Workflow')).toBeInTheDocument()
      expect(screen.queryByText('Inactive Workflow')).not.toBeInTheDocument()
    })
  })

  it('should search workflows by name', async () => {
    const mockWorkflows = [
      { id: '1', name: 'Invoice Workflow', isActive: true },
      { id: '2', name: 'Payment Workflow', isActive: true },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ workflows: mockWorkflows }),
    })

    render(<WorkflowBuilder />)

    await waitFor(() => {
      expect(screen.getByText('Invoice Workflow')).toBeInTheDocument()
      expect(screen.getByText('Payment Workflow')).toBeInTheDocument()
    })

    // Search for invoice workflows
    const searchInput = screen.getByPlaceholderText('Search workflows...')
    fireEvent.change(searchInput, { target: { value: 'invoice' } })

    await waitFor(() => {
      expect(screen.getByText('Invoice Workflow')).toBeInTheDocument()
      expect(screen.queryByText('Payment Workflow')).not.toBeInTheDocument()
    })
  })
})
