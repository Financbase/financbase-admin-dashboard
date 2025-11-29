/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApprovalWorkflowManager } from '@/components/collaboration/approval-workflows'

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'user-123',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
  }),
}))

// Mock workspace service
const { 
  mockGetApprovalWorkflows, 
  mockGetApprovalRequests, 
  mockCreateApprovalWorkflow, 
  mockCreateApprovalRequest, 
  mockApproveRequest, 
  mockRejectRequest 
} = vi.hoisted(() => {
  const getApprovalWorkflows = vi.fn()
  const getApprovalRequests = vi.fn()
  const createApprovalWorkflow = vi.fn()
  const createApprovalRequest = vi.fn()
  const approveRequest = vi.fn()
  const rejectRequest = vi.fn()
  return {
    mockGetApprovalWorkflows: getApprovalWorkflows,
    mockGetApprovalRequests: getApprovalRequests,
    mockCreateApprovalWorkflow: createApprovalWorkflow,
    mockCreateApprovalRequest: createApprovalRequest,
    mockApproveRequest: approveRequest,
    mockRejectRequest: rejectRequest,
  }
})

vi.mock('@/lib/services/workspace-service', () => ({
  workspaceService: {
    getApprovalWorkflows: mockGetApprovalWorkflows,
    getApprovalRequests: mockGetApprovalRequests,
    createApprovalWorkflow: mockCreateApprovalWorkflow,
    createApprovalRequest: mockCreateApprovalRequest,
    approveRequest: mockApproveRequest,
    rejectRequest: mockRejectRequest,
  },
}))

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: (date: Date) => `2 days ago`,
  format: (date: Date, format: string) => 'Jan 1, 2025',
}))

// Create test query client factory
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
    mutations: { retry: false },
  },
})

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('ApprovalWorkflowManager', () => {
  const mockWorkspaceId = 'workspace-123'

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetApprovalWorkflows.mockResolvedValue([])
    mockGetApprovalRequests.mockResolvedValue([])
    mockCreateApprovalWorkflow.mockResolvedValue({ id: 'workflow-1' })
    mockCreateApprovalRequest.mockResolvedValue({ id: 'request-1' })
    mockApproveRequest.mockResolvedValue({ success: true })
    mockRejectRequest.mockResolvedValue({ success: true })
  })

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <TestWrapper>
        {component}
      </TestWrapper>
    )
  }

  it('should render approval workflow manager', async () => {
    renderWithQueryClient(<ApprovalWorkflowManager workspaceId={mockWorkspaceId} />)

    await waitFor(() => {
      expect(screen.getByText('Approval Workflows')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should display workflow stats', async () => {
    const mockRequests = [
      {
        id: 'req-1',
        title: 'Test Request',
        description: 'Test description',
        status: 'pending' as const,
        priority: 'medium' as const,
        createdAt: new Date().toISOString(),
        currentStep: 1,
      },
      {
        id: 'req-2',
        title: 'Approved Request',
        description: 'Approved description',
        status: 'approved' as const,
        priority: 'high' as const,
        createdAt: new Date().toISOString(),
        currentStep: 2,
      },
    ]

    mockGetApprovalRequests.mockResolvedValue(mockRequests)

    renderWithQueryClient(<ApprovalWorkflowManager workspaceId={mockWorkspaceId} />)

    await waitFor(() => {
      expect(screen.getByText(/Pending/)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should create new workflow', async () => {
    const mockWorkflow = {
      id: 'workflow-1',
      name: 'Test Workflow',
      description: 'Test description',
      type: 'expense_approval' as const,
      steps: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockCreateApprovalWorkflow.mockResolvedValue(mockWorkflow)

    renderWithQueryClient(<ApprovalWorkflowManager workspaceId={mockWorkspaceId} />)

    await waitFor(() => {
      expect(screen.getByText('New Workflow')).toBeInTheDocument()
    }, { timeout: 3000 })

    const createButton = screen.getByText('New Workflow')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Create Approval Workflow')).toBeInTheDocument()
    }, { timeout: 3000 })

    const nameInput = screen.getByLabelText('Workflow Name')
    fireEvent.change(nameInput, { target: { value: 'Test Workflow' } })

    const submitButton = screen.getByText('Create Workflow')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockCreateApprovalWorkflow).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('should create new approval request', async () => {
    const mockRequest = {
      id: 'req-1',
      title: 'Test Request',
      description: 'Test description',
      status: 'pending' as const,
      priority: 'medium' as const,
      createdAt: new Date().toISOString(),
      currentStep: 1,
    }

    const mockWorkflow = {
      id: 'workflow-1',
      name: 'Test Workflow',
      description: 'Test description',
      type: 'expense_approval' as const,
      steps: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockGetApprovalWorkflows.mockResolvedValue([mockWorkflow])
    mockGetApprovalRequests.mockResolvedValue([])
    mockCreateApprovalRequest.mockResolvedValue(mockRequest)

    renderWithQueryClient(<ApprovalWorkflowManager workspaceId={mockWorkspaceId} />)

    await waitFor(() => {
      expect(screen.getByText('New Request')).toBeInTheDocument()
    }, { timeout: 3000 })

    const createButton = screen.getByText('New Request')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText(/Create Approval Request/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // Wait for workflows to load first
    await waitFor(() => {
      expect(mockGetApprovalWorkflows).toHaveBeenCalled()
    }, { timeout: 3000 })

    // Fill in the form fields - title is required (button is disabled without it)
    const titleInput = screen.getByLabelText(/Request Title/i)
    fireEvent.change(titleInput, { target: { value: 'Test Request' } })

    const descriptionInput = screen.getByLabelText(/Description/i)
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } })

    // The component requires a workflow to be selected if workflows exist
    // Find the workflow Select component and select the workflow
    // Use getAllByText since "Workflow" might appear multiple times (in heading and label)
    const workflowLabels = screen.getAllByText(/Workflow/i)
    // Find the label element (not the heading)
    const workflowLabel = workflowLabels.find(label => {
      const parent = label.closest('div')
      return parent?.querySelector('[role="combobox"]') !== null
    }) || workflowLabels[0]
    const workflowSelectContainer = workflowLabel?.closest('div')?.querySelector('[role="combobox"]')
    
    if (workflowSelectContainer) {
      // Click to open the select dropdown
      fireEvent.click(workflowSelectContainer)
      
      // Wait for the dropdown to open and select the workflow
      await waitFor(() => {
        const workflowOption = screen.getByText('Test Workflow')
        fireEvent.click(workflowOption)
      }, { timeout: 3000 })
    }

    // Wait for the button to be enabled (it's disabled when title is empty)
    await waitFor(() => {
      const submitButton = screen.getByText(/Create Request/i)
      expect(submitButton).not.toBeDisabled()
    }, { timeout: 3000 })

    const submitButton = screen.getByText(/Create Request/i)
    fireEvent.click(submitButton)

    // Now the function should be called with the selected workflow
    await waitFor(() => {
      expect(mockCreateApprovalRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Request',
          description: 'Test description',
          workflowId: 'workflow-1',
          workspaceId: mockWorkspaceId,
        })
      )
    }, { timeout: 5000 })
  })

  it('should approve request', async () => {
    const mockRequest = {
      id: 'req-1',
      title: 'Test Request',
      description: 'Test description',
      status: 'pending' as const,
      priority: 'medium' as const,
      createdAt: new Date().toISOString(),
      currentStep: 1,
    }

    mockGetApprovalRequests.mockResolvedValue([mockRequest])
    mockApproveRequest.mockResolvedValue(undefined)

    renderWithQueryClient(<ApprovalWorkflowManager workspaceId={mockWorkspaceId} />)

    await waitFor(() => {
      expect(screen.getByText('Test Request')).toBeInTheDocument()
    })

    const approveButton = screen.getByText('Approve')
    fireEvent.click(approveButton)

    await waitFor(() => {
      expect(mockApproveRequest).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('should reject request', async () => {
    const mockRequest = {
      id: 'req-1',
      title: 'Test Request',
      description: 'Test description',
      status: 'pending' as const,
      priority: 'medium' as const,
      createdAt: new Date().toISOString(),
      currentStep: 1,
    }

    mockGetApprovalRequests.mockResolvedValue([mockRequest])
    mockRejectRequest.mockResolvedValue(undefined)

    renderWithQueryClient(<ApprovalWorkflowManager workspaceId={mockWorkspaceId} />)

    await waitFor(() => {
      expect(screen.getByText('Test Request')).toBeInTheDocument()
    }, { timeout: 3000 })

    const rejectButton = screen.getByText('Reject')
    fireEvent.click(rejectButton)

    await waitFor(() => {
      expect(mockRejectRequest).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('should display workflows tab', async () => {
    const user = userEvent.setup()
    const mockWorkflow = {
      id: 'workflow-1',
      name: 'Test Workflow',
      description: 'Test description',
      type: 'expense_approval' as const,
      steps: [
        {
          id: 'step-1',
          name: 'Step 1',
          order: 1,
          approvers: [],
          requiresAllApprovers: false,
          notifyOnTimeout: true,
        },
      ],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockGetApprovalWorkflows.mockResolvedValue([mockWorkflow])
    mockGetApprovalRequests.mockResolvedValue([])

    renderWithQueryClient(<ApprovalWorkflowManager workspaceId={mockWorkspaceId} />)

    // Wait for the component to load and workflows to be fetched
    await waitFor(() => {
      expect(screen.getByText('Approval Workflows')).toBeInTheDocument()
      expect(mockGetApprovalWorkflows).toHaveBeenCalled()
    }, { timeout: 3000 })

    // Wait for the workflows to be loaded into component state
    // The component uses useEffect to load data, so we need to wait for it to complete
    await waitFor(() => {
      // Check that the component has processed the workflows
      // This might be indicated by the presence of workflow-related UI
      expect(screen.getByRole('tab', { name: /^Workflows$/i })).toBeInTheDocument()
    }, { timeout: 3000 })

    // Find the tab button specifically by role, not by text (to avoid matching "Approval Workflows" header)
    const workflowsTab = screen.getByRole('tab', { name: /^Workflows$/i })
    expect(workflowsTab).toBeInTheDocument()
    
    // Use userEvent for more realistic tab interaction
    await user.click(workflowsTab)

    // Wait for the tab content to be visible and the workflow to appear
    // The TabsContent might need a moment to render after clicking
    await waitFor(() => {
      // Check if the workflows tab content is visible
      const workflowsContent = screen.getByText(/Configure approval processes/i)
      expect(workflowsContent).toBeInTheDocument()
    }, { timeout: 3000 })

    // Now wait for the workflow name to appear in the workflows list
    // The component maps over workflows array, so it should render once data is loaded
    await waitFor(() => {
      expect(screen.getByText('Test Workflow')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('should display loading state', async () => {
    mockGetApprovalWorkflows.mockImplementation(() => new Promise(() => {}))
    mockGetApprovalRequests.mockImplementation(() => new Promise(() => {}))

    renderWithQueryClient(<ApprovalWorkflowManager workspaceId={mockWorkspaceId} />)

    await waitFor(() => {
      expect(screen.getByText('Loading approval workflows...')).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})

